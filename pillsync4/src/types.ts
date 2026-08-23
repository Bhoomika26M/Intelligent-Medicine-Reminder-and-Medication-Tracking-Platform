// Shared types used across the frontend.

export interface User {
  id: string;
  name: string;
  email: string;
  is_guest: boolean;
}

export interface Medicine {
  id: string;
  user_id?: string;
  name: string;
  dosage: string;
  quantity: string;
  frequency: string;
  times: string[];        // ["Morning", "Afternoon", "Night"]
  reminder_time: string;  // "HH:MM"
  start_date: string;
  end_date: string;
  notes: string;
  current_stock: number;
}

export type HistoryStatus = "Taken" | "Missed";

export interface HistoryRecord {
  id: string;
  user_id?: string;
  medicine_id: string;
  status: HistoryStatus;
  date: string;  // YYYY-MM-DD
  time: string;  // HH:MM
}

export interface RefillDetail extends Medicine {
  daily_consumption: number;
  remaining_days: number;
  refill_status: "Normal" | "Refill Soon" | "Out of Stock";
}

export interface TrendDay {
  date: string;
  label: string;
  taken: number;
  missed: number;
  adherence: number;
}

export interface Analytics {
  total_medicines: number;
  active_medicines: number;
  taken_count: number;
  missed_count: number;
  adherence: number;
  taken_today: number;
  missed_today: number;
  low_stock: Medicine[];
  refill_soon: (Medicine & { remaining_days: number })[];
  today_records: HistoryRecord[];
  // Milestone 4 additions
  refill_details: RefillDetail[];
  refill_overview: {
    total_active: number;
    sufficient: number;
    requiring_refill: number;
    out_of_stock: number;
    avg_remaining_days: number;
  };
  trend: TrendDay[];
}

export interface Reminder {
  medicine_id: string;
  name: string;
  dosage: string;
  reminder_time: string;
}

export interface OcrResult {
  name: string;
  dosage: string;
  quantity: string;
  raw_text: string;
}
