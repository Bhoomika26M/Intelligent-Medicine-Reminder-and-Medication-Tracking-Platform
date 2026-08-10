import unittest
import time
from datetime import datetime, date, time as dt_time

from app.database import SessionLocal
from app.models.user import User
from app.models.treatment import Treatment
from app.models.medicine import Medicine
from app.models.reminder import Reminder
from app.services.event_bus import event_bus, EventType
from app.services.notification_idempotency import idempotency_engine
from app.services.dead_letter_queue import dead_letter_queue
from app.services.notification_rate_limiter import rate_limiter
from app.services.notification_cache import notification_cache
from app.services.notification_observability import metrics_collector, ObservabilityContext
from app.services.notification_self_healing import self_healing_engine
from app.services.notification_health import get_notification_system_health


class TestEnterpriseNotificationArchitecture(unittest.TestCase):

    def setUp(self):
        self.db = SessionLocal()
        self.user = User(
            full_name="Enterprise User",
            email=f"ent_test_{datetime.utcnow().timestamp()}@pillsync.ai",
            password="hashed_pass_test"
        )
        self.db.add(self.user)
        self.db.commit()
        self.db.refresh(self.user)

    def tearDown(self):
        try:
            self.db.query(User).filter(User.id == self.user.id).delete()
            self.db.commit()
        except Exception:
            self.db.rollback()
        finally:
            self.db.close()

    def test_event_bus_subscribe_publish(self):
        """Test EventBus subscription, event publication, and callback execution."""
        received = []

        def sample_handler(payload):
            received.append(payload)

        event_bus.subscribe(EventType.NOTIFICATION_CREATED, sample_handler)
        event_bus.publish(EventType.NOTIFICATION_CREATED, {"test": "data", "user_id": self.user.id})

        self.assertEqual(len(received), 1)
        self.assertEqual(received[0]["user_id"], self.user.id)
        event_bus.unsubscribe(EventType.NOTIFICATION_CREATED, sample_handler)

    def test_idempotency_engine_duplicate_detection(self):
        """Test Idempotency Engine duplicate detection and hash computation."""
        now = datetime.utcnow()
        rem_id = 9999

        self.assertFalse(idempotency_engine.is_duplicate(self.user.id, rem_id, now))
        idempotency_engine.mark_processed(self.user.id, rem_id, now)

        self.assertTrue(idempotency_engine.is_duplicate(self.user.id, rem_id, now))

    def test_dead_letter_queue_push_and_replay(self):
        """Test pushing failed notification to DLQ and replaying."""
        initial_size = dead_letter_queue.size()
        dlq_id = dead_letter_queue.push(
            notification_id=8888,
            user_id=self.user.id,
            error="Connection timed out",
            retry_count=3,
            stack_trace_summary="Traceback summary mock",
            fcm_response="FCM error 500",
            token_status="FAILED"
        )
        self.assertEqual(dead_letter_queue.size(), initial_size + 1)
        item = dead_letter_queue.get_by_id(dlq_id)
        self.assertIsNotNone(item)
        self.assertEqual(item.notification_id, 8888)

    def test_rate_limiter_sliding_window(self):
        """Test rate limiter acquiring slots and calculating delays on overflow."""
        test_u_id = self.user.id + 5000
        for _ in range(5):
            delay = rate_limiter.check_and_acquire(test_u_id)
            self.assertEqual(delay, 0.0)

        # 6th request should trigger rate limit delay
        overflow_delay = rate_limiter.check_and_acquire(test_u_id)
        self.assertGreater(overflow_delay, 0.0)

    def test_notification_cache_invalidation(self):
        """Test notification cache set, get, hit ratio calculation, and invalidation."""
        notification_cache.set_unread_count(self.user.id, 4)
        count = notification_cache.get_unread_count(self.user.id)
        self.assertEqual(count, 4)

        notification_cache.invalidate(self.user.id)
        count_after = notification_cache.get_unread_count(self.user.id)
        self.assertIsNone(count_after)

    def test_observability_context_and_metrics(self):
        """Test trace context generation and performance metrics recording."""
        ctx = ObservabilityContext(user_id=self.user.id, reminder_id=123)
        self.assertTrue(ctx.trace_id.startswith("tr_"))
        self.assertTrue(ctx.correlation_id.startswith("corr_"))

        metrics_collector.record_dispatch_latency(45.5)
        metrics_collector.record_fcm_response_time(12.3)
        summary = metrics_collector.get_metrics_summary()

        self.assertIn("avg_dispatch_latency_ms", summary)
        self.assertIn("p95_dispatch_latency_ms", summary)

    def test_self_healing_audit(self):
        """Test self-healing audit execution."""
        audit_res = self_healing_engine.run_health_audit()
        self.assertIn("total_heals_executed", audit_res)
        self.assertIn("audit_timestamp", audit_res)

    def test_notification_health_payload(self):
        """Test GET /notification-health endpoint payload generation."""
        health = get_notification_system_health()
        self.assertIn("status", health)
        self.assertIn("components", health)
        self.assertIn("scheduler", health["components"])
        self.assertIn("queues", health["components"])
        self.assertIn("metrics", health["components"])


if __name__ == "__main__":
    unittest.main()
