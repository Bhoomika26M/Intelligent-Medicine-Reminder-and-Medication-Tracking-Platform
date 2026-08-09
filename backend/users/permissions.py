from rest_framework.permissions import BasePermission


class IsPatient(BasePermission):
    """
    Allows access only to patients.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "PATIENT"
        )


class IsCaregiver(BasePermission):
    """
    Allows access only to caregivers.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "CAREGIVER"
        )


class IsAdmin(BasePermission):
    """
    Allows access only to admins.
    """
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == "ADMIN"
        )