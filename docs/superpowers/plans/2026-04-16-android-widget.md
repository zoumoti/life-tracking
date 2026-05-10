# Android Home Screen Widget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 3 interactive Android home screen widgets (small, medium, large) to Life OS that display habits, tasks, sport stats, finances, and objectives — with tap-to-complete habits.

**Architecture:** `react-native-android-widget` with Expo config plugin renders JSX-based widgets. Data flows from Zustand stores → SharedPreferences JSON snapshot → widget reads. Habit taps update SharedPreferences directly and sync to Supabase in background.

**Tech Stack:** `react-native-android-widget`, `react-native-shared-group-preferences`, Expo config plugin, Zustand, Supabase

**Spec:** `docs/superpowers/specs/2026-04-16-android-widget-design.md`

---

## File Structure

```
life-tracker/
├── widgets/
│   ├── SmallWidget.tsx          # Small widget (4×1) — read-only summary
│   ├── MediumWidget.tsx         # Medium widget (4×2) — interactive habits + stats
│   ├── LargeWidget.tsx          # Large widget (4×4) — full dashboard
│   ├── WidgetTaskHandler.ts     # Click handler registration + Supabase background sync
│   └── shared/
│       ├── widgetData.ts        # SharedPreferences read/write + data schema type
│       ├── widgetStyles.ts      # Design tokens (colors, sizes, radii)
│       └── widgetSync.ts        # App-side: serialize stores → SharedPreferences
├── app.json                     # Add react-native-android-widget plugin config
├── app/_layout.tsx              # Register widget task handler + init sync on app launch
├── stores/habitStore.ts         # Add widgetSync call after toggleCompletion
├── stores/taskStore.ts          # Add widgetSync call after toggleComplete/addTask/deleteTask
└── package.json                 # Add dependencies
```

---

### Task 1: Install dependencies & configure Expo plugin

**Files:**
- Modify: `life-tracker/package.json`
- Modify: `life-tracker/app.json:33-49` (plugins array)

- [ ] **Step 1: Install react-native-android-widget**

```bash
cd life-tracker
npx expo install react-native-android-widget
```

- [ ] **Step 2: Install react-native-shared-group-preferences**

```bash
npx expo install react-native-shared-group-preferences
```

- [ ] **Step 3: Add widget definitions to app.json plugins**

Add to the `plugins` array in `app.json`, after the existing plugins:

```json
["react-native-android-widget", {
  "widgets": [
    {
      "name": "LifeOSSmall",
      "label": "Life OS - Résumé",
      "minWidth": "250dp",
      "minHeight": "50dp",
      "description": "Résumé rapide: habitudes, tâches, sport",
      "updatePeriodMillis": 1800000
    },
    {
      "name": "LifeOSMedium",
      "label": "Life OS - Habitudes",
      "minWidth": "250dp",
      "minHeight": "110dp",
      "description": "Habitudes interactives + stats semaine",
      "updatePeriodMillis": 1800000,
      "resizeMode": "horizontal|vertical"
    },
    {
      "name": "LifeOSLarge",
      "label": "Life OS - Dashboard",
      "minWidth": "250dp",
      "minHeight": "250dp",
      "description": "Dashboard complet: habitudes, tâches, sport, finances, objectifs",
      "updatePeriodMillis": 1800000,
      "resizeMode": "horizontal|vertical"
    }
  ]
}]
```

- [ ] **Step 4: Rebuild native project**

```bash
npx expo prebuild --clean
```

Expected: Android project regenerated with widget config in `AndroidManifest.xml`.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json app.json android/
git commit -m "feat(widget): install react-native-android-widget and configure 3 widget sizes"
```

---

### Task 2: Create shared widget design tokens & data types

**Files:**
- Create: `widgets/shared/widgetStyles.ts`
- Create: `widgets/shared/widgetData.ts`

- [ ] **Step 1: Create widgetStyles.ts with light theme design tokens**

```typescript
// widgets/shared/widgetStyles.ts

/** Light-mode design tokens matching app DA */
export const WidgetColors = {
  surface: "#FFFFFF",
  background: "#F5F3EF",
  border: "#E0DDD7",
  textPrimary: "#1a1608",
  textSecondary: "#6b6560",
  textMuted: "#9a9590",
  goldPrimary: "#D4AA40",
  goldDark: "#B8922E",
  success: "#22c55e",
  successLight: "rgba(34,197,94,0.1)",
  danger: "#ef4444",
} as const;

export const WidgetRadius = {
  card: 14,
  element: 10,
  icon: 8,
} as const;

export const WidgetFontSize = {
  xs: 9,
  sm: 11,
  md: 13,
  lg: 15,
  xl: 18,
} as const;

export const WidgetSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
} as const;
```

- [ ] **Step 2: Create widgetData.ts with SharedPreferences type and helpers**

```typescript
// widgets/shared/widgetData.ts
import SharedGroupPreferences from "react-native-shared-group-preferences";

const WIDGET_KEY = "lifeos_widget_data";
const GROUP_ID = "group.com.zoumoti.lifeos";

export type WidgetHabit = {
  id: string;
  name: string;
  icon: string;
  completed: boolean;
};

export type WidgetTask = {
  id: string;
  title: string;
  completed: boolean;
};

export type WidgetStats = {
  weeklyRunKm: number;
  weeklyWorkoutCount: number;
  todayTaskCount: number;
  monthlyBalance: number;
};

export type WidgetObjective = {
  name: string;
  current: number;
  target: number;
  unit: string;
  deadline: string | null;
};

export type WidgetData = {
  habits: WidgetHabit[];
  tasks: WidgetTask[];
  stats: WidgetStats;
  objective: WidgetObjective | null;
  lastUpdated: string;
};

const DEFAULT_DATA: WidgetData = {
  habits: [],
  tasks: [],
  stats: { weeklyRunKm: 0, weeklyWorkoutCount: 0, todayTaskCount: 0, monthlyBalance: 0 },
  objective: null,
  lastUpdated: new Date().toISOString(),
};

export async function readWidgetData(): Promise<WidgetData> {
  try {
    const raw = await SharedGroupPreferences.getItem(WIDGET_KEY, GROUP_ID);
    if (!raw) return DEFAULT_DATA;
    return JSON.parse(raw) as WidgetData;
  } catch {
    return DEFAULT_DATA;
  }
}

export async function writeWidgetData(data: WidgetData): Promise<void> {
  try {
    await SharedGroupPreferences.setItem(WIDGET_KEY, JSON.stringify(data), GROUP_ID);
  } catch {
    // Silent fail — widget will show stale data
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add widgets/
git commit -m "feat(widget): add shared design tokens and SharedPreferences data layer"
```

---

### Task 3: Create app-side sync (stores → SharedPreferences)

**Files:**
- Create: `widgets/shared/widgetSync.ts`

- [ ] **Step 1: Create widgetSync.ts — aggregates all stores into widget data**

This function reads from all Zustand stores, computes the widget snapshot, and writes to SharedPreferences. It also requests a widget update.

```typescript
// widgets/shared/widgetSync.ts
import { requestWidgetUpdate } from "react-native-android-widget";
import { Platform } from "react-native";
import { useHabitStore } from "../../stores/habitStore";
import { useTaskStore } from "../../stores/taskStore";
import { useRunningStore } from "../../stores/runningStore";
import { useWorkoutStore } from "../../stores/workoutStore";
import { useFinanceStore } from "../../stores/financeStore";
import { useObjectiveStore } from "../../stores/objectiveStore";
import { isHabitScheduledForDate } from "../../lib/habitUtils";
import { toDateString } from "../../lib/dateUtils";
import { writeWidgetData, type WidgetData } from "./widgetData";

function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return toDateString(monday);
}

export async function syncWidgetData(): Promise<void> {
  if (Platform.OS !== "android") return;

  const today = toDateString();
  const weekStart = getWeekStart();

  // Read from stores
  const habitState = useHabitStore.getState();
  const taskState = useTaskStore.getState();
  const runningState = useRunningStore.getState();
  const workoutState = useWorkoutStore.getState();
  const financeState = useFinanceStore.getState();
  const objectiveState = useObjectiveStore.getState();

  // Habits: only today's scheduled habits
  const todayHabits = habitState.habits.filter((h) =>
    isHabitScheduledForDate(h, today)
  );
  const habits = todayHabits.map((h) => ({
    id: h.id,
    name: h.name,
    icon: h.icon || "⭐",
    completed: !!habitState.completions[`${h.id}:${today}`],
  }));

  // Tasks: today's tasks (due today or no due date), not completed
  const todayTasks = taskState.tasks.filter(
    (t) => t.due_date === today || (!t.due_date && !t.completed)
  );
  const tasks = todayTasks.slice(0, 5).map((t) => ({
    id: t.id,
    title: t.title,
    completed: t.completed,
  }));

  // Running: weekly distance
  const weeklyRuns = runningState.runs.filter((r) => r.date >= weekStart);
  const weeklyRunKm = Math.round(
    weeklyRuns.reduce((sum, r) => sum + r.distance_km, 0) * 10
  ) / 10;

  // Workouts: weekly count
  const weeklySessions = workoutState.sessions.filter(
    (s) => s.started_at.slice(0, 10) >= weekStart
  );
  const weeklyWorkoutCount = weeklySessions.length;

  // Tasks: today count (incomplete)
  const todayTaskCount = todayTasks.filter((t) => !t.completed).length;

  // Finance: total balance across all accounts
  const monthlyBalance = financeState.accounts.reduce(
    (sum, a) => sum + (a.balance || 0),
    0
  );

  // Objective: nearest deadline or first active
  const activeObjectives = objectiveState.objectives.filter((o) => o.is_active);
  const withDeadline = activeObjectives
    .filter((o) => o.updated_at)
    .sort((a, b) => (a.updated_at > b.updated_at ? 1 : -1));
  const topObjective = withDeadline[0] || activeObjectives[0] || null;

  const objective = topObjective
    ? {
        name: topObjective.name,
        current: topObjective.current_value,
        target: topObjective.target_value,
        unit: topObjective.unit || "",
        deadline: null,
      }
    : null;

  const data: WidgetData = {
    habits,
    tasks,
    stats: { weeklyRunKm, weeklyWorkoutCount, todayTaskCount, monthlyBalance },
    objective,
    lastUpdated: new Date().toISOString(),
  };

  await writeWidgetData(data);

  // Request all widgets to update
  try {
    await requestWidgetUpdate({ widgetName: "LifeOSSmall" });
    await requestWidgetUpdate({ widgetName: "LifeOSMedium" });
    await requestWidgetUpdate({ widgetName: "LifeOSLarge" });
  } catch {
    // Widget may not be placed — ignore
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add widgets/shared/widgetSync.ts
git commit -m "feat(widget): add app-side sync from Zustand stores to SharedPreferences"
```

---

### Task 4: Build the Small Widget (4×1)

**Files:**
- Create: `widgets/SmallWidget.tsx`

- [ ] **Step 1: Create SmallWidget.tsx**

```tsx
// widgets/SmallWidget.tsx
import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";
import { WidgetColors, WidgetRadius, WidgetFontSize, WidgetSpacing } from "./shared/widgetStyles";
import type { WidgetData } from "./shared/widgetData";

type Props = { data: WidgetData };

export function SmallWidget({ data }: Props) {
  const completedCount = data.habits.filter((h) => h.completed).length;
  const totalCount = data.habits.length;

  return (
    <FlexWidget
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: WidgetColors.surface,
        borderRadius: WidgetRadius.card,
        paddingHorizontal: WidgetSpacing.lg,
        paddingVertical: WidgetSpacing.md,
        height: "match_parent",
        width: "match_parent",
      }}
      clickAction="OPEN_APP"
    >
      {/* Logo + Title */}
      <FlexWidget style={{ flexDirection: "row", alignItems: "center" }}>
        <FlexWidget
          style={{
            width: 28,
            height: 28,
            borderRadius: WidgetRadius.icon,
            backgroundColor: WidgetColors.goldPrimary,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TextWidget text="🎯" style={{ fontSize: 14 }} />
        </FlexWidget>
        <TextWidget
          text="Life OS"
          style={{
            fontSize: WidgetFontSize.md,
            color: WidgetColors.textPrimary,
            marginLeft: WidgetSpacing.sm,
          }}
        />
      </FlexWidget>

      {/* Stats */}
      <FlexWidget style={{ flexDirection: "row", alignItems: "center" }}>
        {/* Habits */}
        <FlexWidget style={{ alignItems: "center" }}>
          <TextWidget
            text={`${completedCount}/${totalCount}`}
            style={{ fontSize: WidgetFontSize.lg, color: WidgetColors.goldPrimary }}
          />
          <TextWidget
            text="Habitudes"
            style={{ fontSize: WidgetFontSize.xs, color: WidgetColors.textSecondary }}
          />
        </FlexWidget>

        {/* Divider */}
        <FlexWidget
          style={{
            width: 1,
            height: 24,
            backgroundColor: WidgetColors.border,
            marginHorizontal: WidgetSpacing.md,
          }}
        />

        {/* Tasks */}
        <FlexWidget style={{ alignItems: "center" }}>
          <TextWidget
            text={`${data.stats.todayTaskCount}`}
            style={{ fontSize: WidgetFontSize.lg, color: WidgetColors.textPrimary }}
          />
          <TextWidget
            text="Tâches"
            style={{ fontSize: WidgetFontSize.xs, color: WidgetColors.textSecondary }}
          />
        </FlexWidget>

        {/* Divider */}
        <FlexWidget
          style={{
            width: 1,
            height: 24,
            backgroundColor: WidgetColors.border,
            marginHorizontal: WidgetSpacing.md,
          }}
        />

        {/* Running */}
        <FlexWidget style={{ alignItems: "center" }}>
          <TextWidget
            text={`${data.stats.weeklyRunKm}km`}
            style={{ fontSize: WidgetFontSize.lg, color: WidgetColors.textPrimary }}
          />
          <TextWidget
            text="Semaine"
            style={{ fontSize: WidgetFontSize.xs, color: WidgetColors.textSecondary }}
          />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add widgets/SmallWidget.tsx
git commit -m "feat(widget): add SmallWidget (4x1) read-only summary"
```

---

### Task 5: Build the Medium Widget (4×2)

**Files:**
- Create: `widgets/MediumWidget.tsx`

- [ ] **Step 1: Create MediumWidget.tsx with interactive habit grid**

```tsx
// widgets/MediumWidget.tsx
import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";
import { WidgetColors, WidgetRadius, WidgetFontSize, WidgetSpacing } from "./shared/widgetStyles";
import type { WidgetData } from "./shared/widgetData";

type Props = { data: WidgetData };

function HabitIcon({ habit }: { habit: { id: string; icon: string; completed: boolean } }) {
  return (
    <FlexWidget
      style={{
        width: 38,
        height: 38,
        borderRadius: WidgetRadius.element,
        backgroundColor: habit.completed ? WidgetColors.successLight : WidgetColors.background,
        borderWidth: 2,
        borderColor: habit.completed ? WidgetColors.success : WidgetColors.border,
        justifyContent: "center",
        alignItems: "center",
      }}
      clickAction="TOGGLE_HABIT"
      clickActionData={{ habitId: habit.id }}
    >
      <TextWidget
        text={habit.completed ? "✅" : habit.icon}
        style={{ fontSize: 15 }}
      />
    </FlexWidget>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <FlexWidget
      style={{
        flex: 1,
        backgroundColor: WidgetColors.background,
        borderRadius: WidgetRadius.element,
        paddingVertical: WidgetSpacing.sm,
        alignItems: "center",
      }}
    >
      <TextWidget
        text={value}
        style={{ fontSize: WidgetFontSize.lg, color: WidgetColors.textPrimary }}
      />
      <TextWidget
        text={label}
        style={{ fontSize: WidgetFontSize.xs, color: WidgetColors.textSecondary }}
      />
    </FlexWidget>
  );
}

export function MediumWidget({ data }: Props) {
  const completedCount = data.habits.filter((h) => h.completed).length;
  const totalCount = data.habits.length;

  return (
    <FlexWidget
      style={{
        flexDirection: "column",
        backgroundColor: WidgetColors.surface,
        borderRadius: WidgetRadius.card,
        padding: WidgetSpacing.lg,
        height: "match_parent",
        width: "match_parent",
      }}
    >
      {/* Header */}
      <FlexWidget
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: WidgetSpacing.md,
        }}
        clickAction="OPEN_APP"
      >
        <FlexWidget style={{ flexDirection: "row", alignItems: "center" }}>
          <FlexWidget
            style={{
              width: 24,
              height: 24,
              borderRadius: 7,
              backgroundColor: WidgetColors.goldPrimary,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TextWidget text="🎯" style={{ fontSize: 12 }} />
          </FlexWidget>
          <TextWidget
            text="Life OS"
            style={{
              fontSize: WidgetFontSize.lg,
              color: WidgetColors.textPrimary,
              marginLeft: WidgetSpacing.sm,
            }}
          />
        </FlexWidget>
        <TextWidget
          text={`${completedCount}/${totalCount}`}
          style={{ fontSize: WidgetFontSize.sm, color: WidgetColors.goldPrimary }}
        />
      </FlexWidget>

      {/* Habits grid */}
      <FlexWidget
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          marginBottom: WidgetSpacing.md,
        }}
      >
        {data.habits.map((habit) => (
          <FlexWidget key={habit.id} style={{ marginRight: WidgetSpacing.sm, marginBottom: WidgetSpacing.xs }}>
            <HabitIcon habit={habit} />
          </FlexWidget>
        ))}
      </FlexWidget>

      {/* Stats row */}
      <FlexWidget style={{ flexDirection: "row", gap: WidgetSpacing.sm }}>
        <StatCard value={`${data.stats.weeklyRunKm}km`} label="COURSE" />
        <StatCard value={`${data.stats.weeklyWorkoutCount}`} label="SÉANCES" />
        <StatCard value={`${data.stats.todayTaskCount}`} label="TÂCHES" />
      </FlexWidget>
    </FlexWidget>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add widgets/MediumWidget.tsx
git commit -m "feat(widget): add MediumWidget (4x2) with interactive habits and stats"
```

---

### Task 6: Build the Large Widget (4×4)

**Files:**
- Create: `widgets/LargeWidget.tsx`

- [ ] **Step 1: Create LargeWidget.tsx with full dashboard**

```tsx
// widgets/LargeWidget.tsx
import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";
import { WidgetColors, WidgetRadius, WidgetFontSize, WidgetSpacing } from "./shared/widgetStyles";
import type { WidgetData } from "./shared/widgetData";

type Props = { data: WidgetData };

function HabitIcon({ habit }: { habit: { id: string; icon: string; completed: boolean } }) {
  return (
    <FlexWidget
      style={{
        width: 38,
        height: 38,
        borderRadius: WidgetRadius.element,
        backgroundColor: habit.completed ? WidgetColors.successLight : WidgetColors.background,
        borderWidth: 2,
        borderColor: habit.completed ? WidgetColors.success : WidgetColors.border,
        justifyContent: "center",
        alignItems: "center",
      }}
      clickAction="TOGGLE_HABIT"
      clickActionData={{ habitId: habit.id }}
    >
      <TextWidget
        text={habit.completed ? "✅" : habit.icon}
        style={{ fontSize: 15 }}
      />
    </FlexWidget>
  );
}

function TaskRow({ task }: { task: { title: string; completed: boolean } }) {
  return (
    <FlexWidget
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: WidgetColors.background,
        borderRadius: WidgetRadius.icon,
        paddingHorizontal: WidgetSpacing.md,
        paddingVertical: 6,
        marginBottom: WidgetSpacing.xs,
      }}
    >
      <FlexWidget
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          backgroundColor: task.completed ? WidgetColors.success : "transparent",
          borderWidth: task.completed ? 0 : 2,
          borderColor: WidgetColors.border,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {task.completed && (
          <TextWidget text="✓" style={{ fontSize: 10, color: "#FFFFFF" }} />
        )}
      </FlexWidget>
      <TextWidget
        text={task.title}
        style={{
          fontSize: 12,
          color: task.completed ? WidgetColors.textMuted : WidgetColors.textPrimary,
          marginLeft: WidgetSpacing.sm,
          textDecorationLine: task.completed ? "line-through" : "none",
        }}
        truncate="END"
        maxLines={1}
      />
    </FlexWidget>
  );
}

function StatCard({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <FlexWidget
      style={{
        flex: 1,
        backgroundColor: WidgetColors.background,
        borderRadius: WidgetRadius.element,
        paddingVertical: WidgetSpacing.sm,
        alignItems: "center",
      }}
    >
      <TextWidget
        text={value}
        style={{ fontSize: 16, color: color || WidgetColors.textPrimary }}
      />
      <TextWidget
        text={label}
        style={{ fontSize: WidgetFontSize.xs, color: WidgetColors.textSecondary }}
      />
    </FlexWidget>
  );
}

export function LargeWidget({ data }: Props) {
  const completedCount = data.habits.filter((h) => h.completed).length;
  const totalCount = data.habits.length;
  const today = new Date();
  const dayNames = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
  const monthNames = ["janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
  const dateLabel = `${dayNames[today.getDay()]} ${today.getDate()} ${monthNames[today.getMonth()]}`;

  const displayedTasks = data.tasks.slice(0, 3);
  const extraTasks = data.tasks.length - 3;

  const balanceStr = data.stats.monthlyBalance >= 0
    ? `${Math.round(data.stats.monthlyBalance)}€`
    : `${Math.round(data.stats.monthlyBalance)}€`;
  const balanceColor = data.stats.monthlyBalance >= 0
    ? WidgetColors.success
    : WidgetColors.danger;

  const progressPercent = data.objective
    ? Math.min(100, Math.round((data.objective.current / data.objective.target) * 100))
    : 0;

  return (
    <FlexWidget
      style={{
        flexDirection: "column",
        backgroundColor: WidgetColors.surface,
        borderRadius: WidgetRadius.card,
        padding: WidgetSpacing.lg,
        height: "match_parent",
        width: "match_parent",
      }}
    >
      {/* Header */}
      <FlexWidget
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: WidgetSpacing.md,
        }}
        clickAction="OPEN_APP"
      >
        <FlexWidget style={{ flexDirection: "row", alignItems: "center" }}>
          <FlexWidget
            style={{
              width: 24,
              height: 24,
              borderRadius: 7,
              backgroundColor: WidgetColors.goldPrimary,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TextWidget text="🎯" style={{ fontSize: 12 }} />
          </FlexWidget>
          <TextWidget
            text="Life OS"
            style={{
              fontSize: WidgetFontSize.lg,
              color: WidgetColors.textPrimary,
              marginLeft: WidgetSpacing.sm,
            }}
          />
        </FlexWidget>
        <TextWidget
          text={dateLabel}
          style={{ fontSize: WidgetFontSize.sm, color: WidgetColors.textSecondary }}
        />
      </FlexWidget>

      {/* Habits section */}
      <FlexWidget style={{ marginBottom: WidgetSpacing.md }}>
        <TextWidget
          text={`HABITUDES — ${completedCount}/${totalCount}`}
          style={{
            fontSize: 10,
            color: WidgetColors.goldPrimary,
            marginBottom: 6,
            letterSpacing: 1,
          }}
        />
        <FlexWidget style={{ flexDirection: "row", flexWrap: "wrap" }}>
          {data.habits.map((habit) => (
            <FlexWidget key={habit.id} style={{ marginRight: 7, marginBottom: WidgetSpacing.xs }}>
              <HabitIcon habit={habit} />
            </FlexWidget>
          ))}
        </FlexWidget>
      </FlexWidget>

      {/* Tasks section */}
      <FlexWidget
        style={{ marginBottom: WidgetSpacing.md }}
        clickAction="OPEN_APP"
        clickActionData={{ tab: "tasks" }}
      >
        <TextWidget
          text="TÂCHES DU JOUR"
          style={{
            fontSize: 10,
            color: WidgetColors.goldDark,
            marginBottom: 6,
            letterSpacing: 1,
          }}
        />
        {displayedTasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
        {extraTasks > 0 && (
          <TextWidget
            text={`+${extraTasks} de plus`}
            style={{
              fontSize: WidgetFontSize.xs,
              color: WidgetColors.textMuted,
              marginTop: WidgetSpacing.xs,
            }}
          />
        )}
      </FlexWidget>

      {/* Stats row */}
      <FlexWidget
        style={{
          flexDirection: "row",
          gap: WidgetSpacing.sm,
          marginBottom: WidgetSpacing.md,
        }}
      >
        <StatCard value={`${data.stats.weeklyRunKm}km`} label="COURSE" />
        <StatCard value={`${data.stats.weeklyWorkoutCount}`} label="SÉANCES" />
        <StatCard value={balanceStr} label="BALANCE" color={balanceColor} />
      </FlexWidget>

      {/* Objective card */}
      {data.objective && (
        <FlexWidget
          style={{
            backgroundColor: "rgba(212, 170, 64, 0.08)",
            borderRadius: WidgetRadius.element,
            padding: WidgetSpacing.md,
            borderLeftWidth: 3,
            borderLeftColor: WidgetColors.goldPrimary,
          }}
          clickAction="OPEN_APP"
          clickActionData={{ tab: "objectives" }}
        >
          <TextWidget
            text={`Objectif : ${data.objective.name}`}
            style={{
              fontSize: WidgetFontSize.sm,
              color: WidgetColors.goldDark,
              marginBottom: 5,
            }}
          />
          {/* Progress bar */}
          <FlexWidget
            style={{
              height: 6,
              backgroundColor: "#EBE8E2",
              borderRadius: 4,
              width: "match_parent",
            }}
          >
            <FlexWidget
              style={{
                height: 6,
                backgroundColor: WidgetColors.goldPrimary,
                borderRadius: 4,
                width: `${progressPercent}%` as any,
              }}
            />
          </FlexWidget>
          <TextWidget
            text={`${data.objective.current} / ${data.objective.target} ${data.objective.unit} — ${progressPercent}%`}
            style={{
              fontSize: WidgetFontSize.xs,
              color: WidgetColors.textSecondary,
              marginTop: WidgetSpacing.xs,
            }}
          />
        </FlexWidget>
      )}
    </FlexWidget>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add widgets/LargeWidget.tsx
git commit -m "feat(widget): add LargeWidget (4x4) full dashboard with habits, tasks, stats, objective"
```

---

### Task 7: Create the Widget Task Handler (click actions + Supabase sync)

**Files:**
- Create: `widgets/WidgetTaskHandler.ts`

- [ ] **Step 1: Create WidgetTaskHandler.ts**

This handles widget rendering and click actions. When a habit is tapped, it updates SharedPreferences, refreshes the widget, and syncs to Supabase.

```typescript
// widgets/WidgetTaskHandler.ts
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { readWidgetData, writeWidgetData } from "./shared/widgetData";
import { SmallWidget } from "./SmallWidget";
import { MediumWidget } from "./MediumWidget";
import { LargeWidget } from "./LargeWidget";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SUPABASE_URL = "https://tzyzaygqvxkazdgeyvha.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR6eXpheWdxdnhrYXpkZ2V5dmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMDMxMzEsImV4cCI6MjA5MTY3OTEzMX0.KsfJOK_803UP_orXzBvWSIk95rsFs9AQtvFRQigvvoA";

function getToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

async function toggleHabitInSupabase(habitId: string, completed: boolean): Promise<void> {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const today = getToday();

    if (completed) {
      // Was completed → now uncomplete: delete the record
      await supabase
        .from("habit_completions")
        .delete()
        .eq("habit_id", habitId)
        .eq("completed_date", today)
        .eq("user_id", user.id);
    } else {
      // Was not completed → now complete: insert record
      await supabase
        .from("habit_completions")
        .insert({ habit_id: habitId, user_id: user.id, completed_date: today });
    }
  } catch {
    // Background sync failed — app will reconcile on next open
  }
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo;
  const data = await readWidgetData();

  // Handle click actions
  if (props.widgetAction === "WIDGET_CLICK") {
    if (props.clickAction === "TOGGLE_HABIT" && props.clickActionData?.habitId) {
      const habitId = props.clickActionData.habitId as string;
      const habit = data.habits.find((h) => h.id === habitId);
      if (habit) {
        const wasCompleted = habit.completed;
        // Update SharedPreferences
        habit.completed = !wasCompleted;
        data.lastUpdated = new Date().toISOString();
        await writeWidgetData(data);
        // Background Supabase sync
        toggleHabitInSupabase(habitId, wasCompleted);
      }
    }

    if (props.clickAction === "OPEN_APP") {
      // Default behavior — app opens automatically
      return;
    }
  }

  // Render the appropriate widget
  switch (widgetInfo.widgetName) {
    case "LifeOSSmall":
      return <SmallWidget data={data} />;
    case "LifeOSMedium":
      return <MediumWidget data={data} />;
    case "LifeOSLarge":
      return <LargeWidget data={data} />;
    default:
      return <SmallWidget data={data} />;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add widgets/WidgetTaskHandler.ts
git commit -m "feat(widget): add WidgetTaskHandler with habit toggle and Supabase sync"
```

---

### Task 8: Register widget handler & wire sync into app lifecycle

**Files:**
- Modify: `app/_layout.tsx`
- Modify: `stores/habitStore.ts`
- Modify: `stores/taskStore.ts`

- [ ] **Step 1: Register the widget task handler in app/_layout.tsx**

At the top of the file, add the import and registration:

```typescript
import { registerWidgetTaskHandler } from "react-native-android-widget";
import { widgetTaskHandler } from "../widgets/WidgetTaskHandler";

registerWidgetTaskHandler(widgetTaskHandler);
```

This must be called at module level (outside any component), before the app renders.

- [ ] **Step 2: Add widget sync on app launch in _layout.tsx**

Inside the root layout component, in the existing `useEffect` that runs on app start (after auth init), add:

```typescript
import { syncWidgetData } from "../widgets/shared/widgetSync";
import { Platform } from "react-native";

// Inside the useEffect after auth is loaded:
if (Platform.OS === "android" && session) {
  syncWidgetData();
}
```

- [ ] **Step 3: Add widget sync to habitStore.ts after toggleCompletion**

In `stores/habitStore.ts`, inside the `toggleCompletion` method, after the optimistic update (after `set({ completions: newCompletions })`), add:

```typescript
import { syncWidgetData } from "../widgets/shared/widgetSync";
import { Platform } from "react-native";

// After set({ completions: newCompletions }):
if (Platform.OS === "android") {
  syncWidgetData();
}
```

- [ ] **Step 4: Add widget sync to taskStore.ts after task mutations**

In `stores/taskStore.ts`, add widget sync calls after `toggleComplete`, `addTask`, and `deleteTask`:

```typescript
import { syncWidgetData } from "../widgets/shared/widgetSync";
import { Platform } from "react-native";

// After each mutation's set() call:
if (Platform.OS === "android") {
  syncWidgetData();
}
```

- [ ] **Step 5: Commit**

```bash
git add app/_layout.tsx stores/habitStore.ts stores/taskStore.ts
git commit -m "feat(widget): register handler and wire sync into app lifecycle and store mutations"
```

---

### Task 9: Build, test on device, and fix issues

**Files:**
- No new files — testing and iteration

- [ ] **Step 1: Rebuild the Android project**

```bash
cd life-tracker
npx expo prebuild --clean
npx expo run:android
```

Expected: App builds and runs on device/emulator.

- [ ] **Step 2: Add the widget to home screen**

Long press home screen → Widgets → Find "Life OS" → Add each size (Small, Medium, Large).

Verify:
- Small shows habit count, task count, weekly km
- Medium shows habit icons + stats
- Large shows full dashboard with habits, tasks, stats, objective

- [ ] **Step 3: Test habit toggle from Medium/Large widget**

Tap an uncompleted habit icon on the widget.

Verify:
- Icon changes to completed state (green border + ✅)
- Widget refreshes immediately
- Open the app → habit should also show as completed
- Check Supabase dashboard → `habit_completions` table should have the new row

- [ ] **Step 4: Test data sync from app → widget**

Complete a habit in the app, then check the widget.

Verify:
- Widget updates to reflect the change (may need to wait for refresh or switch back to home screen)

- [ ] **Step 5: Fix any issues found during testing**

Common issues to watch for:
- SharedPreferences group ID mismatch
- Widget not rendering (check `widgetTaskHandler` return type)
- Emoji rendering on older Android versions
- Progress bar width calculation in LargeWidget

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat(widget): tested and fixed widget rendering and interactions"
```
