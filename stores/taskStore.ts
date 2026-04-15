import { createPersistedStore } from "./createPersistedStore";
import { getSupabase } from "../lib/supabase";
import {
  createGoogleTask,
  updateGoogleTask,
  deleteGoogleTask,
  fetchGoogleTasks,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from "../lib/googleSync";
import type { Task, TaskInput } from "../types/task";

type TaskState = {
  tasks: Task[];
  loading: boolean;

  fetchTasks: () => Promise<void>;
  addTask: (input: TaskInput) => Promise<void>;
  updateTask: (id: string, input: Partial<TaskInput>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  syncWithGoogle: () => Promise<void>;
};

async function getUserId(): Promise<string | null> {
  const supabase = getSupabase();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export const useTaskStore = createPersistedStore<TaskState>(
  "task-store",
  (set, get) => ({
    tasks: [],
    loading: false,

    // ─── Fetch ──────────────────────────────────────────────

    fetchTasks: async () => {
      const userId = await getUserId();
      if (!userId) return;
      set({ loading: true });
      try {
        const { data, error } = await getSupabase()
          .from("tasks")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        if (!error && data) {
          set({ tasks: data as unknown as Task[] });
        }
      } finally {
        set({ loading: false });
      }
    },

    // ─── Add ────────────────────────────────────────────────

    addTask: async (input) => {
      const userId = await getUserId();
      if (!userId) return;

      // Let Supabase generate the UUID
      const { data, error } = await getSupabase()
        .from("tasks")
        .insert({
          user_id: userId,
          title: input.title,
          notes: input.notes ?? null,
          due_date: input.due_date ?? null,
          priority: input.priority ?? "normal",
        })
        .select()
        .single();

      if (error || !data) return;

      const newTask = data as unknown as Task;
      set({ tasks: [newTask, ...get().tasks] });

      // Background Google sync
      syncTaskToGoogle(newTask).then((ids) => {
        if (ids.googleTaskId || ids.googleEventId) {
          const updates: Partial<Task> = {};
          if (ids.googleTaskId) updates.google_task_id = ids.googleTaskId;
          if (ids.googleEventId) updates.google_event_id = ids.googleEventId;

          getSupabase().from("tasks").update(updates).eq("id", newTask.id).then(() => {
            set({
              tasks: get().tasks.map((t) =>
                t.id === newTask.id ? { ...t, ...updates } : t
              ),
            });
          });
        }
      });
    },

    // ─── Update ─────────────────────────────────────────────

    updateTask: async (id, input) => {
      const prev = get().tasks.find((t) => t.id === id);
      if (!prev) return;

      const updated = { ...prev, ...input };
      // Optimistic
      set({ tasks: get().tasks.map((t) => (t.id === id ? updated : t)) });

      const { error } = await getSupabase()
        .from("tasks")
        .update(input)
        .eq("id", id);

      if (error) {
        // Rollback
        set({ tasks: get().tasks.map((t) => (t.id === id ? prev : t)) });
        return;
      }

      // Background Google sync
      if (prev.google_task_id) {
        updateGoogleTask(prev.google_task_id, updated).catch(() => {});
      }
      if (prev.google_event_id && input.due_date !== undefined) {
        updateCalendarEvent(prev.google_event_id, updated).catch(() => {});
      }
    },

    // ─── Delete ─────────────────────────────────────────────

    deleteTask: async (id) => {
      const prev = get().tasks.find((t) => t.id === id);
      if (!prev) return;

      // Optimistic
      set({ tasks: get().tasks.filter((t) => t.id !== id) });

      const { error } = await getSupabase()
        .from("tasks")
        .delete()
        .eq("id", id);

      if (error) {
        set({ tasks: [...get().tasks, prev] });
        return;
      }

      // Background Google cleanup
      if (prev.google_task_id) {
        deleteGoogleTask(prev.google_task_id).catch(() => {});
      }
      if (prev.google_event_id) {
        deleteCalendarEvent(prev.google_event_id).catch(() => {});
      }
    },

    // ─── Toggle Complete ────────────────────────────────────

    toggleComplete: async (id) => {
      const task = get().tasks.find((t) => t.id === id);
      if (!task) return;

      const newCompleted = !task.completed;
      const completed_at = newCompleted ? new Date().toISOString() : null;
      const updated = { ...task, completed: newCompleted, completed_at };

      // Optimistic
      set({ tasks: get().tasks.map((t) => (t.id === id ? updated : t)) });

      const { error } = await getSupabase()
        .from("tasks")
        .update({ completed: newCompleted, completed_at })
        .eq("id", id);

      if (error) {
        set({ tasks: get().tasks.map((t) => (t.id === id ? task : t)) });
        return;
      }

      // Background Google sync
      if (task.google_task_id) {
        updateGoogleTask(task.google_task_id, updated).catch(() => {});
      }
    },

    // ─── Sync with Google ───────────────────────────────────

    syncWithGoogle: async () => {
      const googleTasks = await fetchGoogleTasks();
      if (!googleTasks) return;

      const tasks = get().tasks;

      for (const gt of googleTasks) {
        const local = tasks.find((t) => t.google_task_id === gt.id);
        if (!local) continue;

        const googleCompleted = gt.status === "completed";
        if (local.completed !== googleCompleted) {
          const completed_at = googleCompleted ? new Date().toISOString() : null;

          await getSupabase()
            .from("tasks")
            .update({ completed: googleCompleted, completed_at })
            .eq("id", local.id);

          set({
            tasks: get().tasks.map((t) =>
              t.id === local.id
                ? { ...t, completed: googleCompleted, completed_at }
                : t
            ),
          });
        }
      }
    },
  })
);

// ─── Helper ───────────────────────────────────────────────

async function syncTaskToGoogle(
  task: Task
): Promise<{ googleTaskId: string | null; googleEventId: string | null }> {
  let googleTaskId: string | null = null;
  let googleEventId: string | null = null;

  try {
    googleTaskId = await createGoogleTask(task);
  } catch {}

  try {
    googleEventId = await createCalendarEvent(task);
  } catch {}

  return { googleTaskId, googleEventId };
}
