// Sistema de datos desde archivos JSON en el repo
// Los datos se leen desde /data/settings.json y /data/events.json

import settingsData from "@/data/settings.json";
import eventsData from "@/data/events.json";

// Re-exportar tipos desde storage.ts para mantener compatibilidad
export type {
  Event,
  PlanBlock,
  ManualAdjustment,
  AppState,
} from "./storage";

// Importar tipos
import type { Event, PlanBlock, ManualAdjustment, AppState } from "./storage";

// Validar y convertir datos de settings
function validateSettings(data: any): AppState["settings"] {
  return {
    timezone: data.timezone || "America/Argentina/Buenos_Aires",
    goalsByDow: data.goalsByDow || {},
    planBlocksByDow: data.planBlocksByDow || {},
    weeklyGoal: data.weeklyGoal || 400000,
  };
}

// Validar y convertir eventos
function validateEvents(data: any[]): Event[] {
  return data.map((e) => ({
    id: e.id || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: e.type,
    at: e.at,
    amount: e.amount,
    note: e.note,
    incomeType: e.incomeType,
    fuelLiters: e.fuelLiters,
    fuelPricePerLiter: e.fuelPricePerLiter,
    fuelStation: e.fuelStation,
    pauseStartAt: e.pauseStartAt,
    pauseEndAt: e.pauseEndAt,
    pauseReason: e.pauseReason,
  }));
}

// Cargar settings desde JSON
const settings = validateSettings(settingsData);

// Cargar eventos desde JSON
const events = validateEvents(eventsData);

// Estado por defecto (solo lectura desde JSON)
export const defaultState: AppState = {
  version: 1,
  settings,
  events,
  manualAdjustments: {}, // Los ajustes manuales no se persisten en Git por ahora
};

// Obtener estado actual (solo lectura)
export function getState(): AppState {
  return defaultState;
}

// Funciones de compatibilidad (no hacen nada, solo lectura)
// Estas funciones se mantienen para no romper el código existente
// pero no guardan nada porque los datos vienen de Git

export function updateState(updater: (state: AppState) => AppState): void {
  console.warn("updateState: Los datos se leen desde Git. No se pueden modificar desde la UI.");
}

export function addEvent(event: Omit<Event, "id">): Event {
  console.warn("addEvent: Los datos se leen desde Git. No se pueden agregar eventos desde la UI.");
  return {
    ...event,
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
}

export function updateEvent(id: string, updates: Partial<Event>): void {
  console.warn("updateEvent: Los datos se leen desde Git. No se pueden modificar eventos desde la UI.");
}

export function deleteEvent(id: string): void {
  console.warn("deleteEvent: Los datos se leen desde Git. No se pueden eliminar eventos desde la UI.");
}

export function updateDayGoal(dayOfWeek: number, goal: number): void {
  console.warn("updateDayGoal: Los datos se leen desde Git. No se pueden modificar objetivos desde la UI.");
}

export function updateWeeklyGoal(goal: number): void {
  console.warn("updateWeeklyGoal: Los datos se leen desde Git. No se pueden modificar objetivos desde la UI.");
}

export function setManualAdjustment(dateKey: string, adjustment: ManualAdjustment): void {
  console.warn("setManualAdjustment: Los ajustes manuales no se persisten en Git.");
}

export function getManualAdjustment(dateKey: string): ManualAdjustment | undefined {
  // Los ajustes manuales no se persisten en Git, siempre retornar undefined
  return undefined;
}

export function removeManualAdjustment(dateKey: string): void {
  console.warn("removeManualAdjustment: Los ajustes manuales no se persisten en Git.");
}

// Exportar datos (para descargar)
export function exportData(): string {
  const state = getState();
  return JSON.stringify(state, null, 2);
}

// Importar datos (no hace nada, solo lectura)
export function importData(json: string, merge: boolean = false): void {
  console.warn("importData: Los datos se leen desde Git. No se pueden importar desde la UI.");
}

// Reset datos (no hace nada)
export function resetData(): void {
  console.warn("resetData: Los datos se leen desde Git. No se pueden resetear desde la UI.");
}
