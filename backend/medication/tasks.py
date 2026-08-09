from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone

from .models import MedicationSchedule
from .refill import calculate_refill_days


def send_medication_reminders():
    print("========== Scheduler Running ==========")

    current_time = (
        timezone.localtime()
        .time()
        .replace(second=0, microsecond=0)
    )

    print("Checking reminders at:", current_time)

    schedules = MedicationSchedule.objects.filter(
        reminder_time=current_time,
        status="PENDING"
    )

    print("Schedules found:", schedules.count())

    for schedule in schedules:

        medicine = schedule.medicine
        user = medicine.user

        print(f"Sending reminder to: {user.email}")

        try:
            send_mail(
                subject="💊 PillSync Reminder: Time for Your Medicine",
 message=f"""
Hello {user.first_name},

⏰ It's time to take your medicine.

💊 Medicine : {medicine.medicine_name}
    Dosage   : {medicine.dosage}
    Quantity : {schedule.quantity_per_dose}
    Time     : {schedule.reminder_time}

-----------------------------------

Click the link below to open PillSync
and mark your medicine as Taken or Missed.

http://localhost:5173/reminders

-----------------------------------

Thank you,
PillSync Team
""",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[user.email],
                fail_silently=False,
            )

            print("Reminder email sent successfully.")

        except Exception as e:
            print("Email Error:", str(e))

        # IMPORTANT:
        # Do NOT reduce medicine quantity here.
        # Quantity is reduced only when the user
        # clicks the "Taken" button.

        check_refill_alert(medicine)

    print("========== Scheduler Completed ==========")


def check_refill_alert(medicine):

    days_left = calculate_refill_days(medicine)

    print("Remaining Quantity:", medicine.remaining_quantity)
    print("Estimated Days Left:", days_left)

    if medicine.remaining_quantity == 0:

        send_mail(
            subject="🚨 PillSync: Medicine Out of Stock",
            message=f"""
Hello {medicine.user.first_name},

Your medicine has completely finished.

Medicine: {medicine.medicine_name}

Remaining Tablets: 0

Please refill your medicine immediately.

— PillSync Team
""",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[medicine.user.email],
            fail_silently=False,
        )

        print("Out of stock email sent.")

    elif days_left <= 5:

        send_mail(
            subject="💊 PillSync Refill Alert",
            message=f"""
Hello {medicine.user.first_name},

Your medicine stock is running low.

Medicine: {medicine.medicine_name}

Remaining Tablets: {medicine.remaining_quantity}

Estimated Days Left: {days_left}

Please arrange a refill before your medicine runs out.

— PillSync Team
""",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[medicine.user.email],
            fail_silently=False,
        )

        print("Refill alert email sent.")