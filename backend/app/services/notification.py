import logging
from datetime import datetime

# Setup log configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("PillSyncNotification")

# Simple in-memory notification queue for frontend visual alerts
notifications_queue = []

def send_push_notification(user_id: int, user_email: str, medicine_name: str, dosage: str, reminder_time: str):
    message = f"Time to take your medication: {medicine_name} ({dosage}) scheduled for {reminder_time}."
    logger.info(f"[NOTIFICATION SENT] User ID {user_id} ({user_email}): {message}")
    
    event = {
        "user_id": user_id,
        "message": message,
        "medicine_name": medicine_name,
        "dosage": dosage,
        "reminder_time": reminder_time,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    notifications_queue.append(event)
    if len(notifications_queue) > 50:
        notifications_queue.pop(0)
