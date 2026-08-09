from datetime import timedelta

from .models import MedicationSchedule

def calculate_refill_days(medicine):
    if medicine.daily_frequency == 0:
        return 0

    daily_consumption = (
        medicine.quantity_per_dose * medicine.daily_frequency
    )

    remaining_days = medicine.remaining_quantity / daily_consumption

    return int(remaining_days)



def calculate_extended_treatment(medicine):
    if medicine.daily_frequency == 0:
        return {
            "planned_days": 0,
            "missed_days": 0,
            "extended_days": 0,
            "expected_end_date": None,
        }

    daily_consumption = (
        medicine.quantity_per_dose * medicine.daily_frequency
    )

    planned_days = int(medicine.quantity / daily_consumption)

    missed_days = MedicationSchedule.objects.filter(
        medicine=medicine,
        status="MISSED"
    ).count()

    extended_days = planned_days + missed_days

    expected_end_date = (
        medicine.created_at.date() +
        timedelta(days=extended_days)
    )

    return {
        "planned_days": planned_days,
        "missed_days": missed_days,
        "extended_days": extended_days,
        "expected_end_date": expected_end_date,
    }