# Life OS Batch Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 5 improvements: workout notification, habit CRUD, running CRUD, app rename, and task date/time pickers.

**Architecture:** Each feature is independent and can be implemented in any order. We follow the existing Expo Router + Zustand + Supabase + NativeWind patterns. No tests exist in this codebase — we skip TDD and verify manually.

**Tech Stack:** Expo 54, React Native 0.81, Zustand, Supabase, NativeWind, expo-notifications, @react-native-community/datetimepicker

---

## Task 1: Rename app to "Life OS"

**Files:**
- Modify: `app.json`
- Modify: `package.json`
- Modify: `lib/constants.ts`

- [ ] **Step 1: Update app.json**

```json
{
  "expo": {
    "name": "Life OS",
    "slug": "life-os",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "lifeos",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "package": "com.zoumoti.lifeos",
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#121210"
      },
      "edgeToEdgeEnabled": true,
      "predictiveBackGestureEnabled": false
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.1063289815690-6eggvslg2kn9buvbqa3fc95io2qmn0gp"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {},
      "eas": {
        "projectId": "e4309b31-7478-4b81-b005-2af4bc5d8344"
      }
    },
    "owner": "benjamin.coudrais"
  }
}
```

- [ ] **Step 2: Update package.json name**

Change `"name": "life-tracker"` to `"name": "life-os"` in `package.json`.

- [ ] **Step 3: Update constants.ts**

In `lib/constants.ts`, change line 1:

```typescript
export const APP_NAME = "Life OS";
```

- [ ] **Step 4: Commit**

```bash
git add app.json package.json lib/constants.ts
git commit -m "feat: rename app from Life Tracker to Life OS"
```

---

## Task 2: Edit and delete habits from detail page

**Files:**
- Create: `app/habit/edit.tsx`
- Modify: `app/habit/[id].tsx`
- Modify: `app/_layout.tsx`

- [ ] **Step 1: Register the new edit screen in root layout**

In `app/_layout.tsx`, add a `Stack.Screen` for the edit route inside the `<Stack>` component, after the `habit/[id]` screen:

```tsx
<Stack.Screen
  name="habit/edit"
  options={{ headerShown: true }}
/>
```

- [ ] **Step 2: Create habit edit screen**

Create `app/habit/edit.tsx`:

```tsx
import { useState } from "react";
import { View, Text } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { SafeScreen } from "../../components/SafeScreen";
import { HabitForm, type HabitFormData } from "../../components/habits/HabitForm";
import { useHabitStore } from "../../stores/habitStore";
import { useColors } from "../../lib/theme";

export default function HabitEditScreen() {
  const c = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { habits, updateHabit } = useHabitStore();
  const [loading, setLoading] = useState(false);

  const habit = habits.find((h) => h.id === id);

  const handleSubmit = async (data: HabitFormData) => {
    if (!id) return;
    setLoading(true);
    await updateHabit(id, data);
    setLoading(false);
    router.back();
  };

  if (!habit) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: c.background }}>
        <Text style={{ color: c.textSecondary }}>Habitude introuvable</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Modifier l'habitude",
          headerStyle: { backgroundColor: c.background },
          headerTintColor: c.text,
          headerShadowVisible: false,
        }}
      />
      <View className="flex-1 px-4 pt-4" style={{ backgroundColor: c.background }}>
        <HabitForm
          initial={habit}
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          loading={loading}
        />
      </View>
    </>
  );
}
```

- [ ] **Step 3: Update habit detail page with menu**

Replace the entire `app/habit/[id].tsx` with the version below. Changes from original:
- Added `showMenu` state and a dropdown menu (Modifier / Supprimer) triggered by `more-vertical` icon in `headerRight`
- Removed the standalone delete button at the bottom of the ScrollView
- Added navigation to `habit/edit` screen

```tsx
import { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Card } from "../../components/ui/Card";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { HabitStats } from "../../components/habits/HabitStats";
import { StreakChart } from "../../components/habits/StreakChart";
import { MonthView } from "../../components/habits/MonthView";
import { useHabitStore } from "../../stores/habitStore";
import { toDateString, addDays, MONTH_LABELS } from "../../lib/dateUtils";
import { calculateStreak, habitStats } from "../../lib/habitUtils";
import { useColors } from "../../lib/theme";

export default function HabitDetailScreen() {
  const c = useColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { habits, completions, deleteHabit, getCompletedDatesForHabit, fetchCompletions } =
    useHabitStore();
  const [showDelete, setShowDelete] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [monthYear, setMonthYear] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const habit = habits.find((h) => h.id === id);
  const today = toDateString();

  useEffect(() => {
    if (id) {
      fetchCompletions(addDays(today, -365), today);
    }
  }, [id]);

  const completedDates = useMemo(
    () => (id ? getCompletedDatesForHabit(id) : new Set<string>()),
    [id, completions]
  );

  const streak = useMemo(
    () => (habit ? calculateStreak(habit, completedDates, today) : { current: 0, best: 0, warning: false }),
    [habit, completedDates, today]
  );

  const stats = useMemo(
    () =>
      habit
        ? habitStats(habit, completedDates, today)
        : { completionRate30: 0, bestDay: 0, worstDay: 0 },
    [habit, completedDates, today]
  );

  const handleDelete = async () => {
    if (id) {
      await deleteHabit(id);
      router.back();
    }
  };

  const handleChangeMonth = (delta: number) => {
    setMonthYear((prev) => {
      let m = prev.month + delta;
      let y = prev.year;
      if (m < 0) { m = 11; y--; }
      if (m > 11) { m = 0; y++; }
      return { year: y, month: m };
    });
  };

  if (!habit) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: c.background }}>
        <Text style={{ color: c.textSecondary }}>Habitude introuvable</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: habit.name,
          headerStyle: { backgroundColor: c.background },
          headerTintColor: c.text,
          headerShadowVisible: false,
          headerRight: () => (
            <Pressable onPress={() => setShowMenu((v) => !v)} className="p-2">
              <Feather name="more-vertical" size={22} color={c.text} />
            </Pressable>
          ),
        }}
      />
      <ScrollView className="flex-1 px-4 pt-4" style={{ backgroundColor: c.background }}>
        {/* Dropdown menu */}
        {showMenu && (
          <View
            className="absolute right-4 top-0 z-50 rounded-xl py-2 px-1"
            style={{ backgroundColor: c.surface, elevation: 8 }}
          >
            <Pressable
              onPress={() => {
                setShowMenu(false);
                router.push({ pathname: "/habit/edit", params: { id } });
              }}
              className="flex-row items-center px-4 py-3"
            >
              <Feather name="edit-2" size={16} color={c.text} />
              <Text className="ml-3 text-sm" style={{ color: c.text }}>Modifier</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setShowMenu(false);
                setShowDelete(true);
              }}
              className="flex-row items-center px-4 py-3"
            >
              <Feather name="trash-2" size={16} color={c.danger} />
              <Text className="ml-3 text-sm" style={{ color: c.danger }}>Supprimer</Text>
            </Pressable>
          </View>
        )}

        {/* Header */}
        <View className="flex-row items-center mb-6">
          <View
            className="w-12 h-12 rounded-xl items-center justify-center mr-4"
            style={{ backgroundColor: (habit.color || c.primary) + "20" }}
          >
            <Feather
              name={(habit.icon as any) || "circle"}
              size={24}
              color={habit.color || c.primary}
            />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <Text className="text-xl font-bold" style={{ color: c.text }}>{habit.name}</Text>
              {habit.habit_type === "avoid" && (
                <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: c.surfaceLight }}>
                  <Text className="text-xs" style={{ color: c.textSecondary }}>Eviter</Text>
                </View>
              )}
            </View>
            {streak.warning && (
              <View className="flex-row items-center mt-1">
                <Feather name="alert-triangle" size={14} color={c.warning} />
                <Text className="text-xs ml-1" style={{ color: c.warning }}>
                  {habit.habit_type === "avoid"
                    ? "Attention ! Un ecart de plus et le compteur tombe"
                    : "Attention ! Un jour de plus et le streak tombe"}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Stats */}
        <HabitStats
          currentStreak={streak.current}
          bestStreak={streak.best}
          completionRate={stats.completionRate30}
          bestDay={stats.bestDay}
          worstDay={stats.worstDay}
          isAvoid={habit.habit_type === "avoid"}
        />

        {/* Streak Chart */}
        <Card className="mt-4">
          <StreakChart habit={habit} completedDates={completedDates} days={30} />
        </Card>

        {/* Calendar History */}
        <Card className="mt-4 mb-8">
          <Text className="font-bold text-base mb-3" style={{ color: c.text }}>Historique</Text>
          <MonthView
            habits={[habit]}
            completions={completions}
            year={monthYear.year}
            month={monthYear.month}
            onChangeMonth={handleChangeMonth}
          />
        </Card>
      </ScrollView>

      <ConfirmModal
        visible={showDelete}
        title="Supprimer l'habitude"
        message={`Es-tu sur de vouloir supprimer "${habit.name}" ? L'historique sera perdu.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/habit/edit.tsx app/habit/[id].tsx app/_layout.tsx
git commit -m "feat: add edit and delete habits from detail page"
```

---

## Task 3: Edit and delete running sessions

**Files:**
- Create: `app/(tabs)/sport/run-detail.tsx`
- Modify: `stores/runningStore.ts`
- Modify: `app/(tabs)/sport/running.tsx`
- Modify: `app/(tabs)/sport/add-run.tsx`

- [ ] **Step 1: Add updateRun to runningStore**

In `stores/runningStore.ts`, add the `updateRun` method to the store type and implementation. 

Add to the `RunningState` type (after `deleteRun`):

```typescript
updateRun: (id: string, data: Partial<Omit<InsertTables<"running_logs">, "user_id">>) => Promise<{ error: string | null }>;
```

Add the implementation in the store (after the `deleteRun` method):

```typescript
updateRun: async (id, data) => {
  // Recalculate pace if distance or duration changed
  const run = get().runs.find((r) => r.id === id);
  if (!run) return { error: "Course introuvable" };

  const distance = data.distance_km ?? run.distance_km;
  const duration = data.duration_minutes ?? run.duration_minutes;
  const pacePerKm = distance > 0 ? duration / distance : null;

  const { error } = await supabase
    .from("running_logs")
    .update({ ...data, pace_per_km: pacePerKm })
    .eq("id", id);

  if (!error) {
    // Update linked objective if applicable
    const linkedId = data.linked_objective_id ?? run.linked_objective_id;
    if (linkedId && pacePerKm) {
      await supabase
        .from("objectives")
        .update({ current_value: pacePerKm })
        .eq("id", linkedId);
    }
    await get().fetchRuns();
  }
  return { error: error?.message ?? null };
},
```

- [ ] **Step 2: Create run detail screen**

Create `app/(tabs)/sport/run-detail.tsx`:

```tsx
import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { SafeScreen } from "../../../components/SafeScreen";
import { Card } from "../../../components/ui/Card";
import { ConfirmModal } from "../../../components/ui/ConfirmModal";
import { useRunningStore } from "../../../stores/runningStore";
import { formatDateLong, formatPace } from "../../../lib/formatters";
import { RUNNING_TYPE_LABELS } from "../../../lib/constants";
import { useColors } from "../../../lib/theme";
import type { RunningType } from "../../../lib/constants";

export default function RunDetailScreen() {
  const c = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { runs, deleteRun } = useRunningStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const run = runs.find((r) => r.id === id);

  const handleDelete = async () => {
    if (!id) return;
    await deleteRun(id);
    router.back();
  };

  if (!run) {
    return (
      <SafeScreen>
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: c.textSecondary }}>Course introuvable</Text>
          <Pressable onPress={() => router.back()} className="mt-4">
            <Text style={{ color: c.primary }} className="font-semibold">Retour</Text>
          </Pressable>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={c.text} />
        </Pressable>
        <Text style={{ color: c.text }} className="text-xl font-bold">Detail course</Text>
        <Pressable onPress={() => setShowMenu((v) => !v)} className="p-2">
          <Feather name="more-vertical" size={22} color={c.text} />
        </Pressable>
      </View>

      {/* Dropdown menu */}
      {showMenu && (
        <View
          className="absolute right-4 top-14 z-50 rounded-xl py-2 px-1"
          style={{ backgroundColor: c.surface, elevation: 8 }}
        >
          <Pressable
            onPress={() => {
              setShowMenu(false);
              router.push({ pathname: "/(tabs)/sport/add-run", params: { editId: run.id } } as any);
            }}
            className="flex-row items-center px-4 py-3"
          >
            <Feather name="edit-2" size={16} color={c.text} />
            <Text className="ml-3 text-sm" style={{ color: c.text }}>Modifier</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setShowMenu(false);
              setShowDelete(true);
            }}
            className="flex-row items-center px-4 py-3"
          >
            <Feather name="trash-2" size={16} color={c.danger} />
            <Text className="ml-3 text-sm" style={{ color: c.danger }}>Supprimer</Text>
          </Pressable>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Date */}
        <Text className="text-lg font-bold mb-4" style={{ color: c.text }}>
          {formatDateLong(run.date)}
        </Text>

        {/* Main stats */}
        <View style={{ backgroundColor: c.surface }} className="flex-row justify-around mb-4 rounded-card py-4">
          <View className="items-center">
            <Text style={{ color: c.primary }} className="font-bold text-2xl">
              {run.distance_km} km
            </Text>
            <Text style={{ color: c.textSecondary }} className="text-xs">Distance</Text>
          </View>
          <View className="items-center">
            <Text style={{ color: c.primary }} className="font-bold text-2xl">
              {run.duration_minutes} min
            </Text>
            <Text style={{ color: c.textSecondary }} className="text-xs">Duree</Text>
          </View>
          <View className="items-center">
            <Text style={{ color: c.primary }} className="font-bold text-2xl">
              {formatPace(run.duration_minutes, run.distance_km)}
            </Text>
            <Text style={{ color: c.textSecondary }} className="text-xs">/km</Text>
          </View>
        </View>

        {/* Details */}
        <Card className="mb-4">
          <View className="flex-row justify-between mb-3">
            <Text style={{ color: c.textSecondary }} className="text-sm">Type</Text>
            <Text style={{ color: c.text }} className="font-semibold text-sm">
              {RUNNING_TYPE_LABELS[run.type as RunningType]}
            </Text>
          </View>
          <View className="flex-row justify-between items-center mb-3">
            <Text style={{ color: c.textSecondary }} className="text-sm">Ressenti</Text>
            <View className="flex-row items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <View
                  key={i}
                  style={{ backgroundColor: i < run.perceived_effort ? c.primary : c.surfaceLight }}
                  className="w-3 h-3 rounded-full mx-0.5"
                />
              ))}
            </View>
          </View>
          {run.notes && (
            <View>
              <Text style={{ color: c.textSecondary }} className="text-sm mb-1">Notes</Text>
              <Text style={{ color: c.text }} className="text-sm">{run.notes}</Text>
            </View>
          )}
        </Card>
      </ScrollView>

      <ConfirmModal
        visible={showDelete}
        title="Supprimer la course"
        message="Es-tu sur de vouloir supprimer cette course ?"
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </SafeScreen>
  );
}
```

- [ ] **Step 3: Make running list items clickable**

In `app/(tabs)/sport/running.tsx`, change the `renderItem` to wrap the `Card` in a `Pressable` that navigates to `run-detail`. Replace the `renderItem` prop:

```tsx
renderItem={({ item }) => (
  <Pressable onPress={() => router.push({ pathname: "/(tabs)/sport/run-detail", params: { id: item.id } } as any)}>
    <Card className="mb-2">
      <View className="flex-row items-center justify-between">
        <View>
          <Text style={{ color: c.text }} className="font-bold text-sm">
            {formatDateShort(item.date)} — {item.distance_km} km
          </Text>
          <Text style={{ color: c.textSecondary }} className="text-xs mt-1">
            {RUNNING_TYPE_LABELS[item.type as RunningType]} · {formatPace(item.duration_minutes, item.distance_km)} /km
          </Text>
        </View>
        <View className="flex-row items-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <View
              key={i}
              style={{ backgroundColor: i < item.perceived_effort ? c.primary : c.surfaceLight }}
              className="w-2 h-2 rounded-full mx-0.5"
            />
          ))}
          <Feather name="chevron-right" size={16} color={c.textMuted} style={{ marginLeft: 8 }} />
        </View>
      </View>
    </Card>
  </Pressable>
)}
```

- [ ] **Step 4: Add edit mode to add-run screen**

Replace the entire `app/(tabs)/sport/add-run.tsx` to support both creation and editing:

```tsx
import { useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeScreen } from "../../../components/SafeScreen";
import { Button } from "../../../components/ui/Button";
import { useRunningStore } from "../../../stores/runningStore";
import { formatPace } from "../../../lib/formatters";
import { RUNNING_TYPES, RUNNING_TYPE_LABELS } from "../../../lib/constants";
import { useColors } from "../../../lib/theme";
import type { RunningType } from "../../../lib/constants";

export default function AddRunScreen() {
  const c = useColors();
  const router = useRouter();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const { runs, addRun, updateRun } = useRunningStore();

  const editingRun = editId ? runs.find((r) => r.id === editId) : null;
  const isEditing = !!editingRun;

  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [type, setType] = useState<RunningType>("easy");
  const [effort, setEffort] = useState(3);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editingRun) {
      setDistance(String(editingRun.distance_km));
      setDuration(String(editingRun.duration_minutes));
      setType(editingRun.type as RunningType);
      setEffort(editingRun.perceived_effort);
      setNotes(editingRun.notes ?? "");
    }
  }, [editingRun?.id]);

  const distanceNum = parseFloat(distance) || 0;
  const durationNum = parseFloat(duration) || 0;

  const handleSave = async () => {
    if (distanceNum <= 0 || durationNum <= 0) return;
    setLoading(true);

    if (isEditing && editId) {
      const { error } = await updateRun(editId, {
        distance_km: distanceNum,
        duration_minutes: durationNum,
        type,
        perceived_effort: effort,
        notes: notes.trim() || null,
      });
      setLoading(false);
      if (!error) router.back();
    } else {
      const today = new Date().toISOString().split("T")[0];
      const { error } = await addRun({
        date: today,
        distance_km: distanceNum,
        duration_minutes: durationNum,
        type,
        perceived_effort: effort,
        notes: notes.trim() || null,
      });
      setLoading(false);
      if (!error) router.back();
    }
  };

  return (
    <SafeScreen>
      <View className="flex-row items-center mb-6">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={c.text} />
        </Pressable>
        <Text style={{ color: c.text }} className="text-xl font-bold ml-2">
          {isEditing ? "Modifier la course" : "Nouvelle course"}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{ color: c.textSecondary }} className="text-sm mb-2">Distance (km)</Text>
        <TextInput
          style={{ backgroundColor: c.surface, color: c.text }}
          className="rounded-button px-4 py-3 mb-4 text-base"
          placeholder="8.5"
          placeholderTextColor={c.textMuted}
          keyboardType="numeric"
          value={distance}
          onChangeText={setDistance}
        />

        <Text style={{ color: c.textSecondary }} className="text-sm mb-2">Duree (minutes)</Text>
        <TextInput
          style={{ backgroundColor: c.surface, color: c.text }}
          className="rounded-button px-4 py-3 mb-4 text-base"
          placeholder="45"
          placeholderTextColor={c.textMuted}
          keyboardType="numeric"
          value={duration}
          onChangeText={setDuration}
        />

        <View style={{ backgroundColor: c.surface }} className="rounded-card px-4 py-3 mb-4">
          <Text style={{ color: c.textSecondary }} className="text-sm">Allure</Text>
          <Text style={{ color: c.primary }} className="font-bold text-xl">
            {distanceNum > 0 && durationNum > 0
              ? `${formatPace(durationNum, distanceNum)} /km`
              : "--:-- /km"}
          </Text>
        </View>

        <Text style={{ color: c.textSecondary }} className="text-sm mb-2">Type</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {RUNNING_TYPES.map((t) => (
            <Pressable
              key={t}
              style={{ backgroundColor: type === t ? c.primary : c.surface }}
              className="px-4 py-2 rounded-button"
              onPress={() => setType(t)}
            >
              <Text style={{ color: type === t ? c.primaryOnText : c.text }} className={`text-sm ${type === t ? "font-bold" : ""}`}>
                {RUNNING_TYPE_LABELS[t]}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ color: c.textSecondary }} className="text-sm mb-2">Ressenti</Text>
        <View className="flex-row justify-around mb-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable
              key={n}
              onPress={() => setEffort(n)}
              style={{ backgroundColor: effort === n ? c.primary : c.surface }}
              className="w-12 h-12 rounded-full items-center justify-center"
            >
              <Text style={{ color: effort === n ? c.primaryOnText : c.text }} className={`text-base ${effort === n ? "font-bold" : ""}`}>
                {n}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ color: c.textSecondary }} className="text-sm mb-2">Notes (optionnel)</Text>
        <TextInput
          style={{ backgroundColor: c.surface, color: c.text }}
          className="rounded-button px-4 py-3 mb-6 text-sm"
          placeholder="Comment s'est passee la course..."
          placeholderTextColor={c.textMuted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          value={notes}
          onChangeText={setNotes}
        />

        <Button
          title="Enregistrer"
          onPress={handleSave}
          loading={loading}
          disabled={distanceNum <= 0 || durationNum <= 0}
        />
      </ScrollView>
    </SafeScreen>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add stores/runningStore.ts app/(tabs)/sport/run-detail.tsx app/(tabs)/sport/running.tsx app/(tabs)/sport/add-run.tsx
git commit -m "feat: add run detail page with edit and delete"
```

---

## Task 4: Date picker and time fields for tasks

**Files:**
- Modify: `types/task.ts`
- Modify: `components/tasks/TaskForm.tsx`
- Modify: `stores/taskStore.ts`
- Modify: `lib/googleSync.ts`
- Create: `supabase/migrations/20260416000000_add_task_times.sql`

- [ ] **Step 1: Install datetimepicker**

```bash
cd life-tracker && npx expo install @react-native-community/datetimepicker
```

- [ ] **Step 2: Add migration file**

Create `supabase/migrations/20260416000000_add_task_times.sql`:

```sql
ALTER TABLE tasks ADD COLUMN start_time text;
ALTER TABLE tasks ADD COLUMN end_time text;
```

Run the migration:

```bash
npx supabase db push
```

Or if using remote Supabase directly, run via SQL editor in the Supabase dashboard.

- [ ] **Step 3: Update Task types**

Replace `types/task.ts`:

```typescript
export type TaskPriority = "high" | "normal" | "low";
export type TaskFilter = "all" | "today" | "week" | "no_date";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  due_date: string | null; // yyyy-MM-dd
  start_time: string | null; // HH:mm
  end_time: string | null; // HH:mm
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
  start_time?: string | null;
  end_time?: string | null;
  priority?: TaskPriority;
};
```

- [ ] **Step 4: Update taskStore to handle new fields**

In `stores/taskStore.ts`, update the `addTask` method's insert call to include the new fields. Find the `.insert({` block in `addTask` and replace it:

```typescript
const { data, error } = await getSupabase()
  .from("tasks")
  .insert({
    user_id: userId,
    title: input.title,
    notes: input.notes ?? null,
    due_date: input.due_date ?? null,
    start_time: input.start_time ?? null,
    end_time: input.end_time ?? null,
    priority: input.priority ?? "normal",
  })
  .select()
  .single();
```

- [ ] **Step 5: Update TaskForm with date picker and time fields**

Replace `components/tasks/TaskForm.tsx`:

```tsx
import { forwardRef, useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, Platform } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import { BottomSheet } from "../ui/BottomSheet";
import { Button } from "../ui/Button";
import { useColors } from "../../lib/theme";
import type { Task, TaskInput, TaskPriority } from "../../types/task";

type Props = {
  editingTask: Task | null;
  onSave: (input: TaskInput) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
};

const PRIORITIES: { key: TaskPriority; label: string; color: string }[] = [
  { key: "high", label: "Haute", color: "#ef4444" },
  { key: "normal", label: "Normale", color: "#D4AA40" },
  { key: "low", label: "Basse", color: "#9a9590" },
];

export const TaskForm = forwardRef<BottomSheetModal, Props>(
  ({ editingTask, onSave, onDelete, onClose }, ref) => {
    const c = useColors();

    const [title, setTitle] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [showTimePickers, setShowTimePickers] = useState(false);
    const [priority, setPriority] = useState<TaskPriority>("normal");
    const [notes, setNotes] = useState("");

    // Picker visibility states
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);

    useEffect(() => {
      if (editingTask) {
        setTitle(editingTask.title);
        setDueDate(editingTask.due_date ?? "");
        setStartTime(editingTask.start_time ?? "");
        setEndTime(editingTask.end_time ?? "");
        setShowTimePickers(!!(editingTask.start_time || editingTask.end_time));
        setPriority(editingTask.priority);
        setNotes(editingTask.notes ?? "");
      } else {
        setTitle("");
        setDueDate("");
        setStartTime("");
        setEndTime("");
        setShowTimePickers(false);
        setPriority("normal");
        setNotes("");
      }
    }, [editingTask]);

    const handleSave = () => {
      if (!title.trim()) return;
      onSave({
        title: title.trim(),
        due_date: dueDate.trim() || null,
        start_time: startTime.trim() || null,
        end_time: endTime.trim() || null,
        priority,
        notes: notes.trim() || null,
      });
    };

    const handleDateChange = (_event: any, selectedDate?: Date) => {
      setShowDatePicker(false);
      if (selectedDate) {
        const yyyy = selectedDate.getFullYear();
        const mm = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const dd = String(selectedDate.getDate()).padStart(2, "0");
        setDueDate(`${yyyy}-${mm}-${dd}`);
      }
    };

    const handleStartTimeChange = (_event: any, selectedDate?: Date) => {
      setShowStartTimePicker(false);
      if (selectedDate) {
        const hh = String(selectedDate.getHours()).padStart(2, "0");
        const mm = String(selectedDate.getMinutes()).padStart(2, "0");
        setStartTime(`${hh}:${mm}`);
      }
    };

    const handleEndTimeChange = (_event: any, selectedDate?: Date) => {
      setShowEndTimePicker(false);
      if (selectedDate) {
        const hh = String(selectedDate.getHours()).padStart(2, "0");
        const mm = String(selectedDate.getMinutes()).padStart(2, "0");
        setEndTime(`${hh}:${mm}`);
      }
    };

    const parseDateForPicker = (): Date => {
      if (dueDate) {
        const [y, m, d] = dueDate.split("-").map(Number);
        return new Date(y, m - 1, d);
      }
      return new Date();
    };

    const parseTimeForPicker = (time: string): Date => {
      const d = new Date();
      if (time) {
        const [h, m] = time.split(":").map(Number);
        d.setHours(h, m, 0, 0);
      }
      return d;
    };

    return (
      <BottomSheet
        ref={ref}
        title={editingTask ? "Modifier" : "Nouvelle tache"}
        snapPoints={["70%", "90%"]}
        onClose={onClose}
      >
        {/* Title */}
        <Text className="text-sm font-semibold mb-1" style={{ color: c.textSecondary }}>
          Titre
        </Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Titre de la tache"
          placeholderTextColor={c.textMuted}
          className="rounded-xl px-4 py-3 text-base mb-4"
          style={{ backgroundColor: c.surfaceLight, color: c.text }}
        />

        {/* Due date with calendar button */}
        <Text className="text-sm font-semibold mb-1" style={{ color: c.textSecondary }}>
          Date
        </Text>
        <View className="flex-row items-center mb-2">
          <TextInput
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor={c.textMuted}
            className="flex-1 rounded-xl px-4 py-3 text-base"
            style={{ backgroundColor: c.surfaceLight, color: c.text }}
            keyboardType="numbers-and-punctuation"
          />
          <Pressable
            onPress={() => setShowDatePicker(true)}
            className="ml-2 w-12 h-12 rounded-xl items-center justify-center"
            style={{ backgroundColor: c.surfaceLight }}
          >
            <Feather name="calendar" size={20} color={c.primary} />
          </Pressable>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={parseDateForPicker()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {/* Time pickers toggle */}
        {!showTimePickers ? (
          <Pressable
            onPress={() => setShowTimePickers(true)}
            className="flex-row items-center mb-4 mt-1"
          >
            <Feather name="clock" size={14} color={c.primary} />
            <Text className="text-sm ml-1" style={{ color: c.primary }}>
              + Horaire
            </Text>
          </Pressable>
        ) : (
          <View className="mb-4 mt-1">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-sm font-semibold" style={{ color: c.textSecondary }}>
                Horaires
              </Text>
              <Pressable
                onPress={() => {
                  setShowTimePickers(false);
                  setStartTime("");
                  setEndTime("");
                }}
              >
                <Feather name="x" size={18} color={c.textMuted} />
              </Pressable>
            </View>
            <View className="flex-row gap-2">
              {/* Start time */}
              <Pressable
                onPress={() => setShowStartTimePicker(true)}
                className="flex-1 flex-row items-center rounded-xl px-4 py-3"
                style={{ backgroundColor: c.surfaceLight }}
              >
                <Feather name="clock" size={16} color={c.textSecondary} />
                <Text className="ml-2 text-base" style={{ color: startTime ? c.text : c.textMuted }}>
                  {startTime || "Debut"}
                </Text>
              </Pressable>
              {/* End time */}
              <Pressable
                onPress={() => setShowEndTimePicker(true)}
                className="flex-1 flex-row items-center rounded-xl px-4 py-3"
                style={{ backgroundColor: c.surfaceLight }}
              >
                <Feather name="clock" size={16} color={c.textSecondary} />
                <Text className="ml-2 text-base" style={{ color: endTime ? c.text : c.textMuted }}>
                  {endTime || "Fin"}
                </Text>
              </Pressable>
            </View>

            {showStartTimePicker && (
              <DateTimePicker
                value={parseTimeForPicker(startTime)}
                mode="time"
                is24Hour
                display="default"
                onChange={handleStartTimeChange}
              />
            )}
            {showEndTimePicker && (
              <DateTimePicker
                value={parseTimeForPicker(endTime)}
                mode="time"
                is24Hour
                display="default"
                onChange={handleEndTimeChange}
              />
            )}
          </View>
        )}

        {/* Priority */}
        <Text className="text-sm font-semibold mb-2" style={{ color: c.textSecondary }}>
          Priorite
        </Text>
        <View className="flex-row gap-2 mb-4">
          {PRIORITIES.map(({ key, label, color }) => {
            const isActive = priority === key;
            return (
              <Pressable
                key={key}
                onPress={() => setPriority(key)}
                className="flex-1 py-2.5 rounded-xl items-center"
                style={{
                  backgroundColor: isActive ? color : c.surfaceLight,
                  borderWidth: isActive ? 0 : 1,
                  borderColor: c.textMuted,
                }}
              >
                <Text
                  className="text-sm font-semibold"
                  style={{ color: isActive ? "#ffffff" : c.textSecondary }}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Notes */}
        <Text className="text-sm font-semibold mb-1" style={{ color: c.textSecondary }}>
          Notes
        </Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Notes optionnelles..."
          placeholderTextColor={c.textMuted}
          multiline
          numberOfLines={3}
          className="rounded-xl px-4 py-3 text-base mb-6"
          style={{
            backgroundColor: c.surfaceLight,
            color: c.text,
            minHeight: 80,
            textAlignVertical: "top",
          }}
        />

        {/* Actions */}
        <View className="gap-3">
          <Button title="Enregistrer" onPress={handleSave} disabled={!title.trim()} />
          {editingTask && onDelete && (
            <Button
              title="Supprimer"
              variant="destructive"
              onPress={() => onDelete(editingTask.id)}
            />
          )}
          <Button title="Annuler" variant="secondary" onPress={onClose} />
        </View>
      </BottomSheet>
    );
  }
);

TaskForm.displayName = "TaskForm";
```

- [ ] **Step 6: Update Google Calendar sync for timed events**

In `lib/googleSync.ts`, replace the `createCalendarEvent` function:

```typescript
export async function createCalendarEvent(
  task: Task
): Promise<string | null> {
  if (!task.due_date) return null;
  const headers = await authHeaders();
  if (!headers) return null;

  try {
    let start: Record<string, string>;
    let end: Record<string, string>;

    if (task.start_time && task.end_time) {
      // Timed event
      start = { dateTime: `${task.due_date}T${task.start_time}:00`, timeZone: "Europe/Paris" };
      end = { dateTime: `${task.due_date}T${task.end_time}:00`, timeZone: "Europe/Paris" };
    } else {
      // All-day event
      start = { date: task.due_date };
      end = { date: task.due_date };
    }

    const body = {
      summary: task.title,
      description: task.notes ?? "",
      start,
      end,
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
```

Also update `updateCalendarEvent` to handle timed events:

```typescript
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
      if (task.start_time && task.end_time) {
        body.start = { dateTime: `${task.due_date}T${task.start_time}:00`, timeZone: "Europe/Paris" };
        body.end = { dateTime: `${task.due_date}T${task.end_time}:00`, timeZone: "Europe/Paris" };
      } else {
        body.start = { date: task.due_date };
        body.end = { date: task.due_date };
      }
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
```

- [ ] **Step 7: Commit**

```bash
git add types/task.ts components/tasks/TaskForm.tsx stores/taskStore.ts lib/googleSync.ts supabase/migrations/20260416000000_add_task_times.sql
git commit -m "feat: add date picker and start/end time fields for tasks"
```

---

## Task 5: Persistent workout notification (Android)

**Files:**
- Create: `lib/workoutNotification.ts`
- Modify: `app.json`
- Modify: `app/_layout.tsx`
- Modify: `app/(tabs)/sport/active-workout.tsx`
- Modify: `components/sport/RestTimer.tsx`
- Modify: `stores/workoutStore.ts`

- [ ] **Step 1: Install dependencies**

```bash
cd life-tracker && npx expo install expo-notifications
```

- [ ] **Step 2: Update app.json with notification plugin**

In `app.json`, add `"expo-notifications"` to the `plugins` array:

```json
"plugins": [
  "expo-router",
  [
    "@react-native-google-signin/google-signin",
    {
      "iosUrlScheme": "com.googleusercontent.apps.1063289815690-6eggvslg2kn9buvbqa3fc95io2qmn0gp"
    }
  ],
  [
    "expo-notifications",
    {
      "icon": "./assets/images/icon.png",
      "color": "#D4AA40"
    }
  ]
]
```

- [ ] **Step 3: Create workout notification module**

Create `lib/workoutNotification.ts`:

```typescript
import * as Notifications from "expo-notifications";
import { formatDuration } from "./formatters";

const NOTIFICATION_ID = "workout-session";

let updateInterval: ReturnType<typeof setInterval> | null = null;
let sessionStartedAt: number | null = null;
let restStartedAt: number | null = null;

// Configure notification handler (show even when app is foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowInForeground: false,
  }),
});

async function updateNotification() {
  if (!sessionStartedAt) return;

  const sessionElapsed = Date.now() - sessionStartedAt;
  let body = formatDuration(sessionElapsed);

  if (restStartedAt) {
    const restElapsed = Date.now() - restStartedAt;
    body += ` — Repos : ${formatDuration(restElapsed)}`;
  }

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_ID,
    content: {
      title: "Seance en cours",
      body,
      sticky: true,
      data: { url: "/(tabs)/sport/active-workout" },
    },
    trigger: null, // Show immediately
  });
}

export async function startWorkoutNotification(startedAt: number) {
  sessionStartedAt = startedAt;
  restStartedAt = null;

  // Request permissions
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") return;

  // Initial notification
  await updateNotification();

  // Update every second
  if (updateInterval) clearInterval(updateInterval);
  updateInterval = setInterval(updateNotification, 1000);
}

export function updateRestTimer(restStartTime: number | null) {
  restStartedAt = restStartTime;
}

export async function stopWorkoutNotification() {
  sessionStartedAt = null;
  restStartedAt = null;

  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
  }

  await Notifications.dismissNotificationAsync(NOTIFICATION_ID);
}
```

- [ ] **Step 4: Add notification permission request in root layout**

In `app/_layout.tsx`, add the import and permission request. Add to imports:

```typescript
import * as Notifications from "expo-notifications";
```

Add inside the `RootLayout` function, after the existing `useEffect` for `initialize()`:

```typescript
useEffect(() => {
  Notifications.requestPermissionsAsync();
}, []);
```

- [ ] **Step 5: Integrate notification into active-workout screen**

In `app/(tabs)/sport/active-workout.tsx`, add the import at the top:

```typescript
import {
  startWorkoutNotification,
  stopWorkoutNotification,
  updateRestTimer,
} from "../../../lib/workoutNotification";
```

Add a `useEffect` after the existing `useEffect` that fetches exercises (the one with `[currentSession?.id]` dependency). This effect manages the notification lifecycle:

```typescript
// Manage workout notification
useEffect(() => {
  if (currentSession?.startedAt) {
    startWorkoutNotification(currentSession.startedAt);
  }
  return () => {
    // Don't stop on unmount — notification should persist when leaving screen
    // It will be stopped when finishSession is called
  };
}, [currentSession?.startedAt]);

// Update rest timer in notification
useEffect(() => {
  updateRestTimer(currentSession?.restTimerStart ?? null);
}, [currentSession?.restTimerStart]);
```

Update the `handleFinish` function to stop the notification:

```typescript
const handleFinish = async () => {
  setConfirmEnd(false);
  await stopWorkoutNotification();
  const result = await finishSession();
  setSummary(result);
};
```

- [ ] **Step 6: Add notification deep link handling**

In `app/_layout.tsx`, add a notification response listener to navigate back to the workout screen when the user taps the notification. Add to imports:

```typescript
import { useRouter } from "expo-router";
```

Note: `useRouter` is already imported via `useSegments` — just add `useRouter` to the destructured import from `expo-router`. Then inside `RootLayout`, add:

```typescript
const router = useRouter();

useEffect(() => {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const url = response.notification.request.content.data?.url;
    if (url) {
      router.push(url as any);
    }
  });
  return () => subscription.remove();
}, []);
```

- [ ] **Step 7: Commit**

```bash
git add lib/workoutNotification.ts app.json app/_layout.tsx app/(tabs)/sport/active-workout.tsx
git commit -m "feat: add persistent Android notification for workout session"
```

---

## Final: Install all new dependencies at once

Before starting any task, install all dependencies:

```bash
cd life-tracker && npx expo install expo-notifications @react-native-community/datetimepicker
```

Then rebuild the dev client since native modules changed:

```bash
npx expo run:android
```
