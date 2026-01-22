// Sistema de almacenamiento local con versionado y migración

export interface Event {
  id: string;
  type: "INCOME" | "EXPENSE_FUEL" | "EXPENSE_KIOSCO" | "PAUSE";
  at?: string; // ISO string
  amount?: number;
  note?: string;
  // INCOME
  incomeType?: "UBER" | "TIP" | "OTHER";
  // EXPENSE_FUEL
  fuelLiters?: number;
  fuelPricePerLiter?: number;
  fuelStation?: string;
  // PAUSE
  pauseStartAt?: string; // ISO string
  pauseEndAt?: string; // ISO string
  pauseReason?: "SLEEP" | "FOOD" | "REST";
}

export interface PlanBlock {
  start: string; // "HH:mm"
  end: string; // "HH:mm"
}

export interface ManualAdjustment {
  bruto?: number;
  gastoNafta?: number;
  gastoKiosco?: number;
  horasEfectivas?: number;
}

export interface AppState {
  version: number;
  settings: {
    timezone: string;
    goalsByDow: Record<number, number>; // day of week -> goal
    planBlocksByDow: Record<number, PlanBlock[]>; // day of week -> blocks
    weeklyGoal?: number; // objetivo semanal
  };
  events: Event[];
  manualAdjustments: Record<string, ManualAdjustment>; // date (YYYY-MM-DD) -> adjustment
}

const STORAGE_KEY = "copiloto_uber_v1";
const CURRENT_VERSION = 1;

// Estado inicial por defecto
export const defaultState: AppState = {
  version: CURRENT_VERSION,
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
      1: [ // Lunes
        { start: "06:30", end: "09:00" },
        { start: "14:00", end: "16:30" },
        { start: "21:00", end: "23:00" },
      ],
      4: [ // Jueves
        { start: "06:30", end: "09:00" },
        { start: "14:00", end: "16:30" },
        { start: "21:00", end: "23:00" },
      ],
      5: [ // Viernes
        { start: "06:30", end: "09:00" },
        { start: "14:00", end: "16:30" },
        { start: "21:00", end: "23:00" },
      ],
      6: [ // Sábado
        { start: "04:00", end: "08:00" },
        { start: "18:00", end: "23:00" },
      ],
      0: [ // Domingo
        { start: "04:00", end: "08:00" },
        { start: "18:00", end: "22:00" },
      ],
      2: [], // Martes
      3: [], // Miércoles
    },
    weeklyGoal: 400000, // objetivo semanal por defecto
  },
  events: [],
  manualAdjustments: {},
};

// Migraciones
function migrate(state: any, fromVersion: number, toVersion: number): AppState {
  let migrated = { ...state };

  // Asegurar que manualAdjustments existe
  if (!migrated.manualAdjustments) {
    migrated.manualAdjustments = {};
  }

  // Asegurar que weeklyGoal existe
  if (!migrated.settings?.weeklyGoal) {
    migrated.settings = {
      ...migrated.settings,
      weeklyGoal: 400000, // objetivo semanal por defecto
    };
  }

  // Migración v1 -> v2 (ejemplo futuro)
  // if (fromVersion < 2) {
  //   // hacer cambios
  // }

  migrated.version = toVersion;
  return migrated as AppState;
}

// Cargar estado desde localStorage
export function loadState(): AppState {
  if (typeof window === "undefined") {
    return defaultState;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultState;
    }

    const parsed = JSON.parse(stored);
    
    // Si la versión es diferente o falta manualAdjustments, migrar
    if (parsed.version !== CURRENT_VERSION || !parsed.manualAdjustments) {
      const migrated = migrate(parsed, parsed.version || 1, CURRENT_VERSION);
      saveState(migrated);
      return migrated;
    }

    return parsed as AppState;
  } catch (error) {
    console.error("Error loading state:", error);
    return defaultState;
  }
}

// Guardar estado en localStorage
export function saveState(state: AppState): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Error saving state:", error);
    alert("Error al guardar datos. Verifica que tengas espacio disponible.");
  }
}

// Obtener estado actual
export function getState(): AppState {
  return loadState();
}

// Actualizar estado (merge)
export function updateState(updater: (state: AppState) => AppState): void {
  const current = loadState();
  const updated = updater(current);
  saveState(updated);
}

// Agregar evento
export function addEvent(event: Omit<Event, "id">): Event {
  const newEvent: Event = {
    ...event,
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };

  updateState((state) => ({
    ...state,
    events: [...state.events, newEvent],
  }));

  return newEvent;
}

// Actualizar evento
export function updateEvent(id: string, updates: Partial<Event>): void {
  updateState((state) => ({
    ...state,
    events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
  }));
}

// Eliminar evento
export function deleteEvent(id: string): void {
  updateState((state) => ({
    ...state,
    events: state.events.filter((e) => e.id !== id),
  }));
}

// Actualizar objetivo del día
export function updateDayGoal(dayOfWeek: number, goal: number): void {
  updateState((state) => ({
    ...state,
    settings: {
      ...state.settings,
      goalsByDow: {
        ...state.settings.goalsByDow,
        [dayOfWeek]: goal,
      },
    },
  }));
}

// Actualizar objetivo semanal
export function updateWeeklyGoal(goal: number): void {
  updateState((state) => ({
    ...state,
    settings: {
      ...state.settings,
      weeklyGoal: goal,
    },
  }));
}

// Exportar datos
export function exportData(): string {
  const state = loadState();
  return JSON.stringify(state, null, 2);
}

// Importar datos
export function importData(json: string, merge: boolean = false): void {
  try {
    const imported = JSON.parse(json) as AppState;
    
    if (merge) {
      // Merge: combinar eventos
      const current = loadState();
      const mergedEvents = [...current.events, ...imported.events];
      saveState({
        ...imported,
        events: mergedEvents,
      });
    } else {
      // Reemplazar todo
      saveState(imported);
    }
  } catch (error) {
    console.error("Error importing data:", error);
    throw new Error("Error al importar datos. Verifica que el archivo sea válido.");
  }
}

// Reset datos
export function resetData(): void {
  if (typeof window === "undefined") {
    return;
  }
  localStorage.removeItem(STORAGE_KEY);
}

// Guardar ajuste manual para una fecha
export function setManualAdjustment(dateKey: string, adjustment: ManualAdjustment): void {
  updateState((state) => ({
    ...state,
    manualAdjustments: {
      ...state.manualAdjustments,
      [dateKey]: adjustment,
    },
  }));
}

// Obtener ajuste manual para una fecha
export function getManualAdjustment(dateKey: string): ManualAdjustment | undefined {
  const state = loadState();
  return state.manualAdjustments[dateKey];
}

// Eliminar ajuste manual para una fecha
export function removeManualAdjustment(dateKey: string): void {
  updateState((state) => {
    const { [dateKey]: removed, ...rest } = state.manualAdjustments;
    return {
      ...state,
      manualAdjustments: rest,
    };
  });
}
