from django.urls import path
from .views import (
    TreatmentListCreateView,
    MedicineListCreateView,
    MedicineDetailView,
    MedicationScheduleListCreateView,
    MedicalHistoryView,
    MedicationScheduleUpdateView,
    DashboardView,
    OCRUploadView,
    SaveOCRMedicinesView,
    MedicineHistoryView,
)
from .views import CaregiverAssignmentView
urlpatterns = [
    path("treatments/", TreatmentListCreateView.as_view(), name="treatment-list"),
    path("medicines/", MedicineListCreateView.as_view(), name="medicine-list"),
    path("medicines/<int:pk>/", MedicineDetailView.as_view(), name="medicine-detail"),
    path("schedules/", MedicationScheduleListCreateView.as_view(), name="schedule-list"),
    path("schedules/<int:pk>/", MedicationScheduleUpdateView.as_view(), name="schedule-update"),
    path("history/", MedicalHistoryView.as_view(), name="medical-history"),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path("ocr/", OCRUploadView.as_view(), name="ocr-upload"),
    path("ocr/save/",SaveOCRMedicinesView.as_view(),name="ocr-save"),
    path("medicine-history/",MedicineHistoryView.as_view(),name="medicine-history"),
    path("caregiver-assignments/",CaregiverAssignmentView.as_view(),name="caregiver-assignments"),
]