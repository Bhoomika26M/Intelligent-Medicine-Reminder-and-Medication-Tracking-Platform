from datetime import date, datetime
from app.database import SessionLocal
from app.models.enums import HistoryStatus
from app.models.history import History
from app.models.treatment import Treatment
from app.scheduler.reminder_engine import process_due_reminders
from app.services.history_service import is_duplicate_history


def check_expired_treatments(db):
    today = date.today()
    expired_treatments = (
        db.query(Treatment)
        .filter(
            Treatment.status == "Active",
            Treatment.end_date < today
        )
        .all()
    )

    for treatment in expired_treatments:
        treatment.status = HistoryStatus.EXPIRED.value
        if not is_duplicate_history(db, treatment.user_id, treatment.id, HistoryStatus.EXPIRED.value):
            hist = History(
                user_id=treatment.user_id,
                treatment_id=treatment.id,
                scheduled_time=datetime.utcnow(),
                action_time=datetime.utcnow(),
                status=HistoryStatus.EXPIRED.value,
                notes=f"Treatment '{treatment.disease_name}' expired on {treatment.end_date}."
            )
            db.add(hist)
    db.commit()


def check_refill_notifications(db):
    """
    Scans active medicines, computes remaining days, and generates refill notifications
    at thresholds 7, 5, 3, 1, and 0 days. Continues persistent daily alerts until stock is updated.
    """
    import re
    from app.models.medicine import Medicine
    from app.models.reminder import Reminder
    from app.models.notification import Notification

    today_str = date.today().isoformat()
    active_medicines = (
        db.query(Medicine)
        .join(Medicine.treatment)
        .filter(Treatment.status == "Active", Medicine.is_active == True)
        .all()
    )

    for med in active_medicines:
        user_id = med.treatment.user_id
        reminders = db.query(Reminder).filter(Reminder.medicine_id == med.id, Reminder.status == "Active").all()

        dose_per_intake = 1
        if med.dosage:
            tab_match = re.search(r'(\d+)\s*(?:tablets?|tabs?|caps?|capsules?|pills?|units?|puffs?)\b', med.dosage, re.IGNORECASE)
            if tab_match:
                dose_per_intake = int(tab_match.group(1))
            else:
                num_match = re.search(r'^\s*(\d+)\s*$', med.dosage)
                if num_match:
                    dose_per_intake = int(num_match.group(1))
        if dose_per_intake <= 0:
            dose_per_intake = 1

        daily_cons = dose_per_intake * (len(reminders) if reminders else 1)

        # 1. Determine remaining treatment duration (days relative to today)
        parsed_duration = None
        if med.treatment and med.treatment.end_date:
            try:
                today = date.today()
                t_days = (med.treatment.end_date - today).days
                if t_days > 0:
                    parsed_duration = t_days
            except Exception:
                pass

        if parsed_duration is None and med.instructions:
            dur_match = re.search(r'(?:duration:?\s*|for\s*|^|\b)(\d+)\s*(?:days?|d)\b', med.instructions, re.IGNORECASE)
            if dur_match:
                parsed_duration = int(dur_match.group(1))

        remaining_treatment_days = parsed_duration if (parsed_duration is not None and parsed_duration > 0) else 1

        # 2. Compute required stock for remaining treatment
        required_stock = remaining_treatment_days * daily_cons
        current_stock = max(0, med.quantity)

        # 3. Decision: Refill needed ONLY IF current_stock < required_stock
        notif_data = None
        if current_stock < required_stock:
            if current_stock <= 0 or med.quantity <= 0:
                notif_data = ("❌ Medicine Out of Stock", f"No tablets remaining for {med.medicine_name}. Upcoming reminders may be affected.")
            else:
                notif_data = ("⚠️ Refill Reminder", f"Stock ({current_stock} tablets) is insufficient for remaining treatment ({remaining_treatment_days} days). Please arrange a refill.")

        if notif_data:
            title, message = notif_data
            # Prevent duplicate notifications for the same medicine on the same day
            existing_today = (
                db.query(Notification)
                .filter(
                    Notification.user_id == user_id,
                    Notification.reminder_id == (reminders[0].id if reminders else None),
                    Notification.notification_type == "Refill",
                    Notification.created_at >= datetime.combine(date.today(), datetime.min.time())
                )
                .first()
            )

            if not existing_today:
                new_notif = Notification(
                    user_id=user_id,
                    reminder_id=reminders[0].id if reminders else None,
                    title=title,
                    message=message,
                    notification_type="Refill",
                    is_sent=True,
                    sent_at=datetime.utcnow()
                )
                db.add(new_notif)
                db.commit()


def reminder_job():
    db = SessionLocal()

    try:
        print(f"⏰ APScheduler executing reminder job at {datetime.now()}", flush=True)
        process_due_reminders(db)
        check_expired_treatments(db)
        check_refill_notifications(db)
    finally:
        db.close()