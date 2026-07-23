from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session
from datetime import date, datetime, time as pytime, timedelta
from app.database import SessionLocal
from app.models.medicine import Medicine
from app.models.reminder import Reminder
from app.models.user import User
from app.models.history import MedicationHistory
from app.services.notification import send_push_notification

scheduler = BackgroundScheduler()

def check_and_generate_reminders():
    db: Session = SessionLocal()
    try:
        now = datetime.now()
        today = now.date()
        
        # 1. GENERATE REMINDERS FOR ACTIVE MEDICINES
        # Fetch medicines that span today
        active_medicines = db.query(Medicine).filter(
            Medicine.start_date <= today,
            Medicine.end_date >= today
        ).all()
        
        for medicine in active_medicines:
            # Parse scheduled times (comma-separated list, e.g. "08:00, 13:00, 20:00")
            times = [t.strip() for t in medicine.reminder_time.split(",") if t.strip()]
            for t_str in times:
                parts = t_str.split(":")
                if len(parts) >= 2:
                    hh, mm = parts[0], parts[1]
                    # If this is the hour and minute of the scheduled reminder, trigger it!
                    if hh.zfill(2) == str(now.hour).zfill(2) and mm.zfill(2) == str(now.minute).zfill(2):
                        t_obj = pytime(int(hh), int(mm))
                        
                        # Verify we haven't already generated a reminder for today/time combination
                        existing = db.query(Reminder).filter(
                            Reminder.medicine_id == medicine.id,
                            Reminder.reminder_date == today,
                            Reminder.reminder_time == t_obj
                        ).first()
                        
                        if not existing:
                            user = db.query(User).filter(User.id == medicine.user_id).first()
                            user_email = user.email if user else "unknown@pillsync.com"
                            
                            # Create reminder entry
                            new_reminder = Reminder(
                                user_id=medicine.user_id,
                                medicine_id=medicine.id,
                                reminder_date=today,
                                reminder_time=t_obj,
                                status="Pending",
                                is_sent=True
                            )
                            db.add(new_reminder)
                            db.commit()
                            
                            # Execute push notification dispatch
                            send_push_notification(
                                user_id=medicine.user_id,
                                user_email=user_email,
                                medicine_name=medicine.name,
                                dosage=medicine.dosage,
                                reminder_time=t_str
                            )
                            
        # 2. AUTO-MISS OVERDUE DOSES
        # Mark Pending reminders older than 2 hours, or from prior days, as "Missed".
        overdue_threshold = now - timedelta(hours=2)
        overdue_time = overdue_threshold.time()
        
        # Grab past days' reminders that are still pending
        yesterday_pending = db.query(Reminder).filter(
            Reminder.status == "Pending",
            Reminder.reminder_date < today
        ).all()
        
        # Grab today's reminders that are 2 hours overdue
        today_overdue_pending = db.query(Reminder).filter(
            Reminder.status == "Pending",
            Reminder.reminder_date == today,
            Reminder.reminder_time < overdue_time
        ).all()
        
        all_overdue = yesterday_pending + today_overdue_pending
        for r in all_overdue:
            r.status = "Missed"
            
            # Log automatically into history
            hist = MedicationHistory(
                user_id=r.user_id,
                medicine_id=r.medicine_id,
                status="Missed",
                date=r.reminder_date,
                time=r.reminder_time
            )
            db.add(hist)
            
        if all_overdue:
            db.commit()
            
    except Exception as e:
        print(f"Error in background reminder scheduler: {str(e)}")
    finally:
        db.close()

def start_scheduler():
    if not scheduler.running:
        # Schedule cron job to check reminders every minute
        scheduler.add_job(check_and_generate_reminders, 'cron', second=0, id='reminder_checker_job')
        scheduler.start()

def shutdown_scheduler():
    if scheduler.running:
        scheduler.shutdown()
