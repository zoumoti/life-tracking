import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";
import type { Tables, InsertTables } from "../types/database";

// --- Types ---

export type Program = Tables<"workout_programs"> & {
  exercises: (Tables<"workout_program_exercises"> & { exercise: Tables<"exercises"> })[];
};

type SessionSet = {
  reps: number;
  weightKg: number;
  completedAt: number; // timestamp
};

type SessionExercise = {
  exerciseId: string;
  exerciseName: string;
  sets: SessionSet[];
};

export type ActiveSession = {
  id: string;
  programId: string | null;
  name: string;
  startedAt: number; // timestamp ms
  exercises: SessionExercise[];
  restTimerStart: number | null; // timestamp ms or null
};

type WorkoutSummary = {
  duration: number; // ms
  totalVolume: number; // kg
  totalSets: number;
  records: { exerciseName: string; weight: number }[];
};

type HistorySession = Tables<"workout_sessions"> & {
  sets: Tables<"workout_sets">[];
};

type LastSetInfo = { weightKg: number; reps: number };

type WorkoutState = {
  // Programs
  programs: Program[];
  programsLoading: boolean;
  fetchPrograms: () => Promise<void>;
  createProgram: (name: string, description?: string) => Promise<{ id: string | null; error: string | null }>;
  updateProgram: (id: string, data: { name?: string; description?: string }) => Promise<{ error: string | null }>;
  deleteProgram: (id: string) => Promise<{ error: string | null }>;
  addExerciseToProgram: (programId: string, exerciseId: string, sortOrder: number) => Promise<{ error: string | null }>;
  removeExerciseFromProgram: (programExerciseId: string) => Promise<{ error: string | null }>;

  // Active session
  currentSession: ActiveSession | null;
  startSession: (programId?: string, programName?: string, exercises?: { id: string; name: string }[]) => void;
  addExerciseToSession: (exerciseId: string, exerciseName: string) => void;
  addSet: (exerciseIndex: number, reps: number, weightKg: number) => void;
  startRestTimer: () => void;
  skipRestTimer: () => void;
  finishSession: () => Promise<WorkoutSummary>;

  // History
  sessions: HistorySession[];
  sessionsLoading: boolean;
  fetchSessions: () => Promise<void>;
  deleteSession: (id: string) => Promise<{ error: string | null }>;
  fetchSessionDetail: (id: string) => Promise<HistorySession | null>;

  // Last sets cache (per exercise)
  lastSets: Record<string, LastSetInfo[]>;
  fetchLastSets: (exerciseId: string) => Promise<void>;
};

// --- Store ---

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      // --- Programs ---
      programs: [],
      programsLoading: false,

      fetchPrograms: async () => {
        set({ programsLoading: true });
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) { set({ programsLoading: false }); return; }

        const { data } = await supabase
          .from("workout_programs")
          .select("*, exercises:workout_program_exercises(*, exercise:exercises(*))")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        set({ programs: (data as unknown as Program[]) ?? [], programsLoading: false });
      },

      createProgram: async (name, description) => {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return { id: null, error: "Non authentifie" };

        const { data, error } = await supabase
          .from("workout_programs")
          .insert({ user_id: user.id, name, description: description ?? "" })
          .select("id")
          .single();

        if (!error) await get().fetchPrograms();
        return { id: data?.id ?? null, error: error?.message ?? null };
      },

      updateProgram: async (id, updates) => {
        const { error } = await supabase.from("workout_programs").update(updates).eq("id", id);
        if (!error) await get().fetchPrograms();
        return { error: error?.message ?? null };
      },

      deleteProgram: async (id) => {
        const { error } = await supabase.from("workout_programs").delete().eq("id", id);
        if (!error) {
          set({ programs: get().programs.filter((p) => p.id !== id) });
        }
        return { error: error?.message ?? null };
      },

      addExerciseToProgram: async (programId, exerciseId, sortOrder) => {
        const { error } = await supabase.from("workout_program_exercises").insert({
          program_id: programId,
          exercise_id: exerciseId,
          sort_order: sortOrder,
          day_of_week: 0,
        });
        if (!error) await get().fetchPrograms();
        return { error: error?.message ?? null };
      },

      removeExerciseFromProgram: async (programExerciseId) => {
        const { error } = await supabase.from("workout_program_exercises").delete().eq("id", programExerciseId);
        if (!error) await get().fetchPrograms();
        return { error: error?.message ?? null };
      },

      // --- Active Session ---
      currentSession: null,

      startSession: (programId, programName, exercises) => {
        const id = `session-${Date.now()}`;
        set({
          currentSession: {
            id,
            programId: programId ?? null,
            name: programName ?? "Seance libre",
            startedAt: Date.now(),
            exercises: exercises?.map((e) => ({ exerciseId: e.id, exerciseName: e.name, sets: [] })) ?? [],
            restTimerStart: null,
          },
        });
      },

      addExerciseToSession: (exerciseId, exerciseName) => {
        const session = get().currentSession;
        if (!session) return;
        set({
          currentSession: {
            ...session,
            exercises: [...session.exercises, { exerciseId, exerciseName, sets: [] }],
          },
        });
      },

      addSet: (exerciseIndex, reps, weightKg) => {
        const session = get().currentSession;
        if (!session) return;
        const exercises = [...session.exercises];
        exercises[exerciseIndex] = {
          ...exercises[exerciseIndex],
          sets: [
            ...exercises[exerciseIndex].sets,
            { reps, weightKg, completedAt: Date.now() },
          ],
        };
        set({ currentSession: { ...session, exercises } });
      },

      startRestTimer: () => {
        const session = get().currentSession;
        if (!session) return;
        set({ currentSession: { ...session, restTimerStart: Date.now() } });
      },

      skipRestTimer: () => {
        const session = get().currentSession;
        if (!session) return;
        set({ currentSession: { ...session, restTimerStart: null } });
      },

      finishSession: async () => {
        const session = get().currentSession;
        if (!session) return { duration: 0, totalVolume: 0, totalSets: 0, records: [] };

        const duration = Date.now() - session.startedAt;
        let totalVolume = 0;
        let totalSets = 0;
        const records: { exerciseName: string; weight: number }[] = [];

        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return { duration, totalVolume: 0, totalSets: 0, records: [] };

        // Insert session
        const { data: sessionRow } = await supabase
          .from("workout_sessions")
          .insert({
            user_id: user.id,
            program_id: session.programId,
            name: session.name,
            started_at: new Date(session.startedAt).toISOString(),
            finished_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (!sessionRow) {
          set({ currentSession: null });
          return { duration, totalVolume: 0, totalSets: 0, records: [] };
        }

        // Insert all sets + detect records
        for (const exercise of session.exercises) {
          // Get current max weight for this exercise
          const { data: maxData } = await supabase
            .from("workout_sets")
            .select("weight_kg")
            .eq("exercise_id", exercise.exerciseId)
            .order("weight_kg", { ascending: false })
            .limit(1);

          const currentMax = maxData?.[0]?.weight_kg ?? 0;

          for (let i = 0; i < exercise.sets.length; i++) {
            const s = exercise.sets[i];
            totalVolume += s.weightKg * s.reps;
            totalSets++;

            await supabase.from("workout_sets").insert({
              session_id: sessionRow.id,
              exercise_id: exercise.exerciseId,
              set_number: i + 1,
              reps: s.reps,
              weight_kg: s.weightKg,
            });

            if (s.weightKg > currentMax) {
              if (!records.find((r) => r.exerciseName === exercise.exerciseName)) {
                records.push({ exerciseName: exercise.exerciseName, weight: s.weightKg });
              }
            }
          }
        }

        set({ currentSession: null });
        return { duration, totalVolume, totalSets, records };
      },

      // --- History ---
      sessions: [],
      sessionsLoading: false,

      fetchSessions: async () => {
        set({ sessionsLoading: true });
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) { set({ sessionsLoading: false }); return; }

        const { data } = await supabase
          .from("workout_sessions")
          .select("*, sets:workout_sets(*)")
          .eq("user_id", user.id)
          .order("started_at", { ascending: false });

        set({ sessions: (data as unknown as HistorySession[]) ?? [], sessionsLoading: false });
      },

      deleteSession: async (id) => {
        const { error } = await supabase.from("workout_sessions").delete().eq("id", id);
        if (!error) {
          set({ sessions: get().sessions.filter((s) => s.id !== id) });
        }
        return { error: error?.message ?? null };
      },

      fetchSessionDetail: async (id) => {
        const { data } = await supabase
          .from("workout_sessions")
          .select("*, sets:workout_sets(*)")
          .eq("id", id)
          .single();

        return (data as unknown as HistorySession) ?? null;
      },

      // --- Last sets ---
      lastSets: {},

      fetchLastSets: async (exerciseId) => {
        const { data } = await supabase
          .from("workout_sets")
          .select("weight_kg, reps, session_id, created_at")
          .eq("exercise_id", exerciseId)
          .order("created_at", { ascending: false })
          .limit(10);

        if (!data || data.length === 0) return;

        const latestSessionId = data[0].session_id;
        const latestSets = data
          .filter((s) => s.session_id === latestSessionId)
          .map((s) => ({ weightKg: s.weight_kg, reps: s.reps }));

        set({ lastSets: { ...get().lastSets, [exerciseId]: latestSets } });
      },
    }),
    {
      name: "workout-store",
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist currentSession — everything else comes from Supabase
      partialize: (state) => ({ currentSession: state.currentSession }),
    }
  )
);
