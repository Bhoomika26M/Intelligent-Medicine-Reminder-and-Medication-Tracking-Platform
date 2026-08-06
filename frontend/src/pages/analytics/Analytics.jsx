import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { getMedicines } from "../../services/medicineService";
import { getReminderAnalytics, getReminders } from "../../services/reminderService";
import { getPrescriptions } from "../../services/prescriptionService";

export default function Analytics() {
  const [stats, setStats] = useState({ medicines: 0, reminders: 0, prescriptions: 0, lowStock: 0 });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [medicines, reminders, prescriptions, analyticsData] = await Promise.all([
          getMedicines(),
          getReminders(),
          getPrescriptions(),
          getReminderAnalytics(),
        ]);
        const lowStock = medicines.filter((m) => Number(m.stock_quantity) <= 5).length;
        setStats({ medicines: medicines.length, reminders: reminders.length, prescriptions: prescriptions.length, lowStock });
        setAnalytics(analyticsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">Analytics</h1>
        <p className="mt-2 text-slate-400">A quick overview of your medication routine.</p>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-[#111827] p-8 text-slate-300">Loading analytics...</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-emerald-500/20 bg-[#111827] p-6 text-white">
            <p className="text-sm text-emerald-400">Total Medicines</p>
            <p className="mt-3 text-4xl font-bold">{stats.medicines}</p>
          </div>
          <div className="rounded-3xl border border-amber-500/20 bg-[#111827] p-6 text-white">
            <p className="text-sm text-amber-400">Active Reminders</p>
            <p className="mt-3 text-4xl font-bold">{stats.reminders}</p>
          </div>
          <div className="rounded-3xl border border-cyan-500/20 bg-[#111827] p-6 text-white">
            <p className="text-sm text-cyan-400">Prescriptions</p>
            <p className="mt-3 text-4xl font-bold">{stats.prescriptions}</p>
          </div>

          <div className="lg:col-span-3 rounded-3xl border border-white/10 bg-[#111827] p-6 text-white">
            <h2 className="text-xl font-semibold">Health Summary</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="flex items-center justify-between rounded-2xl bg-slate-800/70 p-4">
                <span>Low stock medicines</span>
                <span className="font-semibold text-rose-400">{stats.lowStock}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-800/70 p-4">
                <span>Adherence</span>
                <span className="font-semibold text-emerald-400">{analytics?.adherence_percentage ?? 0}%</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-800/70 p-4">
                <span>Taken / Missed</span>
                <span className="font-semibold text-cyan-400">{analytics?.taken_count ?? 0} / {analytics?.missed_count ?? 0}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-800/70 p-4">
                <span>Refill insights</span>
                <span className="font-semibold text-amber-400">{analytics?.refill_insights?.needs_refill ? "Needs refill" : "On track"}</span>
              </div>
            </div>
            {analytics?.refill_insights?.items?.length > 0 && (
              <div className="mt-6 space-y-2 text-sm text-slate-300">
                {analytics.refill_insights.items.slice(0, 4).map((item) => (
                  <div key={item.medicine_id} className="flex items-center justify-between rounded-2xl bg-slate-800/70 p-3">
                    <span>{item.medicine_name}</span>
                    <span className="text-slate-400">{item.days_remaining} days • {item.needs_refill ? "low" : "stable"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
}
