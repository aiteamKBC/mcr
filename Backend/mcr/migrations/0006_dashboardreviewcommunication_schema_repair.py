from django.db import migrations


def add_missing_dashboard_communication_columns(apps, schema_editor):
    table_name = "mcr_dashboardreviewcommunication"
    connection = schema_editor.connection

    if table_name not in connection.introspection.table_names():
        return

    with connection.cursor() as cursor:
        existing_columns = {
            column.name
            for column in connection.introspection.get_table_description(cursor, table_name)
        }

    if "status" not in existing_columns:
        schema_editor.execute(
            f"ALTER TABLE {table_name} ADD COLUMN status varchar(20) NOT NULL DEFAULT 'sent'"
        )

    if "error_message" not in existing_columns:
        schema_editor.execute(
            f"ALTER TABLE {table_name} ADD COLUMN error_message text NULL"
        )


class Migration(migrations.Migration):

    dependencies = [
        ("mcr", "0005_alter_attachment_id_alter_communicationlogentry_id_and_more"),
    ]

    operations = [
        migrations.RunPython(
            add_missing_dashboard_communication_columns,
            reverse_code=migrations.RunPython.noop,
        ),
    ]
