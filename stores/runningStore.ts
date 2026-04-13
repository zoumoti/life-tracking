import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { Tables, InsertTables } from "../types/database";

type RunningLog = Tables<"running_logs">;

type RunStats = {
  totalDistance: number;
  totalRuns: number;
  thisWeekDistance: number;
  avgPace: number; // min per km
};

type RunningState = {
  runs: RunningLog[];
  loading: boolean;
  fetchRuns: () => Promise<void>;
  addRun: (data: Omit<InsertTables<"running_logs">, "user_id">) => Promise<{ error: string | null }>;
  deleteRun: (id: string) => Promise<{ error: string | null }>;
  getStats: () => RunStats;
  getWeeklyDistances: () => { label: string; value: number }[];
};

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export const useRunningStore = create<RunningState>((set, get) => ({
  runs: [],
  loading: false,

  fetchRuns: async () => {
    set({ loading: true });
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) { set({ loading: false }); return; }

    const { data } = await supabase
      .from("running_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    set({ runs: data ?? [], loading: false });
  },

  addRun: async (data) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return { error: "Non authentifie" };

    const pacePerKm = data.distance_km > 0
      ? data.duration_minutes / data.distance_km
      : null;

    const { error } = await supabase.from("running_logs").insert({
      ...data,
      user_id: user.id,
      pace_per_km: pacePerKm,
    });

    if (!error) {
      // Update linked objective if exists
      if (data.linked_objective_id && pacePerKm) {
        await supabase
          .from("objectives")
          .update({ current_value: pacePerKm })
          .eq("id", data.linked_objective_id);
      }
      await get().fetchRuns();
    }
    return { error: error?.message ?? null };
  },

  deleteRun: async (id) => {
    const { error } = await supabase.from("running_logs").delete().eq("id", id);
    if (!error) {
      set({ runs: get().runs.filter((r) => r.id !== id) });
    }
    return { error: error?.message ?? null };
  },

  getStats: () => {
    const { runs } = get();
    const now = new Date();
    const weekStart = startOfWeek(now);

    const thisWeekRuns = runs.filter((r) => new Date(r.date) >= weekStart);
    const thisWeekDistance = thisWeekRuns.reduce((sum, r) => sum + r.distance_km, 0);
    const totalDistance = runs.reduce((sum, r) => sum + r.distance_km, 0);
    const totalDuration = runs.reduce((sum, r) => sum + r.duration_minutes, 0);
    const avgPace = totalDistance > 0 ? totalDuration / totalDistance : 0;

    return {
      totalDistance,
      totalRuns: runs.length,
      thisWeekDistance,
      avgPace,
    };
  },

  getWeeklyDistances: () => {
    const { runs } = get();
    const weeks: { label: string; value: number }[] = [];
    const now = new Date();

    for (let i = 3; i >= 0; i--) {
      const weekStart = startOfWeek(new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000));
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      const distance = runs
        .filter((r) => {
          const d = new Date(r.date);
          return d >= weekStart && d < weekEnd;
        })
        .reduce((sum, r) => sum + r.distance_km, 0);

      const label = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
      weeks.push({ label, value: Math.round(distance * 10) / 10 });
    }
    return weeks;
  },
}));
