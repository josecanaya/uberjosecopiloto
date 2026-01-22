// Utilidades de fecha y timezone para Argentina

const ARGENTINA_TZ = "America/Argentina/Buenos_Aires";

export function getArgentinaDate(): Date {
  return new Date();
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: ARGENTINA_TZ,
  }).format(date);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: ARGENTINA_TZ,
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: ARGENTINA_TZ,
  }).format(date);
}

export function formatCurrency(amount: number): string {
  // Formatear como moneda argentina con $ al principio
  const formatted = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  // Asegurar que el formato sea $ X.XXX
  return formatted.replace(/\s/g, " "); // Normalizar espacios
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

// Obtener inicio del día en timezone Argentina
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  const argentinaStr = d.toLocaleString("en-US", {
    timeZone: ARGENTINA_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  
  const [month, day, year] = argentinaStr.split("/");
  const localDate = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    0, 0, 0, 0
  );
  
  // Convertir a UTC considerando offset de Argentina
  const offset = localDate.getTimezoneOffset();
  return new Date(localDate.getTime() - offset * 60 * 1000);
}

// Obtener fin del día en timezone Argentina
export function endOfDay(date: Date): Date {
  const start = startOfDay(date);
  const end = new Date(start);
  end.setHours(23, 59, 59, 999);
  return end;
}

// Verificar si dos fechas son el mismo día en timezone Argentina
export function sameLocalDay(date1: Date, date2: Date): boolean {
  const d1 = date1.toLocaleDateString("en-US", { timeZone: ARGENTINA_TZ });
  const d2 = date2.toLocaleDateString("en-US", { timeZone: ARGENTINA_TZ });
  return d1 === d2;
}

// Obtener inicio de semana (Lunes) en timezone Argentina
export function startOfWeek(date: Date, monday: boolean = true): Date {
  // Obtener fecha en timezone Argentina
  const argentinaDate = new Date(date.toLocaleString("en-US", { timeZone: ARGENTINA_TZ }));
  
  // Crear fecha local
  const localDate = new Date(
    argentinaDate.getFullYear(),
    argentinaDate.getMonth(),
    argentinaDate.getDate(),
    0, 0, 0, 0
  );
  
  // Calcular lunes de la semana
  const dayOfWeek = localDate.getDay(); // 0 = Domingo, 1 = Lunes, etc.
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Lunes = día 1
  
  localDate.setDate(localDate.getDate() + diff);
  
  return localDate;
}

// Obtener fin de semana (Domingo) en timezone Argentina
export function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

// Obtener día de la semana (0 = Domingo, 1 = Lunes, etc.) en timezone Argentina
export function getDayOfWeek(date: Date): number {
  // Obtener fecha en timezone Argentina
  const argentinaDate = new Date(date.toLocaleString("en-US", { timeZone: ARGENTINA_TZ }));
  
  // Crear fecha local
  const localDate = new Date(
    argentinaDate.getFullYear(),
    argentinaDate.getMonth(),
    argentinaDate.getDate(),
    0, 0, 0, 0
  );
  
  return localDate.getDay();
}
