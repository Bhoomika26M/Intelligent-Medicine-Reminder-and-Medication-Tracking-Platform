"""
Scheduler that checks reminder times every minute.
When the current time matches a reminder time, it prints a log line.
(The actual browser notification is triggered from the frontend.)
"""
from apscheduler.schedulers.background import BackgroundScheduler
from database import medicines_table, reminders_table
from datetime import datetime


def check_reminders():
    now = datetime.now()
    current_time = now.strftime("%H:%M")
    for med in medicines_table.all():
        reminder_time = med.get("reminder_time", "")
        if reminder_time == current_time:
            print(f"[REMINDER] Time to take {med.get('name')} - {med.get('dosage')}")


def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(check_reminders, "interval", minutes=1)
    scheduler.start()
    return scheduler
