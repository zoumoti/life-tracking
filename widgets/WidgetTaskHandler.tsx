import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { readWidgetData, writeWidgetData } from "./shared/widgetData";
import { SmallWidget } from "./SmallWidget";
import { MediumWidget } from "./MediumWidget";
import { LargeWidget } from "./LargeWidget";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getValidAccessToken } from "../lib/googleAuth";

const SUPABASE_URL = "https://tzyzaygqvxkazdgeyvha.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6eXpheWdxdnhrYXpkZ2V5dmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDMxMzEsImV4cCI6MjA5MTY3OTEzMX0.KsfJOK_803UP_orXzBvWSIk95rsFs9AQtvFRQigvvoA";

function getToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

function getSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

async function toggleHabitInSupabase(habitId: string, wasCompleted: boolean): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const today = getToday();

    if (wasCompleted) {
      await supabase.from("habit_completions").delete()
        .eq("habit_id", habitId).eq("completed_date", today).eq("user_id", user.id);
    } else {
      await supabase.from("habit_completions")
        .insert({ habit_id: habitId, user_id: user.id, completed_date: today });
    }
  } catch {}
}

async function toggleTaskInSupabase(taskId: string, wasCompleted: boolean): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (wasCompleted) {
      await supabase.from("tasks").update({ completed: false, completed_at: null })
        .eq("id", taskId).eq("user_id", user.id);
    } else {
      await supabase.from("tasks").update({ completed: true, completed_at: new Date().toISOString() })
        .eq("id", taskId).eq("user_id", user.id);
    }
  } catch {}
}

async function toggleTaskInGoogle(googleTaskId: string, newCompleted: boolean): Promise<void> {
  try {
    const token = await getValidAccessToken();
    if (!token) return;

    await fetch(
      `https://tasks.googleapis.com/tasks/v1/lists/@default/tasks/${googleTaskId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newCompleted ? "completed" : "needsAction",
        }),
      }
    );
  } catch {}
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps): Promise<void> {
  const widgetName = props.widgetInfo.widgetName;
  const data = await readWidgetData();

  if (props.widgetAction === "WIDGET_CLICK") {
    // Habit toggle
    if (props.clickAction === "TOGGLE_HABIT" && props.clickActionData?.habitId) {
      const habitId = props.clickActionData.habitId as string;
      const habit = data.habits.find((h) => h.id === habitId);
      if (habit) {
        const wasCompleted = habit.completed;
        habit.completed = !wasCompleted;
        data.lastUpdated = new Date().toISOString();
        await writeWidgetData(data);
        toggleHabitInSupabase(habitId, wasCompleted);
      }
    }

    // Task toggle
    if (props.clickAction === "TOGGLE_TASK" && props.clickActionData?.taskId) {
      const taskId = props.clickActionData.taskId as string;
      const task = data.tasks.find((t) => t.id === taskId);
      if (task) {
        const wasCompleted = task.completed;
        task.completed = !wasCompleted;
        data.lastUpdated = new Date().toISOString();
        await writeWidgetData(data);
        toggleTaskInSupabase(taskId, wasCompleted);
        // Sync with Google Tasks if linked
        if (task.google_task_id) {
          toggleTaskInGoogle(task.google_task_id, !wasCompleted);
        }
      }
    }
  }

  // Render
  switch (widgetName) {
    case "LifeOSSmall":
      props.renderWidget(<SmallWidget data={data} />);
      break;
    case "LifeOSMedium":
      props.renderWidget(<MediumWidget data={data} />);
      break;
    case "LifeOSLarge":
      props.renderWidget(<LargeWidget data={data} />);
      break;
    default:
      props.renderWidget(<SmallWidget data={data} />);
      break;
  }
}
