from django.db import models

class McrReview(models.Model):
    RAG_RED = "red"
    RAG_AMBER = "amber"
    RAG_GREEN = "green"
    RAG_CHOICES = [(RAG_RED, "Red"), (RAG_AMBER, "Amber"), (RAG_GREEN, "Green")]

    QR_OUTSTANDING = "outstanding"
    QR_STRONG = "strong"
    QR_REQUIRES_IMPROVEMENT = "requires_improvement"
    QR_CAUSE_FOR_CONCERN = "cause_for_concern"
    QUAL_CHOICES = [
        (QR_OUTSTANDING, "Outstanding"),
        (QR_STRONG, "Strong"),
        (QR_REQUIRES_IMPROVEMENT, "Requires Improvement"),
        (QR_CAUSE_FOR_CONCERN, "Cause for Concern"),
    ]

    date = models.DateField()
    programme = models.CharField(max_length=200, blank=True, default="")
    group = models.CharField(max_length=200, blank=True, default="")
    meeting_link = models.URLField(blank=True, default="")
    total_duration_min = models.PositiveIntegerField(default=0)

    coach_name = models.CharField(max_length=200)
    learner_name = models.CharField(max_length=200)

    rag_status = models.CharField(max_length=10, choices=RAG_CHOICES, default=RAG_AMBER)
    qualitative_rating = models.CharField(max_length=30, choices=QUAL_CHOICES, default=QR_STRONG)

    executive_summary = models.TextField(blank=True, default="")
    strengths = models.TextField(blank=True, default="")
    areas_for_development = models.TextField(blank=True, default="")
    professional_judgement = models.TextField(blank=True, default="")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class MeetingSectionTiming(models.Model):
    review = models.ForeignKey(McrReview, on_delete=models.CASCADE, related_name="section_timings")
    section_key = models.CharField(max_length=80)
    section_name = models.CharField(max_length=200)
    planned_min = models.PositiveIntegerField()
    actual_min = models.PositiveIntegerField(default=0)
    notes = models.TextField(blank=True, default="")

class QaIndicatorEvaluation(models.Model):
    STATUS_MET = "met"
    STATUS_PARTIAL = "partial"
    STATUS_NOT_MET = "not_met"
    STATUS_CHOICES = [(STATUS_MET, "Met"), (STATUS_PARTIAL, "Partially Met"), (STATUS_NOT_MET, "Not Met")]

    review = models.ForeignKey(McrReview, on_delete=models.CASCADE, related_name="qa_indicators")
    indicator_key = models.CharField(max_length=80)
    indicator_name = models.CharField(max_length=200)
    score0to5 = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PARTIAL)
    comments = models.TextField(blank=True, default="")
    evidence_urls = models.JSONField(default=list, blank=True)

class SafeguardingChecklistItem(models.Model):
    review = models.ForeignKey(McrReview, on_delete=models.CASCADE, related_name="safeguarding_items")
    key = models.CharField(max_length=120)
    label = models.CharField(max_length=220)
    status = models.CharField(max_length=20, choices=QaIndicatorEvaluation.STATUS_CHOICES, default=QaIndicatorEvaluation.STATUS_PARTIAL)
    notes = models.TextField(blank=True, default="")

class EvidenceItem(models.Model):
    review = models.ForeignKey(McrReview, on_delete=models.CASCADE, related_name="evidence_items")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, default="")
    verified = models.BooleanField(default=False)
    ksb_tags = models.JSONField(default=list, blank=True)
    epa_topics = models.JSONField(default=list, blank=True)
    links = models.JSONField(default=list, blank=True)

class Attachment(models.Model):
    review = models.ForeignKey(McrReview, on_delete=models.CASCADE, related_name="attachments")
    name = models.CharField(max_length=200)
    url = models.URLField()
    type = models.CharField(max_length=80, blank=True, default="")

class CommunicationLogEntry(models.Model):
    REC_EMPLOYER = "employer"
    REC_LEARNER = "learner"
    REC_QA = "qa_system"
    REC_CHOICES = [(REC_EMPLOYER, "Employer"), (REC_LEARNER, "Learner"), (REC_QA, "Quality Assurance system")]

    STATUS_SENT = "sent"
    STATUS_FAILED = "failed"
    STATUS_PENDING = "pending"
    STATUS_CHOICES = [(STATUS_SENT, "Sent"), (STATUS_FAILED, "Failed"), (STATUS_PENDING, "Pending")]

    review = models.ForeignKey(McrReview, on_delete=models.CASCADE, related_name="communications")
    recipient_type = models.CharField(max_length=20, choices=REC_CHOICES)
    sent_at = models.DateTimeField()
    sent_by = models.CharField(max_length=200, blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_SENT)
    notes = models.TextField(blank=True, default="")