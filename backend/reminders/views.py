from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime, date
from .models import Reminder
from .serializers import ReminderSerializer
from utils.email_utils import (
    send_low_stock_email,
    send_reminder_email,
    send_test_email,
    send_upcoming_refill_email,
)
from medication_history.models import MedicationHistory
from accounts.models import User


class ReminderViewSet(viewsets.ModelViewSet):
    serializer_class = ReminderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Reminder.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        old_instance = self.get_object()
        old_status = old_instance.status
        instance = serializer.save()
        
        # Create medication history entry when status changes
        if 'status' in serializer.validated_data:
            new_status = instance.status
            if old_status != new_status and new_status in ['TAKEN', 'MISSED', 'SNOOZED']:
                MedicationHistory.objects.create(
                    user=instance.user,
                    medicine=instance.medicine,
                    reminder=instance,
                    status=new_status,
                    date=timezone.now().date(),
                    time=timezone.now().time()
                )
                
                # Reduce stock quantity when medicine is taken
                if new_status == 'TAKEN':
                    medicine = instance.medicine
                    units_per_intake = medicine.units_per_dose if medicine.units_per_dose > 0 else 1
                    medicine.stock_quantity = max(0, medicine.stock_quantity - units_per_intake)
                    medicine.save(update_fields=["stock_quantity"])

                    days_remaining = medicine.calculate_days_remaining()
                    user_email = instance.user.email
                    if user_email:
                        if days_remaining <= 2 and not medicine.low_stock_email_sent:
                            success, _ = send_low_stock_email(
                                user_email=user_email,
                                user_name=instance.user.username,
                                medicine_name=medicine.medicine_name,
                                days_remaining=days_remaining,
                            )
                            if success:
                                medicine.low_stock_email_sent = True
                                medicine.save(update_fields=["low_stock_email_sent"])
                        elif days_remaining <= 5 and not medicine.upcoming_refill_email_sent and not medicine.low_stock_email_sent:
                            success, _ = send_upcoming_refill_email(
                                user_email=user_email,
                                user_name=instance.user.username,
                                medicine_name=medicine.medicine_name,
                                days_remaining=days_remaining,
                                run_out_date=str(medicine.predicted_run_out_date()),
                            )
                            if success:
                                medicine.upcoming_refill_email_sent = True
                                medicine.save(update_fields=["upcoming_refill_email_sent"])

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        from medicines.models import Medicine
        from medication_history.models import MedicationHistory

        today = date.today()
        now = timezone.now()

        total_medicines = Medicine.objects.filter(user=request.user).count()

        total_reminders = Reminder.objects.filter(user=request.user).count()

        today_completed = MedicationHistory.objects.filter(
            user=request.user,
            date=today,
            status='TAKEN'
        ).count()

        missed_medications = MedicationHistory.objects.filter(
            user=request.user,
            status='MISSED'
        ).count()

        upcoming_reminder = Reminder.objects.filter(
            user=request.user,
            reminder_time__gt=now.time(),
            status='PENDING',
            is_active=True
        ).order_by('reminder_time').first()

        status_summary = {
            'taken': MedicationHistory.objects.filter(user=request.user, status='TAKEN').count(),
            'missed': MedicationHistory.objects.filter(user=request.user, status='MISSED').count(),
            'snoozed': MedicationHistory.objects.filter(user=request.user, status='SNOOZED').count(),
        }

        recent_history = MedicationHistory.objects.filter(
            user=request.user
        ).order_by('-created_at')[:5]

        recent_history_data = [
            {
                'medicine_name': item.medicine.medicine_name,
                'status': item.status,
                'date': str(item.date),
                'time': str(item.time),
            }
            for item in recent_history
        ]

        return Response({
            'total_medicines': total_medicines,
            'total_reminders': total_reminders,
            'today_completed': today_completed,
            'missed_medications': missed_medications,
            'upcoming_reminder': {
                'medicine_name': upcoming_reminder.medicine.medicine_name if upcoming_reminder else None,
                'reminder_time': str(upcoming_reminder.reminder_time) if upcoming_reminder else None,
            } if upcoming_reminder else None,
            'status_summary': status_summary,
            'recent_history': recent_history_data,
        })

    @action(detail=False, methods=["get"])
    def analytics(self, request):
        from .analytics import get_adherence_analytics

        days = request.query_params.get("days", 30)
        return Response(get_adherence_analytics(request.user, days=days), status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='action')
    def update_status(self, request, pk=None):
        reminder = self.get_object()
        action = request.data.get('action')
        
        if not action:
            return Response(
                {'detail': 'Action is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if action not in ['TAKEN', 'MISSED', 'SNOOZED']:
            return Response(
                {'detail': 'Invalid action. Must be TAKEN, MISSED, or SNOOZED'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = reminder.status
        reminder.status = action
        reminder.save()
        
        # Create medication history entry when status changes
        if old_status != action:
            MedicationHistory.objects.create(
                user=reminder.user,
                medicine=reminder.medicine,
                reminder=reminder,
                status=action,
                date=timezone.now().date(),
                time=timezone.now().time()
            )
            
            # Reduce stock quantity when medicine is taken
            if action == 'TAKEN':
                medicine = reminder.medicine
                units_per_intake = medicine.units_per_dose if medicine.units_per_dose > 0 else 1
                medicine.stock_quantity = max(0, medicine.stock_quantity - units_per_intake)
                medicine.save(update_fields=["stock_quantity"])

                days_remaining = medicine.calculate_days_remaining()
                user_email = reminder.user.email
                if user_email:
                    if days_remaining <= 2 and not medicine.low_stock_email_sent:
                        success, _ = send_low_stock_email(
                            user_email=user_email,
                            user_name=reminder.user.username,
                            medicine_name=medicine.medicine_name,
                            days_remaining=days_remaining,
                        )
                        if success:
                            medicine.low_stock_email_sent = True
                            medicine.save(update_fields=["low_stock_email_sent"])
                    elif days_remaining <= 5 and not medicine.upcoming_refill_email_sent and not medicine.low_stock_email_sent:
                        success, _ = send_upcoming_refill_email(
                            user_email=user_email,
                            user_name=reminder.user.username,
                            medicine_name=medicine.medicine_name,
                            days_remaining=days_remaining,
                            run_out_date=str(medicine.predicted_run_out_date()),
                        )
                        if success:
                            medicine.upcoming_refill_email_sent = True
                            medicine.save(update_fields=["upcoming_refill_email_sent"])
        
        serializer = self.get_serializer(reminder)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], url_path='confirm/(?P<token>[^/]+)/(?P<action>[^/]+)')
    def confirm_from_email(self, request, token=None, action=None):
        """
        Endpoint for email-based confirmation.
        Updates all pending reminders for the user based on the action.
        Token is currently simple validation - in production, use proper JWT or secure tokens.
        """
        if action not in ['TAKEN', 'MISSED']:
            return Response(
                {'detail': 'Invalid action. Must be TAKEN or MISSED'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # For simplicity, we'll use the token to identify the user
        # In production, store token in database with expiry
        import hashlib
        import time
        
        # Try to find user by matching token pattern (user_id_timestamp)
        # This is a simplified approach - production should use proper token storage
        users = User.objects.all()
        matched_user = None
        
        for user in users:
            # Generate token for this user (same logic as email generation)
            # Since we don't store the timestamp, we'll just match by user_id prefix
            # This is NOT secure for production - just for demonstration
            test_token = hashlib.md5(f"{user.id}_".encode()).hexdigest()[:8]
            if token.startswith(test_token):
                matched_user = user
                break
        
        if not matched_user:
            return Response(
                {'detail': 'Invalid or expired token'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get all pending reminders for this user
        pending_reminders = Reminder.objects.filter(
            user=matched_user,
            status='PENDING',
            is_active=True
        )
        
        updated_count = 0
        for reminder in pending_reminders:
            old_status = reminder.status
            reminder.status = action
            reminder.save()
            
            # Create medication history entry
            if old_status != action:
                MedicationHistory.objects.create(
                    user=reminder.user,
                    medicine=reminder.medicine,
                    reminder=reminder,
                    status=action,
                    date=timezone.now().date(),
                    time=timezone.now().time()
                )
                
                # Reduce stock quantity if TAKEN
                if action == 'TAKEN':
                    medicine = reminder.medicine
                    medicine.stock_quantity = max(0, medicine.stock_quantity - 1)
                    medicine.save()
                    
                    # Check for low stock
                    days_remaining = medicine.calculate_days_remaining()
                    if days_remaining <= 2 and not medicine.low_stock_email_sent:
                        user_email = reminder.user.email
                        if user_email:
                            success, _ = send_low_stock_email(
                                user_email=user_email,
                                user_name=reminder.user.username,
                                medicine_name=medicine.medicine_name,
                                days_remaining=days_remaining
                            )
                            if success:
                                medicine.low_stock_email_sent = True
                                medicine.save()
            
            updated_count += 1
        
        return Response({
            'success': True,
            'message': f'{updated_count} reminders marked as {action}',
            'updated_count': updated_count
        })

    @action(detail=False, methods=['post'])
    def test_email(self, request):
        user_email = request.user.email
        if not user_email:
            return Response(
                {'error': 'No email address associated with your account'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        success, message = send_test_email(user_email)
        if success:
            return Response({'success': True, 'message': message})
        else:
            return Response(
                {'success': False, 'error': message},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
