import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { analyticsApi } from "@/api";
import type { Analytics } from "@/types";
import { Card, StatCard, Badge, EmptyState } from "@/components/ui";
import { CheckCircle2, XCircle, TrendingUp, Pill, Package, AlertTriangle, BarChart3 } from "lucide-react";

export default function Analytics() {
  const { user } = useAuth();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.get(user!).then((d) => { setData(d); setLoading(false); });
  }, [user]);

  if (loading || !data) return <div className="py-20 text-center text-ink-500">Loading analytics…</div>;

  const total = data.taken_count + data.missed_count;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Adherence Analytics</h1>
        <p className="text-ink-500 mt-1">Understand your medication adherence over time.</p>
      </div>

      {/* Adherence summary */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold text-ink-900">Adherence Summary</h2>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Circular progress */}
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

          <div className="flex-1 grid grid-cols-2 gap-4 w-full">
            <div className="bg-success-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-success-600 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-medium">Taken</span>
              </div>
              <p className="text-2xl font-bold text-ink-900">{data.taken_count}</p>
            </div>
            <div className="bg-danger-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-danger-600 mb-1">
                <XCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Missed</span>
              </div>
              <p className="text-2xl font-bold text-ink-900">{data.missed_count}</p>
            </div>
            <div className="bg-primary-50 rounded-xl p-4 col-span-2">
              <div className="flex items-center gap-2 text-primary-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-medium">Total Records</span>
              </div>
              <p className="text-2xl font-bold text-ink-900">{total}</p>
              <p className="text-xs text-ink-500 mt-1">Formula: Taken / (Taken + Missed) × 100</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Medicines" value={data.total_medicines} icon={<Pill className="w-5 h-5" />} tone="primary" />
        <StatCard label="Taken Today" value={data.taken_today} icon={<CheckCircle2 className="w-5 h-5" />} tone="success" />
        <StatCard label="Missed Today" value={data.missed_today} icon={<XCircle className="w-5 h-5" />} tone="danger" />
        <StatCard label="Low Stock" value={data.low_stock.length} icon={<AlertTriangle className="w-5 h-5" />} tone="warning" />
      </div>

      {/* Refill prediction */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold text-ink-900">Refill Prediction</h2>
        </div>
        {data.refill_soon.length === 0 ? (
          <EmptyState icon={<Package className="w-6 h-6" />} title="No refills needed soon" subtitle="All medicines have enough stock for more than 5 days." />
        ) : (
          <div className="space-y-2">
            {data.refill_soon.map((m) => (
              <div key={m.id} className="flex items-center justify-between bg-danger-50/50 border border-danger-100 rounded-xl px-4 py-3">
                <div>
                  <p className="font-medium text-ink-900">{m.name}</p>
                  <p className="text-xs text-ink-500">Stock: {m.current_stock} · Daily: {m.times.length || 1}</p>
                </div>
                <div className="text-right">
                  <Badge tone="danger">Refill Soon</Badge>
                  <p className="text-xs text-ink-500 mt-1">{m.remaining_days} days left</p>
                </div>
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
