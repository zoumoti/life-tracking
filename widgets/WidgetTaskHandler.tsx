import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { readWidgetData, writeWidgetData } from "./shared/widgetData";
import { SmallWidget } from "./SmallWidget";
import { MediumWidget } from "./MediumWidget";
import { LargeWidget } from "./LargeWidget";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Use the same Supabase credentials as the app (from lib/supabase.ts)
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

async function toggleHabitInSupabase(habitId: string, completed: boolean): Promise<void> {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = getToday();

    if (completed) {
      // Was completed → now uncomplete: delete the record
      await supabase
        .from("habit_completions")
        .delete()
        .eq("habit_id", habitId)
        .eq("completed_date", today)
        .eq("user_id", user.id);
    } else {
      // Was not completed → now complete: insert record
      await supabase
        .from("habit_completions")
        .insert({ habit_id: habitId, user_id: user.id, completed_date: today });
    }
  } catch {
    // Background sync failed — app will reconcile on next open
  }
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo;
  const data = await readWidgetData();

  // Handle click actions
  if (props.widgetAction === "WIDGET_CLICK") {
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

    if (props.clickAction === "OPEN_APP") {
      return;
    }
  }

  // Render the appropriate widget
  switch (widgetInfo.widgetName) {
    case "LifeOSSmall":
      return <SmallWidget data={data} />;
    case "LifeOSMedium":
      return <MediumWidget data={data} />;
    case "LifeOSLarge":
      return <LargeWidget data={data} />;
    default:
      return <SmallWidget data={data} />;
  }
}
