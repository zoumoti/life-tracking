// widgets/shared/widgetSync.ts
import { requestWidgetUpdate } from "react-native-android-widget";
import { Platform } from "react-native";
import { useHabitStore } from "../../stores/habitStore";
import { useTaskStore } from "../../stores/taskStore";
import { useRunningStore } from "../../stores/runningStore";
import { useWorkoutStore } from "../../stores/workoutStore";
import { useFinanceStore } from "../../stores/financeStore";
import { useObjectiveStore } from "../../stores/objectiveStore";
import { isHabitScheduledForDate } from "../../lib/habitUtils";
import { toDateString } from "../../lib/dateUtils";
import { writeWidgetData, type WidgetData } from "./widgetData";

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return toDateString(monday);
}

export async function syncWidgetData(): Promise<void> {
  if (Platform.OS !== "android") return;

  const today = toDateString();
  const weekStart = getWeekStart();

  // Read from stores
  const habitState = useHabitStore.getState();
  const taskState = useTaskStore.getState();
  const runningState = useRunningStore.getState();
  const workoutState = useWorkoutStore.getState();
  const financeState = useFinanceStore.getState();
  const objectiveState = useObjectiveStore.getState();

  // Habits: only today's scheduled habits
  const todayHabits = habitState.habits.filter((h) =>
    isHabitScheduledForDate(h, today)
  );
  const habits = todayHabits.map((h) => ({
    id: h.id,
    name: h.name,
    icon: h.icon || "⭐",
    completed: !!habitState.completions[`${h.id}:${today}`],
  }));

  // Tasks: today's tasks (due today or no due date), not completed
  const todayTasks = taskState.tasks.filter(
    (t) => t.due_date === today || (!t.due_date && !t.completed)
  );
  const tasks = todayTasks.slice(0, 5).map((t) => ({
    id: t.id,
    title: t.title,
    completed: t.completed,
  }));

  // Running: weekly distance
  const weeklyRuns = runningState.runs.filter((r) => r.date >= weekStart);
  const weeklyRunKm = Math.round(
    weeklyRuns.reduce((sum, r) => sum + r.distance_km, 0) * 10
  ) / 10;

  // Workouts: weekly count
  const weeklySessions = workoutState.sessions.filter(
    (s) => s.started_at.slice(0, 10) >= weekStart
  );
  const weeklyWorkoutCount = weeklySessions.length;

  // Tasks: today count (incomplete)
  const todayTaskCount = todayTasks.filter((t) => !t.completed).length;

  // Finance: total balance across all accounts
  const monthlyBalance = financeState.accounts.reduce(
    (sum, a) => sum + (a.balance || 0),
    0
  );

  // Objective: nearest deadline or first active
  const activeObjectives = objectiveState.objectives.filter((o) => o.is_active);
  const withDeadline = activeObjectives
    .filter((o) => o.updated_at)
    .sort((a, b) => (a.updated_at > b.updated_at ? 1 : -1));
  const topObjective = withDeadline[0] || activeObjectives[0] || null;

  const objective = topObjective
    ? {
        name: topObjective.name,
        current: topObjective.current_value,
        target: topObjective.target_value,
        unit: topObjective.unit || "",
        deadline: null,
      }
    : null;

  const data: WidgetData = {
    habits,
    tasks,
    stats: { weeklyRunKm, weeklyWorkoutCount, todayTaskCount, monthlyBalance },
    objective,
    lastUpdated: new Date().toISOString(),
  };

  await writeWidgetData(data);

  // Request all widgets to update
  try {
    await requestWidgetUpdate({ widgetName: "LifeOSSmall" });
    await requestWidgetUpdate({ widgetName: "LifeOSMedium" });
    await requestWidgetUpdate({ widgetName: "LifeOSLarge" });
  } catch {
    // Widget may not be placed — ignore
  }
}
