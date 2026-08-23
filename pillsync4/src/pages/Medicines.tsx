import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { medicineApi, ocrApi, historyApi } from "@/api";
import type { Medicine } from "@/types";
import { Card, Button, Input, Label, Badge, EmptyState } from "@/components/ui";
import { showReminderNotification } from "@/notifications";
import {
  Plus, Pencil, Trash2, BellRing, Upload, X, Pill, Check, AlertTriangle,
} from "lucide-react";

const TIME_SLOTS = ["Morning", "Afternoon", "Night"];

const empty = {
  name: "", dosage: "", quantity: "", frequency: "", times: [] as string[],
  reminder_time: "", start_date: "", end_date: "", notes: "", current_stock: 0,
};

export default function Medicines() {
  const { user } = useAuth();
  const [meds, setMeds] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Medicine | null>(null);
  const [form, setForm] = useState({ ...empty });
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrText, setOcrText] = useState("");

  const load = async () => {
    if (!user) return;
    setMeds(await medicineApi.list(user));
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...empty });
    setOcrText("");
    setShowForm(true);
  };

  const openEdit = (m: Medicine) => {
    setEditing(m);
    setForm({
      name: m.name, dosage: m.dosage, quantity: m.quantity, frequency: m.frequency,
      times: m.times, reminder_time: m.reminder_time, start_date: m.start_date,
      end_date: m.end_date, notes: m.notes, current_stock: m.current_stock,
    });
    setOcrText("");
    setShowForm(true);
  };

  const toggleTime = (slot: string) => {
    setForm((f) => ({
      ...f,
      times: f.times.includes(slot) ? f.times.filter((t) => t !== slot) : [...f.times, slot],
    }));
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (editing) {
      await medicineApi.update(user, editing.id, form);
    } else {
      await medicineApi.create(user, form);
    }
    setShowForm(false);
    load();
  };

  const remove = async (id: string) => {
    if (!user || !confirm("Delete this medicine and its history?")) return;
    await medicineApi.remove(user, id);
    load();
  };

  const handleOcr = async (file: File) => {
    if (!user) return;
    setOcrLoading(true);
    try {
      const result = await ocrApi.extract(file);
      setOcrText(result.raw_text || "");
      setForm((f) => ({
        ...f,
        name: result.name || f.name,
        dosage: result.dosage || f.dosage,
        quantity: result.quantity || f.quantity,
      }));
    } catch {
      alert("OCR failed. You can still fill the form manually.");
    } finally {
      setOcrLoading(false);
    }
  };

  const triggerNow = (m: Medicine) => {
    showReminderNotification(m.name, m.dosage, m.reminder_time || "now");
  };

  const markTaken = async (m: Medicine) => {
    if (!user) return;
    await historyApi.add(user, m.id, "Taken");
    load();
  };

  if (loading) return <div className="py-20 text-center text-ink-500">Loading medicines…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Medicine Management</h1>
          <p className="text-ink-500 mt-1">Add, edit and track your medicines.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="w-4 h-4" /> Add Medicine
        </Button>
      </div>

      {meds.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={<Pill className="w-6 h-6" />}
            title="No medicines yet"
            subtitle="Add your first medicine, or upload a label image to auto-fill details with OCR."
          />
          <div className="text-center mt-2">
            <Button onClick={openAdd}><Plus className="w-4 h-4" /> Add your first medicine</Button>
          </div>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {meds.map((m) => {
            const lowStock = m.current_stock < 5;
            const daily = m.times.length || 1;
            const remaining = m.current_stock / daily;
            const refillSoon = remaining <= 5;
            const highlight = lowStock || refillSoon;
            return (
              <Card key={m.id} className={`p-5 ${highlight ? "border-danger-300 bg-danger-50/30" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-ink-900 truncate">{m.name}</h3>
                    <p className="text-sm text-ink-500">{m.dosage || "No dosage"}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg text-ink-500 hover:bg-slate-100" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => remove(m.id)} className="p-1.5 rounded-lg text-danger-500 hover:bg-danger-50" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  {m.times.map((t) => <Badge key={t} tone="primary">{t}</Badge>)}
                  {m.reminder_time && <Badge tone="primary">{m.reminder_time}</Badge>}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                  <div className="bg-slate-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-ink-500">Stock</p>
                    <p className={`font-semibold ${lowStock ? "text-danger-600" : "text-ink-900"}`}>{m.current_stock}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg px-3 py-2">
                    <p className="text-xs text-ink-500">Refill in</p>
                    <p className={`font-semibold ${refillSoon ? "text-danger-600" : "text-ink-900"}`}>{Math.round(remaining)} days</p>
                  </div>
                </div>

                {m.notes && <p className="text-sm text-ink-500 mt-3 line-clamp-2">{m.notes}</p>}

                <div className="flex gap-2 mt-4">
                  {m.reminder_time && (
                    <Button variant="secondary" onClick={() => triggerNow(m)} className="flex-1 !py-2 !text-xs">
                      <BellRing className="w-3.5 h-3.5" /> Trigger Now
                    </Button>
                  )}
                  <Button onClick={() => markTaken(m)} className="flex-1 !py-2 !text-xs">
                    <Check className="w-3.5 h-3.5" /> Mark Taken
                  </Button>
                </div>
                {highlight && (
                  <p className="text-xs text-danger-600 mt-2 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> {lowStock ? "Low stock" : "Refill soon"}
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/40 backdrop-blur-sm">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 sticky top-0 bg-white rounded-t-2xl">
              <h2 className="font-semibold text-ink-900">{editing ? "Edit Medicine" : "Add Medicine"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-ink-500 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={save} className="p-5 space-y-4">
              {/* OCR upload */}
              {!editing && (
                <div className="bg-primary-50/50 border border-primary-100 rounded-xl p-4">
                  <p className="text-sm font-medium text-ink-700 mb-2 flex items-center gap-2">
                    <Upload className="w-4 h-4 text-primary-600" /> OCR — upload a medicine label
                  </p>
                  <input
                    type="file" accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleOcr(e.target.files[0])}
                    className="text-sm text-ink-500 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-primary-600 file:text-white file:text-sm file:font-medium hover:file:bg-primary-700"
                  />
                  {ocrLoading && <p className="text-xs text-ink-500 mt-2">Extracting text…</p>}
                  {ocrText && (
                    <details className="mt-2">
                      <summary className="text-xs text-ink-500 cursor-pointer">Detected text</summary>
                      <pre className="text-xs text-ink-500 mt-1 whitespace-pre-wrap bg-white p-2 rounded-lg max-h-32 overflow-auto">{ocrText}</pre>
                    </details>
                  )}
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Medicine Name</Label>
                  <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Paracetamol" />
                </div>
                <div>
                  <Label>Dosage</Label>
                  <Input value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="500 mg / 1 tablet" />
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="20" />
                </div>
                <div>
                  <Label>Current Stock</Label>
                  <Input type="number" min={0} value={form.current_stock} onChange={(e) => setForm({ ...form, current_stock: Number(e.target.value) })} />
                </div>
                <div>
                  <Label>Frequency</Label>
                  <Input value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} placeholder="Once daily" />
                </div>
                <div>
                  <Label>Reminder Time</Label>
                  <Input type="time" value={form.reminder_time} onChange={(e) => setForm({ ...form, reminder_time: e.target.value })} />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                </div>
              </div>

              <div>
                <Label>Times of Day</Label>
                <div className="flex gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot} type="button" onClick={() => toggleTime(slot)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        form.times.includes(slot)
                          ? "bg-primary-600 text-white border-primary-600"
                          : "bg-white text-ink-500 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <textarea
                  value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2} placeholder="Take with food…"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">{editing ? "Save Changes" : "Add Medicine"}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
