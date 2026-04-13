import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { Tables, InsertTables } from "../types/database";

type Exercise = Tables<"exercises">;

type ExerciseState = {
  exercises: Exercise[];
  loading: boolean;
  error: string | null;
  fetchExercises: () => Promise<void>;
  addExercise: (data: Pick<InsertTables<"exercises">, "name" | "muscle_group" | "secondary_muscle_group" | "description" | "is_compound">) => Promise<{ error: string | null }>;
  deleteExercise: (id: string) => Promise<{ error: string | null }>;
};

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  exercises: [],
  loading: false,
  error: null,

  fetchExercises: async () => {
    set({ loading: true, error: null });
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      set({ loading: false, error: "Non authentifie" });
      return;
    }

    // Fetch default exercises (user_id IS NULL) + user's custom exercises
    const { data, error } = await supabase
      .from("exercises")
      .select("*")
      .or(`user_id.is.null,user_id.eq.${user.id}`)
      .order("muscle_group")
      .order("name");

    if (error) {
      set({ loading: false, error: error.message });
    } else {
      set({ exercises: data ?? [], loading: false });
    }
  },

  addExercise: async (data) => {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return { error: "Non authentifie" };

    const { error } = await supabase.from("exercises").insert({
      ...data,
      user_id: user.id,
    });

    if (!error) {
      await get().fetchExercises();
    }
    return { error: error?.message ?? null };
  },

  deleteExercise: async (id) => {
    const { error } = await supabase.from("exercises").delete().eq("id", id);
    if (!error) {
      set({ exercises: get().exercises.filter((e) => e.id !== id) });
    }
    return { error: error?.message ?? null };
  },
}));
