import json
from html import escape

from django.db import connection
from django.http import Http404, HttpResponse
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema

from .serializers import BookingSessionSerializer, DashboardMcrReviewDetailSerializer


class McrReviewViewSet(viewsets.ViewSet):
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
                ORDER BY created_at DESC NULLS LAST, id DESC
                """
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
                LIMIT 1
                """,
                [review_id],
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

    def _get_row_or_404(self, pk):
        review_id = self._to_int_or_default(pk, default=None)
        if review_id is None:
            raise Http404
        row = self._fetch_one_row(review_id)
        if not row:
            raise Http404
        return row

    def _get_mapped_review_or_404(self, pk):
        return self._map_row(self._get_row_or_404(pk))

    @extend_schema(responses=DashboardMcrReviewDetailSerializer(many=True))
    def list(self, request):
        mapped = [self._map_row(row) for row in self._fetch_all_rows()]
        serializer = DashboardMcrReviewDetailSerializer(instance=mapped, many=True)
        return Response(serializer.data)

    @extend_schema(
        parameters=[OpenApiParameter(name="id", location=OpenApiParameter.PATH, type=int)],
        responses=DashboardMcrReviewDetailSerializer,
    )
    def retrieve(self, request, pk=None):
        mapped = self._get_mapped_review_or_404(pk)
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
        review_id = self._to_int_or_default(pk, default=None)
        if review_id is None:
            raise Http404

        summary_table_name = self._resolve_table_name(self.SUMMARY_TABLE_CANDIDATES)
        if not summary_table_name:
            raise Http404
        summary_table = connection.ops.quote_name(summary_table_name)
        with connection.cursor() as cursor:
            cursor.execute(
                f"""
                SELECT created_at::text
                FROM {summary_table}
                WHERE id = %s
                LIMIT 1
                """,
                [review_id],
            )
            row = cursor.fetchone()

        if not row:
            raise Http404

        return Response({"created_at": row[0]})

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

