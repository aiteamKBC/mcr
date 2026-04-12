# MCR file header: Backend\mcr\migrations\0009_alter_dashboardreviewattachment_id.py
# This file is part of the MCR application source.
# Purpose: Align DashboardReviewAttachment primary key type with the app default.


from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("mcr", "0008_alter_attachment_id_alter_evidenceitem_id_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="dashboardreviewattachment",
            name="id",
            field=models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID"),
        ),
    ]
