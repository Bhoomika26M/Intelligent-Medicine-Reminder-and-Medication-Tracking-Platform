from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('prescriptions', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='prescription',
            name='ocr_text',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='prescription',
            name='ocr_source',
            field=models.CharField(blank=True, default='printed', max_length=20),
        ),
    ]