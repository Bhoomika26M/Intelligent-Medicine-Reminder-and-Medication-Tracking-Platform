from django.conf import settings
from django.core.mail import send_mail


def send_test_email(user_email):
    subject = "PillSync Test Reminder"
    message = """Hello,

This is a test email from PillSync.

If you received this email,
your SMTP configuration is working correctly.
"""

    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user_email],
            fail_silently=False,
        )
        return True, "Test email sent successfully"
    except Exception as e:
        return False, str(e)


def send_reminder_email(user_email, user_name, medicine_name, dosage, reminder_time):
    subject = "💊 Time to Take Your Medicine"
    message = f"""Hello {user_name},

This is a reminder that it's time to take your medicine.

Medicine: {medicine_name}
Dosage: {dosage}
Scheduled Time: {reminder_time}

Please take your medicine as prescribed.

If you have already taken it, you may ignore this email.

Regards,
PillSync Team
"""

    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user_email],
            fail_silently=False,
        )
        return True, "Reminder email sent successfully"
    except Exception as e:
        return False, str(e)


def send_low_stock_email(user_email, user_name, medicine_name, days_remaining):
    subject = "Low Stock Alert - PillSync"
    message = f"""Hello {user_name},

This is a low stock alert from PillSync.

Your medicine is running low:

Medicine:
{medicine_name}

Estimated days remaining:
{days_remaining} days

Please refill your medicine soon to avoid missing doses.

Stay Healthy!

PillSync Team
"""

    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user_email],
            fail_silently=False,
        )
        return True, "Low stock email sent successfully"
    except Exception as e:
        return False, str(e)


def send_upcoming_refill_email(user_email, user_name, medicine_name, days_remaining, run_out_date):
    subject = "Upcoming Refill Reminder - PillSync"
    message = f"""Hello {user_name},

This is a refill reminder from PillSync.

Your medicine is expected to run out soon:

Medicine:
{medicine_name}

Estimated days remaining:
{days_remaining} days

Predicted run-out date:
{run_out_date}

Please plan your refill in advance to avoid missing doses.

Stay Healthy!

PillSync Team
"""

    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user_email],
            fail_silently=False,
        )
        return True, "Upcoming refill email sent successfully"
    except Exception as e:
        return False, str(e)


def send_daily_confirmation_email(user_email, user_name, user_id, pending_reminders, base_url):
    subject = "Daily Medication Confirmation - PillSync"

    if not pending_reminders:
        message = f"""Hello {user_name},

This is your daily medication confirmation from PillSync.

You have no pending medications for today.

Stay Healthy!

PillSync Team
"""
    else:
        reminder_list = "\n".join([
            f"- {r['medicine_name']} at {r['reminder_time']}"
            for r in pending_reminders
        ])

        message = f"""Hello {user_name},

This is your daily medication confirmation from PillSync.

Please review your pending medications for today:

{reminder_list}

Stay Healthy!

PillSync Team
"""

    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user_email],
            fail_silently=False,
        )
        return True, "Daily confirmation email sent successfully"
    except Exception as e:
        return False, str(e)


def send_end_of_day_pending_email(user_email, user_name, user_id, pending_reminders, base_url):
    subject = "End of Day - Pending Medications - PillSync"

    if not pending_reminders:
        message = f"""Hello {user_name},

Great job! You have completed all your medications for today.

Stay Healthy!

PillSync Team
"""
    else:
        reminder_list = "\n".join([
            f"- {r['medicine_name']} at {r['reminder_time']}"
            for r in pending_reminders
        ])

        message = f"""Hello {user_name},

You have the following pending medications for today:

{reminder_list}

Please update your reminder status in the app once you have taken them.

Stay Healthy!

PillSync Team
"""

    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user_email],
            fail_silently=False,
        )
        return True, "End of day pending email sent successfully"
    except Exception as e:
        return False, str(e)
