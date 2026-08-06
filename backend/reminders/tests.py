from datetime import date, timedelta

from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase

from medicines.models import Medicine
from medication_history.models import MedicationHistory
from reminders.models import Reminder

User = get_user_model()


class ReminderAnalyticsTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(username="analytics", email="analytics@example.com", password="password123")
        self.client.force_authenticate(self.user)
        self.medicine = Medicine.objects.create(
            user=self.user,
            medicine_name="Metformin",
            dosage="500 mg",
            frequency_per_day=2,
            stock_quantity=20,
            expiry_date=date.today() + timedelta(days=90),
        )
        self.reminder = Reminder.objects.create(
            user=self.user,
            medicine=self.medicine,
            reminder_time="08:00:00",
        )
        MedicationHistory.objects.create(user=self.user, medicine=self.medicine, reminder=self.reminder, status="TAKEN")
        MedicationHistory.objects.create(user=self.user, medicine=self.medicine, reminder=self.reminder, status="MISSED")

    def test_adherence_analytics_endpoint_returns_expected_metrics(self):
        response = self.client.get("/api/reminders/analytics/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["taken_count"], 1)
        self.assertEqual(response.data["missed_count"], 1)
        self.assertEqual(response.data["adherence_percentage"], 50.0)
        self.assertEqual(response.data["refill_insights"]["days_remaining"], 10)
