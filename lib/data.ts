// Sistema de datos desde archivos JSON en el repo
// Los datos se leen desde /data/settings.json y /data/events.json
// Y se pueden actualizar mediante API routes que hacen commits a Git

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

// Cargar settings desde JSON (estático en build time)
const initialSettings = validateSettings(settingsData);

// Cargar eventos desde JSON (estático en build time)
const initialEvents = validateEvents(eventsData);

// Estado en memoria (se actualiza dinámicamente)
let cachedState: AppState = {
  version: 1,
  settings: initialSettings,
  events: initialEvents,
  manualAdjustments: {},
};

// Recargar datos desde los JSONs (en el cliente)
export async function reloadData(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    // Cargar settings
    const settingsResponse = await fetch("/data/settings.json?t=" + Date.now());
    if (settingsResponse.ok) {
      const settingsJson = await settingsResponse.json();
      cachedState.settings = validateSettings(settingsJson);
    }

    // Cargar events
    const eventsResponse = await fetch("/data/events.json?t=" + Date.now());
    if (eventsResponse.ok) {
      const eventsJson = await eventsResponse.json();
      cachedState.events = validateEvents(eventsJson);
    }
  } catch (error) {
    console.error("Error al recargar datos:", error);
  }
}

// Estado por defecto (para SSR)
export const defaultState: AppState = {
  version: 1,
  settings: initialSettings,
  events: initialEvents,
  manualAdjustments: {},
};

// Obtener estado actual
export function getState(): AppState {
  return cachedState;
}

// Actualizar settings en Git
async function updateSettingsInGit(settings: AppState["settings"]): Promise<void> {
  try {
    const response = await fetch("/api/git/update-settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ settings }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al actualizar settings");
    }

    // Recargar datos después de actualizar
    await reloadData();
  } catch (error) {
    console.error("Error al actualizar settings en Git:", error);
    throw error;
  }
}

// Actualizar events en Git
async function updateEventsInGit(events: Event[]): Promise<void> {
  try {
    const response = await fetch("/api/git/update-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ events }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al actualizar events");
    }

    // Recargar datos después de actualizar
    await reloadData();
  } catch (error) {
    console.error("Error al actualizar events en Git:", error);
    throw error;
  }
}

// Funciones de escritura que guardan en Git

export function updateState(updater: (state: AppState) => AppState): void {
  if (typeof window === "undefined") {
    console.warn("updateState: Solo disponible en el cliente");
    return;
  }

  const updated = updater(cachedState);
  cachedState = updated;

  // Guardar en Git (async, no bloquea)
  updateSettingsInGit(updated.settings).catch((err) => {
    console.error("Error al guardar settings:", err);
    alert("Error al guardar en Git. Verifica la consola para más detalles.");
  });
  updateEventsInGit(updated.events).catch((err) => {
    console.error("Error al guardar events:", err);
    alert("Error al guardar en Git. Verifica la consola para más detalles.");
  });
}

export async function addEvent(event: Omit<Event, "id">): Promise<Event> {
  if (typeof window === "undefined") {
    throw new Error("addEvent: Solo disponible en el cliente");
  }

  const newEvent: Event = {
    ...event,
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };

  const updatedEvents = [...cachedState.events, newEvent];
  cachedState.events = updatedEvents;

  try {
    await updateEventsInGit(updatedEvents);
    return newEvent;
  } catch (error) {
    // Revertir cambio local si falla
    cachedState.events = cachedState.events.filter((e) => e.id !== newEvent.id);
    throw error;
  }
}

export async function updateEvent(id: string, updates: Partial<Event>): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("updateEvent: Solo disponible en el cliente");
  }

  const updatedEvents = cachedState.events.map((e) =>
    e.id === id ? { ...e, ...updates } : e
  );
  const oldEvents = cachedState.events;
  cachedState.events = updatedEvents;

  try {
    await updateEventsInGit(updatedEvents);
  } catch (error) {
    // Revertir cambio local si falla
    cachedState.events = oldEvents;
    throw error;
  }
}

export async function deleteEvent(id: string): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("deleteEvent: Solo disponible en el cliente");
  }

  const updatedEvents = cachedState.events.filter((e) => e.id !== id);
  const oldEvents = cachedState.events;
  cachedState.events = updatedEvents;

  try {
    await updateEventsInGit(updatedEvents);
  } catch (error) {
    // Revertir cambio local si falla
    cachedState.events = oldEvents;
    throw error;
  }
}

export async function updateDayGoal(dayOfWeek: number, goal: number): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("updateDayGoal: Solo disponible en el cliente");
  }

  const updatedSettings = {
    ...cachedState.settings,
    goalsByDow: {
      ...cachedState.settings.goalsByDow,
      [dayOfWeek]: goal,
    },
  };
  const oldSettings = cachedState.settings;
  cachedState.settings = updatedSettings;

  try {
    await updateSettingsInGit(updatedSettings);
  } catch (error) {
    // Revertir cambio local si falla
    cachedState.settings = oldSettings;
    throw error;
  }
}

export async function updateWeeklyGoal(goal: number): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("updateWeeklyGoal: Solo disponible en el cliente");
  }

  const updatedSettings = {
    ...cachedState.settings,
    weeklyGoal: goal,
  };
  const oldSettings = cachedState.settings;
  cachedState.settings = updatedSettings;

  try {
    await updateSettingsInGit(updatedSettings);
  } catch (error) {
    // Revertir cambio local si falla
    cachedState.settings = oldSettings;
    throw error;
  }
}

export function setManualAdjustment(dateKey: string, adjustment: ManualAdjustment): void {
  // Los ajustes manuales no se persisten en Git por ahora
  cachedState.manualAdjustments = {
    ...cachedState.manualAdjustments,
    [dateKey]: adjustment,
  };
}

export function getManualAdjustment(dateKey: string): ManualAdjustment | undefined {
  return cachedState.manualAdjustments[dateKey];
}

export function removeManualAdjustment(dateKey: string): void {
  const { [dateKey]: removed, ...rest } = cachedState.manualAdjustments;
  cachedState.manualAdjustments = rest;
}

// Exportar datos (para descargar)
export function exportData(): string {
  const state = getState();
  return JSON.stringify(state, null, 2);
}

// Importar datos (actualiza en Git)
export async function importData(json: string, merge: boolean = false): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("importData: Solo disponible en el cliente");
  }

  try {
    const imported = JSON.parse(json) as AppState;

    if (merge) {
      // Merge: combinar eventos
      const mergedEvents = [...cachedState.events, ...imported.events];
      await updateEventsInGit(mergedEvents);
    } else {
      // Reemplazar todo
      await updateSettingsInGit(imported.settings);
      await updateEventsInGit(imported.events);
    }
  } catch (error) {
    console.error("Error importing data:", error);
    throw new Error("Error al importar datos. Verifica que el archivo sea válido.");
  }
}

// Reset datos (limpia events, mantiene settings)
export async function resetData(): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("resetData: Solo disponible en el cliente");
  }

  if (!confirm("¿Estás seguro? Esto eliminará TODOS los eventos.")) {
    return;
  }

  try {
    await updateEventsInGit([]);
    alert("Eventos eliminados correctamente");
  } catch (error) {
    console.error("Error al resetear datos:", error);
    throw error;
  }
}

// No inicializar automáticamente aquí - se hace en los componentes
