import logging

from django.core.management.base import BaseCommand

from medicines.models import Medicine
from utils.email_utils import send_low_stock_email, send_upcoming_refill_email

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Send automatic low-stock and upcoming refill notifications"

    def add_arguments(self, parser):
        parser.add_argument("--upcoming-threshold-days", type=int, default=5)
        parser.add_argument("--low-threshold-days", type=int, default=2)

    def handle(self, *args, **options):
        upcoming_threshold = max(1, int(options["upcoming_threshold_days"]))
        low_threshold = max(0, int(options["low_threshold_days"]))

        medicines = Medicine.objects.select_related("user").all()
        notified_low = 0
        notified_upcoming = 0

        for medicine in medicines:
            user = medicine.user
            if not user.email:
                continue

            days_remaining = medicine.calculate_days_remaining()

            if days_remaining <= low_threshold:
                if medicine.low_stock_email_sent:
                    continue
                success, message = send_low_stock_email(
                    user_email=user.email,
                    user_name=user.username,
                    medicine_name=medicine.medicine_name,
                    days_remaining=days_remaining,
                )
                if success:
                    medicine.low_stock_email_sent = True
                    medicine.save(update_fields=["low_stock_email_sent"])
                    notified_low += 1
                else:
                    logger.warning("Low stock email failed for medicine_id=%s: %s", medicine.id, message)
                continue

            if days_remaining <= upcoming_threshold:
                if medicine.upcoming_refill_email_sent or medicine.low_stock_email_sent:
                    continue
                success, message = send_upcoming_refill_email(
                    user_email=user.email,
                    user_name=user.username,
                    medicine_name=medicine.medicine_name,
                    days_remaining=days_remaining,
                    run_out_date=str(medicine.predicted_run_out_date()),
                )
                if success:
                    medicine.upcoming_refill_email_sent = True
                    medicine.save(update_fields=["upcoming_refill_email_sent"])
                    notified_upcoming += 1
                else:
                    logger.warning("Upcoming refill email failed for medicine_id=%s: %s", medicine.id, message)

        self.stdout.write(
            self.style.SUCCESS(
                f"Refill notifications complete. low_stock_sent={notified_low}, upcoming_sent={notified_upcoming}"
            )
        )

