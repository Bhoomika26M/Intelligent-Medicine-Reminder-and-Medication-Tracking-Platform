from rest_framework import serializers
from .models import Medicine


class MedicineSerializer(serializers.ModelSerializer):
    days_remaining = serializers.SerializerMethodField()
    predicted_run_out_date = serializers.SerializerMethodField()
    daily_consumption_units = serializers.SerializerMethodField()
    needs_refill = serializers.SerializerMethodField()
    upcoming_refill = serializers.SerializerMethodField()

    class Meta:
        model = Medicine
        fields = "__all__"
        read_only_fields = ("user",)

    def get_days_remaining(self, obj):
        return obj.calculate_days_remaining()

    def get_predicted_run_out_date(self, obj):
        try:
            return str(obj.predicted_run_out_date())
        except Exception:
            return None

    def get_daily_consumption_units(self, obj):
        try:
            return obj.daily_consumption_units()
        except Exception:
            return 1

    def get_needs_refill(self, obj):
        return obj.is_low_stock()

    def get_upcoming_refill(self, obj):
        return obj.calculate_days_remaining() <= 5
