from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("medicines", "0003_medicine_low_stock_email_sent"),
    ]

    operations = [
        migrations.AddField(
            model_name="medicine",
            name="upcoming_refill_email_sent",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="medicine",
            name="units_per_dose",
            field=models.PositiveIntegerField(default=1),
        ),
    ]

