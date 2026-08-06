import io

from datetime import timedelta

from django.core.files.base import ContentFile
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from medicines.models import Medicine
from .models import Prescription
from .ocr_service import run_ocr
from .serializers import PrescriptionSerializer


class PrescriptionViewSet(viewsets.ModelViewSet):
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [FormParser, MultiPartParser]

    def get_queryset(self):
        return Prescription.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=["post"])
    def analyze(self, request):
        image_file = request.FILES.get("prescription_image")
        source = request.data.get("source", "printed")
        if not image_file:
            return Response({"error": "A prescription image is required."}, status=status.HTTP_400_BAD_REQUEST)

        extracted = run_ocr(image_file, source=source)
        return Response(extracted)

    @action(detail=False, methods=["post"])
    def review_and_save(self, request):
        image_file = request.FILES.get("prescription_image")
        print("review_and_save content type:", request.content_type)
        print("review_and_save data keys:", request.data.keys())
        print("review_and_save files:", request.FILES.keys())
        if not image_file:
            return Response({"error": "A prescription image is required."}, status=status.HTTP_400_BAD_REQUEST)

        source = request.data.get("source", "printed")
        extracted = run_ocr(image_file, source=source)
        image_file.seek(0)

        payload = {
            "doctor_name": request.data.get("doctor_name", extracted.get("medicine_name", "")),
            "hospital_name": request.data.get("hospital_name", ""),
            "prescription_date": request.data.get("prescription_date", ""),
            "notes": request.data.get("notes", extracted.get("ocr_text", "")),
            "prescription_image": image_file,
        }
        print("review_and_save payload:", payload)
        serializer = self.get_serializer(data=payload)
        if not serializer.is_valid():
            print("review_and_save validation errors:", serializer.errors)
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        self.perform_create(serializer)
        prescription = serializer.instance

        prescription.notes = request.data.get("notes", extracted.get("ocr_text", ""))
        prescription.ocr_text = extracted.get("ocr_text", "")
        prescription.ocr_source = source
        prescription.ocr_metadata = extracted
        prescription.save(update_fields=["notes", "ocr_text", "ocr_source", "ocr_metadata"])

        self._create_medicines_from_extracted_data(request.user, extracted.get("medicines", []))

        return Response(
            {
                "message": "Prescription created successfully.",
                "prescription": PrescriptionSerializer(prescription).data,
                "extracted_data": extracted,
            },
            status=status.HTTP_201_CREATED,
        )

    def _create_medicines_from_extracted_data(self, user, medicines_data):
        for item in medicines_data:
            medicine_name = item.get("medicine_name") or "Unclear"
            dosage = item.get("dosage") or ""
            frequency_text = item.get("frequency") or ""
            duration = item.get("duration") or ""

            if medicine_name.lower() == "unclear":
                continue

            frequency_per_day = self._parse_frequency_per_day(frequency_text)
            medicine_type = self._infer_medicine_type(medicine_name)
            stock_quantity = 1
            expiry_date = timezone.localdate() + timedelta(days=90)

            if Medicine.objects.filter(
                user=user,
                medicine_name__iexact=medicine_name,
                dosage__iexact=dosage,
                frequency_per_day=frequency_per_day,
            ).exists():
                continue

            Medicine.objects.create(
                user=user,
                medicine_name=medicine_name,
                dosage=dosage,
                medicine_type=medicine_type,
                frequency_per_day=frequency_per_day,
                stock_quantity=stock_quantity,
                units_per_dose=1,
                expiry_date=expiry_date,
                instructions=f"Extracted from prescription: {duration or frequency_text}",
            )

    def _parse_frequency_per_day(self, frequency_text):
        lowered = frequency_text.lower()
        if "twice" in lowered or "bid" in lowered or "2x" in lowered or "2 times" in lowered:
            return 2
        if "three" in lowered or "tid" in lowered or "3x" in lowered or "3 times" in lowered:
            return 3
        if "once" in lowered or "od" in lowered or "1x" in lowered or "1 time" in lowered:
            return 1
        if "daily" in lowered:
            return 1
        return 1

    def _infer_medicine_type(self, medicine_name):
        lowered = medicine_name.lower()
        if any(token in lowered for token in ["tablet", "tab", "capsule", "cap"]):
            return "Tablet"
        if any(token in lowered for token in ["syrup", "drop", "drops"]):
            return "Syrup"
        if any(token in lowered for token in ["injection", "inj"]):
            return "Injection"
        return "Tablet"
