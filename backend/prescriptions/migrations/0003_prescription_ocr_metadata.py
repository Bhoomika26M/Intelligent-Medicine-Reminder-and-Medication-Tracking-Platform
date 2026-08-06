from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("prescriptions", "0002_prescription_ocr_metadata"),
    ]

    operations = [
        migrations.AddField(
            model_name="prescription",
            name="ocr_metadata",
            field=models.JSONField(blank=True, default=dict),
        ),
    ]

