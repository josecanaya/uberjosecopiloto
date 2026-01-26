// Tipos compartidos entre frontend y backend

export type EventType = "INCOME" | "EXPENSE_FUEL" | "EXPENSE_KIOSCO" | "PAUSE";
export type IncomeType = "UBER" | "TIP" | "OTHER";
export type PauseReason = "SLEEP" | "FOOD" | "REST";

export interface PlanBlock {
  start: string; // "HH:mm"
  end: string; // "HH:mm"
}

export interface Event {
  id: string;
  type: EventType;
  at?: string; // ISO string (timestamptz)
  amount?: number;
  note?: string;
  // INCOME
  income_type?: IncomeType;
  // EXPENSE_FUEL
  fuel_liters?: number;
  fuel_price_per_liter?: number;
  fuel_station?: string;
  // PAUSE
  pause_start_at?: string; // ISO string (timestamptz)
  pause_end_at?: string; // ISO string (timestamptz)
  pause_reason?: PauseReason;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: string;
  timezone: string;
  goals_by_dow: Record<string, number>; // "0" = Domingo, "1" = Lunes, etc.
  plan_blocks_by_dow: Record<string, PlanBlock[]>;
  weekly_goal?: number;
  created_at: string;
  updated_at: string;
}

// Tipos para requests
export interface CreateEventRequest {
  type: EventType;
  at?: string;
  amount?: number;
  note?: string;
  income_type?: IncomeType;
  fuel_liters?: number;
  fuel_price_per_liter?: number;
  fuel_station?: string;
  pause_start_at?: string;
  pause_end_at?: string;
  pause_reason?: PauseReason;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {}

export interface UpdateSettingsRequest {
  timezone?: string;
  goals_by_dow?: Record<string, number>;
  plan_blocks_by_dow?: Record<string, PlanBlock[]>;
  weekly_goal?: number;
}
