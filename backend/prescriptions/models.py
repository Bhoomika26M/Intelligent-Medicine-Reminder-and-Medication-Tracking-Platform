from django.db import models
from django.conf import settings


class Prescription(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="prescriptions"
    )

    prescription_image = models.ImageField(
        upload_to="prescriptions/"
    )

    doctor_name = models.CharField(max_length=100)

    hospital_name = models.CharField(max_length=150)

    prescription_date = models.DateField()

    notes = models.TextField(blank=True)

    ocr_text = models.TextField(blank=True, default="")
    ocr_source = models.CharField(max_length=20, blank=True, default="printed")
    ocr_metadata = models.JSONField(default=dict, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.doctor_name}"
