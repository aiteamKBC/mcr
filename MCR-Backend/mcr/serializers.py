from rest_framework import serializers
from .models import (
    McrReview, MeetingSectionTiming, QaIndicatorEvaluation,
    SafeguardingChecklistItem, EvidenceItem, Attachment, CommunicationLogEntry
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


class CommunicationLogEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunicationLogEntry
        fields = "__all__"


class CommunicationLogEntryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunicationLogEntry
        fields = ["recipient_type", "sent_at", "sent_by", "status", "notes"]


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
    communications = CommunicationLogEntrySerializer(many=True, read_only=True)

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


class DashboardMcrReviewDetailSerializer(DashboardMcrReviewListSerializer):
    executive_summary = serializers.CharField(allow_blank=True, default="")
    strengths = serializers.ListField(child=serializers.CharField(), default=list)
    priority_actions = serializers.JSONField(default=list)
    overall_rating = serializers.JSONField(default=dict)
    qa = serializers.JSONField(default=list)
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
