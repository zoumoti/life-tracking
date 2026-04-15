export type TaskPriority = "high" | "normal" | "low";
export type TaskFilter = "all" | "today" | "week" | "no_date";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  due_date: string | null; // yyyy-MM-dd
  priority: TaskPriority;
  completed: boolean;
  completed_at: string | null;
  google_task_id: string | null;
  google_event_id: string | null;
  created_at: string;
}

export type TaskInput = {
  title: string;
  notes?: string | null;
  due_date?: string | null;
  priority?: TaskPriority;
};
