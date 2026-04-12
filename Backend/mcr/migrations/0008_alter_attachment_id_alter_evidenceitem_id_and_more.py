# MCR file header: Backend\mcr\migrations\0008_alter_attachment_id_alter_evidenceitem_id_and_more.py
# This file is part of the MCR application source.
# Purpose: Align legacy MCR model primary keys with AutoField.


from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("mcr", "0007_dashboardreviewattachment"),
    ]

    operations = [
        migrations.AlterField(
            model_name="attachment",
            name="id",
            field=models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID"),
        ),
        migrations.AlterField(
            model_name="evidenceitem",
            name="id",
            field=models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID"),
        ),
        migrations.AlterField(
            model_name="mcrreview",
            name="id",
            field=models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID"),
        ),
        migrations.AlterField(
            model_name="meetingsectiontiming",
            name="id",
            field=models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID"),
        ),
        migrations.AlterField(
            model_name="qaindicatorevaluation",
            name="id",
            field=models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID"),
        ),
        migrations.AlterField(
            model_name="safeguardingchecklistitem",
            name="id",
            field=models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID"),
        ),
    ]
