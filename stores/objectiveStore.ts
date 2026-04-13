import { createPersistedStore } from "./createPersistedStore";
import { supabase } from "../lib/supabase";
import type { Tables, InsertTables, UpdateTables } from "../types/database";

type Objective = Tables<"objectives">;
type ObjectiveUpdate = Tables<"objective_updates">;

type ObjectiveState = {
  objectives: Objective[];
  updates: Record<string, ObjectiveUpdate[]>; // keyed by objective_id
  loading: boolean;
  fetchObjectives: () => Promise<void>;
  fetchUpdates: (objectiveId: string) => Promise<void>;
  addObjective: (obj: Omit<InsertTables<"objectives">, "user_id">) => Promise<{ error: string | null }>;
  updateObjective: (id: string, updates: UpdateTables<"objectives">) => Promise<{ error: string | null }>;
  deleteObjective: (id: string) => Promise<{ error: string | null }>;
  logUpdate: (objectiveId: string, newValue: number, note?: string) => Promise<{ error: string | null }>;
  getObjectivesByVision: (visionId: string) => Objective[];
};

export const useObjectiveStore = createPersistedStore<ObjectiveState>(
  "objective-store",
  (set, get) => ({
    objectives: [],
    updates: {},
    loading: false,

    fetchObjectives: async () => {
      set({ loading: true });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { set({ loading: false }); return; }

      const { data, error } = await supabase
        .from("objectives")
        .select("*")
        .eq("user_id", user.id)
        .is("archived_at", null)
        .order("sort_order", { ascending: true });

      if (!error && data) {
        set({ objectives: data, loading: false });
      } else {
        set({ loading: false });
      }
    },

    fetchUpdates: async (objectiveId) => {
      const { data, error } = await supabase
        .from("objective_updates")
        .select("*")
        .eq("objective_id", objectiveId)
        .order("created_at", { ascending: true });

      if (!error && data) {
        set({ updates: { ...get().updates, [objectiveId]: data } });
      }
    },

    addObjective: async (obj) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: "Non connecte" };

      const siblingsCount = get().objectives.filter((o) => o.vision_id === obj.vision_id).length;
      const { data, error } = await supabase
        .from("objectives")
        .insert({ ...obj, user_id: user.id, sort_order: siblingsCount })
        .select()
        .single();

      if (error) return { error: error.message };
      set({ objectives: [...get().objectives, data] });
      return { error: null };
    },

    updateObjective: async (id, updates) => {
      const { data, error } = await supabase
        .from("objectives")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) return { error: error.message };
      set({ objectives: get().objectives.map((o) => (o.id === id ? data : o)) });
      return { error: null };
    },

    deleteObjective: async (id) => {
      const { error } = await supabase.from("objectives").delete().eq("id", id);
      if (error) return { error: error.message };
      set({ objectives: get().objectives.filter((o) => o.id !== id) });
      const newUpdates = { ...get().updates };
      delete newUpdates[id];
      set({ updates: newUpdates });
      return { error: null };
    },

    logUpdate: async (objectiveId, newValue, note) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: "Non connecte" };

      const objective = get().objectives.find((o) => o.id === objectiveId);
      if (!objective) return { error: "Objectif introuvable" };

      const previousValue = objective.current_value;

      // Insert update record
      const { data: updateData, error: updateError } = await supabase
        .from("objective_updates")
        .insert({
          objective_id: objectiveId,
          user_id: user.id,
          previous_value: previousValue,
          new_value: newValue,
          note: note || null,
        })
        .select()
        .single();

      if (updateError) return { error: updateError.message };

      // Update objective's current_value
      const { data: objData, error: objError } = await supabase
        .from("objectives")
        .update({ current_value: newValue, updated_at: new Date().toISOString() })
        .eq("id", objectiveId)
        .select()
        .single();

      if (objError) return { error: objError.message };

      // Update local state
      set({
        objectives: get().objectives.map((o) => (o.id === objectiveId ? objData : o)),
        updates: {
          ...get().updates,
          [objectiveId]: [...(get().updates[objectiveId] || []), updateData],
        },
      });

      return { error: null };
    },

    getObjectivesByVision: (visionId) => {
      return get().objectives.filter((o) => o.vision_id === visionId);
    },
  })
);
