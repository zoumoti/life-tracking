import { toDateString, parseDate, isoDayOfWeek, addDays } from "./dateUtils";
import type { Tables } from "../types/database";

type Habit = Tables<"habits">;

/**
 * Check if a habit is scheduled for a given date.
 * - daily: always true
 * - specific_days: check if day-of-week is in frequency_days (0=Mon..6=Sun ISO)
 * - x_per_week: always true (user chooses when)
 */
export function isHabitScheduledForDate(habit: Habit, dateStr: string): boolean {
  if (!habit.is_active) return false;
  if (habit.frequency_type === "daily") return true;
  if (habit.frequency_type === "specific_days" && habit.frequency_days) {
    const dayOfWeek = isoDayOfWeek(parseDate(dateStr));
    return habit.frequency_days.includes(dayOfWeek);
  }
  return true;
}

/**
 * Calculate streak with "never miss twice" rule.
 * Returns { current, best, warning }.
 * - warning=true means 1 scheduled day was missed — next miss breaks streak.
 * - Streak breaks after 2 CONSECUTIVE scheduled-but-missed days.
 */
export function calculateStreak(
  habit: Habit,
  completedDates: Set<string>,
  today: string = toDateString()
): { current: number; best: number; warning: boolean } {
  let current = 0;
  let best = 0;
  let warning = false;
  let consecutiveMisses = 0;
  let streakActive = true;
  let tempStreak = 0;

  for (let i = 0; i < 365; i++) {
    const dateStr = addDays(today, -i);
    if (dateStr < habit.created_at.slice(0, 10)) break;
    if (!isHabitScheduledForDate(habit, dateStr)) continue;

    if (completedDates.has(dateStr)) {
      consecutiveMisses = 0;
      if (streakActive) {
        tempStreak++;
      }
    } else {
      consecutiveMisses++;
      if (consecutiveMisses >= 2) {
        if (streakActive) {
          streakActive = false;
        }
      } else if (streakActive && i === 0) {
        consecutiveMisses = 0;
        continue;
      } else if (streakActive) {
        warning = true;
      }
    }

    if (!streakActive && tempStreak > 0) {
      best = Math.max(best, tempStreak);
      tempStreak = completedDates.has(dateStr) ? 1 : 0;
      streakActive = false;
    }
  }

  current = streakActive ? tempStreak : 0;
  best = Math.max(best, tempStreak, current);

  return { current, best, warning };
}

/**
 * Completion rate over last N days (only counting scheduled days).
 */
export function completionRate(
  habit: Habit,
  completedDates: Set<string>,
  days: number = 30,
  today: string = toDateString()
): number {
  let scheduled = 0;
  let completed = 0;

  for (let i = 0; i < days; i++) {
    const dateStr = addDays(today, -i);
    if (dateStr < habit.created_at.slice(0, 10)) break;
    if (!isHabitScheduledForDate(habit, dateStr)) continue;
    scheduled++;
    if (completedDates.has(dateStr)) completed++;
  }

  return scheduled === 0 ? 0 : completed / scheduled;
}

/**
 * Stats for habit detail screen.
 */
export function habitStats(
  habit: Habit,
  completedDates: Set<string>,
  today: string = toDateString()
): {
  completionRate30: number;
  bestDay: number;
  worstDay: number;
} {
  const dayCount = Array(7).fill(0);
  const dayTotal = Array(7).fill(0);

  for (let i = 0; i < 90; i++) {
    const dateStr = addDays(today, -i);
    if (dateStr < habit.created_at.slice(0, 10)) break;
    if (!isHabitScheduledForDate(habit, dateStr)) continue;
    const dow = isoDayOfWeek(parseDate(dateStr));
    dayTotal[dow]++;
    if (completedDates.has(dateStr)) dayCount[dow]++;
  }

  let bestDay = 0;
  let worstDay = 0;
  let bestRate = -1;
  let worstRate = 2;

  for (let d = 0; d < 7; d++) {
    if (dayTotal[d] === 0) continue;
    const rate = dayCount[d] / dayTotal[d];
    if (rate > bestRate) { bestRate = rate; bestDay = d; }
    if (rate < worstRate) { worstRate = rate; worstDay = d; }
  }

  return {
    completionRate30: completionRate(habit, completedDates, 30, today),
    bestDay,
    worstDay,
  };
}
