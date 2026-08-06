from collections import Counter
from datetime import date, timedelta

from django.db.models import Count
from django.utils import timezone

from medicines.models import Medicine
from medication_history.models import MedicationHistory
from reminders.models import Reminder


def get_adherence_analytics(user, days: int = 30):
    days = max(1, int(days or 30))
    today = timezone.localdate()
    start_date = today - timedelta(days=days - 1)

    history = MedicationHistory.objects.filter(user=user)
    history_range = history.filter(date__gte=start_date, date__lte=today)

    taken_count = history_range.filter(status="TAKEN").count()
    missed_count = history_range.filter(status="MISSED").count()
    snoozed_count = history_range.filter(status="SNOOZED").count()

    total = taken_count + missed_count + snoozed_count
    adherence_percentage = round((taken_count / total) * 100, 2) if total else 0.0

    strict_total = taken_count + missed_count
    adherence_percentage_strict = round((taken_count / strict_total) * 100, 2) if strict_total else 0.0

    reminders = Reminder.objects.filter(user=user, is_active=True).select_related("medicine")
    medicines = Medicine.objects.filter(user=user)

    expected_by_day = {}
    expected_by_medicine = Counter()
    for offset in range(days):
        day = start_date + timedelta(days=offset)
        expected_for_day = Counter()
        for reminder in reminders:
            if reminder.matches_schedule_for_date(day):
                expected_for_day[reminder.medicine_id] += 1
                expected_by_medicine[reminder.medicine_id] += 1
        expected_by_day[str(day)] = dict(expected_for_day)

    daily = []
    for offset in range(days):
        day = start_date + timedelta(days=offset)
        day_taken = history_range.filter(date=day, status="TAKEN").count()
        day_missed = history_range.filter(date=day, status="MISSED").count()
        day_snoozed = history_range.filter(date=day, status="SNOOZED").count()
        day_total = day_taken + day_missed + day_snoozed
        day_adherence = round((day_taken / day_total) * 100, 2) if day_total else 0.0
        daily.append(
            {
                "date": str(day),
                "taken": day_taken,
                "missed": day_missed,
                "snoozed": day_snoozed,
                "adherence_percentage": day_adherence,
                "expected_doses": sum(expected_by_day.get(str(day), {}).values()),
            }
        )

    refill_items = []
    for medicine in medicines:
        days_remaining = medicine.calculate_days_remaining()
        refill_items.append(
            {
                "medicine_id": medicine.id,
                "medicine_name": medicine.medicine_name,
                "stock_quantity": medicine.stock_quantity,
                "days_remaining": days_remaining,
                "predicted_run_out_date": str(medicine.predicted_run_out_date()),
                "needs_refill": medicine.is_low_stock(),
                "upcoming_refill": days_remaining <= 5,
            }
        )

    medicine_breakdown = []
    for medicine in medicines:
        medicine_history = history_range.filter(medicine=medicine)
        med_taken = medicine_history.filter(status="TAKEN").count()
        med_missed = medicine_history.filter(status="MISSED").count()
        med_snoozed = medicine_history.filter(status="SNOOZED").count()
        med_total = med_taken + med_missed + med_snoozed
        med_adherence = round((med_taken / med_total) * 100, 2) if med_total else 0.0
        expected = expected_by_medicine.get(medicine.id, 0)
        expected_adherence = round((med_taken / expected) * 100, 2) if expected else 0.0
        medicine_breakdown.append(
            {
                "medicine_id": medicine.id,
                "medicine_name": medicine.medicine_name,
                "taken": med_taken,
                "missed": med_missed,
                "snoozed": med_snoozed,
                "adherence_percentage": med_adherence,
                "expected_doses": expected,
                "expected_adherence_percentage": expected_adherence,
            }
        )

    missed_by_hour = Counter()
    for time_value in history_range.filter(status="MISSED").values_list("time", flat=True):
        if time_value is None:
            continue
        missed_by_hour[int(time_value.hour)] += 1

    trend = Counter(history_range.values_list("status", flat=True))
    return {
        "window": {"days": days, "start_date": str(start_date), "end_date": str(today)},
        "taken_count": taken_count,
        "missed_count": missed_count,
        "snoozed_count": snoozed_count,
        "adherence_percentage": adherence_percentage,
        "adherence_percentage_strict": adherence_percentage_strict,
        "trend": dict(trend),
        "daily": daily,
        "dosage_analysis": {
            "expected_by_day": expected_by_day,
            "missed_by_hour": dict(missed_by_hour),
        },
        "medicine_breakdown": medicine_breakdown,
        "refill_insights": {
            "items": refill_items,
            "days_remaining": min((item["days_remaining"] for item in refill_items), default=0),
            "needs_refill": any(item["needs_refill"] for item in refill_items),
            "upcoming_refill": any(item["upcoming_refill"] for item in refill_items),
        },
        "summary": {
            "active_reminders": reminders.count(),
            "medicines_with_low_stock": sum(1 for item in refill_items if item["needs_refill"]),
            "medicines_with_upcoming_refill": sum(1 for item in refill_items if item["upcoming_refill"]),
        },
    }
