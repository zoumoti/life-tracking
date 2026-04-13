/** Format: "2026-04-13" */
export function toDateString(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Parse "2026-04-13" to Date (local timezone) */
export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Day of week 0=Mon, 6=Sun (ISO convention) */
export function isoDayOfWeek(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/** Get array of date strings for the week containing `date` (Mon-Sun) */
export function getWeekDates(date: Date = new Date()): string[] {
  const day = isoDayOfWeek(date);
  const monday = new Date(date);
  monday.setDate(date.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return toDateString(d);
  });
}

/** Get all date strings for a calendar month grid (6 weeks, Mon-Sun) */
export function getMonthGrid(year: number, month: number): string[] {
  const first = new Date(year, month, 1);
  const startDay = isoDayOfWeek(first);
  const gridStart = new Date(first);
  gridStart.setDate(1 - startDay);

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return toDateString(d);
  });
}

/** Human-readable day labels */
export const DAY_LABELS_SHORT = ["L", "M", "M", "J", "V", "S", "D"] as const;
export const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"] as const;

export const MONTH_LABELS = [
  "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
] as const;

/** Add days to a date string */
export function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return toDateString(d);
}

/** Number of days between two date strings (a - b) */
export function daysBetween(a: string, b: string): number {
  const da = parseDate(a);
  const db = parseDate(b);
  return Math.round((da.getTime() - db.getTime()) / 86400000);
}

/** Is `dateStr` the same day as today? */
export function isToday(dateStr: string): boolean {
  return dateStr === toDateString();
}
