from django.db import models
from django.conf import settings
from datetime import timedelta

from django.utils import timezone


class Medicine(models.Model):

    MEDICINE_TYPES = [
        ("Tablet", "Tablet"),
        ("Capsule", "Capsule"),
        ("Syrup", "Syrup"),
        ("Injection", "Injection"),
        ("Drops", "Drops"),
        ("Ointment", "Ointment"),
        ("Other", "Other"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="medicines"
    )

    medicine_name = models.CharField(max_length=100)

    dosage = models.CharField(max_length=50)

    medicine_type = models.CharField(
        max_length=20,
        choices=MEDICINE_TYPES,
        default="Tablet"
    )

    frequency_per_day = models.PositiveIntegerField(default=1)

    dose_times = models.JSONField(default=list, blank=True, null=True)

    SCHEDULE_CHOICES = [
        ("MORNING", "Morning"),
        ("AFTERNOON", "Afternoon"),
        ("NIGHT", "Night"),
        ("CUSTOM", "Custom"),
    ]

    schedule_type = models.CharField(
        max_length=20,
        choices=SCHEDULE_CHOICES,
        default="CUSTOM",
        blank=True,
        null=True
    )

    stock_quantity = models.PositiveIntegerField()

    low_stock_email_sent = models.BooleanField(default=False)

    upcoming_refill_email_sent = models.BooleanField(default=False)

    units_per_dose = models.PositiveIntegerField(default=1)

    expiry_date = models.DateField()

    instructions = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.medicine_name

    def calculate_days_remaining(self):
        try:
            frequency = self.frequency_per_day if self.frequency_per_day > 0 else 1
            units_per_intake = self.units_per_dose if self.units_per_dose > 0 else 1
            daily_consumption = units_per_intake * frequency
            if daily_consumption == 0:
                daily_consumption = 1

            days_remaining = self.stock_quantity // daily_consumption
            return max(0, days_remaining)
        except Exception as e:
            return 0

    def is_low_stock(self, threshold_days=3):
        return self.calculate_days_remaining() <= threshold_days

    def daily_consumption_units(self) -> int:
        frequency = self.frequency_per_day if self.frequency_per_day > 0 else 1
        units_per_intake = self.units_per_dose if self.units_per_dose > 0 else 1
        return max(1, frequency * units_per_intake)

    def predicted_run_out_date(self):
        return timezone.localdate() + timedelta(days=self.calculate_days_remaining())

    def decrement_stock(self, amount=1):
        self.stock_quantity = max(0, self.stock_quantity - amount)
        return self.stock_quantity
