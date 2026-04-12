# MCR file header: Backend\mcr\migrations\0003_dashboard_review_communication_delivery_fields.py
# This file is part of the MCR application source.
# Purpose: Source file for the MCR application.


from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("mcr", "0002_dashboard_review_communication"),
    ]

    operations = [
        migrations.AddField(
            model_name="dashboardreviewcommunication",
            name="error_message",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="dashboardreviewcommunication",
            name="recipient_email",
            field=models.EmailField(blank=True, default="", max_length=254),
        ),
    ]
