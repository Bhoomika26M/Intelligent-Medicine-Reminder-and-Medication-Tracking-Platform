from apscheduler.schedulers.background import BackgroundScheduler
from .tasks import send_medication_reminders

scheduler = None


def start():
    global scheduler

    # Prevent multiple scheduler instances
    if scheduler is not None and scheduler.running:
        print("Scheduler already running...")
        return

    scheduler = BackgroundScheduler()

    scheduler.add_job(
        send_medication_reminders,
        trigger="interval",
        minutes=1,
        id="medicine_reminders",
        replace_existing=True,
    )

    scheduler.start()

    print("Scheduler started successfully.")