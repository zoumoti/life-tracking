import { getValidAccessToken } from "./googleAuth";
import type { Task } from "../types/task";

const TASKS_API = "https://tasks.googleapis.com/tasks/v1";
const CALENDAR_API = "https://www.googleapis.com/calendar/v3";
const DEFAULT_TASK_LIST = "@default";

// ─── Google Tasks API ───────────────────────────────────────

async function authHeaders(): Promise<HeadersInit | null> {
  const token = await getValidAccessToken();
  if (!token) return null;
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function createGoogleTask(
  task: Task
): Promise<string | null> {
  const headers = await authHeaders();
  if (!headers) return null;

  try {
    const body: Record<string, unknown> = {
      title: task.title,
      notes: task.notes ?? undefined,
      status: task.completed ? "completed" : "needsAction",
    };
    if (task.due_date) {
      body.due = `${task.due_date}T00:00:00.000Z`;
    }

    const resp = await fetch(
      `${TASKS_API}/lists/${DEFAULT_TASK_LIST}/tasks`,
      { method: "POST", headers, body: JSON.stringify(body) }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.id ?? null;
  } catch {
    return null;
  }
}

export async function updateGoogleTask(
  googleTaskId: string,
  task: Partial<Task>
): Promise<boolean> {
  const headers = await authHeaders();
  if (!headers) return false;

  try {
    const body: Record<string, unknown> = {};
    if (task.title !== undefined) body.title = task.title;
    if (task.notes !== undefined) body.notes = task.notes;
    if (task.due_date !== undefined) {
      body.due = task.due_date ? `${task.due_date}T00:00:00.000Z` : null;
    }
    if (task.completed !== undefined) {
      body.status = task.completed ? "completed" : "needsAction";
    }

    const resp = await fetch(
      `${TASKS_API}/lists/${DEFAULT_TASK_LIST}/tasks/${googleTaskId}`,
      { method: "PATCH", headers, body: JSON.stringify(body) }
    );
    return resp.ok;
  } catch {
    return false;
  }
}

export async function deleteGoogleTask(googleTaskId: string): Promise<boolean> {
  const headers = await authHeaders();
  if (!headers) return false;

  try {
    const resp = await fetch(
      `${TASKS_API}/lists/${DEFAULT_TASK_LIST}/tasks/${googleTaskId}`,
      { method: "DELETE", headers }
    );
    return resp.ok;
  } catch {
    return false;
  }
}

export interface GoogleTaskItem {
  id: string;
  title: string;
  notes?: string;
  due?: string;
  status: "needsAction" | "completed";
  completed?: string;
  updated: string;
}

export async function fetchGoogleTasks(): Promise<GoogleTaskItem[] | null> {
  const headers = await authHeaders();
  if (!headers) return null;

  try {
    const resp = await fetch(
      `${TASKS_API}/lists/${DEFAULT_TASK_LIST}/tasks?maxResults=100&showCompleted=true&showHidden=true`,
      { method: "GET", headers }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    return (data.items ?? []) as GoogleTaskItem[];
  } catch {
    return null;
  }
}

// ─── Google Calendar API ────────────────────────────────────

export async function createCalendarEvent(
  task: Task
): Promise<string | null> {
  if (!task.due_date) return null;
  const headers = await authHeaders();
  if (!headers) return null;

  try {
    const body = {
      summary: task.title,
      description: task.notes ?? "",
      start: { date: task.due_date },
      end: { date: task.due_date },
    };

    const resp = await fetch(
      `${CALENDAR_API}/calendars/primary/events`,
      { method: "POST", headers, body: JSON.stringify(body) }
    );
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.id ?? null;
  } catch {
    return null;
  }
}

export async function updateCalendarEvent(
  eventId: string,
  task: Partial<Task>
): Promise<boolean> {
  const headers = await authHeaders();
  if (!headers) return false;

  try {
    const body: Record<string, unknown> = {};
    if (task.title !== undefined) body.summary = task.title;
    if (task.notes !== undefined) body.description = task.notes;
    if (task.due_date !== undefined) {
      body.start = { date: task.due_date };
      body.end = { date: task.due_date };
    }

    const resp = await fetch(
      `${CALENDAR_API}/calendars/primary/events/${eventId}`,
      { method: "PATCH", headers, body: JSON.stringify(body) }
    );
    return resp.ok;
  } catch {
    return false;
  }
}

export async function deleteCalendarEvent(eventId: string): Promise<boolean> {
  const headers = await authHeaders();
  if (!headers) return false;

  try {
    const resp = await fetch(
      `${CALENDAR_API}/calendars/primary/events/${eventId}`,
      { method: "DELETE", headers }
    );
    return resp.ok;
  } catch {
    return false;
  }
}
