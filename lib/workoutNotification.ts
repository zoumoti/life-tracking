import * as Notifications from "expo-notifications";
import { AppState } from "react-native";
import { formatDuration } from "./formatters";

const NOTIFICATION_ID = "workout-session";

let sessionStartedAt: number | null = null;
let restStartedAt: number | null = null;
let foregroundInterval: ReturnType<typeof setInterval> | null = null;
let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

function formatTime(timestamp: number): string {
  const d = new Date(timestamp);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

async function updateNotification() {
  if (!sessionStartedAt) return;

  const sessionElapsed = Date.now() - sessionStartedAt;
  let body = `${formatDuration(sessionElapsed)} (depuis ${formatTime(sessionStartedAt)})`;

  if (restStartedAt) {
    const restElapsed = Date.now() - restStartedAt;
    body += ` — Repos : ${formatDuration(restElapsed)}`;
  }

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_ID,
    content: {
      title: "Seance en cours",
      body,
      sticky: true,
      data: { url: "/(tabs)/sport/active-workout" },
    },
    trigger: null,
  });
}

function startInterval() {
  if (foregroundInterval) clearInterval(foregroundInterval);
  foregroundInterval = setInterval(updateNotification, 1000);
}

function stopInterval() {
  if (foregroundInterval) {
    clearInterval(foregroundInterval);
    foregroundInterval = null;
  }
}

export async function startWorkoutNotification(startedAt: number) {
  sessionStartedAt = startedAt;
  restStartedAt = null;

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return;

  await updateNotification();
  startInterval();

  // Re-sync notification when app comes back to foreground
  if (appStateSubscription) appStateSubscription.remove();
  appStateSubscription = AppState.addEventListener("change", (state) => {
    if (state === "active" && sessionStartedAt) {
      updateNotification();
      startInterval();
    } else if (state === "background") {
      // Keep interval running — Android may throttle but it's our best option
    }
  });
}

export function updateRestTimer(restStartTime: number | null) {
  restStartedAt = restStartTime;
}

export async function stopWorkoutNotification() {
  sessionStartedAt = null;
  restStartedAt = null;

  stopInterval();

  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }

  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID);
  await Notifications.dismissNotificationAsync(NOTIFICATION_ID);
}
