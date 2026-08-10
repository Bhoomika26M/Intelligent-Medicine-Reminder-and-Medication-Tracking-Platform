import time
import unittest
import concurrent.futures
from datetime import datetime

from app.database import SessionLocal
from app.models.user import User
from app.models.treatment import Treatment
from app.models.medicine import Medicine
from app.models.reminder import Reminder
from app.services.notification_idempotency import idempotency_engine
from app.scheduler.dispatcher import batch_dispatch_notifications


class TestNotificationLoadAndBenchmark(unittest.TestCase):

    def setUp(self):
        self.db = SessionLocal()
        self.users = []
        for i in range(10):  # Multi-user simulation batch
            u = User(
                full_name=f"Load User {i}",
                email=f"load_user_{i}_{datetime.utcnow().timestamp()}@pillsync.ai",
                password="hashed_pass_test"
            )
            self.db.add(u)
            self.users.append(u)
        self.db.commit()

    def tearDown(self):
        try:
            for u in self.users:
                self.db.query(User).filter(User.id == u.id).delete()
            self.db.commit()
        except Exception:
            self.db.rollback()
        finally:
            self.db.close()

    def test_idempotency_concurrency_stress(self):
        """Simulates 100 concurrent threads creating notifications for identical reminder times."""
        now = datetime.utcnow()
        user_id = self.users[0].id
        reminder_id = 7777

        processed_flags = []

        def worker_attempt():
            if not idempotency_engine.is_duplicate(user_id, reminder_id, now):
                idempotency_engine.mark_processed(user_id, reminder_id, now)
                processed_flags.append(True)
            else:
                processed_flags.append(False)

        with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
            futures = [executor.submit(worker_attempt) for _ in range(100)]
            concurrent.futures.wait(futures)

        # Exactly 1 attempt must succeed, 99 must be blocked as duplicates
        successful_creates = [f for f in processed_flags if f is True]
        self.assertEqual(len(successful_creates), 1)

    def test_batch_dispatch_benchmark(self):
        """Simulates batch dispatching 1,000 notifications and measures throughput & latency."""
        mock_notifications = []
        for i in range(100):
            mock_notifications.append({
                "user_id": self.users[i % len(self.users)].id,
                "reminder_id": 100 + i,
                "medicine_id": 200 + i,
                "notification_id": 300 + i,
                "medicine_name": f"Medicine {i}",
                "priority": "HIGH" if i % 2 == 0 else "NORMAL"
            })

        res = batch_dispatch_notifications(mock_notifications, batch_size=50)

        self.assertEqual(res["dispatched_count"], 100)
        self.assertIn("batch_latency_ms", res)
        self.assertLess(res["batch_latency_ms"], 2000.0)


if __name__ == "__main__":
    unittest.main()
