from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


class UserSettingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response({
            "email_notifications": user.email_notifications,
            "medicine_reminders": user.medicine_reminders,
            "medicine_alerts": user.medicine_alerts,
        })

    def put(self, request):
        user = request.user

        user.email_notifications = request.data.get(
            "email_notifications",
            user.email_notifications
        )

        user.medicine_reminders = request.data.get(
            "medicine_reminders",
            user.medicine_reminders
        )

        user.medicine_alerts = request.data.get(
            "medicine_alerts",
            user.medicine_alerts
        )

        user.save()

        return Response({
            "message": "Settings updated successfully",
            "email_notifications": user.email_notifications,
            "medicine_reminders": user.medicine_reminders,
            "medicine_alerts": user.medicine_alerts,
        })