# MCR file header: Backend\mcr\serializers.py
# This file is part of the MCR application source.
# Purpose: Source file for the MCR application.


from rest_framework import serializers
from .models import (
    McrReview, MeetingSectionTiming, QaIndicatorEvaluation,
    SafeguardingChecklistItem, EvidenceItem, Attachment, DashboardReviewAttachment,
)


class MeetingSectionTimingSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeetingSectionTiming
        fields = "__all__"


class QaIndicatorEvaluationSerializer(serializers.ModelSerializer):
    class Meta:
        model = QaIndicatorEvaluation
        fields = "__all__"


class SafeguardingChecklistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = SafeguardingChecklistItem
        fields = "__all__"


class EvidenceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvidenceItem
        fields = "__all__"


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = "__all__"


class DashboardReviewAttachmentSerializer(serializers.ModelSerializer):
    reviewId = serializers.IntegerField(source="review_id", read_only=True)
    name = serializers.CharField(source="original_name", read_only=True)
    url = serializers.SerializerMethodField()
    downloadUrl = serializers.SerializerMethodField()
    type = serializers.CharField(source="content_type", read_only=True)
    size = serializers.IntegerField(read_only=True)
    uploadedAt = serializers.DateTimeField(source="uploaded_at", read_only=True)
    uploadedBy = serializers.CharField(source="uploaded_by", read_only=True)
    visibleToLearner = serializers.BooleanField(source="visible_to_learner", read_only=True)

    class Meta:
        model = DashboardReviewAttachment
        fields = [
            "id",
            "reviewId",
            "name",
            "url",
            "downloadUrl",
            "type",
            "size",
            "uploadedAt",
            "uploadedBy",
            "visibleToLearner",
        ]

    def get_url(self, obj) -> str:
        return f"/api/mcr/reviews/{obj.review_id}/attachments/{obj.id}/file/"

    def get_downloadUrl(self, obj) -> str:
        return f"/api/mcr/reviews/{obj.review_id}/attachments/{obj.id}/download/"


class DashboardReviewAttachmentUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    uploaded_by = serializers.CharField(required=False, allow_blank=True, max_length=200)
    visible_to_learner = serializers.BooleanField(required=False, default=True)


class McrReviewListSerializer(serializers.ModelSerializer):
    safeguarding_flagged = serializers.SerializerMethodField()
    satisfaction_score = serializers.SerializerMethodField()

    class Meta:
        model = McrReview
        fields = [
            "id", "date", "programme", "group", "meeting_link", "total_duration_min",
            "coach_name", "learner_name", "rag_status", "qualitative_rating",
            "created_at", "updated_at", "safeguarding_flagged", "satisfaction_score"
        ]

    def get_safeguarding_flagged(self, obj) -> bool:
        return obj.safeguarding_items.filter(status="not_met").exists()

    def get_satisfaction_score(self, obj) -> int | None:
        ind = obj.qa_indicators.filter(indicator_key="satisfaction_aptem").first()
        return ind.score0to5 if ind else None


class McrReviewDetailSerializer(serializers.ModelSerializer):
    section_timings = MeetingSectionTimingSerializer(many=True, read_only=True)
    qa_indicators = QaIndicatorEvaluationSerializer(many=True, read_only=True)
    safeguarding_items = SafeguardingChecklistItemSerializer(many=True, read_only=True)
    evidence_items = EvidenceItemSerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = McrReview
        fields = "__all__"


class DashboardMcrReviewListSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    date = serializers.DateField(allow_null=True, required=False)
    programme = serializers.CharField(allow_blank=True, default="")
    group = serializers.CharField(allow_blank=True, default="")
    meeting_link = serializers.CharField(allow_blank=True, default="")
    total_duration_min = serializers.IntegerField(default=0)
    coach_name = serializers.CharField(allow_blank=True, default="")
    learner_name = serializers.CharField(allow_blank=True, default="")
    rag_status = serializers.CharField(allow_blank=True, default="amber")
    qualitative_rating = serializers.CharField(allow_blank=True, default="")
    created_at = serializers.DateTimeField(allow_null=True, required=False)
    updated_at = serializers.DateTimeField(allow_null=True, required=False)
    safeguarding_flagged = serializers.BooleanField(default=False)
    satisfaction_score = serializers.IntegerField(allow_null=True, required=False)
    meeting_day_date = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    meeting_starts_at = serializers.CharField(allow_blank=True, allow_null=True, required=False)


class DashboardMcrReviewDetailSerializer(DashboardMcrReviewListSerializer):
    executive_summary = serializers.CharField(allow_blank=True, default="")
    strengths = serializers.ListField(child=serializers.CharField(), default=list)
    priority_actions = serializers.JSONField(default=list)
    overall_rating = serializers.JSONField(default=dict)
    qa = serializers.JSONField(default=list)
    attachments = serializers.JSONField(default=list)
    booking_id = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    status = serializers.CharField(allow_blank=True, required=False)
    summary_text_raw = serializers.CharField(allow_blank=True, default="")
    summary_text_json = serializers.JSONField(allow_null=True, required=False)
    summary_json = serializers.JSONField(allow_null=True, required=False)


class BookingSessionSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    case_owner_id = serializers.IntegerField(allow_null=True, required=False)
    day_date = serializers.DateField(allow_null=True, required=False)
    booking_id = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    service_name = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    meeting_subject = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    customer_name = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    customer_email = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    duration_seconds = serializers.IntegerField(allow_null=True, required=False)
    total_participant_count = serializers.IntegerField(allow_null=True, required=False)
    staff_names = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    staff_emails = serializers.CharField(allow_blank=True, allow_null=True, required=False)
    created_at = serializers.DateTimeField(allow_null=True, required=False)
    updated_at = serializers.DateTimeField(allow_null=True, required=False)


class DashboardCoachSessionStatSerializer(serializers.Serializer):
    coach_name = serializers.CharField()
    session_count = serializers.IntegerField()
    total_duration_seconds = serializers.IntegerField()
    avg_minutes = serializers.FloatField()
    missing_transcript_sessions = serializers.IntegerField()


class DashboardSessionStatsSerializer(serializers.Serializer):
    total_sessions = serializers.IntegerField()
    total_duration_seconds = serializers.IntegerField()
    overall_avg_minutes = serializers.FloatField()
    sessions_without_transcript = serializers.IntegerField()
    coach_stats = DashboardCoachSessionStatSerializer(many=True)
