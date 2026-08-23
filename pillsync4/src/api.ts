import axios from "axios";
import type {
  User, Medicine, HistoryRecord, Analytics, Reminder, OcrResult, RefillDetail, TrendDay,
} from "@/types";

/**
 * API client.
 *
 * Primary target: the FastAPI backend at http://localhost:8000.
 * Fallback: if the backend is unreachable (e.g. the Python server is not
 * running, which is the case in this hosted preview), every call transparently
 * falls back to localStorage so the demo still works end-to-end.
 */

const API_URL = "http://localhost:8000/api";
const api = axios.create({ baseURL: API_URL, timeout: 4000 });

const LS = {
  users: "pillsync_users",
  meds: "pillsync_meds",
  history: "pillsync_history",
  token: "pillsync_token",
  user: "pillsync_user",
};

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}
function uid() {
  return crypto.randomUUID();
}
function nowDate() {
  return new Date().toISOString().slice(0, 10);
}
function nowTime() {
  return new Date().toTimeString().slice(0, 5);
}

function isBackendError(e: unknown) {
  return axios.isAxiosError(e) && (e.code === "ECONNABORTED" || !e.response);
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
export const authApi = {
  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    try {
      const { data } = await api.post("/auth/register", { name, email, password });
      return data;
    } catch (e) {
      if (!isBackendError(e)) throw e;
      return this._registerLocal(name, email, password);
    }
  },
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      return data;
    } catch (e) {
      if (!isBackendError(e)) throw e;
      return this._loginLocal(email, password);
    }
  },
  async guest(): Promise<{ token: string; user: User }> {
    try {
      const { data } = await api.post("/auth/guest");
      return data;
    } catch (e) {
      if (!isBackendError(e)) throw e;
      return this._guestLocal();
    }
  },

  // localStorage fallback implementations
  _registerLocal(name: string, email: string, password: string) {
    const users = read<Array<User & { password: string }>>(LS.users, []);
    if (users.find((u) => u.email === email)) throw new Error("Email already registered");
    const user: User = { id: uid(), name, email, is_guest: false };
    users.push({ ...user, password });
    write(LS.users, users);
    return { token: "local-" + user.id, user };
  },
  _loginLocal(email: string, password: string) {
    const users = read<Array<User & { password: string }>>(LS.users, []);
    const found = users.find((u) => u.email === email);
    if (!found || found.password !== password) throw new Error("Invalid email or password");
    const { password: _p, ...user } = found;
    return { token: "local-" + user.id, user };
  },
  _guestLocal() {
    const id = uid();
    const user: User = { id, name: `Guest_${id.slice(0, 6)}`, email: "", is_guest: true };
    return { token: "local-" + id, user };
  },
};

// ---------------------------------------------------------------------------
// Medicines
// ---------------------------------------------------------------------------
function medsFor(user: User) {
  return read<Medicine[]>(LS.meds, []).filter((m) => m.user_id === user.id);
}
function saveMeds(all: Medicine[]) {
  write(LS.meds, all);
}

export const medicineApi = {
  async list(user: User): Promise<Medicine[]> {
    try {
      const { data } = await api.get("/medicines", { headers: auth() });
      return data;
    } catch (e) {
      if (!isBackendError(e)) throw e;
      return medsFor(user);
    }
  },
  async create(user: User, med: Omit<Medicine, "id" | "user_id">): Promise<Medicine> {
    try {
      const { data } = await api.post("/medicines", med, { headers: auth() });
      return data;
    } catch (e) {
      if (!isBackendError(e)) throw e;
      const all = read<Medicine[]>(LS.meds, []);
      const newMed: Medicine = { ...med, id: uid(), user_id: user.id };
      all.push(newMed);
      saveMeds(all);
      return newMed;
    }
  },
  async update(user: User, id: string, med: Omit<Medicine, "id" | "user_id">): Promise<Medicine> {
    try {
      const { data } = await api.put(`/medicines/${id}`, med, { headers: auth() });
      return data;
    } catch (e) {
      if (!isBackendError(e)) throw e;
      const all = read<Medicine[]>(LS.meds, []);
      const idx = all.findIndex((m) => m.id === id && m.user_id === user.id);
      if (idx === -1) throw new Error("Not found");
      all[idx] = { ...all[idx], ...med };
      saveMeds(all);
      return all[idx];
    }
  },
  async remove(user: User, id: string): Promise<void> {
    try {
      await api.delete(`/medicines/${id}`, { headers: auth() });
    } catch (e) {
      if (!isBackendError(e)) throw e;
      const all = read<Medicine[]>(LS.meds, []).filter((m) => m.id !== id);
      saveMeds(all);
      const hist = read<HistoryRecord[]>(LS.history, []).filter((h) => h.medicine_id !== id);
      write(LS.history, hist);
    }
  },
};

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------
export const historyApi = {
  async list(user: User): Promise<HistoryRecord[]> {
    try {
      const { data } = await api.get("/history", { headers: auth() });
      return data;
    } catch (e) {
      if (!isBackendError(e)) throw e;
      return read<HistoryRecord[]>(LS.history, []).filter((h) => h.user_id === user.id);
    }
  },
  async add(user: User, medicine_id: string, status: "Taken" | "Missed"): Promise<HistoryRecord> {
    try {
      const { data } = await api.post("/history", { medicine_id, status }, { headers: auth() });
      return data;
    } catch (e) {
      if (!isBackendError(e)) throw e;
      const all = read<HistoryRecord[]>(LS.history, []);
      const rec: HistoryRecord = {
        id: uid(), user_id: user.id, medicine_id, status,
        date: nowDate(), time: nowTime(),
      };
      all.push(rec);
      write(LS.history, all);
      // decrement stock when taken
      if (status === "Taken") {
        const meds = read<Medicine[]>(LS.meds, []);
        const idx = meds.findIndex((m) => m.id === medicine_id);
        if (idx !== -1) {
          meds[idx].current_stock = Math.max(0, meds[idx].current_stock - 1);
          saveMeds(meds);
        }
      }
      return rec;
    }
  },
  async remove(user: User, id: string): Promise<void> {
    try {
      await api.delete(`/history/${id}`, { headers: auth() });
    } catch (e) {
      if (!isBackendError(e)) throw e;
      const all = read<HistoryRecord[]>(LS.history, []).filter((h) => h.id !== id);
      write(LS.history, all);
    }
  },
};

// ---------------------------------------------------------------------------
// Analytics (computed locally from meds + history)
// ---------------------------------------------------------------------------
export const analyticsApi = {
  async get(user: User): Promise<Analytics> {
    try {
      const { data } = await api.get("/analytics", { headers: auth() });
      return data;
    } catch (e) {
      if (!isBackendError(e)) throw e;
      const meds = medsFor(user);
      const history = read<HistoryRecord[]>(LS.history, []).filter((h) => h.user_id === user.id);
      const taken = history.filter((h) => h.status === "Taken").length;
      const missed = history.filter((h) => h.status === "Missed").length;
      const total = taken + missed;
      const adherence = total ? Math.round((taken / total) * 1000) / 10 : 0;
      const today = nowDate();
      const todayRecords = history.filter((h) => h.date === today);
      const low_stock = meds.filter((m) => m.current_stock < 5);

      // Milestone 4: refill details per medicine
      const refill_details: RefillDetail[] = meds.map((m) => {
        const daily = m.times.length || 1;
        const remaining = m.current_stock / daily;
        let refill_status: RefillDetail["refill_status"] = "Normal";
        if (m.current_stock === 0) refill_status = "Out of Stock";
        else if (remaining <= 5) refill_status = "Refill Soon";
        return { ...m, daily_consumption: daily, remaining_days: Math.round(remaining * 10) / 10, refill_status };
      });

      const refill_soon = refill_details
        .filter((r) => r.refill_status !== "Normal")
        .map(({ daily_consumption: _d, refill_status: _s, ...m }) => m);

      // Refill overview
      const sufficient = refill_details.filter((r) => r.refill_status === "Normal").length;
      const requiring_refill = refill_details.filter((r) => r.refill_status === "Refill Soon").length;
      const out_of_stock = refill_details.filter((r) => r.refill_status === "Out of Stock").length;
      const avg_remaining_days = meds.length
        ? Math.round((refill_details.reduce((sum, r) => sum + r.remaining_days, 0) / meds.length) * 10) / 10
        : 0;

      // 7-day adherence trend
      const trend: TrendDay[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().slice(0, 10);
        const dayRecords = history.filter((h) => h.date === dateStr);
        const dayTaken = dayRecords.filter((h) => h.status === "Taken").length;
        const dayMissed = dayRecords.filter((h) => h.status === "Missed").length;
        const dayTotal = dayTaken + dayMissed;
        trend.push({
          date: dateStr,
          label: d.toLocaleDateString("en-US", { weekday: "short" }),
          taken: dayTaken,
          missed: dayMissed,
          adherence: dayTotal ? Math.round((dayTaken / dayTotal) * 1000) / 10 : 0,
        });
      }

      // Active medicines: have at least one time slot or a reminder set
      const active_medicines = meds.filter((m) => m.times.length > 0 || m.reminder_time).length;

      return {
        total_medicines: meds.length, active_medicines, taken_count: taken, missed_count: missed,
        adherence, taken_today: todayRecords.filter((h) => h.status === "Taken").length,
        missed_today: todayRecords.filter((h) => h.status === "Missed").length,
        low_stock, refill_soon, today_records: todayRecords,
        refill_details, refill_overview: { total_active: meds.length, sufficient, requiring_refill, out_of_stock, avg_remaining_days },
        trend,
      };
    }
  },
};

// ---------------------------------------------------------------------------
// Reminders
// ---------------------------------------------------------------------------
export const reminderApi = {
  async list(user: User): Promise<Reminder[]> {
    try {
      const { data } = await api.get("/reminders", { headers: auth() });
      return data;
    } catch (e) {
      if (!isBackendError(e)) throw e;
      return medsFor(user)
        .filter((m) => m.reminder_time)
        .map((m) => ({ medicine_id: m.id, name: m.name, dosage: m.dosage, reminder_time: m.reminder_time }))
        .sort((a, b) => a.reminder_time.localeCompare(b.reminder_time));
    }
  },
};

// ---------------------------------------------------------------------------
// OCR
// ---------------------------------------------------------------------------
export const ocrApi = {
  async extract(file: File): Promise<OcrResult> {
    try {
      const form = new FormData();
      form.append("image", file);
      const { data } = await api.post("/ocr", form, { headers: { ...auth(), "Content-Type": "multipart/form-data" } });
      return data;
    } catch (e) {
      if (!isBackendError(e)) throw e;
      // Local fallback: can't run tesseract in the browser, return a placeholder
      return { name: "", dosage: "", quantity: "", raw_text: "[Backend not running — OCR unavailable in browser. Start the FastAPI server to use OCR.]" };
    }
  },
};

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
function auth() {
  const token = localStorage.getItem(LS.token);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const storage = {
  saveSession(token: string, user: User) {
    localStorage.setItem(LS.token, token);
    write(LS.user, user);
  },
  loadUser(): User | null {
    return read<User | null>(LS.user, null);
  },
  clear() {
    localStorage.removeItem(LS.token);
    localStorage.removeItem(LS.user);
  },
};
