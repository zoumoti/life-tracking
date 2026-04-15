import { createPersistedStore } from "./createPersistedStore";
import { getSupabase } from "../lib/supabase";
import { toDateString } from "../lib/dateUtils";
import type { Tables, InsertTables } from "../types/database";

type Habit = Tables<"habits">;
type HabitCompletion = Tables<"habit_completions">;

type HabitState = {
  habits: Habit[];
  completions: Record<string, boolean>;
  loading: boolean;
  lastSyncedAt: string | null;

  fetchHabits: () => Promise<void>;
  fetchCompletions: (startDate: string, endDate: string) => Promise<void>;
  createHabit: (input: Omit<InsertTables<"habits">, "user_id">) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleCompletion: (habitId: string, date: string) => Promise<void>;
  getCompletedDatesForHabit: (habitId: string) => Set<string>;
};

function completionKey(habitId: string, date: string): string {
  return `${habitId}:${date}`;
}

export const useHabitStore = createPersistedStore<HabitState>(
  "habit-store",
  (set, get) => ({
    habits: [],
    completions: {},
    loading: false,
    lastSyncedAt: null,

    fetchHabits: async () => {
      set({ loading: true });
      try {
        const supabase = getSupabase();
        const userId = (await supabase.auth.getUser()).data.user?.id;
        if (!userId) return;

        const { data, error } = await supabase
          .from("habits")
          .select("*")
          .eq("user_id", userId)
          .is("archived_at", null)
          .order("sort_order", { ascending: true });

        if (!error && data) {
          // Migrate old purple colors to gold
          const OLD_COLORS = ["#6C5CE7", "#a855f7"];
          const NEW_COLOR = "#D4AA40";
          const migrated = data.map((h) => {
            if (h.color && OLD_COLORS.includes(h.color)) {
              supabase.from("habits").update({ color: NEW_COLOR }).eq("id", h.id);
              return { ...h, color: NEW_COLOR };
            }
            return h;
          });
          set({ habits: migrated, lastSyncedAt: new Date().toISOString() });
        }
      } finally {
        set({ loading: false });
      }
    },

    fetchCompletions: async (startDate: string, endDate: string) => {
      const supabase = getSupabase();
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from("habit_completions")
        .select("*")
        .eq("user_id", userId)
        .gte("completed_date", startDate)
        .lte("completed_date", endDate);

      if (!error && data) {
        const completions = { ...get().completions };
        data.forEach((c) => {
          completions[completionKey(c.habit_id, c.completed_date)] = true;
        });
        set({ completions });
      }
    },

    createHabit: async (input) => {
      const supabase = getSupabase();
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      const maxOrder = Math.max(0, ...get().habits.map((h) => h.sort_order));

      const { data, error } = await supabase
        .from("habits")
        .insert({ ...input, user_id: userId, sort_order: maxOrder + 1 })
        .select()
        .single();

      if (!error && data) {
        set({ habits: [...get().habits, data] });
      }
    },

    updateHabit: async (id, updates) => {
      const supabase = getSupabase();
      const { error, data } = await supabase
        .from("habits")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (!error && data) {
        set({ habits: get().habits.map((h) => (h.id === id ? data : h)) });
      }
    },

    deleteHabit: async (id) => {
      const supabase = getSupabase();
      const { error } = await supabase
        .from("habits")
        .update({ archived_at: new Date().toISOString(), is_active: false })
        .eq("id", id);

      if (!error) {
        set({ habits: get().habits.filter((h) => h.id !== id) });
      }
    },

    toggleCompletion: async (habitId, date) => {
      const key = completionKey(habitId, date);
      const isCompleted = get().completions[key];
      const supabase = getSupabase();
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return;

      // Save previous state for rollback
      const previousCompletions = get().completions;

      // Optimistic update
      const newCompletions = { ...previousCompletions };
      if (isCompleted) {
        delete newCompletions[key];
      } else {
        newCompletions[key] = true;
      }
      set({ completions: newCompletions });

      // Sync with Supabase — rollback on failure
      try {
        if (isCompleted) {
          const { error } = await supabase
            .from("habit_completions")
            .delete()
            .eq("habit_id", habitId)
            .eq("completed_date", date)
            .eq("user_id", userId);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("habit_completions")
            .insert({ habit_id: habitId, user_id: userId, completed_date: date });
          if (error) throw error;
        }
      } catch {
        // Rollback optimistic update
        set({ completions: previousCompletions });
      }
    },

    getCompletedDatesForHabit: (habitId) => {
      const completions = get().completions;
      const dates = new Set<string>();
      const prefix = `${habitId}:`;
      for (const key of Object.keys(completions)) {
        if (key.startsWith(prefix) && completions[key]) {
          dates.add(key.slice(prefix.length));
        }
      }
      return dates;
    },
  })
);
