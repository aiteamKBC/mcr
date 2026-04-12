from django.db import migrations, models

import mcr.models


class Migration(migrations.Migration):

    dependencies = [
        ("mcr", "0006_dashboardreviewcommunication_schema_repair"),
        ("mcr", "0003_remove_communication_log"),
    ]

    operations = [
        migrations.CreateModel(
            name="DashboardReviewAttachment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("review_id", models.BigIntegerField(db_index=True)),
                ("file", models.FileField(max_length=500, upload_to=mcr.models.dashboard_review_attachment_upload_to)),
                ("original_name", models.CharField(max_length=255)),
                ("content_type", models.CharField(blank=True, default="", max_length=120)),
                ("size", models.PositiveBigIntegerField(default=0)),
                ("uploaded_by", models.CharField(blank=True, default="", max_length=200)),
                ("visible_to_learner", models.BooleanField(default=True)),
                ("uploaded_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["-uploaded_at", "-id"],
            },
        ),
    ]
