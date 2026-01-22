import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-exportar funciones de dates.ts
export {
  formatCurrency,
  formatTime,
  formatDate,
  formatDateTime,
  formatDuration,
  getArgentinaDate,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  sameLocalDay,
  getDayOfWeek,
} from "./dates";
