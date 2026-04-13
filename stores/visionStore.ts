import { createPersistedStore } from "./createPersistedStore";
import { supabase } from "../lib/supabase";
import type { Tables, InsertTables, UpdateTables } from "../types/database";

type Vision = Tables<"visions">;

type VisionState = {
  visions: Vision[];
  loading: boolean;
  fetchVisions: () => Promise<void>;
  addVision: (vision: Omit<InsertTables<"visions">, "user_id">) => Promise<{ error: string | null }>;
  updateVision: (id: string, updates: UpdateTables<"visions">) => Promise<{ error: string | null }>;
  deleteVision: (id: string) => Promise<{ error: string | null }>;
};

export const useVisionStore = createPersistedStore<VisionState>(
  "vision-store",
  (set, get) => ({
    visions: [],
    loading: false,

    fetchVisions: async () => {
      set({ loading: true });
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { set({ loading: false }); return; }

      const { data, error } = await supabase
        .from("visions")
        .select("*")
        .eq("user_id", user.id)
        .order("sort_order", { ascending: true });

      if (!error && data) {
        set({ visions: data, loading: false });
      } else {
        set({ loading: false });
      }
    },

    addVision: async (vision) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { error: "Non connecte" };

      const nextOrder = get().visions.length;
      const { data, error } = await supabase
        .from("visions")
        .insert({ ...vision, user_id: user.id, sort_order: nextOrder })
        .select()
        .single();

      if (error) return { error: error.message };
      set({ visions: [...get().visions, data] });
      return { error: null };
    },

    updateVision: async (id, updates) => {
      const { data, error } = await supabase
        .from("visions")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) return { error: error.message };
      set({ visions: get().visions.map((v) => (v.id === id ? data : v)) });
      return { error: null };
    },

    deleteVision: async (id) => {
      const { error } = await supabase.from("visions").delete().eq("id", id);
      if (error) return { error: error.message };
      set({ visions: get().visions.filter((v) => v.id !== id) });
      return { error: null };
    },
  })
);
