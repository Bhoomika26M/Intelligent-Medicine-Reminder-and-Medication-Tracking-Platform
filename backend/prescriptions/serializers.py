from rest_framework import serializers
from .models import Prescription


class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = "__all__"
        read_only_fields = ("user", "created_at", "updated_at", "ocr_text", "ocr_source", "ocr_metadata")
