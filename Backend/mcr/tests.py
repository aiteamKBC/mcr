from pathlib import Path
import shutil
from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from .models import DashboardReviewAttachment
from .views import McrReviewViewSet


class DashboardReviewAttachmentApiTests(TestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls._media_root = Path(__file__).resolve().parent.parent / "test_media"
        shutil.rmtree(cls._media_root, ignore_errors=True)
        cls._media_root.mkdir(parents=True, exist_ok=True)
        cls._override = override_settings(MEDIA_ROOT=str(cls._media_root))
        cls._override.enable()

    @classmethod
    def tearDownClass(cls):
        cls._override.disable()
        shutil.rmtree(cls._media_root, ignore_errors=True)
        super().tearDownClass()

    def setUp(self):
        self.client = APIClient()
        self.review_stub = {
            "id": 123,
            "summary_text": "",
            "summary_json": {},
            "created_at": None,
        }

    def test_can_upload_list_and_download_review_attachment(self):
        upload = SimpleUploadedFile(
            "evidence.pdf",
            b"attachment-body",
            content_type="application/pdf",
        )

        with patch.object(McrReviewViewSet, "_get_row_or_404", return_value=self.review_stub):
            create_response = self.client.post(
                "/api/mcr/reviews/123/attachments/",
                {
                    "file": upload,
                    "uploaded_by": "Learner",
                    "visible_to_learner": "true",
                },
                format="multipart",
            )

            self.assertEqual(create_response.status_code, 201)
            self.assertEqual(create_response.data["name"], "evidence.pdf")
            self.assertEqual(create_response.data["type"], "application/pdf")

            list_response = self.client.get("/api/mcr/reviews/123/attachments/")
            self.assertEqual(list_response.status_code, 200)
            self.assertEqual(len(list_response.data), 1)
            self.assertEqual(list_response.data[0]["name"], "evidence.pdf")

            download_url = create_response.data["downloadUrl"]
            download_response = self.client.get(download_url)
            self.assertEqual(download_response.status_code, 200)
            self.assertEqual(
                b"".join(download_response.streaming_content),
                b"attachment-body",
            )

    def test_can_delete_review_attachment_and_file(self):
        upload = SimpleUploadedFile(
            "obsolete.pdf",
            b"old-attachment",
            content_type="application/pdf",
        )

        with patch.object(McrReviewViewSet, "_get_row_or_404", return_value=self.review_stub):
            create_response = self.client.post(
                "/api/mcr/reviews/123/attachments/",
                {
                    "file": upload,
                },
                format="multipart",
            )

            self.assertEqual(create_response.status_code, 201)
            attachment_id = create_response.data["id"]
            attachment = DashboardReviewAttachment.objects.get(id=attachment_id)
            stored_path = Path(attachment.file.path)
            self.assertTrue(stored_path.exists())

            delete_response = self.client.delete(f"/api/mcr/reviews/123/attachments/{attachment_id}/")
            self.assertEqual(delete_response.status_code, 200)
            self.assertEqual(delete_response.data["deletedId"], attachment_id)
            self.assertFalse(DashboardReviewAttachment.objects.filter(id=attachment_id).exists())
            self.assertFalse(stored_path.exists())

            list_response = self.client.get("/api/mcr/reviews/123/attachments/")
            self.assertEqual(list_response.status_code, 200)
            self.assertEqual(list_response.data, [])

    def test_review_detail_includes_uploaded_attachments(self):
        DashboardReviewAttachment.objects.create(
            review_id=123,
            file=SimpleUploadedFile("notes.docx", b"doc-body", content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
            original_name="notes.docx",
            content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            size=len(b"doc-body"),
            uploaded_by="Learner",
            visible_to_learner=True,
        )

        mapped_review = {
            "id": 123,
            "date": None,
            "programme": "",
            "group": "",
            "meeting_link": "",
            "total_duration_min": 0,
            "coach_name": "",
            "learner_name": "",
            "rag_status": "amber",
            "qualitative_rating": "",
            "created_at": None,
            "updated_at": None,
            "safeguarding_flagged": False,
            "satisfaction_score": None,
            "executive_summary": "",
            "strengths": [],
            "priority_actions": [],
            "overall_rating": {},
            "qa": [],
            "booking_id": None,
            "status": "",
            "summary_text_raw": "",
            "summary_text_json": None,
            "summary_json": None,
        }

        with patch.object(McrReviewViewSet, "_get_mapped_review_or_404", return_value=mapped_review), patch.object(
            McrReviewViewSet,
            "_enrich_meeting_schedule_bulk",
            return_value=None,
        ):
            response = self.client.get("/api/mcr/reviews/123/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["attachments"]), 1)
        self.assertEqual(response.data["attachments"][0]["name"], "notes.docx")


class DashboardSessionStatsApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_dashboard_session_stats_endpoint_returns_aggregates(self):
        payload = {
            "total_sessions": 271,
            "total_duration_seconds": 780660,
            "overall_avg_minutes": 50.63,
            "sessions_without_transcript": 271,
            "coach_stats": [
                {
                    "coach_name": "Femi Falodun",
                    "session_count": 39,
                    "total_duration_seconds": 114624,
                    "avg_minutes": 48.98,
                    "missing_transcript_sessions": 39,
                }
            ],
        }

        with patch.object(McrReviewViewSet, "_build_dashboard_session_stats", return_value=payload) as stats_mock:
            response = self.client.get(
                "/api/mcr/dashboard/session-stats/?date_from=2026-04-01&date_to=2026-04-30&booking_id=abc&booking_id=def"
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_sessions"], 271)
        self.assertEqual(response.data["sessions_without_transcript"], 271)
        self.assertEqual(response.data["coach_stats"][0]["coach_name"], "Femi Falodun")
        stats_mock.assert_called_once_with(
            date_from="2026-04-01",
            date_to="2026-04-30",
            booking_ids=["abc", "def"],
        )

    def test_dashboard_session_stats_endpoint_accepts_post_body(self):
        payload = {
            "total_sessions": 2,
            "total_duration_seconds": 5400,
            "overall_avg_minutes": 45.0,
            "sessions_without_transcript": 1,
            "coach_stats": [],
        }

        with patch.object(McrReviewViewSet, "_build_dashboard_session_stats", return_value=payload) as stats_mock:
            response = self.client.post(
                "/api/mcr/dashboard/session-stats/",
                {
                    "date_from": "2026-04-01",
                    "date_to": "2026-04-30",
                    "booking_ids": ["abc", "def"],
                },
                format="json",
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_sessions"], 2)
        stats_mock.assert_called_once_with(
            date_from="2026-04-01",
            date_to="2026-04-30",
            booking_ids=["abc", "def"],
        )
