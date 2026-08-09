from django.apps import AppConfig
import os
import sys


class MedicationConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "medication"

    def ready(self):
        if any(cmd in sys.argv for cmd in ["makemigrations", "migrate"]):
            return

        # Only start scheduler in the main runserver process
        if os.environ.get("RUN_MAIN") != "true":
            return

        from .scheduler import start
        start()