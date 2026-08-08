from sqlalchemy.orm import Session
from datetime import date, time as pytime, datetime
from app.models.reminder import Reminder
from app.models.medicine import Medicine
from app.models.history import MedicationHistory
from app.schemas.reminder import ReminderCreate

def create_reminder(db: Session, user_id: int, reminder_data: ReminderCreate) -> Reminder:
    # Parse reminder time string to datetime.time object
    try:
        t_parsed = datetime.strptime(reminder_data.reminder_time, "%H:%M:%S").time()
    except ValueError:
        try:
            t_parsed = datetime.strptime(reminder_data.reminder_time, "%H:%M").time()
        except ValueError:
            t_parsed = datetime.strptime("12:00:00", "%H:%M:%S").time()
            
    db_reminder = Reminder(
        user_id=user_id,
        medicine_id=reminder_data.medicine_id,
        reminder_date=reminder_data.reminder_date,
        reminder_time=t_parsed,
        status="Pending",
        is_sent=False,
        is_enabled=True
    )
    db.add(db_reminder)
    db.commit()
    db.refresh(db_reminder)
    return db_reminder

def get_reminder_by_id(db: Session, reminder_id: int) -> Reminder:
    return db.query(Reminder).filter(Reminder.id == reminder_id).first()

def get_user_reminders(db: Session, user_id: int, target_date: date = None, status: str = None):
    query = db.query(Reminder).filter(Reminder.user_id == user_id)
    if target_date:
        query = query.filter(Reminder.reminder_date == target_date)
    if status:
        query = query.filter(Reminder.status == status)
    return query.order_by(Reminder.reminder_date.desc(), Reminder.reminder_time.asc()).all()

def update_reminder_status(db: Session, reminder_id: int, new_status: str) -> Reminder:
    reminder = get_reminder_by_id(db, reminder_id)
    if not reminder:
        return None
    
    old_status = reminder.status
    reminder.status = new_status
    db.commit()
    
    # If the status transitioned to Taken, Skipped, or Missed, insert into medication history
    if new_status in ["Taken", "Skipped", "Missed"] and old_status != new_status:
        # Create history record
        history_record = MedicationHistory(
            user_id=reminder.user_id,
            medicine_id=reminder.medicine_id,
            status=new_status,
            date=reminder.reminder_date,
            time=reminder.reminder_time
        )
        db.add(history_record)
        
        # Decrement remaining stock on medicine if "Taken"
        if new_status == "Taken":
            medicine = db.query(Medicine).filter(Medicine.id == reminder.medicine_id).first()
            if medicine and medicine.remaining_stock > 0:
                medicine.remaining_stock -= 1
                
        db.commit()
        db.refresh(reminder)
        
    return reminder

def toggle_reminder_enabled(db: Session, reminder_id: int, is_enabled: bool) -> Reminder:
    """Enable or disable a specific reminder."""
    reminder = get_reminder_by_id(db, reminder_id)
    if not reminder:
        return None
    reminder.is_enabled = is_enabled
    db.commit()
    db.refresh(reminder)
    return reminder

def delete_reminder(db: Session, reminder_id: int) -> bool:
    reminder = get_reminder_by_id(db, reminder_id)
    if not reminder:
        return False
    db.delete(reminder)
    db.commit()
    return True

