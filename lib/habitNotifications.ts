import * as Notifications from "expo-notifications";
import { useHabitStore } from "../stores/habitStore";
import { featherToEmoji } from "./iconUtils";

const NOTIF_PREFIX = "habit-reminder-";

/**
 * Cancel all existing habit reminder notifications,
 * then schedule a daily one for each habit that has a reminder_time set.
 */
export async function scheduleHabitNotifications(): Promise<void> {
  // Cancel all existing habit reminders
  const all = await Notifications.getAllScheduledNotificationsAsync();
  const cancelPromises = all
    .filter((n) => n.identifier.startsWith(NOTIF_PREFIX))
    .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier));
  await Promise.all(cancelPromises);

  const habits = useHabitStore.getState().habits;

  for (const habit of habits) {
    if (!habit.reminder_time || !habit.is_active) continue;

    const [hourStr, minuteStr] = habit.reminder_time.split(":");
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    if (isNaN(hour) || isNaN(minute)) continue;

    const emoji = featherToEmoji(habit.icon || "circle");

    await Notifications.scheduleNotificationAsync({
      identifier: `${NOTIF_PREFIX}${habit.id}`,
      content: {
        title: `${emoji} N'oublie pas: ${habit.name}`,
        body: "",
        data: { url: `/(tabs)/habits` },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  }
}
