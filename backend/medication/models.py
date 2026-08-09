from django.db import models
from users.models import User
from django.conf import settings

class Treatment(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="treatments"
    )

    disease_name = models.CharField(max_length=100)

    doctor_name = models.CharField(
        max_length=100,
        default="Unknown"
    )

    hospital_name = models.CharField(
        max_length=100,
        default="Unknown"
    )

    start_date = models.DateField(
        auto_now_add=True
    )

    end_date = models.DateField(
        null=True,
        blank=True
    )

    def __str__(self):
        return self.disease_name


class Medicine(models.Model):

    DISEASE_CHOICES = [
        ("BP", "Blood Pressure"),
        ("DIABETES", "Diabetes"),
        ("THYROID", "Thyroid"),
        ("HEART", "Heart Disease"),
        ("ASTHMA", "Asthma"),
        ("FEVER", "Fever"),
        ("VITAMINS", "Vitamin Deficiency"),
        ("OTHER", "Other"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="medicines"
    )

    treatment = models.ForeignKey(
        Treatment,
        on_delete=models.CASCADE,
        related_name="medicines",
        null=True,
        blank=True
    )

    disease = models.CharField(
        max_length=100,
       
    )

    medicine_name = models.CharField(
        max_length=100
    )

    dosage = models.CharField(
        max_length=100
    )

    quantity = models.PositiveIntegerField()

    frequency = models.CharField(
        max_length=100
    )

    quantity_per_dose = models.PositiveIntegerField(
        default=1
    )

    daily_frequency = models.PositiveIntegerField(
        default=1
    )

    reminder_time = models.TimeField()

    remaining_quantity = models.PositiveIntegerField(
        default=0
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def save(self, *args, **kwargs):

        if self.remaining_quantity == 0:
            self.remaining_quantity = self.quantity

        super().save(*args, **kwargs)

    def __str__(self):
        return self.medicine_name


class MedicationSchedule(models.Model):

    STATUS_CHOICES = [
        ("PENDING", "Pending"),
        ("TAKEN", "Taken"),
        ("MISSED", "Missed"),
    ]

    medicine = models.ForeignKey(
        Medicine,
        on_delete=models.CASCADE,
        related_name="schedules"
    )

    reminder_time = models.TimeField()

    quantity_per_dose = models.PositiveIntegerField(
        default=1
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.medicine.medicine_name} - {self.reminder_time}"
class MedicineHistory(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    medicine_name = models.CharField(max_length=255)

    disease = models.CharField(
        max_length=100,
        default="OTHER"
    )

    dosage = models.CharField(
        max_length=100,
        blank=True
    )

    quantity = models.IntegerField(default=0)

    remaining_quantity = models.IntegerField(default=0)

    frequency = models.CharField(
        max_length=100,
        blank=True
    )

    reminder_time = models.TimeField(
        null=True,
        blank=True
    )

    action = models.CharField(
        max_length=20,
        default="ADDED"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.medicine_name} ({self.action})"
class CaregiverAssignment(models.Model):
    caregiver = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='assigned_patients'
    )

    patient = models.ForeignKey(
        'users.User',
        on_delete=models.CASCADE,
        related_name='assigned_caregivers'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('caregiver', 'patient')

    def __str__(self):
        return f"{self.caregiver.username} → {self.patient.username}"