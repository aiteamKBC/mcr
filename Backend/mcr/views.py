# MCR file header: Backend\mcr\views.py
# This file is part of the MCR application source.
# Purpose: Source file for the MCR application.


from __future__ import annotations

import json
import logging
import mimetypes
from collections import defaultdict
from datetime import date, datetime
from html import escape
from urllib.parse import urlsplit, urlunsplit
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import connection, connections
from django.http import FileResponse, Http404, HttpResponse
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema

from .models import DashboardReviewAttachment
from .serializers import (
    BookingSessionSerializer,
    DashboardReviewAttachmentSerializer,
    DashboardReviewAttachmentUploadSerializer,
    DashboardMcrReviewDetailSerializer,
)


logger = logging.getLogger(__name__)


class McrReviewViewSet(viewsets.ViewSet):
    DISPLAY_CUTOFF_DATE = None
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

    def _display_cutoff_date(self):
        configured = getattr(self, "DISPLAY_CUTOFF_DATE", None)
        if isinstance(configured, date):
            return configured
        raw = str(configured or "").strip()
        if not raw:
            return None
        try:
            return date.fromisoformat(raw)
        except ValueError:
            return None

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
        cutoff = self._display_cutoff_date()
        if cutoff is None:
            return True
        return review_date >= cutoff

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
        cutoff = self._display_cutoff_date()
        with connection.cursor() as cursor:
            if cutoff is None:
                cursor.execute(
                    f"""
                    SELECT id, status, summary_json, summary_text, created_at, booking_id
                    FROM {summary_table}
                    ORDER BY created_at DESC NULLS LAST, id DESC
                    """
                )
            else:
                cursor.execute(
                    f"""
                    SELECT id, status, summary_json, summary_text, created_at, booking_id
                    FROM {summary_table}
                    WHERE created_at >= %s
                    ORDER BY created_at DESC NULLS LAST, id DESC
                    """,
                    [cutoff.isoformat()],
                )
            return self._dictfetchall(cursor)

    def _fetch_one_row(self, review_id):
        summary_table_name = self._resolve_table_name(self.SUMMARY_TABLE_CANDIDATES)
        if not summary_table_name:
            return None
        summary_table = connection.ops.quote_name(summary_table_name)
        cutoff = self._display_cutoff_date()
        with connection.cursor() as cursor:
            if cutoff is None:
                cursor.execute(
                    f"""
                    SELECT id, status, summary_json, summary_text, created_at, booking_id
                    FROM {summary_table}
                    WHERE id = %s
                    LIMIT 1
                    """,
                    [review_id],
                )
            else:
                cursor.execute(
                    f"""
                    SELECT id, status, summary_json, summary_text, created_at, booking_id
                    FROM {summary_table}
                    WHERE id = %s
                      AND created_at >= %s
                    LIMIT 1
                    """,
                    [review_id, cutoff.isoformat()],
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

    def _serialize_dashboard_attachment(self, obj: DashboardReviewAttachment, request=None) -> dict:
        serializer = DashboardReviewAttachmentSerializer(instance=obj, context={"request": request})
        return serializer.data

    def _attachments_by_review_ids(self, review_ids: list, request=None) -> dict[int, list[dict]]:
        normalized_ids: list[int] = []
        seen: set[int] = set()

        for review_id in review_ids:
            rid = self._to_int_or_default(review_id, default=None)
            if rid is None or rid in seen:
                continue
            seen.add(rid)
            normalized_ids.append(rid)

        if not normalized_ids:
            return {}

        out: dict[int, list[dict]] = defaultdict(list)
        queryset = DashboardReviewAttachment.objects.filter(review_id__in=normalized_ids).order_by("-uploaded_at", "-id")
        for obj in queryset:
            out[obj.review_id].append(self._serialize_dashboard_attachment(obj, request=request))
        return dict(out)

    def _attach_attachments_bulk(self, rows: list, request=None) -> None:
        ids = [row.get("id") for row in rows if row.get("id") is not None]
        attachment_map = self._attachments_by_review_ids(ids, request=request)
        for row in rows:
            rid = self._to_int_or_default(row.get("id"), default=None)
            row["attachments"] = attachment_map.get(rid, []) if rid is not None else []

    def _get_dashboard_attachment_or_404(self, review_id: int, attachment_id):
        att_id = self._to_int_or_default(attachment_id, default=None)
        if att_id is None:
            raise Http404
        obj = DashboardReviewAttachment.objects.filter(id=att_id, review_id=review_id).first()
        if obj is None:
            raise Http404
        return obj

    def _serialize_dashboard_communication(self, obj: DashboardReviewCommunication) -> dict:
        return {
            "id": obj.id,
            "recipient_type": obj.recipient_type,
            "recipient_email": obj.recipient_email,
            "sent_at": obj.sent_at.isoformat(),
            "sent_by": obj.sent_by,
            "status": obj.status,
            "notes": obj.notes,
            "learner_full_name": self._clean_string(obj.learner_full_name),
            "learner_email": self._clean_string(obj.learner_email),
            "coach_name": self._clean_string(obj.coach_name),
            "coach_email": self._clean_string(obj.coach_email),
            "manager_name": self._clean_string(obj.manager_name),
            "manager_email": self._clean_string(obj.manager_email),
            "error_message": obj.error_message,
        }

    def _clean_string(self, value) -> str:
        return str(value or "").strip()

    def _first_csv_value(self, value: str | None) -> str:
        raw = self._clean_string(value)
        if not raw:
            return ""
        for part in raw.split(","):
            item = part.strip()
            if item:
                return item
        return ""

    def _duration_display(self, value) -> str:
        minutes = self._to_int_or_default(value, default=0)
        return f"{minutes} min" if minutes > 0 else ""

    def _validated_email_or_blank(self, value) -> str:
        email = self._clean_string(value)
        if not email:
            return ""
        try:
            validate_email(email)
        except ValidationError:
            return ""
        return email

    def _normalized_text_key(self, value) -> str:
        return " ".join(self._clean_string(value).lower().split())

    def _lookup_people_source_record(
        self,
        learner_email: str,
        learner_full_name: str,
        coach_name: str = "",
        coach_email: str = "",
    ) -> dict:
        if "kbc_users" not in connections.databases:
            return {}

        try:
            with connections["kbc_users"].cursor() as cursor:
                base_select = """
                    SELECT
                        COALESCE("FullName", ''),
                        COALESCE("Email", ''),
                        COALESCE("OwnerName", ''),
                        COALESCE("OwnerEmail", ''),
                        COALESCE("ManagerName", ''),
                        COALESCE("ManagerEmail", '')
                    FROM "kbc_users_data"
                """

                lookups: list[tuple[str, list[str]]] = []
                if learner_email and coach_email:
                    lookups.append(
                        (
                            'LOWER(TRIM(COALESCE("Email", \'\'))) = LOWER(TRIM(%s)) '
                            'AND LOWER(TRIM(COALESCE("OwnerEmail", \'\'))) = LOWER(TRIM(%s))',
                            [learner_email, coach_email],
                        )
                    )
                if learner_email and coach_name:
                    lookups.append(
                        (
                            'LOWER(TRIM(COALESCE("Email", \'\'))) = LOWER(TRIM(%s)) '
                            'AND LOWER(TRIM(COALESCE("OwnerName", \'\'))) = LOWER(TRIM(%s))',
                            [learner_email, coach_name],
                        )
                    )
                if learner_email:
                    lookups.append(
                        ('LOWER(TRIM(COALESCE("Email", \'\'))) = LOWER(TRIM(%s))', [learner_email])
                    )
                if learner_full_name and coach_email:
                    lookups.append(
                        (
                            'LOWER(TRIM(COALESCE("FullName", \'\'))) = LOWER(TRIM(%s)) '
                            'AND LOWER(TRIM(COALESCE("OwnerEmail", \'\'))) = LOWER(TRIM(%s))',
                            [learner_full_name, coach_email],
                        )
                    )
                if learner_full_name and coach_name:
                    lookups.append(
                        (
                            'LOWER(TRIM(COALESCE("FullName", \'\'))) = LOWER(TRIM(%s)) '
                            'AND LOWER(TRIM(COALESCE("OwnerName", \'\'))) = LOWER(TRIM(%s))',
                            [learner_full_name, coach_name],
                        )
                    )
                if learner_full_name:
                    lookups.append(
                        ('LOWER(TRIM(COALESCE("FullName", \'\'))) = LOWER(TRIM(%s))', [learner_full_name])
                    )
                if coach_email and learner_full_name:
                    lookups.append(
                        (
                            'LOWER(TRIM(COALESCE("OwnerEmail", \'\'))) = LOWER(TRIM(%s)) '
                            'AND LOWER(TRIM(COALESCE("FullName", \'\'))) LIKE LOWER(TRIM(%s))',
                            [coach_email, learner_full_name],
                        )
                    )

                row = None
                seen = set()
                for where_sql, params in lookups:
                    cache_key = (where_sql, tuple(params))
                    if cache_key in seen:
                        continue
                    seen.add(cache_key)
                    cursor.execute(f"{base_select} WHERE {where_sql} LIMIT 1", params)
                    row = cursor.fetchone()
                    if row:
                        break
        except Exception:  # noqa: BLE001
            logger.exception("Failed to query kbc_users_data for communication people metadata")
            return {}

        if not row:
            return {}

        return {
            "learnerFullName": self._clean_string(row[0]),
            "learnerEmail": self._validated_email_or_blank(row[1]),
            "coachName": self._clean_string(row[2]),
            "coachEmail": self._validated_email_or_blank(row[3]),
            "managerName": self._clean_string(row[4]),
            "managerEmail": self._validated_email_or_blank(row[5]),
        }

    def _lookup_case_owner_profile(self, case_owner_id, coach_name: str = "") -> dict:
        normalized_name = self._normalized_text_key(coach_name)
        if case_owner_id is None and not normalized_name:
            return {}

        if not hasattr(self, "_coach_profile_cache"):
            self._coach_profile_cache = {}
        cache_key = (case_owner_id, normalized_name)
        if cache_key in self._coach_profile_cache:
            return self._coach_profile_cache[cache_key]

        def run_lookup(where_sql: str, params: list) -> tuple[str, str] | None:
            with connection.cursor() as cursor:
                cursor.execute(
                    f"""
                    SELECT
                        COALESCE(NULLIF(TRIM(cp.display_name), ''), NULLIF(TRIM(CONCAT(u.first_name, ' ', u.last_name)), ''), ''),
                        COALESCE(NULLIF(TRIM(u.email), ''), '')
                    FROM {connection.ops.quote_name('mcr_coachprofile')} cp
                    LEFT JOIN {connection.ops.quote_name('auth_user')} u
                        ON u.id = cp.user_id
                    WHERE {where_sql}
                    ORDER BY cp.id
                    LIMIT 1
                    """,
                    params,
                )
                return cursor.fetchone()

        row = None
        if case_owner_id is not None:
            row = run_lookup("cp.id = %s", [case_owner_id])
        if row is None and normalized_name:
            row = run_lookup("LOWER(TRIM(cp.display_name)) = LOWER(TRIM(%s))", [coach_name])

        out = {
            "coachName": self._clean_string(row[0]) if row else "",
            "coachEmail": self._validated_email_or_blank(row[1]) if row else "",
        }
        self._coach_profile_cache[cache_key] = out
        return out

    def _resolve_people_metadata(self, review: dict, sessions: list) -> dict:
        session = sessions[0] if sessions else {}
        coach_name_from_review = self._clean_string(review.get("coachName") or review.get("coach_name"))
        coach_email_from_review = self._validated_email_or_blank(
            review.get("coachEmail")
            or review.get("coach_email")
            or session.get("staff_emails")
        )
        learner_full_name = self._clean_string(
            review.get("learnerFullName")
            or review.get("learner_full_name")
            or session.get("customer_name")
            or review.get("learner_name")
        )
        learner_email = self._validated_email_or_blank(
            review.get("learnerEmail")
            or review.get("learner_email")
            or session.get("customer_email")
        )

        source_record = self._lookup_people_source_record(
            learner_email=learner_email,
            learner_full_name=learner_full_name,
            coach_name=coach_name_from_review,
            coach_email=coach_email_from_review,
        )
        case_owner_id = self._to_int_or_default(session.get("case_owner_id"), default=None)
        coach_profile = self._lookup_case_owner_profile(
            case_owner_id=case_owner_id,
            coach_name=coach_name_from_review,
        )

        return {
            "learnerFullName": self._clean_string(source_record.get("learnerFullName") or learner_full_name),
            "learnerEmail": self._validated_email_or_blank(learner_email or source_record.get("learnerEmail")),
            "coachName": self._clean_string(
                source_record.get("coachName")
                or coach_profile.get("coachName")
                or coach_name_from_review
            ),
            "coachEmail": self._validated_email_or_blank(
                coach_email_from_review
                or coach_profile.get("coachEmail")
                or source_record.get("coachEmail")
            ),
            "managerName": self._clean_string(
                source_record.get("managerName")
                or review.get("managerName")
                or review.get("manager_name")
            ),
            "managerEmail": self._validated_email_or_blank(
                source_record.get("managerEmail")
                or review.get("managerEmail")
                or review.get("manager_email")
            ),
        }

    def _mask_webhook_url(self, value: str) -> str:
        raw = self._clean_string(value)
        if not raw:
            return ""
        parsed = urlsplit(raw)
        path = parsed.path.rstrip("/")
        if not path:
            masked_path = ""
        elif "/" in path:
            prefix, _, _ = path.rpartition("/")
            masked_path = f"{prefix}/***"
        else:
            masked_path = "/***"
        return urlunsplit((parsed.scheme, parsed.netloc, masked_path, "", ""))

    def _build_success_response_communication(
        self,
        recipient_type: str,
        recipient_email: str,
        sent_by: str,
        sent_at: datetime,
        people: dict | None = None,
    ) -> dict:
        people = people or {}
        return {
            "recipientType": recipient_type,
            "email": self._clean_string(recipient_email),
            "sentBy": self._clean_string(sent_by),
            "timestamp": sent_at.isoformat(),
            "learnerFullName": self._clean_string(people.get("learnerFullName")),
            "learnerEmail": self._clean_string(people.get("learnerEmail")),
            "coachName": self._clean_string(people.get("coachName")),
            "coachEmail": self._clean_string(people.get("coachEmail")),
            "managerName": self._clean_string(people.get("managerName")),
            "managerEmail": self._clean_string(people.get("managerEmail")),
            "sentAt": sent_at.isoformat(),
        }

    def _create_dashboard_communication_log(
        self,
        review_id: int,
        recipient_type: str,
        recipient_email: str,
        notes: str,
        sent_by: str,
        status: str,
        error_message: str = "",
        people: dict | None = None,
        sent_at: datetime | None = None,
    ) -> DashboardReviewCommunication:
        people = people or {}
        return DashboardReviewCommunication.objects.create(
            review_id=review_id,
            recipient_type=recipient_type,
            recipient_email=self._clean_string(recipient_email),
            sent_at=sent_at or timezone.now(),
            sent_by=self._clean_string(sent_by),
            status=status,
            notes=notes,
            learner_full_name=self._clean_string(people.get("learnerFullName")),
            learner_email=self._validated_email_or_blank(people.get("learnerEmail")),
            coach_name=self._clean_string(people.get("coachName")),
            coach_email=self._validated_email_or_blank(people.get("coachEmail")),
            manager_name=self._clean_string(people.get("managerName")),
            manager_email=self._validated_email_or_blank(people.get("managerEmail")),
            error_message=self._clean_string(error_message) or None,
        )

    def _get_dashboard_communication_or_404(self, review_id: int, communication_id) -> DashboardReviewCommunication:
        comm_id = self._to_int_or_default(communication_id, default=None)
        if comm_id is None:
            raise Http404
        obj = DashboardReviewCommunication.objects.filter(id=comm_id, review_id=review_id).first()
        if obj is None:
            raise Http404
        return obj

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

    def _recipient_type_to_code(self, recipient_type: str) -> str:
        mapping = {
            "Employer": CommunicationLogEntry.REC_EMPLOYER,
            "Learner": CommunicationLogEntry.REC_LEARNER,
            "QA": CommunicationLogEntry.REC_QA,
        }
        return mapping[recipient_type]

    def _resolve_sent_by(self, request, review: dict | None = None) -> str:
        user = getattr(request, "user", None)
        if getattr(user, "is_authenticated", False):
            full_name = self._clean_string(getattr(user, "get_full_name", lambda: "")())
            if full_name:
                return full_name
            username = self._clean_string(getattr(user, "username", ""))
            if username:
                return username
        if isinstance(review, dict):
            coach_name = self._clean_string(review.get("coach_name") or review.get("coach"))
            if coach_name:
                return coach_name
        return "Coach"

    def _resolve_communication_contacts(self, review: dict, sessions: list) -> dict:
        session = sessions[0] if sessions else {}
        people = self._resolve_people_metadata(review, sessions)
        learner_name = self._clean_string(people.get("learnerFullName"))
        learner_email = self._validated_email_or_blank(people.get("learnerEmail"))
        employer_name = self._clean_string(people.get("managerName"))
        employer_email = self._validated_email_or_blank(people.get("managerEmail"))
        qa_name = self._clean_string(session.get("qa_name")) or "QA Team"
        qa_email = self._validated_email_or_blank(session.get("qa_email")) or self._validated_email_or_blank(
            getattr(settings, "MCR_QA_NOTIFICATION_EMAIL", "")
        )

        return {
            "learnerName": learner_name,
            "learnerFullName": learner_name,
            "learnerEmail": learner_email,
            "coachName": self._clean_string(people.get("coachName")),
            "coachEmail": self._validated_email_or_blank(people.get("coachEmail")),
            "managerName": self._clean_string(people.get("managerName")),
            "managerEmail": self._validated_email_or_blank(people.get("managerEmail")),
            "employerName": employer_name,
            "employerEmail": employer_email,
            "qaName": qa_name,
            "qaEmail": qa_email,
        }

    def _resolve_recipient_email(self, contacts: dict, recipient_type: str) -> str:
        if recipient_type == CommunicationLogEntry.REC_EMPLOYER:
            return self._clean_string(contacts.get("employerEmail"))
        if recipient_type == CommunicationLogEntry.REC_LEARNER:
            return self._clean_string(contacts.get("learnerEmail"))
        if recipient_type == CommunicationLogEntry.REC_QA:
            return self._clean_string(contacts.get("qaEmail"))
        return ""

    def _resolve_recipient_name(self, contacts: dict, recipient_type: str) -> str:
        if recipient_type == CommunicationLogEntry.REC_EMPLOYER:
            return self._clean_string(contacts.get("employerName"))
        if recipient_type == CommunicationLogEntry.REC_LEARNER:
            return self._clean_string(contacts.get("learnerName"))
        if recipient_type == CommunicationLogEntry.REC_QA:
            return self._clean_string(contacts.get("qaName"))
        return ""

    def _recipient_display_label(self, recipient_type: str) -> str:
        return str(dict(CommunicationLogEntry.REC_CHOICES).get(recipient_type) or recipient_type)

    def _build_review_public_url(self, review_id: int) -> str | None:
        base_url = (getattr(settings, "MCR_PUBLIC_BASE_URL", "") or "").strip().rstrip("/")
        if not base_url:
            return None
        return f"{base_url}/mcr/reviews/{review_id}"

    def _notes_to_html(self, notes: str) -> str:
        normalized = (notes or "").strip()
        if not normalized:
            return ""
        paragraphs = [part.strip() for part in normalized.splitlines() if part.strip()]
        return "".join(f"<p>{escape(part)}</p>" for part in paragraphs)

    def _build_communication_payload(
        self,
        recipient_type: str,
        recipient_email: str,
        notes: str,
        sent_by: str,
        review: dict,
        contacts: dict,
        review_id: int | None = None,
        sent_at: datetime | None = None,
    ) -> dict:
        recipient_code = self._recipient_type_to_code(recipient_type)
        recipient_label = self._recipient_display_label(recipient_code)
        recipient_name = self._resolve_recipient_name(contacts, recipient_code)
        learner_name = self._clean_string(contacts.get("learnerFullName") or contacts.get("learnerName"))
        message_body = (notes or "").strip()
        sent_at_iso = self._iso_datetime(sent_at) or ""
        return {
            "reviewId": review_id,
            "recipientType": recipient_type,
            "recipientLabel": recipient_label,
            "recipientName": recipient_name,
            "recipient_email": self._clean_string(recipient_email),
            "toEmail": self._clean_string(recipient_email),
            "notes": notes,
            "messageBody": message_body,
            "messageText": message_body,
            "messageHtml": self._notes_to_html(message_body),
            "subject": f"Review communication update for {learner_name or 'Learner'}",
            "sentBy": sent_by,
            "learnerFullName": learner_name,
            "learnerName": learner_name,
            "learnerEmail": self._clean_string(contacts.get("learnerEmail")),
            "coachName": self._clean_string(contacts.get("coachName")),
            "coachEmail": self._clean_string(contacts.get("coachEmail")),
            "managerName": self._clean_string(contacts.get("managerName")),
            "managerEmail": self._clean_string(contacts.get("managerEmail")),
            "employerName": self._clean_string(contacts.get("employerName")),
            "employerEmail": self._clean_string(contacts.get("employerEmail")),
            "qaName": self._clean_string(contacts.get("qaName")),
            "qaEmail": self._clean_string(contacts.get("qaEmail")),
            "programme": self._clean_string(review.get("programme")),
            "group": self._clean_string(review.get("group")),
            "reviewDate": self._clean_string(review.get("date")),
            "duration": self._duration_display(review.get("total_duration_min")),
            "reviewUrl": (self._build_review_public_url(review_id) or "") if review_id is not None else "",
            "sentAt": sent_at_iso,
        }

    def _dispatch_communication(
        self,
        review_id: int,
        recipient: str,
        recipient_email: str,
        payload: dict,
    ) -> str:
        webhook_url = (getattr(settings, "MCR_N8N_COMMUNICATION_WEBHOOK", "") or "").strip()
        if not webhook_url:
            raise ValueError("MCR_N8N_COMMUNICATION_WEBHOOK is not configured.")
        if "/webhook-test/" in webhook_url:
            raise ValueError("MCR_N8N_COMMUNICATION_WEBHOOK must use the production webhook URL, not webhook-test.")

        request = Request(
            webhook_url,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        logger.info(
            "Dispatching MCR communication webhook",
            extra={
                "review_id": review_id,
                "recipient_type": recipient,
                "recipient_email": recipient_email,
                "webhook_url": self._mask_webhook_url(webhook_url),
            },
        )
        try:
            with urlopen(request, timeout=15) as response:
                status_code = getattr(response, "status", 200)
                response_body = response.read().decode("utf-8", errors="replace")
                logger.info(
                    "MCR communication webhook responded",
                    extra={
                        "review_id": review_id,
                        "recipient_type": recipient,
                        "status_code": status_code,
                        "response_body": response_body[:1000],
                    },
                )
                if status_code >= 400:
                    raise ValueError(f"n8n webhook returned HTTP {status_code}")
        except HTTPError as exc:
            response_body = exc.read().decode("utf-8", errors="replace")
            logger.exception(
                "MCR communication webhook HTTP error",
                extra={
                    "review_id": review_id,
                    "recipient_type": recipient,
                    "status_code": exc.code,
                    "response_body": response_body[:1000],
                    "webhook_url": self._mask_webhook_url(webhook_url),
                },
            )
            raise ValueError(f"n8n webhook returned HTTP {exc.code}") from exc
        except URLError as exc:
            logger.exception(
                "MCR communication webhook connection error",
                extra={
                    "review_id": review_id,
                    "recipient_type": recipient,
                    "reason": str(exc.reason),
                    "webhook_url": self._mask_webhook_url(webhook_url),
                },
            )
            raise ValueError(f"n8n webhook could not be reached: {exc.reason}") from exc
        except Exception as exc:  # noqa: BLE001
            logger.exception(
                "MCR communication webhook unexpected failure",
                extra={
                    "review_id": review_id,
                    "recipient_type": recipient,
                    "webhook_url": self._mask_webhook_url(webhook_url),
                },
            )
            raise ValueError(f"n8n webhook failed: {exc!s}") from exc
        return CommunicationLogEntry.STATUS_SENT

    @extend_schema(responses=DashboardMcrReviewDetailSerializer(many=True))
    def list(self, request):
        mapped = [
            self._map_row(row)
            for row in self._fetch_all_rows()
            if self._review_visible_from_row(row)
        ]
        self._enrich_meeting_schedule_bulk(mapped)
        self._attach_attachments_bulk(mapped, request=request)
        serializer = DashboardMcrReviewDetailSerializer(instance=mapped, many=True)
        return Response(serializer.data)

    @extend_schema(
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, type=int)],
        responses=DashboardMcrReviewDetailSerializer,
    )
    def retrieve(self, request, pk=None):
        mapped = self._get_mapped_review_or_404(pk)
        self._enrich_meeting_schedule_bulk([mapped])
        self._attach_attachments_bulk([mapped], request=request)
        serializer = DashboardMcrReviewDetailSerializer(instance=mapped)
        return Response(serializer.data)

    @extend_schema(
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, type=int)],
        request=DashboardReviewAttachmentUploadSerializer,
        responses=DashboardReviewAttachmentSerializer(many=True),
    )
    @action(detail=True, methods=["get", "post"], url_path="attachments", parser_classes=[MultiPartParser, FormParser])
    def attachments(self, request, pk=None):
        row = self._get_row_or_404(pk)
        review_id = self._to_int_or_default(row.get("id"), default=None)
        if review_id is None:
            raise Http404

        if request.method.lower() == "get":
            queryset = DashboardReviewAttachment.objects.filter(review_id=review_id).order_by("-uploaded_at", "-id")
            serializer = DashboardReviewAttachmentSerializer(instance=queryset, many=True, context={"request": request})
            return Response(serializer.data)

        serializer = DashboardReviewAttachmentUploadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        upload = serializer.validated_data["file"]
        uploaded_by = self._clean_string(serializer.validated_data.get("uploaded_by")) or self._resolve_sent_by(
            request,
            review=self._map_row(row),
        )
        content_type = self._clean_string(getattr(upload, "content_type", "")) or self._clean_string(
            mimetypes.guess_type(getattr(upload, "name", ""))[0]
        )

        attachment = DashboardReviewAttachment.objects.create(
            review_id=review_id,
            file=upload,
            original_name=self._clean_string(getattr(upload, "name", "")) or "Attachment",
            content_type=content_type or "application/octet-stream",
            size=self._to_int_or_default(getattr(upload, "size", 0), default=0),
            uploaded_by=uploaded_by,
            visible_to_learner=serializer.validated_data.get("visible_to_learner", True),
        )
        out = DashboardReviewAttachmentSerializer(instance=attachment, context={"request": request})
        return Response(out.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        parameters=[
            OpenApiParameter(name="id", location=OpenApiParameter.PATH, type=int),
            OpenApiParameter(name="attachment_id", location=OpenApiParameter.PATH, type=int),
        ],
        responses=OpenApiTypes.BINARY,
    )
    @action(detail=True, methods=["get"], url_path=r"attachments/(?P<attachment_id>[^/.]+)/file")
    def attachment_file(self, request, pk=None, attachment_id=None):
        row = self._get_row_or_404(pk)
        review_id = self._to_int_or_default(row.get("id"), default=None)
        if review_id is None:
            raise Http404

        attachment = self._get_dashboard_attachment_or_404(review_id, attachment_id)
        response = FileResponse(
            attachment.file.open("rb"),
            as_attachment=False,
            filename=attachment.original_name,
            content_type=attachment.content_type or "application/octet-stream",
        )
        response["X-Content-Type-Options"] = "nosniff"
        return response

    @extend_schema(
        parameters=[
            OpenApiParameter(name="id", location=OpenApiParameter.PATH, type=int),
            OpenApiParameter(name="attachment_id", location=OpenApiParameter.PATH, type=int),
        ],
        responses=OpenApiTypes.BINARY,
    )
    @action(detail=True, methods=["get"], url_path=r"attachments/(?P<attachment_id>[^/.]+)/download")
    def download_attachment(self, request, pk=None, attachment_id=None):
        row = self._get_row_or_404(pk)
        review_id = self._to_int_or_default(row.get("id"), default=None)
        if review_id is None:
            raise Http404

        attachment = self._get_dashboard_attachment_or_404(review_id, attachment_id)
        response = FileResponse(
            attachment.file.open("rb"),
            as_attachment=True,
            filename=attachment.original_name,
            content_type=attachment.content_type or "application/octet-stream",
        )
        response["X-Content-Type-Options"] = "nosniff"
        return response

    @extend_schema(
        parameters=[
            OpenApiParameter(name="id", location=OpenApiParameter.PATH, type=int),
            OpenApiParameter(name="attachment_id", location=OpenApiParameter.PATH, type=int),
        ],
        responses=OpenApiTypes.OBJECT,
    )
    @action(detail=True, methods=["delete"], url_path=r"attachments/(?P<attachment_id>[^/.]+)")
    def delete_attachment(self, request, pk=None, attachment_id=None):
        row = self._get_row_or_404(pk)
        review_id = self._to_int_or_default(row.get("id"), default=None)
        if review_id is None:
            raise Http404

        attachment = self._get_dashboard_attachment_or_404(review_id, attachment_id)
        deleted_id = attachment.id
        attachment.file.delete(save=False)
        attachment.delete()
        return Response(
            {
                "success": True,
                "message": "Attachment deleted",
                "deletedId": deleted_id,
            },
            status=status.HTTP_200_OK,
        )

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
    def communications(self, request, pk=None):
        raise Http404
        if request.method.lower() == "delete":
            _ = self._get_row_or_404(pk)
            rid = self._to_int_or_default(pk, default=None)
            if rid is None:
                raise Http404
            deleted_count, _deleted_detail = DashboardReviewCommunication.objects.filter(review_id=rid).delete()
            return Response(
                {
                    "success": True,
                    "message": "Communication logs cleared",
                    "deletedCount": deleted_count,
                },
                status=200,
            )

        # Production checklist:
        # 1. Employer success
        # 2. Learner success
        # 3. QA success with qa_email
        # 4. QA success with MCR_QA_NOTIFICATION_EMAIL fallback
        # 5. Failure when no recipient email exists
        # 6. Failure when webhook URL is missing or uses webhook-test
        _ = self._get_row_or_404(pk)
        review = self._get_mapped_review_or_404(pk)
        ser = DashboardReviewCommunicationCreateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        recipient_type = ser.validated_data["recipientType"]
        recipient = self._recipient_type_to_code(recipient_type)
        notes = ser.validated_data.get("notes") or ""
        sent_by = self._resolve_sent_by(request, review)
        rid = self._to_int_or_default(pk, default=None)
        if rid is None:
            raise Http404
        logger.info(
            "MCR communication request received",
            extra={"review_id": rid, "recipient_type": recipient_type},
        )
        sessions = self._fetch_sessions_by_booking_id(review.get("booking_id"))
        contacts = self._resolve_communication_contacts(review, sessions)
        people = {
            "learnerFullName": self._clean_string(contacts.get("learnerFullName") or contacts.get("learnerName")),
            "learnerEmail": self._validated_email_or_blank(contacts.get("learnerEmail")),
            "coachName": self._clean_string(contacts.get("coachName")),
            "coachEmail": self._validated_email_or_blank(contacts.get("coachEmail")),
            "managerName": self._clean_string(contacts.get("managerName")),
            "managerEmail": self._validated_email_or_blank(contacts.get("managerEmail")),
        }
        to_email = self._resolve_recipient_email(contacts, recipient)
        sent_at = timezone.now()
        logger.info(
            "MCR communication recipient resolved",
            extra={
                "review_id": rid,
                "recipient_type": recipient_type,
                "recipient_email": to_email,
            },
        )
        if not to_email:
            detail = (
                "No email address available for this recipient. "
                "Use learner/customer or staff emails from the booking session, "
                "or set MCR_QA_NOTIFICATION_EMAIL for QA."
            )
            self._create_dashboard_communication_log(
                review_id=rid,
                recipient_type=recipient,
                recipient_email="",
                notes=notes,
                sent_by=sent_by,
                status=CommunicationLogEntry.STATUS_FAILED,
                error_message=detail,
                people=people,
                sent_at=sent_at,
            )
            return Response(
                {
                    "success": False,
                    "detail": detail,
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
        payload = self._build_communication_payload(
            recipient_type=recipient_type,
            recipient_email=to_email,
            notes=notes,
            sent_by=sent_by,
            review=review,
            contacts=contacts,
            review_id=rid,
            sent_at=sent_at,
        )
        try:
            status = self._dispatch_communication(
                review_id=rid,
                recipient=recipient,
                recipient_email=to_email,
                payload=payload,
            )
        except Exception as exc:  # noqa: BLE001
            detail = f"Communication could not be sent: {exc!s}"
            self._create_dashboard_communication_log(
                review_id=rid,
                recipient_type=recipient,
                recipient_email=to_email,
                notes=notes,
                sent_by=sent_by,
                status=CommunicationLogEntry.STATUS_FAILED,
                error_message=detail,
                people=people,
                sent_at=sent_at,
            )
            return Response(
                {"success": False, "detail": detail},
                status=502,
            )
        obj = self._create_dashboard_communication_log(
            review_id=rid,
            recipient_type=recipient,
            recipient_email=to_email,
            notes=notes,
            sent_by=sent_by,
            status=status,
            people=people,
            sent_at=sent_at,
        )
        return Response(
            {
                "success": True,
                "message": "Communication sent",
                "communication": self._build_success_response_communication(
                    recipient_type=recipient_type,
                    recipient_email=to_email,
                    sent_by=sent_by,
                    sent_at=obj.sent_at,
                    people=people,
                ),
            },
            status=201,
        )

    def communication_detail(self, request, pk=None, communication_id=None):
        raise Http404
        _ = self._get_row_or_404(pk)
        rid = self._to_int_or_default(pk, default=None)
        if rid is None:
            raise Http404
        obj = self._get_dashboard_communication_or_404(rid, communication_id)

        if request.method.lower() == "delete":
            obj.delete()
            return Response(
                {
                    "success": True,
                    "message": "Communication log deleted",
                    "deletedId": self._to_int_or_default(communication_id, default=0),
                },
                status=200,
            )

        review = self._get_mapped_review_or_404(pk)
        ser = DashboardReviewCommunicationUpdateSerializer(data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        validated = ser.validated_data

        if "recipientType" in validated:
            recipient_code = self._recipient_type_to_code(validated["recipientType"])
            sessions = self._fetch_sessions_by_booking_id(review.get("booking_id"))
            contacts = self._resolve_communication_contacts(review, sessions)
            recipient_email = self._resolve_recipient_email(contacts, recipient_code)
            if not recipient_email:
                detail = (
                    "No email address available for this recipient. "
                    "Use learner/customer or staff emails from the booking session, "
                    "or set MCR_QA_NOTIFICATION_EMAIL for QA."
                )
                return Response({"success": False, "detail": detail}, status=400)
            obj.recipient_type = recipient_code
            obj.recipient_email = recipient_email

        if "notes" in validated:
            obj.notes = validated.get("notes") or ""

        obj.save(update_fields=["recipient_type", "recipient_email", "notes"])
        return Response(
            {
                "success": True,
                "message": "Communication log updated",
                "communication": self._serialize_dashboard_communication(obj),
            },
            status=200,
        )

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
