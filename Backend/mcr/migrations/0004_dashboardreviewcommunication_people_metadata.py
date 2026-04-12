# MCR file header: Backend\mcr\migrations\0004_dashboardreviewcommunication_people_metadata.py
# This file is part of the MCR application source.
# Purpose: Source file for the MCR application.


from django.db import migrations, models
from django.utils import timezone


class Migration(migrations.Migration):

    dependencies = [
        ("mcr", "0003_dashboard_review_communication_delivery_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="dashboardreviewcommunication",
            name="coach_email",
            field=models.EmailField(blank=True, default="", max_length=254),
        ),
        migrations.AddField(
            model_name="dashboardreviewcommunication",
            name="coach_name",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AddField(
            model_name="dashboardreviewcommunication",
            name="learner_email",
            field=models.EmailField(blank=True, default="", max_length=254),
        ),
        migrations.AddField(
            model_name="dashboardreviewcommunication",
            name="learner_full_name",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AddField(
            model_name="dashboardreviewcommunication",
            name="manager_email",
            field=models.EmailField(blank=True, default="", max_length=254),
        ),
        migrations.AddField(
            model_name="dashboardreviewcommunication",
            name="manager_name",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AlterField(
            model_name="dashboardreviewcommunication",
            name="sent_at",
            field=models.DateTimeField(default=timezone.now),
        ),
    ]
