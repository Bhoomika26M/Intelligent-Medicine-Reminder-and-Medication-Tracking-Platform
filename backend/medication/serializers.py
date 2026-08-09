from rest_framework import serializers

from .models import (
    Medicine,
    MedicationSchedule,
    Treatment,
    MedicineHistory,
    CaregiverAssignment,
)

from .refill import (
    calculate_extended_treatment,
    calculate_refill_days,
)

from .gemini_service import (
    validate_medicine,
    validate_disease,
)
class MedicationScheduleSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(
        source="medicine.medicine_name",
        read_only=True
    )

    class Meta:
        model = MedicationSchedule
        fields = [
            "id",
            "medicine",
            "medicine_name",
            "reminder_time",
            "quantity_per_dose",
            "status",
            "created_at",
        ]
        read_only_fields = [
            "medicine",
            "medicine_name",
            "reminder_time",
            "quantity_per_dose",
            "created_at",
        ]

class MedicineSerializer(serializers.ModelSerializer):
    schedules = MedicationScheduleSerializer(
        many=True,
        read_only=True
    )

    reminder_times = serializers.ListField(
        child=serializers.TimeField(),
        write_only=True,
        required=False
    )

    planned_days = serializers.SerializerMethodField()
    extended_days = serializers.SerializerMethodField()
    expected_end_date = serializers.SerializerMethodField()

    class Meta:
        model = Medicine
        fields = [
            "id",
            "disease",
            "medicine_name",
            "dosage",
            "quantity",
            "frequency",
            "quantity_per_dose",
            "daily_frequency",
            "remaining_quantity",
            "reminder_time",
            "reminder_times",
            "planned_days",
            "extended_days",
            "expected_end_date",
            "schedules",
            "created_at",
        ]

        read_only_fields = [
            "created_at",
            "planned_days",
            "extended_days",
            "expected_end_date",
            "schedules",
        ]

    def get_planned_days(self, obj):
        return calculate_extended_treatment(obj)["planned_days"]

    def get_extended_days(self, obj):
        return calculate_extended_treatment(obj)["extended_days"]

    def get_expected_end_date(self, obj):
        return calculate_extended_treatment(obj)["expected_end_date"]

    def validate_disease(self, value):
        result = validate_disease(value)

        if result != "VALID":
            raise serializers.ValidationError(
                "Invalid disease name."
            )

        return value

    def validate_medicine_name(self, value):

        # If editing and medicine name is unchanged,
        # skip Gemini validation.
        if self.instance:
            old_name = self.instance.medicine_name.strip().lower()
            new_name = value.strip().lower()

            if old_name == new_name:
                return value

        # Validate only when medicine name changes
        result = validate_medicine(value)

        if result != "VALID":
            raise serializers.ValidationError(
                "Invalid medicine name."
            )

        return value

    def create(self, validated_data):

        reminder_times = validated_data.pop(
            "reminder_times",
            []
        )

        medicine = Medicine.objects.create(
            **validated_data
        )

        if reminder_times:

            medicine.reminder_time = reminder_times[0]
            medicine.save(update_fields=["reminder_time"])

            for reminder in reminder_times:

                MedicationSchedule.objects.create(
                    medicine=medicine,
                    reminder_time=reminder,
                    quantity_per_dose=medicine.quantity_per_dose,
                    status="PENDING",
                )

        else:

            MedicationSchedule.objects.create(
                medicine=medicine,
                reminder_time=medicine.reminder_time,
                quantity_per_dose=medicine.quantity_per_dose,
                status="PENDING",
            )

        return medicine
class TreatmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Treatment
        fields = "__all__"


class OCRMedicineSerializer(serializers.Serializer):
    medicine_name = serializers.CharField()
    dosage = serializers.CharField(required=False, allow_blank=True)
    frequency = serializers.CharField(required=False, allow_blank=True)
class MedicineHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicineHistory
        fields = "__all__"


class CaregiverAssignmentSerializer(serializers.ModelSerializer):
    caregiver_name = serializers.CharField(
        source="caregiver.username",
        read_only=True
    )
    patient_name = serializers.CharField(
        source="patient.username",
        read_only=True
    )

    class Meta:
        model = CaregiverAssignment
        fields = [
            "id",
            "caregiver",
            "caregiver_name",
            "patient",
            "patient_name",
            "created_at",
        ]