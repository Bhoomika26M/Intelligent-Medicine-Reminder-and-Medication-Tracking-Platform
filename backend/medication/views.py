from rest_framework import generics, serializers
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from rest_framework import status
from .models import (
    Medicine,
    Treatment,
    MedicationSchedule,
    MedicineHistory,
    CaregiverAssignment,
)

from .serializers import (
    MedicineSerializer,
    TreatmentSerializer,
    MedicationScheduleSerializer,
    OCRMedicineSerializer,
    MedicineHistorySerializer,
    CaregiverAssignmentSerializer,
)

from .ocr import extract_text, extract_medicines
from .gemini_vision import analyze_prescription_image
from .medicine_matcher import correct_medicines

# ==========================
# Treatment Views
# ==========================

class TreatmentListCreateView(generics.ListCreateAPIView):
    serializer_class = TreatmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Treatment.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ==========================
# Medicine Views
# ==========================

class MedicineListCreateView(generics.ListCreateAPIView):
    serializer_class = MedicineSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Medicine.objects.filter(
            user=self.request.user
        )

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(
            data=request.data
        )

        if not serializer.is_valid():
            print("========== SERIALIZER ERRORS ==========")
            print(serializer.errors)
            print("=======================================")
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

        self.perform_create(serializer)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )

    def perform_create(self, serializer):
        reminder_times = serializer.validated_data.get(
            "reminder_times",
            []
        )

        medicine = serializer.save(
            user=self.request.user
        )

        medicine.remaining_quantity = medicine.quantity
        medicine.save(
            update_fields=["remaining_quantity"]
        )

      
        MedicineHistory.objects.create(
            user=self.request.user,
            medicine_name=medicine.medicine_name,
            disease=medicine.disease,
            dosage=medicine.dosage,
            quantity=medicine.quantity,
            remaining_quantity=medicine.remaining_quantity,
            frequency=medicine.frequency,
            reminder_time=medicine.reminder_time,
            action="ADDED",
        )
class MedicineDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MedicineSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Medicine.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        # Get reminder_times sent from frontend
        reminder_times = serializer.validated_data.pop(
            "reminder_times",
            []
        )

        # Save medicine
        medicine = serializer.save()

        # Reset remaining quantity
        medicine.remaining_quantity = medicine.quantity
        medicine.save()

        # If frontend doesn't send reminder_times,
        # use the single reminder_time
        if not reminder_times:
            reminder_times = [medicine.reminder_time]

        # Delete old schedules
        MedicationSchedule.objects.filter(
            medicine=medicine
        ).delete()

        # Create new schedules
        for reminder_time in reminder_times:
            MedicationSchedule.objects.create(
                medicine=medicine,
                reminder_time=reminder_time,
                quantity_per_dose=medicine.quantity_per_dose,
                status="PENDING",
            )

        # Save update history
        MedicineHistory.objects.create(
            user=self.request.user,
            medicine_name=medicine.medicine_name,
            disease=medicine.disease,
            dosage=medicine.dosage,
            quantity=medicine.quantity,
            remaining_quantity=medicine.remaining_quantity,
            frequency=medicine.frequency,
            reminder_time=medicine.reminder_time,
            action="UPDATED",
        )

    def perform_destroy(self, instance):
        # Save delete history
        MedicineHistory.objects.create(
            user=self.request.user,
            medicine_name=instance.medicine_name,
            disease=instance.disease,
            dosage=instance.dosage,
            quantity=instance.quantity,
            remaining_quantity=instance.remaining_quantity,
            frequency=instance.frequency,
            reminder_time=instance.reminder_time,
            action="DELETED",
        )

        # Delete all schedules
        MedicationSchedule.objects.filter(
            medicine=instance
        ).delete()

        # Delete medicine
        instance.delete()
# ==========================
# Medication Schedule Views
# ==========================

class MedicationScheduleListCreateView(generics.ListCreateAPIView):
    serializer_class = MedicationScheduleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MedicationSchedule.objects.filter(
            medicine__user=self.request.user
        )

    def perform_create(self, serializer):
        medicine = serializer.validated_data.get("medicine")

        if medicine.user != self.request.user:
            raise serializers.ValidationError(
                {
                    "medicine": "Invalid medicine selected."
                }
            )

        serializer.save()


class MedicalHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        schedules = MedicationSchedule.objects.filter(
            medicine__user=request.user
        ).exclude(status="PENDING")

        history = []

        for schedule in schedules:
            history.append({
                "medicine_name": schedule.medicine.medicine_name,
                "dosage": schedule.medicine.dosage,
                "reminder_time": schedule.reminder_time,
                "status": schedule.status,
                "date": schedule.created_at.date(),
            })

        return Response(history)


# ==========================
# Medication Schedule Update
# ==========================

class MedicationScheduleUpdateView(generics.UpdateAPIView):
    serializer_class = MedicationScheduleSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return MedicationSchedule.objects.filter(
            medicine__user=self.request.user
        )

    def perform_update(self, serializer):

        print("========== UPDATE CALLED ==========")

        schedule = self.get_object()

        previous_status = schedule.status
        print("Previous Status:", previous_status)

        schedule = serializer.save()

        print("New Status:", schedule.status)

        medicine = schedule.medicine

        print("Before Quantity:", medicine.remaining_quantity)

        # Reduce quantity ONLY when changing
        # from PENDING -> TAKEN
        if (
            previous_status == "PENDING"
            and schedule.status == "TAKEN"
        ):
            if medicine.remaining_quantity >= schedule.quantity_per_dose:
                medicine.remaining_quantity -= schedule.quantity_per_dose
                medicine.save()

                print(
                    "Reduced by:",
                    schedule.quantity_per_dose
                )

        print("After Quantity:", medicine.remaining_quantity)
        print("========== UPDATE COMPLETED ==========")


# ==========================
# Dashboard View
# ==========================

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        print("USER:", request.user)
        print("USER ID:", request.user.id)

        today = timezone.now().date()

        total_medicines = Medicine.objects.filter(
            user=request.user
        ).count()

        today_reminders = MedicationSchedule.objects.filter(
            medicine__user=request.user,
            created_at__date=today
        ).count()

        taken_today = MedicationSchedule.objects.filter(
            medicine__user=request.user,
            status="TAKEN",
            created_at__date=today
        ).count()

        missed_today = MedicationSchedule.objects.filter(
            medicine__user=request.user,
            status="MISSED",
            created_at__date=today
        ).count()

        low_stock = Medicine.objects.filter(
            user=request.user,
            remaining_quantity__lte=5
        ).count()

        total_completed = MedicationSchedule.objects.filter(
            medicine__user=request.user,
            status__in=["TAKEN", "MISSED"]
        ).count()

        total_taken = MedicationSchedule.objects.filter(
            medicine__user=request.user,
            status="TAKEN"
        ).count()

        adherence_rate = (
            round((total_taken / total_completed) * 100, 2)
            if total_completed > 0
            else 0
        )

        return Response({
            "total_medicines": total_medicines,
            "today_reminders": today_reminders,
            "taken_today": taken_today,
            "missed_today": missed_today,
            "low_stock": low_stock,
            "total_completed": total_completed,
            "adherence_rate": adherence_rate,
        })
# ==========================
# OCR Upload Views
# ==========================

class OCRUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):

        image = request.FILES.get("image")

        if not image:
            return Response(
                {
                    "success": False,
                    "error": "No image uploaded."
                },
                status=400,
            )

        import tempfile
        import os

        temp_path = None

        try:

            # Save uploaded image temporarily
            with tempfile.NamedTemporaryFile(
                delete=False,
                suffix=".jpg"
            ) as temp:

                for chunk in image.chunks():
                    temp.write(chunk)

                temp_path = temp.name

            # Analyze image using Gemini Vision
            ai_result = analyze_prescription_image(temp_path)

            # Correct medicine names using RapidFuzz
            ai_result["medicines"] = correct_medicines(
                ai_result.get("medicines", [])
            )

            print("========== GEMINI VISION ==========")
            print(ai_result)
            print("===================================")

            return Response(
                {
                    "success": True,
                    "extracted_text": "Prescription analyzed successfully.",
                    "disease": ai_result.get(
                        "disease",
                        "OTHER"
                    ),
                    "medicines": ai_result.get(
                        "medicines",
                        []
                    ),
                }
            )

        except Exception as e:

            print("========== GEMINI ERROR ==========")
            print(type(e).__name__)
            print(str(e))
            print("==================================")

            return Response(
                {
                    "success": False,
                    "error": str(e),
                    "disease": "OTHER",
                    "medicines": [],
                },
                status=500,
            )

        finally:

            if (
                temp_path
                and os.path.exists(temp_path)
            ):
                os.remove(temp_path)


# ==========================
# Save OCR Medicines
# ==========================

class SaveOCRMedicinesView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        medicines = request.data.get("medicines", [])
        disease = request.data.get("disease", "OTHER")

        saved = []

        for item in medicines:

            reminder_times = item.get("reminder_times", [])

            medicine = Medicine.objects.create(
                user=request.user,
                disease=item.get("disease", disease),
                medicine_name=item.get("medicine_name", ""),
                dosage=item.get("dosage", ""),
                quantity=item.get("quantity", 30),
                remaining_quantity=item.get("remaining_quantity", 30),
                quantity_per_dose=item.get("quantity_per_dose", 1),
                daily_frequency=item.get("daily_frequency", 1),
                frequency=item.get("frequency", "Once Daily"),
                reminder_time=(
                    reminder_times[0]
                    if reminder_times
                    else item.get("reminder_time", "09:00:00")
                ),
            )

            if not reminder_times:
                reminder_times = [medicine.reminder_time]

            medicine.reminder_time = reminder_times[0]
            medicine.save(update_fields=["reminder_time"])

            for reminder_time in reminder_times:
                MedicationSchedule.objects.create(
                    medicine=medicine,
                    reminder_time=reminder_time,
                    quantity_per_dose=medicine.quantity_per_dose,
                    status="PENDING",
                )

            MedicineHistory.objects.create(
                user=request.user,
                medicine_name=medicine.medicine_name,
                disease=medicine.disease,
                dosage=medicine.dosage,
                quantity=medicine.quantity,
                remaining_quantity=medicine.remaining_quantity,
                frequency=medicine.frequency,
                reminder_time=medicine.reminder_time,
                action="ADDED",
            )

            saved.append({
                "id": medicine.id,
                "medicine_name": medicine.medicine_name,
                "disease": medicine.disease,
            })

        return Response({
            "message": "Medicines saved successfully.",
            "saved_medicines": saved,
        })


# ==========================
# Medicine History
# ==========================

class MedicineHistoryView(generics.ListAPIView):
    serializer_class = MedicineHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        print("Logged in user:", self.request.user)
        print("User ID:", self.request.user.id)

        qs = MedicineHistory.objects.filter(
            user=self.request.user
        ).order_by("-created_at")

        print("History count:", qs.count())

        return qs


# ==========================
# Caregiver Assignment
# ==========================

class CaregiverAssignmentView(generics.ListCreateAPIView):
    serializer_class = CaregiverAssignmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "CAREGIVER":
            return CaregiverAssignment.objects.filter(
                caregiver=user
            )

        elif user.role == "PATIENT":
            return CaregiverAssignment.objects.filter(
                patient=user
            )

        return CaregiverAssignment.objects.all()