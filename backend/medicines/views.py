from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Medicine
from .serializers import MedicineSerializer


class MedicineViewSet(viewsets.ModelViewSet):
    serializer_class = MedicineSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Medicine.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        instance = serializer.save()
        if 'stock_quantity' in serializer.validated_data:
            instance.low_stock_email_sent = False
            instance.upcoming_refill_email_sent = False
            instance.save()

    @action(detail=False, methods=["get"])
    def refill_report(self, request):
        medicines = self.get_queryset()
        payload = self.get_serializer(medicines, many=True).data
        return Response({"medicines": payload}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"])
    def refill_prediction(self, request, pk=None):
        medicine = self.get_object()
        days_remaining = medicine.calculate_days_remaining()
        upcoming_refill = days_remaining <= 5
        return Response(
            {
                "medicine_id": medicine.id,
                "medicine_name": medicine.medicine_name,
                "stock_quantity": medicine.stock_quantity,
                "units_per_dose": medicine.units_per_dose,
                "frequency_per_day": medicine.frequency_per_day,
                "daily_consumption_units": medicine.daily_consumption_units(),
                "days_remaining": days_remaining,
                "predicted_run_out_date": str(medicine.predicted_run_out_date()),
                "needs_refill": medicine.is_low_stock(),
                "upcoming_refill": upcoming_refill,
            },
            status=status.HTTP_200_OK,
        )
