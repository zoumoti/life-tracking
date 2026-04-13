/**
 * Format milliseconds to mm:ss or hh:mm:ss
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

/**
 * Format pace as m:ss /km from total minutes and km
 */
export function formatPace(durationMinutes: number, distanceKm: number): string {
  if (distanceKm <= 0) return "--:--";
  const paceMinutes = durationMinutes / distanceKm;
  const mins = Math.floor(paceMinutes);
  const secs = Math.round((paceMinutes - mins) * 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

/**
 * Format a date to French short format: "12 avr"
 */
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

/**
 * Format a date to French long format: "Samedi 12 avril 2026"
 */
export function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
