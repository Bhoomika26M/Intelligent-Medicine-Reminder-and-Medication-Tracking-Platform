from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ReminderViewSet

router = DefaultRouter()
router.register("", ReminderViewSet, basename="reminder")

urlpatterns = [
    path("", include(router.urls)),
    path("analytics/", ReminderViewSet.as_view({"get": "analytics"}), name="reminder-analytics"),
]