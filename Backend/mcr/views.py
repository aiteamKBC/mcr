import json
from collections import defaultdict
from datetime import date, datetime
from email.utils import formataddr
from html import escape
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings
from django.core.mail import send_mail
from django.db import connection
from django.http import Http404, HttpResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema

from .models import CommunicationLogEntry, DashboardReviewCommunication
from .serializers import (
    BookingSessionSerializer,
    DashboardMcrReviewDetailSerializer,
    DashboardReviewCommunicationCreateSerializer,
)


class McrReviewViewSet(viewsets.ViewSet):
    DISPLAY_CUTOFF_DATE = date(2026, 3, 1)
    SUMMARY_TABLE_CANDIDATES = (
        "booking_summaries",
        "MCM_booking_summaries",
        "PR_BOOKING_SUMMERIES",
    )
    SESSION_TABLE_CANDIDATES = (
        "booking_sessions",
        "MCM_booking_sessions",
        "PR_BOOKING_SESSIONS",
    )

    def _table_name_set(self):
        if not hasattr(self, "_cached_table_names"):
            self._cached_table_names = set(connection.introspection.table_names())
        return self._cached_table_names

    def _resolve_table_name(self, candidates):
        available = self._table_name_set()
        for table_name in candidates:
            if table_name in available:
                return table_name
        return None

    def _dictfetchall(self, cursor):
        columns = [col[0] for col in cursor.description]
        return [dict(zip(columns, row)) for row in cursor.fetchall()]

    def _parse_summary(self, value):
        if isinstance(value, dict):
            return value
        if isinstance(value, str):
            try:
                parsed = json.loads(value)
                return parsed if isinstance(parsed, dict) else {}
            except json.JSONDecodeError:
                return {}
        return {}

    def _to_int_or_default(self, value, default=0):
        try:
            return int(value)
        except (TypeError, ValueError):
            return default

    def _date_only(self, value):
        if value is None:
            return None
        if isinstance(value, datetime):
            return value.date()
        if isinstance(value, date):
            return value
        s = str(value).strip()
        if len(s) >= 10 and s[4] == "-" and s[7] == "-":
            try:
                return date.fromisoformat(s[:10])
            except ValueError:
                return None
        return None

    def _review_visible_from_row(self, row):
        summary_text_payload = self._parse_summary(row.get("summary_text"))
        summary_json_payload = self._parse_summary(row.get("summary_json"))
        summary = summary_text_payload or summary_json_payload

        review_date = self._date_only(summary.get("date")) or self._date_only(row.get("created_at"))
        if review_date is None:
            return True
        return review_date >= self.DISPLAY_CUTOFF_DATE

    def _map_row(self, row):
        summary_text_payload = self._parse_summary(row.get("summary_text"))
        summary_json_payload = self._parse_summary(row.get("summary_json"))
        summary = summary_text_payload or summary_json_payload

        overall_rating = summary.get("overall_rating") or {}
        if not isinstance(overall_rating, dict):
            overall_rating = {}

        qa_items = summary.get("qa")
        if not isinstance(qa_items, list):
            qa_items = []

        rag_status = str(overall_rating.get("rag") or "amber").lower()
        if rag_status not in {"red", "amber", "green"}:
            rag_status = "amber"

        satisfaction_score = None
        safeguarding_flagged = False
        for item in qa_items:
            if not isinstance(item, dict):
                continue
            metric = str(item.get("metric") or "").lower()
            rag = str(item.get("rag") or "").lower()

            if satisfaction_score is None and "satisfaction" in metric:
                try:
                    satisfaction_score = int(item.get("rating_1_to_5"))
                except (TypeError, ValueError):
                    satisfaction_score = None

            if "safeguarding" in metric and rag in {"amber", "red"}:
                safeguarding_flagged = True

        return {
            "id": row.get("id"),
            "date": summary.get("date"),
            "programme": str(summary.get("programme") or ""),
            "group": str(summary.get("Group") or summary.get("group") or ""),
            "meeting_link": "",
            "total_duration_min": self._to_int_or_default(summary.get("duration_inferred_minutes"), 0),
            "coach_name": str(summary.get("coach") or ""),
            "learner_name": str(summary.get("learner") or ""),
            "rag_status": rag_status,
            "qualitative_rating": str(overall_rating.get("qualitative") or ""),
            "created_at": row.get("created_at"),
            "updated_at": row.get("created_at"),
            "safeguarding_flagged": safeguarding_flagged,
            "satisfaction_score": satisfaction_score,
            "executive_summary": str(summary.get("executive_summary") or ""),
            "strengths": summary.get("strengths") if isinstance(summary.get("strengths"), list) else [],
            "priority_actions": summary.get("priority_actions") if isinstance(summary.get("priority_actions"), list) else [],
            "overall_rating": overall_rating,
            "qa": qa_items,
            "booking_id": row.get("booking_id"),
            "status": str(row.get("status") or ""),
            "summary_text_raw": row.get("summary_text") or "",
            "summary_text_json": summary_text_payload or None,
            "summary_json": summary_json_payload or None,
        }

    def _fetch_all_rows(self):
        summary_table_name = self._resolve_table_name(self.SUMMARY_TABLE_CANDIDATES)
        if not summary_table_name:
            return []
        summary_table = connection.ops.quote_name(summary_table_name)
        with connection.cursor() as cursor:
            cursor.execute(
                f"""
                SELECT id, status, summary_json, summary_text, created_at, booking_id
                FROM {summary_table}
                WHERE created_at >= %s
                ORDER BY created_at DESC NULLS LAST, id DESC
                """,
                [self.DISPLAY_CUTOFF_DATE.isoformat()],
            )
            return self._dictfetchall(cursor)

    def _fetch_one_row(self, review_id):
        summary_table_name = self._resolve_table_name(self.SUMMARY_TABLE_CANDIDATES)
        if not summary_table_name:
            return None
        summary_table = connection.ops.quote_name(summary_table_name)
        with connection.cursor() as cursor:
            cursor.execute(
                f"""
                SELECT id, status, summary_json, summary_text, created_at, booking_id
                FROM {summary_table}
                WHERE id = %s
                  AND created_at >= %s
                LIMIT 1
                """,
                [review_id, self.DISPLAY_CUTOFF_DATE.isoformat()],
            )
            rows = self._dictfetchall(cursor)
        return rows[0] if rows else None

    def _fetch_sessions_by_booking_id(self, booking_id):
        if not booking_id:
            return []

        sessions_table_name = self._resolve_table_name(self.SESSION_TABLE_CANDIDATES)
        if not sessions_table_name:
            return []
        sessions_table = connection.ops.quote_name(sessions_table_name)
        with connection.cursor() as cursor:
            cursor.execute(
                f"""
                SELECT
                    id,
                    case_owner_id,
                    day_date,
                    booking_id,
                    service_name,
                    meeting_subject,
                    customer_name,
                    customer_email,
                    duration_seconds,
                    total_participant_count,
                    staff_names,
                    staff_emails,
                    created_at,
                    updated_at
                FROM {sessions_table}
                WHERE booking_id = %s
                ORDER BY day_date DESC NULLS LAST, id DESC
                """,
                [booking_id],
            )
            return self._dictfetchall(cursor)

    def _iso_date_only(self, value):
        if value is None:
            return None
        if isinstance(value, datetime):
            return value.date().isoformat()
        if isinstance(value, date):
            return value.isoformat()
        s = str(value).strip()
        if len(s) >= 10 and s[4] == "-" and s[7] == "-":
            return s[:10]
        return None

    def _iso_datetime(self, value):
        if value is None:
            return None
        if isinstance(value, datetime):
            return value.isoformat()
        s = str(value).strip()
        return s or None

    def _fetch_sessions_for_bookings(self, booking_ids: list):
        ids = []
        seen = set()
        for bid in booking_ids:
            if bid is None:
                continue
            key = str(bid).strip()
            if key and key not in seen:
                seen.add(key)
                ids.append(bid)
        if not ids:
            return {}

        sessions_table_name = self._resolve_table_name(self.SESSION_TABLE_CANDIDATES)
        if not sessions_table_name:
            return {}
        sessions_table = connection.ops.quote_name(sessions_table_name)
        placeholders = ",".join(["%s"] * len(ids))
        with connection.cursor() as cursor:
            cursor.execute(
                f"""
                SELECT
                    booking_id,
                    day_date,
                    created_at,
                    updated_at
                FROM {sessions_table}
                WHERE booking_id IN ({placeholders})
                ORDER BY booking_id, day_date DESC NULLS LAST, id DESC
                """,
                ids,
            )
            rows = self._dictfetchall(cursor)

        best = {}
        for r in rows:
            bid = r.get("booking_id")
            if bid is None:
                continue
            k = str(bid).strip()
            if k and k not in best:
                best[k] = r
        return best

    def _enrich_meeting_schedule_bulk(self, mapped_rows: list) -> None:
        booking_keys = []
        for m in mapped_rows:
            bid = m.get("booking_id")
            if bid is not None and str(bid).strip():
                booking_keys.append(bid)
        session_map = self._fetch_sessions_for_bookings(booking_keys)

        for m in mapped_rows:
            bid = m.get("booking_id")
            k = str(bid).strip() if bid is not None else ""
            sess = session_map.get(k) if k else None
            summary_date = m.get("date")

            if sess:
                dd = sess.get("day_date")
                if dd is not None:
                    m["meeting_day_date"] = self._iso_date_only(dd)
                elif summary_date:
                    m["meeting_day_date"] = self._iso_date_only(summary_date)
                else:
                    m["meeting_day_date"] = None

                ca = sess.get("created_at")
                starts_at = None
                if ca is not None:
                    if isinstance(ca, datetime) and dd is not None:
                        dd_norm = dd.date() if isinstance(dd, datetime) else (dd if isinstance(dd, date) else None)
                        if dd_norm and ca.date() == dd_norm:
                            starts_at = self._iso_datetime(ca)
                    elif isinstance(ca, datetime) and dd is None:
                        starts_at = self._iso_datetime(ca)
                    elif not isinstance(ca, datetime):
                        starts_at = self._iso_datetime(ca)
                m["meeting_starts_at"] = starts_at
            else:
                m["meeting_day_date"] = self._iso_date_only(summary_date) if summary_date else None
                m["meeting_starts_at"] = None

    def _get_row_or_404(self, pk):
        review_id = self._to_int_or_default(pk, default=None)
        if review_id is None:
            raise Http404
        row = self._fetch_one_row(review_id)
        if not row or not self._review_visible_from_row(row):
            raise Http404
        return row

    def _get_mapped_review_or_404(self, pk):
        return self._map_row(self._get_row_or_404(pk))

    def _serialize_dashboard_communication(self, obj: DashboardReviewCommunication) -> dict:
        return {
            "id": obj.id,
            "recipient_type": obj.recipient_type,
            "sent_at": obj.sent_at.isoformat(),
            "sent_by": obj.sent_by,
            "status": obj.status,
            "notes": obj.notes,
        }

    def _communications_by_review_ids(self, review_ids: list) -> dict:
        ids = [i for i in review_ids if i is not None]
        if not ids:
            return {}
        out: dict = defaultdict(list)
        for obj in DashboardReviewCommunication.objects.filter(review_id__in=ids).order_by(
            "sent_at", "id"
        ):
            out[obj.review_id].append(self._serialize_dashboard_communication(obj))
        return dict(out)

    def _attach_communications_bulk(self, rows: list) -> None:
        ids = [r.get("id") for r in rows if r.get("id") is not None]
        comm_map = self._communications_by_review_ids(ids)
        for r in rows:
            rid = r.get("id")
            r["communications"] = comm_map.get(rid, []) if rid is not None else []

    def _resolve_communication_email(self, sessions: list, recipient_type: str) -> str | None:
        if recipient_type == CommunicationLogEntry.REC_QA:
            addr = (getattr(settings, "MCR_QA_NOTIFICATION_EMAIL", None) or "").strip()
            return addr or None
        if not sessions:
            return None
        s = sessions[0]
        if recipient_type == CommunicationLogEntry.REC_LEARNER:
            return (str(s.get("customer_email") or "").strip()) or None
        if recipient_type == CommunicationLogEntry.REC_EMPLOYER:
            raw = str(s.get("staff_emails") or "").strip()
            if not raw:
                return None
            first = raw.split(",")[0].strip()
            return first or None
        return None

    def _recipient_display_label(self, recipient_type: str) -> str:
        return str(dict(CommunicationLogEntry.REC_CHOICES).get(recipient_type) or recipient_type)

    def _build_review_public_url(self, review_id: int) -> str | None:
        base_url = (getattr(settings, "MCR_PUBLIC_BASE_URL", "") or "").strip().rstrip("/")
        if not base_url:
            return None
        return f"{base_url}/mcr/reviews/{review_id}"

    def _dispatch_communication(
        self,
        review_id: int,
        review: dict,
        recipient: str,
        to_email: str,
        sent_by: str,
        notes: str,
    ) -> str:
        recipient_label = self._recipient_display_label(recipient)
        webhook_url = (getattr(settings, "MCR_N8N_COMMUNICATION_WEBHOOK", "") or "").strip()

        payload = {
            "event": "mcr.communication_requested",
            "review_id": review_id,
            "booking_id": review.get("booking_id"),
            "recipient_type": recipient,
            "recipient_label": recipient_label,
            "recipient_email": to_email,
            "sent_by": sent_by,
            "notes": notes,
            "coach_name": str(review.get("coach_name") or ""),
            "learner_name": str(review.get("learner_name") or ""),
            "programme": str(review.get("programme") or ""),
            "group": str(review.get("group") or ""),
            "review_date": review.get("date"),
            "rag_status": review.get("rag_status"),
            "qualitative_rating": review.get("qualitative_rating"),
            "review_url": self._build_review_public_url(review_id),
            "requested_at": datetime.utcnow().isoformat() + "Z",
        }

        if webhook_url:
            request = Request(
                webhook_url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            try:
                with urlopen(request, timeout=20) as response:
                    status_code = getattr(response, "status", 200)
                    if status_code >= 400:
                        raise ValueError(f"Webhook returned HTTP {status_code}")
            except HTTPError as exc:
                raise ValueError(f"n8n webhook returned HTTP {exc.code}") from exc
            except URLError as exc:
                raise ValueError(f"n8n webhook could not be reached: {exc.reason}") from exc
            except Exception as exc:  # noqa: BLE001
                raise ValueError(f"n8n webhook failed: {exc!s}") from exc
            return CommunicationLogEntry.STATUS_SENT

        subject = f"MCR review #{review_id} - notification ({recipient_label})"
        body = (
            f"This message was logged from the MCR dashboard.\n\n"
            f"Recipient: {recipient_label}\n"
            f"Recipient email: {to_email}\n"
            f"Sent by: {sent_by}\n\n"
            f"{notes}\n"
        )
        send_mail(
            subject=subject,
            message=body,
            from_email=formataddr((sent_by, settings.DEFAULT_FROM_EMAIL)),
            recipient_list=[to_email],
            fail_silently=False,
        )
        return CommunicationLogEntry.STATUS_SENT

    @extend_schema(responses=DashboardMcrReviewDetailSerializer(many=True))
    def list(self, request):
        mapped = [
            self._map_row(row)
            for row in self._fetch_all_rows()
            if self._review_visible_from_row(row)
        ]
        self._enrich_meeting_schedule_bulk(mapped)
        self._attach_communications_bulk(mapped)
        serializer = DashboardMcrReviewDetailSerializer(instance=mapped, many=True)
        return Response(serializer.data)

    @extend_schema(
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, type=int)],
        responses=DashboardMcrReviewDetailSerializer,
    )
    def retrieve(self, request, pk=None):
        mapped = self._get_mapped_review_or_404(pk)
        self._enrich_meeting_schedule_bulk([mapped])
        self._attach_communications_bulk([mapped])
        serializer = DashboardMcrReviewDetailSerializer(instance=mapped)
        return Response(serializer.data)

    @extend_schema(
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, type=int)],
        responses=OpenApiTypes.OBJECT,
    )
    @action(detail=True, methods=["get"], url_path="summary_json")
    def summary_json(self, request, pk=None):
        row = self._get_row_or_404(pk)
        return Response(self._parse_summary(row.get("summary_json")))

    @extend_schema(
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, type=int)],
        responses=OpenApiTypes.OBJECT,
    )
    @action(detail=True, methods=["get"], url_path="status")
    def status(self, request, pk=None):
        row = self._get_row_or_404(pk)
        return Response({"status": str(row.get("status") or "")})

    @extend_schema(
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, type=int)],
        responses=OpenApiTypes.OBJECT,
    )
    @action(detail=True, methods=["get"], url_path="created_at")
    def created_at(self, request, pk=None):
        row = self._get_row_or_404(pk)
        return Response({"created_at": self._iso_datetime(row.get("created_at"))})

    @extend_schema(
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, type=int)],
        responses=BookingSessionSerializer(many=True),
    )
    @action(detail=True, methods=["get"], url_path="booking_session")
    def booking_session(self, request, pk=None):
        row = self._get_row_or_404(pk)
        sessions = self._fetch_sessions_by_booking_id(row.get("booking_id"))
        serializer = BookingSessionSerializer(instance=sessions, many=True)
        return Response(serializer.data)

    @extend_schema(
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, type=int)],
        request=DashboardReviewCommunicationCreateSerializer,
        responses={201: OpenApiTypes.OBJECT},
    )
    @action(detail=True, methods=["post"], url_path="communications")
    def communications(self, request, pk=None):
        _ = self._get_row_or_404(pk)
        review = self._get_mapped_review_or_404(pk)
        ser = DashboardReviewCommunicationCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        recipient = ser.validated_data["recipient_type"]
        notes = ser.validated_data.get("notes") or ""
        coach_name = str(review.get("coach_name") or "").strip()
        sent_by = str(ser.validated_data.get("sent_by") or "").strip() or coach_name or "Coach"
        rid = self._to_int_or_default(pk, default=None)
        if rid is None:
            raise Http404
        sessions = self._fetch_sessions_by_booking_id(review.get("booking_id"))
        to_email = self._resolve_communication_email(sessions, recipient)
        if not to_email:
            return Response(
                {
                    "detail": (
                        "No email address available for this recipient. "
                        "Use learner/customer or staff emails from the booking session, "
                        "or set MCR_QA_NOTIFICATION_EMAIL for QA."
                    )
                },
                status=400,
            )
        subject = f"MCR review #{pk} — notification ({recipient})"
        body = (
            f"This message was logged from the MCR dashboard.\n\n"
            f"Recipient: {recipient}\n"
            f"Sent by: {sent_by}\n\n"
            f"{notes}\n"
        )
        try:
            status = self._dispatch_communication(
                review_id=rid,
                review=review,
                recipient=recipient,
                to_email=to_email,
                sent_by=sent_by,
                notes=notes,
            )
        except Exception as exc:  # noqa: BLE001
            return Response(
                {"detail": f"Communication could not be sent: {exc!s}"},
                status=502,
            )
        obj = DashboardReviewCommunication.objects.create(
            review_id=rid,
            recipient_type=recipient,
            sent_by=sent_by,
            status=status,
            notes=notes,
        )
        return Response(self._serialize_dashboard_communication(obj), status=201)

    @extend_schema(
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, type=int)],
        responses={200: {"type": "string", "format": "binary"}},
    )
    @action(detail=True, methods=["get"])
    def export(self, request, pk=None):
        review = self._get_mapped_review_or_404(pk)

        strengths = review.get("strengths") or []
        strengths_html = "".join(f"<li>{escape(str(item))}</li>" for item in strengths)
        if not strengths_html:
            strengths_html = "<li>No strengths provided.</li>"

        html = f"""
        <html><head><meta charset=\"utf-8\"><title>MCR Export</title></head>
        <body>
          <h1>MCR Review #{review['id']}</h1>
          <p><b>Learner:</b> {escape(review.get('learner_name', ''))}</p>
          <p><b>Coach:</b> {escape(review.get('coach_name', ''))}</p>
          <p><b>Date:</b> {escape(str(review.get('date', '')))}</p>
          <p><b>RAG:</b> {escape(review.get('rag_status', ''))}</p>
          <h2>Executive Summary</h2>
          <p>{escape(review.get('executive_summary', ''))}</p>
          <h2>Strengths</h2>
          <ul>{strengths_html}</ul>
        </body></html>
        """
        resp = HttpResponse(html, content_type="text/html; charset=utf-8")
        resp["Content-Disposition"] = f'attachment; filename="mcr_{review["id"]}.html"'
        return resp
