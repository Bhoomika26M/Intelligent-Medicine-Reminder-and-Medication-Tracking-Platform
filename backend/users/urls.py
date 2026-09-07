from django.urls import path

from .views import (
    RegisterView,
    ProfileView,
    PatientDashboardView,
    CaregiverDashboardView,
    AdminDashboardView,
    ChangePasswordView,
    google_login,
    forgot_password,
    verify_otp,
    reset_password,
)

from .settings_views import UserSettingsView


urlpatterns = [
    # ==========================================
    # USER
    # ==========================================

    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),

    path(
        "profile/",
        ProfileView.as_view(),
        name="profile",
    ),

    # ==========================================
    # DASHBOARDS
    # ==========================================

    path(
        "patient-dashboard/",
        PatientDashboardView.as_view(),
        name="patient-dashboard",
    ),

    path(
        "caregiver-dashboard/",
        CaregiverDashboardView.as_view(),
        name="caregiver-dashboard",
    ),

    path(
        "admin-dashboard/",
        AdminDashboardView.as_view(),
        name="admin-dashboard",
    ),

    # ==========================================
    # PASSWORD
    # ==========================================

    path(
        "change-password/",
        ChangePasswordView.as_view(),
        name="change-password",
    ),

    path(
        "forgot-password/",
        forgot_password,
        name="forgot_password",
    ),

    path(
        "verify-otp/",
        verify_otp,
        name="verify_otp",
    ),

    path(
        "reset-password/",
        reset_password,
        name="reset_password",
    ),

    # ==========================================
    # GOOGLE LOGIN
    # ==========================================

    path(
        "google-login/",
        google_login,
        name="google_login",
    ),

    # ==========================================
    # SETTINGS
    # ==========================================

    path(
        "settings/",
        UserSettingsView.as_view(),
        name="user-settings",
    ),
]