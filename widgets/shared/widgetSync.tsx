import React from "react";
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
import { featherToEmoji } from "../../lib/iconUtils";
import { writeWidgetData, type WidgetData } from "./widgetData";
import { SmallWidget } from "../SmallWidget";
import { MediumWidget } from "../MediumWidget";
import { LargeWidget } from "../LargeWidget";

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return toDateString(monday);
}

async function buildWidgetData(): Promise<WidgetData> {
  const today = toDateString();
  const weekStart = getWeekStart();

  const habitState = useHabitStore.getState();
  const taskState = useTaskStore.getState();
  const runningState = useRunningStore.getState();
  const workoutState = useWorkoutStore.getState();
  const financeState = useFinanceStore.getState();
  const objectiveState = useObjectiveStore.getState();

  const todayHabits = habitState.habits.filter((h) =>
    isHabitScheduledForDate(h, today)
  );
  const habits = todayHabits.map((h) => ({
    id: h.id,
    name: h.name,
    icon: featherToEmoji(h.icon || "circle"),
    completed: !!habitState.completions[`${h.id}:${today}`],
  }));

  const todayTasks = taskState.tasks.filter(
    (t) => t.due_date === today || (!t.due_date && !t.completed)
  );
  const tasks = todayTasks.slice(0, 5).map((t) => ({
    id: t.id,
    title: t.title,
    completed: t.completed,
    google_task_id: t.google_task_id || null,
  }));

  const weeklyRuns = runningState.runs.filter((r) => r.date >= weekStart);
  const weeklyRunKm =
    Math.round(weeklyRuns.reduce((sum, r) => sum + r.distance_km, 0) * 10) /
    10;

  const weeklySessions = workoutState.sessions.filter(
    (s) => s.started_at.slice(0, 10) >= weekStart
  );
  const weeklyWorkoutCount = weeklySessions.length;

  const todayTaskCount = todayTasks.filter((t) => !t.completed).length;

  const totalBalance = financeState.accounts.reduce(
    (sum, a) => sum + (a.balance || 0),
    0
  );
  const monthlyBalance = totalBalance;

  // Monthly finance stats
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthTransactions = financeState.transactions.filter((t) => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const monthlyExpenses = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyRevenue = monthTransactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const activeObjectives = objectiveState.objectives.filter((o) => o.is_active);
  const topObjective = activeObjectives[0] || null;

  const objective = topObjective
    ? {
        name: topObjective.name,
        current: topObjective.current_value,
        target: topObjective.target_value,
        unit: topObjective.unit || "",
        deadline: null,
      }
    : null;

  return {
    habits,
    tasks,
    stats: { weeklyRunKm, weeklyWorkoutCount, todayTaskCount, monthlyBalance, totalBalance, monthlyExpenses, monthlyRevenue },
    objective,
    lastUpdated: new Date().toISOString(),
  };
}

export async function syncWidgetData(): Promise<void> {
  if (Platform.OS !== "android") return;

  const data = await buildWidgetData();
  await writeWidgetData(data);

  try {
    await requestWidgetUpdate({
      widgetName: "LifeOSSmall",
      renderWidget: () => <SmallWidget data={data} />,
    });
  } catch {}

  try {
    await requestWidgetUpdate({
      widgetName: "LifeOSMedium",
      renderWidget: () => <MediumWidget data={data} />,
    });
  } catch {}

  try {
    await requestWidgetUpdate({
      widgetName: "LifeOSLarge",
      renderWidget: () => <LargeWidget data={data} />,
    });
  } catch {}
}
