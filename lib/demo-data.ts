// Generar datos de ejemplo para la semana actual

import { addEvent } from "./storage";
import { startOfWeek, getArgentinaDate } from "./dates";
import type { Event } from "./storage";

export function loadDemoData() {
  const today = getArgentinaDate();
  const weekStart = startOfWeek(today);

  const events: Omit<Event, "id">[] = [];

  // Lunes (día 0 desde weekStart)
  const monday = new Date(weekStart);
  monday.setHours(7, 0, 0, 0);
  events.push({
    type: "INCOME",
    amount: 15000,
    incomeType: "UBER",
    at: monday.toISOString(),
    note: "Primera hora - Lunes",
  });

  monday.setHours(8, 30, 0, 0);
  events.push({
    type: "INCOME",
    amount: 12000,
    incomeType: "UBER",
    at: monday.toISOString(),
    note: undefined,
  });

  // Martes (día 1)
  const tuesday = new Date(weekStart);
  tuesday.setDate(weekStart.getDate() + 1);
  tuesday.setHours(10, 0, 0, 0);
  events.push({
    type: "EXPENSE_KIOSCO",
    amount: 500,
    at: tuesday.toISOString(),
    note: "Café - Martes",
  });

  // Jueves (día 3)
  const thursday = new Date(weekStart);
  thursday.setDate(weekStart.getDate() + 3);
  thursday.setHours(6, 0, 0, 0);
  events.push({
    type: "EXPENSE_FUEL",
    amount: 8000,
    fuelLiters: 20,
    fuelPricePerLiter: 400,
    fuelStation: "YPF",
    at: thursday.toISOString(),
    note: "Carga completa",
  });

  thursday.setHours(7, 0, 0, 0);
  events.push({
    type: "INCOME",
    amount: 18000,
    incomeType: "UBER",
    at: thursday.toISOString(),
    note: "Mañana - Jueves",
  });

  thursday.setHours(14, 30, 0, 0);
  events.push({
    type: "INCOME",
    amount: 20000,
    incomeType: "UBER",
    at: thursday.toISOString(),
    note: "Mediodía - Jueves",
  });

  // Viernes (día 4)
  const friday = new Date(weekStart);
  friday.setDate(weekStart.getDate() + 4);
  friday.setHours(7, 30, 0, 0);
  events.push({
    type: "INCOME",
    amount: 16000,
    incomeType: "UBER",
    at: friday.toISOString(),
    note: "Mañana - Viernes",
  });

  friday.setHours(9, 0, 0, 0);
  events.push({
    type: "EXPENSE_KIOSCO",
    amount: 300,
    at: friday.toISOString(),
    note: "Agua y snack",
  });

  friday.setHours(21, 0, 0, 0);
  events.push({
    type: "INCOME",
    amount: 22000,
    incomeType: "UBER",
    at: friday.toISOString(),
    note: "Noche - Viernes",
  });

  // Sábado (día 5)
  const saturday = new Date(weekStart);
  saturday.setDate(weekStart.getDate() + 5);
  saturday.setHours(5, 0, 0, 0);
  events.push({
    type: "INCOME",
    amount: 25000,
    incomeType: "UBER",
    at: saturday.toISOString(),
    note: "Madrugada - Sábado",
  });

  saturday.setHours(6, 0, 0, 0);
  events.push({
    type: "EXPENSE_FUEL",
    amount: 10000,
    fuelLiters: 25,
    fuelPricePerLiter: 400,
    fuelStation: "Shell",
    at: saturday.toISOString(),
    note: "Carga sábado",
  });

  saturday.setHours(19, 0, 0, 0);
  events.push({
    type: "INCOME",
    amount: 30000,
    incomeType: "UBER",
    at: saturday.toISOString(),
    note: "Noche - Sábado",
  });

  // Domingo (día 6)
  const sunday = new Date(weekStart);
  sunday.setDate(weekStart.getDate() + 6);
  sunday.setHours(5, 30, 0, 0);
  events.push({
    type: "INCOME",
    amount: 22000,
    incomeType: "UBER",
    at: sunday.toISOString(),
    note: "Madrugada - Domingo",
  });

  sunday.setHours(18, 30, 0, 0);
  events.push({
    type: "INCOME",
    amount: 28000,
    incomeType: "UBER",
    at: sunday.toISOString(),
    note: "Noche - Domingo",
  });

  // Agregar una pausa (viernes mediodía)
  friday.setHours(13, 0, 0, 0);
  const pauseStart = new Date(friday);
  pauseStart.setHours(13, 0, 0, 0);
  const pauseEnd = new Date(friday);
  pauseEnd.setHours(13, 45, 0, 0);
  events.push({
    type: "PAUSE",
    pauseStartAt: pauseStart.toISOString(),
    pauseEndAt: pauseEnd.toISOString(),
    pauseReason: "FOOD",
  });

  // Agregar todos los eventos
  events.forEach((event) => {
    addEvent(event);
  });

  return events.length;
}
