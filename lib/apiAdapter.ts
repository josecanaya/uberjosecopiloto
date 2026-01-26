// Adaptador para convertir entre tipos antiguos (storage.ts) y nuevos (types.ts)
// Mantiene compatibilidad con el código existente

import type { Event as OldEvent, AppState, ManualAdjustment } from "./storage";
import type { Event as NewEvent, Settings } from "./types";
import { getSettings, getEvents, createEvent, updateEvent, deleteEvent, updateSettings } from "./api";
import { startOfDay, endOfDay, startOfWeek, endOfWeek } from "./dates";

// Convertir Event nuevo a Event antiguo
export function convertEventToOld(newEvent: NewEvent): OldEvent {
  return {
    id: newEvent.id,
    type: newEvent.type,
    at: newEvent.at,
    amount: newEvent.amount,
    note: newEvent.note,
    incomeType: newEvent.income_type,
    fuelLiters: newEvent.fuel_liters,
    fuelPricePerLiter: newEvent.fuel_price_per_liter,
    fuelStation: newEvent.fuel_station,
    pauseStartAt: newEvent.pause_start_at,
    pauseEndAt: newEvent.pause_end_at,
    pauseReason: newEvent.pause_reason,
  };
}

// Convertir Event antiguo a Event nuevo
export function convertEventToNew(oldEvent: Partial<OldEvent>): any {
  return {
    type: oldEvent.type,
    at: oldEvent.at,
    amount: oldEvent.amount,
    note: oldEvent.note,
    income_type: oldEvent.incomeType,
    fuel_liters: oldEvent.fuelLiters,
    fuel_price_per_liter: oldEvent.fuelPricePerLiter,
    fuel_station: oldEvent.fuelStation,
    pause_start_at: oldEvent.pauseStartAt,
    pause_end_at: oldEvent.pauseEndAt,
    pause_reason: oldEvent.pauseReason,
  };
}

// Convertir Settings nuevo a AppState.settings
export function convertSettingsToOld(settings: Settings): AppState["settings"] {
  // Convertir goals_by_dow de string keys a number keys
  const goalsByDow: Record<number, number> = {};
  Object.entries(settings.goals_by_dow || {}).forEach(([key, value]) => {
    goalsByDow[parseInt(key)] = value;
  });

  // Convertir plan_blocks_by_dow de string keys a number keys
  const planBlocksByDow: Record<number, Array<{ start: string; end: string }>> = {};
  Object.entries(settings.plan_blocks_by_dow || {}).forEach(([key, value]) => {
    planBlocksByDow[parseInt(key)] = value;
  });

  return {
    timezone: settings.timezone,
    goalsByDow,
    planBlocksByDow,
    weeklyGoal: settings.weekly_goal,
  };
}

// Estado por defecto (para SSR)
export const defaultState: AppState = {
  version: 1,
  settings: {
    timezone: "America/Argentina/Buenos_Aires",
    goalsByDow: {
      0: 100000, // Domingo
      1: 65000,  // Lunes
      2: 0,      // Martes (descanso)
      3: 0,      // Miércoles (descanso)
      4: 65000,  // Jueves
      5: 70000,  // Viernes
      6: 120000, // Sábado
    },
    planBlocksByDow: {
      1: [
        { start: "06:30", end: "09:00" },
        { start: "14:00", end: "16:30" },
        { start: "21:00", end: "23:00" },
      ],
      4: [
        { start: "06:30", end: "09:00" },
        { start: "14:00", end: "16:30" },
        { start: "21:00", end: "23:00" },
      ],
      5: [
        { start: "06:30", end: "09:00" },
        { start: "14:00", end: "16:30" },
        { start: "21:00", end: "23:00" },
      ],
      6: [
        { start: "04:00", end: "08:00" },
        { start: "18:00", end: "23:00" },
      ],
      0: [
        { start: "04:00", end: "08:00" },
        { start: "18:00", end: "22:00" },
      ],
      2: [],
      3: [],
    },
    weeklyGoal: 400000,
  },
  events: [],
  manualAdjustments: {},
};

// Obtener estado completo desde la API
export async function getState(): Promise<AppState> {
  try {
    const [settings, allEvents] = await Promise.all([
      getSettings().catch((err) => {
        console.error("Error al obtener settings:", err);
        return null;
      }),
      getEvents().catch((err) => {
        console.error("Error al obtener events:", err);
        return [];
      }),
    ]);

    return {
      version: 1,
      settings: settings ? convertSettingsToOld(settings) : defaultState.settings,
      events: allEvents.map(convertEventToOld),
      manualAdjustments: {}, // Los ajustes manuales no se persisten en Supabase por ahora
    };
  } catch (error) {
    console.error("Error al cargar estado:", error);
    return defaultState;
  }
}

// Recargar datos
export async function reloadData(): Promise<void> {
  // Esta función se llama desde los componentes, pero no hace nada
  // porque getState() siempre obtiene datos frescos
}

// Funciones de escritura
export async function addEvent(event: Omit<OldEvent, "id">): Promise<OldEvent> {
  const newEvent = await createEvent(convertEventToNew(event));
  return convertEventToOld(newEvent);
}

export async function updateEventById(id: string, updates: Partial<OldEvent>): Promise<void> {
  await updateEvent(id, convertEventToNew(updates));
}

export async function deleteEventById(id: string): Promise<void> {
  await deleteEvent(id);
}

export async function updateDayGoal(dayOfWeek: number, goal: number): Promise<void> {
  const settings = await getSettings();
  const goalsByDow = { ...settings.goals_by_dow, [dayOfWeek.toString()]: goal };
  await updateSettings({ goals_by_dow: goalsByDow });
}

export async function updateWeeklyGoal(goal: number): Promise<void> {
  await updateSettings({ weekly_goal: goal });
}

// Funciones de compatibilidad (no hacen nada)
export function setManualAdjustment(dateKey: string, adjustment: ManualAdjustment): void {
  // Los ajustes manuales no se persisten en Supabase por ahora
}

export function getManualAdjustment(dateKey: string): ManualAdjustment | undefined {
  return undefined;
}

export function removeManualAdjustment(dateKey: string): void {
  // Los ajustes manuales no se persisten en Supabase por ahora
}

export function exportData(): string {
  // No implementado por ahora
  return JSON.stringify({});
}

export async function importData(json: string, merge: boolean = false): Promise<void> {
  // No implementado por ahora
  throw new Error("Import no implementado");
}

export async function resetData(): Promise<void> {
  // No implementado por ahora
  throw new Error("Reset no implementado");
}
