import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { analyticsApi } from "@/api";
import type { Analytics } from "@/types";
import { Card, StatCard, Badge, EmptyState } from "@/components/ui";
import {
  CheckCircle2, XCircle, TrendingUp, Pill, Package, AlertTriangle, BarChart3, Activity, CalendarDays,
} from "lucide-react";

export default function Analytics() {
  const { user } = useAuth();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.get(user!).then((d) => { setData(d); setLoading(false); });
  }, [user]);

  if (loading || !data) return <div className="py-20 text-center text-ink-500">Loading analytics…</div>;

  const total = data.taken_count + data.missed_count;
  const takenPct = total ? (data.taken_count / total) * 100 : 0;
  const missedPct = total ? (data.missed_count / total) * 100 : 0;
  const hasTrendData = data.trend.some((d) => d.taken > 0 || d.missed > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Medication Analytics</h1>
        <p className="text-ink-500 mt-1">Adherence, refill and trend insights from your medication data.</p>
      </div>

      {/* M4 required summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Medicines" value={data.total_medicines} icon={<Pill className="w-5 h-5" />} tone="primary" />
        <StatCard label="Active Medicines" value={data.active_medicines} icon={<Activity className="w-5 h-5" />} tone="accent" />
        <StatCard label="Doses Taken" value={data.taken_count} icon={<CheckCircle2 className="w-5 h-5" />} tone="success" />
        <StatCard label="Doses Missed" value={data.missed_count} icon={<XCircle className="w-5 h-5" />} tone="danger" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Overall Adherence" value={`${data.adherence}%`} icon={<TrendingUp className="w-5 h-5" />} tone="success" />
        <StatCard label="Low on Stock" value={data.low_stock.length} icon={<AlertTriangle className="w-5 h-5" />} tone="warning" />
        <StatCard label="Requiring Refill" value={data.refill_overview.requiring_refill} icon={<Package className="w-5 h-5" />} tone="danger" />
        <StatCard label="Out of Stock" value={data.refill_overview.out_of_stock} icon={<AlertTriangle className="w-5 h-5" />} tone="danger" />
      </div>

      {/* Adherence visualization */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold text-ink-900">Adherence Visualization</h2>
        </div>

        {total === 0 ? (
          <EmptyState icon={<BarChart3 className="w-6 h-6" />} title="Not enough data for adherence analysis" subtitle="Mark medicines as Taken or Missed to see your adherence." />
        ) : (
          <>
            {/* Circular progress */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-32 h-32 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3"
                    strokeDasharray={`${data.adherence} 100`} strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-ink-900">{data.adherence}%</span>
                  <span className="text-xs text-ink-500">adherence</span>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-3 gap-4 w-full">
                <div className="bg-success-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-success-600 font-medium mb-1">Taken</p>
                  <p className="text-2xl font-bold text-ink-900">{data.taken_count}</p>
                </div>
                <div className="bg-danger-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-danger-600 font-medium mb-1">Missed</p>
                  <p className="text-2xl font-bold text-ink-900">{data.missed_count}</p>
                </div>
                <div className="bg-primary-50 rounded-xl p-4 text-center">
                  <p className="text-xs text-primary-600 font-medium mb-1">Total</p>
                  <p className="text-2xl font-bold text-ink-900">{total}</p>
                </div>
              </div>
            </div>

            {/* Adherence breakdown bars */}
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-medium text-ink-700">Adherence Breakdown</h3>
              <BreakdownBar label="Taken" value={data.taken_count} pct={takenPct} color="bg-success-500" />
              <BreakdownBar label="Missed" value={data.missed_count} pct={missedPct} color="bg-danger-500" />
              <p className="text-xs text-ink-500 pt-1">Formula: Taken / (Taken + Missed) × 100 = {data.adherence}%</p>
            </div>
          </>
        )}
      </Card>

      {/* Refill visualization */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold text-ink-900">Refill Visualization</h2>
        </div>
        {data.refill_details.length === 0 ? (
          <EmptyState icon={<Package className="w-6 h-6" />} title="No medicines added yet" subtitle="Add medicines to see refill predictions." />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {data.refill_details.map((m) => (
              <div key={m.id} className={`rounded-xl border p-4 ${
                m.refill_status === "Out of Stock" ? "border-danger-200 bg-danger-50/40"
                : m.refill_status === "Refill Soon" ? "border-warning-200 bg-warning-50/40"
                : "border-slate-200 bg-white"
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-ink-900 truncate">{m.name}</h3>
                  <Badge tone={m.refill_status === "Out of Stock" ? "danger" : m.refill_status === "Refill Soon" ? "warning" : "success"}>
                    {m.refill_status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div className="bg-slate-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-ink-500">Current Stock</p>
                    <p className="font-semibold text-ink-900">{m.current_stock}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-ink-500">Daily Usage</p>
                    <p className="font-semibold text-ink-900">{m.daily_consumption}/day</p>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-ink-500 mb-1">
                    <span>Remaining: {m.remaining_days} days</span>
                    <span>{m.refill_status === "Out of Stock" ? "0%" : `${Math.min(100, Math.round((m.remaining_days / 30) * 100))}%`}</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        m.refill_status === "Out of Stock" ? "bg-danger-500 w-0"
                        : m.refill_status === "Refill Soon" ? "bg-warning-500"
                        : "bg-success-500"
                      }`}
                      style={{ width: m.refill_status === "Out of Stock" ? "0%" : `${Math.min(100, (m.remaining_days / 30) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Refill overview */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold text-ink-900">Refill Overview</h2>
        </div>
        {data.refill_details.length === 0 ? (
          <EmptyState icon={<Package className="w-6 h-6" />} title="No data available" />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <OverviewStat label="Total Active" value={data.refill_overview.total_active} tone="primary" />
            <OverviewStat label="Sufficient Stock" value={data.refill_overview.sufficient} tone="success" />
            <OverviewStat label="Require Refill" value={data.refill_overview.requiring_refill} tone="warning" />
            <OverviewStat label="Out of Stock" value={data.refill_overview.out_of_stock} tone="danger" />
            <OverviewStat label="Avg Remaining" value={`${data.refill_overview.avg_remaining_days}d`} tone="neutral" />
          </div>
        )}
      </Card>

      {/* 7-day trend */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold text-ink-900">7-Day Adherence Trend</h2>
        </div>
        {!hasTrendData ? (
          <EmptyState icon={<TrendingUp className="w-6 h-6" />} title="Not enough historical data yet" subtitle="Mark medicines over a few days to see your adherence trend." />
        ) : (
          <div className="flex items-end justify-between gap-2 h-48">
            {data.trend.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-2">
                <div className="text-xs font-medium text-ink-700">{d.adherence}%</div>
                <div className="w-full flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-lg bg-primary-500 transition-all duration-500 min-h-[2px]"
                    style={{ height: `${Math.max(2, d.adherence)}%` }}
                    title={`${d.label}: ${d.taken} taken, ${d.missed} missed`}
                  />
                </div>
                <div className="text-xs text-ink-500">{d.label}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Low stock list */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-warning-600" />
          <h2 className="font-semibold text-ink-900">Low Stock Medicines</h2>
        </div>
        {data.low_stock.length === 0 ? (
          <EmptyState icon={<Package className="w-6 h-6" />} title="No low stock medicines" />
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {data.low_stock.map((m) => (
              <div key={m.id} className="flex items-center justify-between bg-warning-50 rounded-xl px-4 py-3">
                <span className="font-medium text-ink-900">{m.name}</span>
                <Badge tone="warning">{m.current_stock} left</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function BreakdownBar({ label, value, pct, color }: { label: string; value: number; pct: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-ink-700 font-medium">{label}</span>
        <span className="text-ink-500">{value} ({Math.round(pct)}%)</span>
      </div>
      <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function OverviewStat({ label, value, tone }: { label: string; value: React.ReactNode; tone: "primary" | "success" | "warning" | "danger" | "neutral" }) {
  const tones: Record<string, string> = {
    primary: "bg-primary-50 text-primary-600",
    success: "bg-success-50 text-success-600",
    warning: "bg-warning-50 text-warning-600",
    danger: "bg-danger-50 text-danger-600",
    neutral: "bg-slate-100 text-ink-500",
  };
  return (
    <div className={`rounded-xl p-4 text-center ${tones[tone]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs mt-1">{label}</p>
    </div>
  );
}
