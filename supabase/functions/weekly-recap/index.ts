import { createClient } from "https://esm.sh/@supabase/supabase-js@2.103.0";

const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN")!;
const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function sendTelegram(text: string) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: "HTML",
    }),
  });
}

function getWeekRange(): { start: string; end: string } {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysToLastMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const lastMonday = new Date(now);
  lastMonday.setDate(now.getDate() - daysToLastMonday - 7);
  const lastSunday = new Date(lastMonday);
  lastSunday.setDate(lastMonday.getDate() + 6);

  const fmt = (d: Date) => d.toISOString().split("T")[0];
  return { start: fmt(lastMonday), end: fmt(lastSunday) };
}

/** How many days per week this habit is scheduled */
function getExpectedDaysPerWeek(habit: {
  frequency_type: string;
  frequency_days: number[] | null;
  frequency_value: number | null;
}): number {
  if (habit.frequency_type === "daily") return 7;
  if (habit.frequency_type === "specific_days" && habit.frequency_days) {
    return habit.frequency_days.length;
  }
  if (habit.frequency_type === "x_per_week" && habit.frequency_value) {
    return habit.frequency_value;
  }
  return 7;
}

Deno.serve(async () => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { start, end } = getWeekRange();

    // Get the first user (single-user app)
    const { data: users } = await supabase.auth.admin.listUsers();
    const userId = users?.users?.[0]?.id;
    if (!userId) {
      return new Response("No user found", { status: 404 });
    }

    // ─── Habits ───
    const { data: habits } = await supabase
      .from("habits")
      .select("id, name, frequency_type, frequency_days, frequency_value")
      .eq("user_id", userId)
      .is("archived_at", null);

    const { data: completions } = await supabase
      .from("habit_completions")
      .select("habit_id, completed_date")
      .eq("user_id", userId)
      .gte("completed_date", start)
      .lte("completed_date", end);

    const completionsByHabit: Record<string, number> = {};
    completions?.forEach((c) => {
      completionsByHabit[c.habit_id] = (completionsByHabit[c.habit_id] || 0) + 1;
    });

    let totalCompleted = 0;
    let totalExpected = 0;
    let habitDetails = "";

    habits?.forEach((h) => {
      const count = completionsByHabit[h.id] || 0;
      const expected = getExpectedDaysPerWeek(h);
      totalCompleted += count;
      totalExpected += expected;

      const pct = expected > 0 ? Math.round((count / expected) * 100) : 0;
      const emoji = pct >= 85 ? "🔥" : pct >= 50 ? "✅" : pct >= 1 ? "⚠️" : "❌";
      habitDetails += `  ${emoji} ${h.name}: ${count}/${expected}`;
      if (expected < 7) habitDetails += ` (${expected}j/sem)`;
      habitDetails += "\n";
    });

    const habitRate = totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;

    // ─── Sport: Running ───
    const { data: runs } = await supabase
      .from("running_logs")
      .select("distance_km, duration_minutes, pace_per_km")
      .eq("user_id", userId)
      .gte("date", start)
      .lte("date", end);

    const totalRunKm = runs?.reduce((s, r) => s + r.distance_km, 0) ?? 0;
    const totalRuns = runs?.length ?? 0;
    const avgPace = totalRuns > 0
      ? runs!.reduce((s, r) => s + r.pace_per_km, 0) / totalRuns
      : 0;
    const paceMin = Math.floor(avgPace);
    const paceSec = Math.round((avgPace - paceMin) * 60);

    // ─── Sport: Workouts ───
    const { data: sessions } = await supabase
      .from("workout_sessions")
      .select("id, started_at, finished_at")
      .eq("user_id", userId)
      .gte("started_at", `${start}T00:00:00`)
      .lte("started_at", `${end}T23:59:59`);

    const totalSessions = sessions?.length ?? 0;

    let totalVolume = 0;
    if (sessions && sessions.length > 0) {
      const sessionIds = sessions.map((s) => s.id);
      const { data: sets } = await supabase
        .from("workout_sets")
        .select("weight_kg, reps")
        .in("session_id", sessionIds);

      totalVolume = sets?.reduce((s, set) => s + set.weight_kg * set.reps, 0) ?? 0;
    }

    // ─── Objectives ───
    const { data: objectives } = await supabase
      .from("objectives")
      .select("name, current_value, target_value, unit")
      .eq("user_id", userId)
      .eq("is_active", true)
      .is("archived_at", null);

    let objectiveDetails = "";
    objectives?.forEach((o) => {
      const pct = o.target_value > 0 ? Math.round((o.current_value / o.target_value) * 100) : 0;
      const bar = "█".repeat(Math.floor(pct / 10)) + "░".repeat(10 - Math.floor(pct / 10));
      objectiveDetails += `  ${bar} ${pct}% — ${o.name} (${o.current_value}/${o.target_value} ${o.unit || ""})\n`;
    });

    // ─── Build message ───
    const message = `🎯 <b>Récap de la semaine</b>
${start} → ${end}

📋 <b>Habitudes</b> — ${habitRate}% complété
${habitDetails}
🏃 <b>Course</b>
  ${totalRuns} course${totalRuns !== 1 ? "s" : ""} — ${Math.round(totalRunKm * 10) / 10} km total${avgPace > 0 ? `\n  Allure moyenne: ${paceMin}:${String(paceSec).padStart(2, "0")} /km` : ""}

💪 <b>Musculation</b>
  ${totalSessions} séance${totalSessions !== 1 ? "s" : ""}${totalVolume > 0 ? ` — ${Math.round(totalVolume)} kg de volume` : ""}

🎯 <b>Objectifs</b>
${objectiveDetails || "  Aucun objectif actif"}

Bonne semaine ! 💪`;

    await sendTelegram(message);

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
