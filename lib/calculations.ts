// Funciones de cálculo para estadísticas

import type { Event, ManualAdjustment } from "./storage";
import { startOfWeek, getDayOfWeek, sameLocalDay } from "./dates";

export interface DayStats {
  bruto: number;
  gastoNafta: number;
  gastoKiosco: number;
  gastosTotal: number;
  neto: number;
  pausasMinutos: number;
  horasPlanificadas: number;
  horasEfectivas: number;
  porHoraNeto: number;
}

// Calcular horas planificadas desde bloques
export function calculatePlannedHours(blocks: Array<{ start: string; end: string }>): number {
  let total = 0;
  blocks.forEach((block) => {
    const [startH, startM] = block.start.split(":").map(Number);
    const [endH, endM] = block.end.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const diff = endMinutes - startMinutes;
    total += diff / 60; // convertir a horas
  });
  return total;
}

// Calcular estadísticas del día
export function calculateDayStats(
  events: Event[],
  date: Date,
  planBlocks: Array<{ start: string; end: string }>,
  goal: number,
  manualAdjustment?: ManualAdjustment
): DayStats {
  // Filtrar eventos del día usando sameLocalDay
  const dayEvents = events.filter((e) => {
    if (!e.at && !e.pauseStartAt) return false;
    const eventDate = new Date(e.at || e.pauseStartAt || "");
    return sameLocalDay(eventDate, date);
  });

  // Calcular ingresos
  const incomes = dayEvents.filter((e) => e.type === "INCOME");
  let bruto = incomes.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Calcular gastos
  const fuelExpenses = dayEvents.filter((e) => e.type === "EXPENSE_FUEL");
  let gastoNafta = fuelExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  const kioscoExpenses = dayEvents.filter((e) => e.type === "EXPENSE_KIOSCO");
  let gastoKiosco = kioscoExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // Aplicar ajustes manuales si existen
  if (manualAdjustment) {
    if (manualAdjustment.bruto !== undefined) bruto = manualAdjustment.bruto;
    if (manualAdjustment.gastoNafta !== undefined) gastoNafta = manualAdjustment.gastoNafta;
    if (manualAdjustment.gastoKiosco !== undefined) gastoKiosco = manualAdjustment.gastoKiosco;
  }

  const gastosTotal = gastoNafta + gastoKiosco;
  const neto = bruto - gastosTotal;

  // Calcular pausas
  const pauses = dayEvents.filter((e) => e.type === "PAUSE");
  let pausasMinutos = 0;
  pauses.forEach((pause) => {
    if (pause.pauseStartAt && pause.pauseEndAt) {
      const start = new Date(pause.pauseStartAt);
      const end = new Date(pause.pauseEndAt);
      const diff = (end.getTime() - start.getTime()) / (1000 * 60);
      pausasMinutos += diff;
    } else if (pause.pauseStartAt) {
      // Pausa activa
      const start = new Date(pause.pauseStartAt);
      const now = new Date();
      const diff = (now.getTime() - start.getTime()) / (1000 * 60);
      pausasMinutos += diff;
    }
  });

  // Horas planificadas
  const horasPlanificadas = calculatePlannedHours(planBlocks);

  // Horas efectivas
  let horasEfectivas = Math.max(0, horasPlanificadas - pausasMinutos / 60);
  
  // Aplicar ajuste manual de horas si existe
  if (manualAdjustment?.horasEfectivas !== undefined) {
    horasEfectivas = manualAdjustment.horasEfectivas;
  }

  // $/hora neto
  const porHoraNeto = horasEfectivas > 0 ? neto / horasEfectivas : 0;

  return {
    bruto,
    gastoNafta,
    gastoKiosco,
    gastosTotal,
    neto,
    pausasMinutos,
    horasPlanificadas,
    horasEfectivas,
    porHoraNeto,
  };
}

// Calcular estadísticas de la semana
export function calculateWeekStats(
  events: Event[],
  weekStart: Date,
  goalsByDow: Record<number, number>,
  planBlocksByDow: Record<number, Array<{ start: string; end: string }>>,
  manualAdjustments?: Record<string, ManualAdjustment>
): Array<{ dayOfWeek: number; dayName: string; date: Date; goal: number; stats: DayStats }> {
  const weekStats = [];
  const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    const dayOfWeek = getDayOfWeek(date);
    const goal = goalsByDow[dayOfWeek] || 0;
    const blocks = planBlocksByDow[dayOfWeek] || [];
    
    // Obtener clave de fecha para ajustes manuales (YYYY-MM-DD)
    const dateKey = date.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Buenos_Aires" });
    const adjustment = manualAdjustments?.[dateKey];
    
    const stats = calculateDayStats(events, date, blocks, goal, adjustment);

    weekStats.push({
      dayOfWeek,
      dayName: dayNames[dayOfWeek],
      date,
      goal,
      stats,
    });
  }

  return weekStats;
}
