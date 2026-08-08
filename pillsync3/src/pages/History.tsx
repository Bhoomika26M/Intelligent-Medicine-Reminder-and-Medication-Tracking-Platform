import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { historyApi, medicineApi } from "@/api";
import type { HistoryRecord, Medicine } from "@/types";
import { Card, Badge, EmptyState, Button } from "@/components/ui";
import { CheckCircle2, XCircle, History as HistoryIcon, Trash2, Filter } from "lucide-react";

export default function MedicationHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [meds, setMeds] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"All" | "Taken" | "Missed">("All");

  const load = async () => {
    if (!user) return;
    const [h, m] = await Promise.all([historyApi.list(user), medicineApi.list(user)]);
    setHistory(h);
    setMeds(m);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const medName = (id: string) => meds.find((m) => m.id === id)?.name || "Unknown";

  const remove = async (id: string) => {
    if (!user) return;
    await historyApi.remove(user, id);
    load();
  };

  const filtered = filter === "All" ? history : history.filter((h) => h.status === filter);
  const sorted = [...filtered].reverse();

  if (loading) return <div className="py-20 text-center text-ink-500">Loading history…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Medication History</h1>
        <p className="text-ink-500 mt-1">Track when medicines were taken or missed.</p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-ink-500" />
        {(["All", "Taken", "Missed"] as const).map((f) => (
          <button
            key={f} onClick={() => setFilter(f)}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f ? "bg-primary-600 text-white" : "bg-white text-ink-500 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={<HistoryIcon className="w-6 h-6" />}
            title="No history records"
            subtitle="Mark medicines as Taken or Missed from the Medicines page or Dashboard to build your history."
          />
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-ink-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Medicine</th>
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                  <th className="text-left px-5 py-3 font-medium">Time</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3.5 font-medium text-ink-900">{medName(h.medicine_id)}</td>
                    <td className="px-5 py-3.5 text-ink-500">{h.date}</td>
                    <td className="px-5 py-3.5 text-ink-500">{h.time}</td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 ${h.status === "Taken" ? "text-success-600" : "text-danger-600"}`}>
                        {h.status === "Taken" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {h.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button onClick={() => remove(h.id)} className="p-1.5 rounded-lg text-ink-300 hover:text-danger-500 hover:bg-danger-50" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
