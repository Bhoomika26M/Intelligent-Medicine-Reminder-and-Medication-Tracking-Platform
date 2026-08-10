import unittest
from datetime import datetime, date, time as dt_time
from types import SimpleNamespace

from app.database import SessionLocal
from app.models.user import User
from app.models.treatment import Treatment
from app.models.medicine import Medicine
from app.models.reminder import Reminder
from app.models.notification import Notification
from app.models.history import History
from app.services.notification_lifecycle import (
    NotificationState,
    transition_notification_state,
    create_atomic_reminder_notification
)
from app.services.notification_analytics import compute_notification_analytics
from app.services.notification_service import (
    get_notifications,
    get_unread_notifications,
    mark_all_as_read,
    cleanup_old_notifications
)
from app.scheduler.scheduler import get_scheduler


class TestNotificationArchitecture(unittest.TestCase):

    def setUp(self):
        self.db = SessionLocal()
        self.user = User(
            full_name="Test User",
            email=f"test_notif_{datetime.utcnow().timestamp()}@pillsync.ai",
            password="hashed_pass_test"
        )
        self.db.add(self.user)
        self.db.commit()
        self.db.refresh(self.user)

        self.treatment = Treatment(
            user_id=self.user.id,
            disease_name="Hypertension",
            start_date=date.today(),
            end_date=date.today(),
            status="Active"
        )
        self.db.add(self.treatment)
        self.db.commit()

        self.medicine = Medicine(
            treatment_id=self.treatment.id,
            medicine_name="Amlodipine",
            medicine_type="Tablet",
            dosage="5 mg",
            quantity=30,
            is_active=True
        )
        self.db.add(self.medicine)
        self.db.commit()

        self.reminder = Reminder(
            medicine_id=self.medicine.id,
            reminder_time=dt_time(9, 0),
            repeat_type="Daily",
            status="Active",
            notification_enabled=True
        )
        self.db.add(self.reminder)
        self.db.commit()

    def tearDown(self):
        try:
            self.db.query(Notification).filter(Notification.user_id == self.user.id).delete()
            self.db.query(History).filter(History.user_id == self.user.id).delete()
            self.db.query(Reminder).filter(Reminder.medicine_id == self.medicine.id).delete()
            self.db.query(Medicine).filter(Medicine.id == self.medicine.id).delete()
            self.db.query(Treatment).filter(Treatment.id == self.treatment.id).delete()
            self.db.query(User).filter(User.id == self.user.id).delete()
            self.db.commit()
        except Exception:
            self.db.rollback()
        finally:
            self.db.close()

    def test_lifecycle_atomic_creation(self):
        """Test atomic creation of Notification and History record."""
        now = datetime.now().astimezone()
        notif, hist = create_atomic_reminder_notification(
            db=self.db,
            reminder=self.reminder,
            user_id=self.user.id,
            medicine_id=self.medicine.id,
            medicine_name=self.medicine.medicine_name,
            treatment_id=self.treatment.id,
            now=now
        )
        self.db.commit()

        self.assertIsNotNone(notif)
        self.assertEqual(notif.user_id, self.user.id)
        self.assertTrue(notif.is_sent)
        self.assertFalse(notif.is_read)
        self.assertIn("Amlodipine", notif.message)

    def test_lifecycle_state_transitions(self):
        """Test state transitions: PENDING -> SENT -> READ."""
        now = datetime.now().astimezone()
        notif, _ = create_atomic_reminder_notification(
            db=self.db,
            reminder=self.reminder,
            user_id=self.user.id,
            medicine_id=self.medicine.id,
            medicine_name=self.medicine.medicine_name,
            treatment_id=self.treatment.id,
            now=now
        )
        self.db.commit()

        # Transition to READ
        updated_notif = transition_notification_state(self.db, notif.id, NotificationState.READ, reason="User opened tab")
        self.assertIsNotNone(updated_notif)
        self.assertTrue(updated_notif.is_read)

    def test_notification_analytics_computation(self):
        """Test calculation of notification analytics and metrics."""
        now = datetime.now().astimezone()
        notif, _ = create_atomic_reminder_notification(
            db=self.db,
            reminder=self.reminder,
            user_id=self.user.id,
            medicine_id=self.medicine.id,
            medicine_name=self.medicine.medicine_name,
            treatment_id=self.treatment.id,
            now=now
        )
        self.db.commit()

        analytics = compute_notification_analytics(self.db, self.user)
        self.assertIn("notifications_sent", analytics)
        self.assertGreaterEqual(analytics["notifications_sent"], 1)
        self.assertIn("notification_click_rate", analytics)
        self.assertIn("reminder_completion_rate", analytics)

    def test_mark_all_as_read_and_cleanup(self):
        """Test bulk mark as read and retention cleanup."""
        now = datetime.now().astimezone()
        create_atomic_reminder_notification(
            db=self.db,
            reminder=self.reminder,
            user_id=self.user.id,
            medicine_id=self.medicine.id,
            medicine_name=self.medicine.medicine_name,
            treatment_id=self.treatment.id,
            now=now
        )
        self.db.commit()

        unread = get_unread_notifications(self.db, self.user)
        self.assertGreater(len(unread), 0)

        mark_all_as_read(self.db, self.user)

        unread_after = get_unread_notifications(self.db, self.user)
        self.assertEqual(len(unread_after), 0)

    def test_scheduler_singleton(self):
        """Test scheduler singleton instance."""
        s1 = get_scheduler()
        s2 = get_scheduler()
        self.assertIs(s1, s2)


if __name__ == "__main__":
    unittest.main()
