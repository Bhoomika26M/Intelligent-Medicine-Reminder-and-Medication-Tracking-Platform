import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { analyticsApi, reminderApi, historyApi, medicineApi } from "@/api";
import type { Analytics, Reminder, Medicine, HistoryRecord } from "@/types";
import { Card, StatCard, Badge, EmptyState, Button } from "@/components/ui";
import { showReminderNotification } from "@/notifications";
import {
  Pill, CheckCircle2, XCircle, Clock, AlertTriangle, Package,
  BellRing, CalendarClock, TrendingUp, Activity,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [meds, setMeds] = useState<Medicine[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!user) return;
    const [a, r, m, h] = await Promise.all([
      analyticsApi.get(user),
      reminderApi.list(user),
      medicineApi.list(user),
      historyApi.list(user),
    ]);
    setAnalytics(a);
    setReminders(r);
    setMeds(m);
    setHistory(h);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const triggerNow = (r: Reminder) => {
    showReminderNotification(r.name, r.dosage, r.reminder_time);
  };

  const markStatus = async (med: Medicine, status: "Taken" | "Missed") => {
    if (!user) return;
    await historyApi.add(user, med.id, status);
    load();
  };

  if (loading || !analytics) {
    return <div className="py-20 text-center text-ink-500">Loading dashboard…</div>;
  }

  const upcoming = reminders.find((r) => r.reminder_time >= new Date().toTimeString().slice(0, 5));
  const recent = [...history].reverse().slice(0, 6);
  const medName = (id: string) => meds.find((m) => m.id === id)?.name || "Unknown";
  const totalDoses = analytics.taken_count + analytics.missed_count;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Hello, {user?.name?.split(" ")[0] || "there"} 👋</h1>
        <p className="text-ink-500 mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* M4 Analytics stat grid — required cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Medicines" value={analytics.total_medicines} icon={<Pill className="w-5 h-5" />} tone="primary" />
        <StatCard label="Active Medicines" value={analytics.active_medicines} icon={<Activity className="w-5 h-5" />} tone="accent" />
        <StatCard label="Doses Taken" value={analytics.taken_count} icon={<CheckCircle2 className="w-5 h-5" />} tone="success" />
        <StatCard label="Doses Missed" value={analytics.missed_count} icon={<XCircle className="w-5 h-5" />} tone="danger" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Overall Adherence" value={`${analytics.adherence}%`} icon={<TrendingUp className="w-5 h-5" />} tone="success" />
        <StatCard label="Low on Stock" value={analytics.low_stock.length} icon={<AlertTriangle className="w-5 h-5" />} tone="warning" />
        <StatCard label="Requiring Refill" value={analytics.refill_overview.requiring_refill + analytics.refill_overview.out_of_stock} icon={<Package className="w-5 h-5" />} tone="danger" />
        <StatCard label="Upcoming Reminders" value={reminders.length} icon={<BellRing className="w-5 h-5" />} tone="primary" />
      </div>

      {/* Mini adherence bar */}
      {totalDoses > 0 && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-ink-900">Adherence Overview</h2>
            <Link to="/analytics" className="text-sm text-primary-600 hover:underline">View details</Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
                <div className="bg-success-500 transition-all duration-500" style={{ width: `${totalDoses ? (analytics.taken_count / totalDoses) * 100 : 0}%` }} />
                <div className="bg-danger-500 transition-all duration-500" style={{ width: `${totalDoses ? (analytics.missed_count / totalDoses) * 100 : 0}%` }} />
              </div>
              <div className="flex justify-between mt-2 text-xs text-ink-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success-500" /> Taken {analytics.taken_count}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-danger-500" /> Missed {analytics.missed_count}</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-ink-900">{analytics.adherence}%</p>
              <p className="text-xs text-ink-500">adherence</p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming reminder */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <BellRing className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-ink-900">Upcoming Reminder</h2>
          </div>
          {upcoming ? (
            <div className="flex items-center justify-between bg-primary-50 rounded-xl p-4">
              <div>
                <p className="font-semibold text-ink-900">{upcoming.name}</p>
                <p className="text-sm text-ink-500 mt-0.5">Dosage: {upcoming.dosage || "—"} · {upcoming.reminder_time}</p>
              </div>
              <Button onClick={() => triggerNow(upcoming)} className="!px-3">
                <BellRing className="w-4 h-4" /> Trigger
              </Button>
            </div>
          ) : (
            <EmptyState icon={<BellRing className="w-6 h-6" />} title="No upcoming reminders" subtitle="Add reminder times to your medicines to see them here." />
          )}

          {/* All reminders quick list */}
          {reminders.length > 0 && (
            <div className="mt-4 space-y-2">
              {reminders.slice(0, 4).map((r) => (
                <div key={r.medicine_id} className="flex items-center justify-between text-sm py-2 border-t border-slate-100">
                  <span className="text-ink-700">{r.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-ink-500">{r.reminder_time}</span>
                    <button onClick={() => triggerNow(r)} className="text-primary-600 hover:text-primary-700" title="Trigger now">
                      <BellRing className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Low stock */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-warning-600" />
            <h2 className="font-semibold text-ink-900">Low Stock Medicines</h2>
          </div>
          {analytics.low_stock.length === 0 ? (
            <EmptyState icon={<Package className="w-6 h-6" />} title="All stocks look healthy" />
          ) : (
            <div className="space-y-2">
              {analytics.low_stock.map((m) => (
                <div key={m.id} className="flex items-center justify-between bg-warning-50 rounded-xl px-4 py-3">
                  <span className="font-medium text-ink-900">{m.name}</span>
                  <Badge tone="warning">{m.current_stock} left</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent activity */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-ink-900">Recent Activity</h2>
          <Link to="/history" className="text-sm text-primary-600 hover:underline">View all</Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState icon={<Clock className="w-6 h-6" />} title="No activity yet" subtitle="Mark medicines as taken or missed to build your history." />
        ) : (
          <div className="space-y-2">
            {recent.map((h) => (
              <div key={h.id} className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${h.status === "Taken" ? "bg-success-50 text-success-600" : "bg-danger-50 text-danger-600"}`}>
                    {h.status === "Taken" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-900">{medName(h.medicine_id)}</p>
                    <p className="text-xs text-ink-500">{h.date} · {h.time}</p>
                  </div>
                </div>
                <Badge tone={h.status === "Taken" ? "success" : "danger"}>{h.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick mark */}
      {meds.length > 0 && (
        <Card className="p-5">
          <h2 className="font-semibold text-ink-900 mb-4">Quick Mark</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {meds.slice(0, 6).map((m) => (
              <div key={m.id} className="border border-slate-200 rounded-xl p-3">
                <p className="font-medium text-ink-900 text-sm truncate">{m.name}</p>
                <p className="text-xs text-ink-500 mb-2.5">{m.dosage || "—"} · Stock: {m.current_stock}</p>
                <div className="flex gap-2">
                  <Button onClick={() => markStatus(m, "Taken")} className="!py-1.5 !px-3 !text-xs flex-1">Taken</Button>
                  <Button variant="secondary" onClick={() => markStatus(m, "Missed")} className="!py-1.5 !px-3 !text-xs flex-1">Missed</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
