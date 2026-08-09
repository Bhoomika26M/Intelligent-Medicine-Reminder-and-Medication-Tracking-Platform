from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import (
    api_view,
    permission_classes,
    authentication_classes,
)

from rest_framework_simplejwt.tokens import RefreshToken

from google.oauth2 import id_token
from google.auth.transport import requests

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
import random

from medication.models import Medicine, MedicationSchedule

from .models import User, PasswordResetOTP
from .serializers import (
    RegisterSerializer,
    ChangePasswordSerializer,
)
from .permissions import (
    IsPatient,
    IsCaregiver,
    IsAdmin,
)


# ======================================
# Register
# ======================================

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


# ======================================
# Profile
# ======================================

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response({
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "full_name": f"{user.first_name} {user.last_name}".strip(),
            "email": user.email,
            "phone_number": user.phone_number,
            "role": user.role,
        })

    def put(self, request):
        user = request.user

        user.username = request.data.get(
            "username",
            user.username,
        )

        user.first_name = request.data.get(
            "first_name",
            user.first_name,
        )

        user.last_name = request.data.get(
            "last_name",
            user.last_name,
        )

        user.phone_number = request.data.get(
            "phone_number",
            user.phone_number,
        )

        user.save()

        return Response({
            "id": user.id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "full_name": f"{user.first_name} {user.last_name}".strip(),
            "email": user.email,
            "phone_number": user.phone_number,
            "role": user.role,
        })
# ======================================
# Patient Dashboard
# ======================================

class PatientDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsPatient]

    def get(self, request):

        today = timezone.now().date()

        return Response({
            "message": f"Welcome Patient {request.user.username}",

            "total_medicines": Medicine.objects.filter(
                user=request.user
            ).count(),

            "today_reminders": MedicationSchedule.objects.filter(
                medicine__user=request.user,
                created_at__date=today
            ).count(),

            "taken_today": MedicationSchedule.objects.filter(
                medicine__user=request.user,
                status="TAKEN",
                created_at__date=today
            ).count(),

            "missed_today": MedicationSchedule.objects.filter(
                medicine__user=request.user,
                status="MISSED",
                created_at__date=today
            ).count(),

            "low_stock": Medicine.objects.filter(
                user=request.user,
                remaining_quantity__lte=5
            ).count(),
        })


# ======================================
# Caregiver Dashboard
# ======================================

class CaregiverDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsCaregiver]

    def get(self, request):
        return Response({
            "message": f"Welcome Caregiver {request.user.username}"
        })


# ======================================
# Admin Dashboard
# ======================================

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        return Response({
            "message": f"Welcome Admin {request.user.username}"
        })


# ======================================
# Change Password
# ======================================

class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data
        )

        if serializer.is_valid():

            if not request.user.check_password(
                serializer.validated_data["old_password"]
            ):
                return Response(
                    {
                        "error": "Old password is incorrect."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            request.user.set_password(
                serializer.validated_data["new_password"]
            )

            request.user.save()

            refresh = RefreshToken.for_user(request.user)

            return Response({
                "message": "Password changed successfully.",
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            })

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )
# ======================================
# Google Login
# ======================================

@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])
def google_login(request):
    token = request.data.get("token")

    try:
        idinfo = id_token.verify_oauth2_token(
            token,
            requests.Request(),
            "1039590017025-n9vnc84cjok04jjf7hr7lk28h1gs3gb5.apps.googleusercontent.com",
        )

        email = idinfo["email"]

        user = User.objects.filter(email=email).first()

        if not user:
            username = email.split("@")[0]

            base_username = username
            count = 1

            while User.objects.filter(username=username).exists():
                username = f"{base_username}{count}"
                count += 1

            user = User.objects.create(
                username=username,
                email=email,
                first_name=idinfo.get("given_name", ""),
                last_name=idinfo.get("family_name", ""),
                role="PATIENT",
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        })

    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_400_BAD_REQUEST,
        )


# ======================================
# Forgot Password - Send OTP
# ======================================

@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])
def forgot_password(request):

    email = request.data.get("email")

    if not email:
        return Response(
            {"error": "Email is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = User.objects.filter(email=email).first()

    if not user:
        return Response(
            {"error": "User with this email does not exist."},
            status=status.HTTP_404_NOT_FOUND,
        )

    PasswordResetOTP.objects.filter(user=user).delete()

    otp = str(random.randint(100000, 999999))

    PasswordResetOTP.objects.create(
        user=user,
        otp=otp,
    )

    send_mail(
        subject="PillSync Password Reset OTP",
        message=f"Your OTP is: {otp}\n\nThis OTP is valid for 5 minutes.",
        from_email=settings.EMAIL_HOST_USER,
        recipient_list=[email],
        fail_silently=False,
    )

    return Response({
        "message": "OTP sent successfully."
    })
# ======================================
# Verify OTP
# ======================================

@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])
def verify_otp(request):

    email = request.data.get("email")
    otp = request.data.get("otp")

    user = User.objects.filter(email=email).first()

    if not user:
        return Response(
            {"error": "User not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    otp_obj = PasswordResetOTP.objects.filter(
        user=user,
        otp=otp,
    ).first()

    if not otp_obj:
        return Response(
            {"error": "Invalid OTP."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if timezone.now() - otp_obj.created_at > timedelta(minutes=5):
        otp_obj.delete()

        return Response(
            {"error": "OTP has expired."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    return Response({
        "message": "OTP verified successfully."
    })


# ======================================
# Reset Password
# ======================================

@api_view(["POST"])
@permission_classes([AllowAny])
@authentication_classes([])
def reset_password(request):

    email = request.data.get("email")
    otp = request.data.get("otp")
    new_password = request.data.get("new_password")

    user = User.objects.filter(email=email).first()

    if not user:
        return Response(
            {"error": "User not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    otp_obj = PasswordResetOTP.objects.filter(
        user=user,
        otp=otp,
    ).first()

    if not otp_obj:
        return Response(
            {"error": "Invalid OTP."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if timezone.now() - otp_obj.created_at > timedelta(minutes=5):
        otp_obj.delete()

        return Response(
            {"error": "OTP has expired."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    user.set_password(new_password)
    user.save()

    otp_obj.delete()

    return Response({
        "message": "Password reset successful."
    })