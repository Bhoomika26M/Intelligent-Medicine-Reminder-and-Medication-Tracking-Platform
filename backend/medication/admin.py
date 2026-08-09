from django.contrib import admin
from .models import Treatment, Medicine, MedicationSchedule


admin.site.register(Treatment)
admin.site.register(Medicine)
admin.site.register(MedicationSchedule)