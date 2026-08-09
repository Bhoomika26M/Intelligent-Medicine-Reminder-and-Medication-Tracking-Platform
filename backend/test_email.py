from django.core.mail import send_mail
from django.conf import settings

send_mail(
    subject="PillSync Test Email",
    message="Congratulations! Your PillSync email notifications are working.",
    from_email=settings.EMAIL_HOST_USER,
    recipient_list=[settings.EMAIL_HOST_USER],
    fail_silently=False,
)

print("Email sent successfully!")