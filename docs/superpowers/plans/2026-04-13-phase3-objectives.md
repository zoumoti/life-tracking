# Phase 3 — Objectifs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full Objectives feature — visions (life directions) grouping measurable objectives with progress tracking, update history, and evolution charts.

**Architecture:** Two-level data model (Visions → Objectives → Updates). Zustand persisted stores with Supabase background sync. Main screen groups objectives by vision with progress bars. Detail view shows SVG evolution chart (real vs ideal). All forms use existing BottomSheet component.

**Tech Stack:** React Native, Expo Router, TypeScript, NativeWind, Zustand + AsyncStorage, Supabase, react-native-svg (for charts)

**Spec:** `docs/superpowers/specs/2026-04-13-life-tracker-design.md` (Pilier 3)

---

## File Structure

### New files to create
| File | Responsibility |
|------|---------------|
| `stores/visionStore.ts` | CRUD visions + Supabase sync |
| `stores/objectiveStore.ts` | CRUD objectives + updates + Supabase sync |
| `components/ui/ProgressBar.tsx` | Reusable horizontal progress bar |
| `components/objectives/VisionCard.tsx` | Vision card with list of objectives |
| `components/objectives/ObjectiveRow.tsx` | Single objective: name + progress + deadline + status indicator |
| `components/objectives/VisionForm.tsx` | BottomSheet content for create/edit vision |
| `components/objectives/ObjectiveForm.tsx` | BottomSheet content for create/edit objective |
| `components/objectives/UpdateValueForm.tsx` | BottomSheet content for logging a new value |
| `components/objectives/ProgressChart.tsx` | SVG line chart — real curve vs ideal linear curve |
| `components/objectives/ObjectiveDetail.tsx` | Full detail view for one objective |
| `app/(tabs)/objectives.tsx` | Main Objectives screen (replace placeholder) |

### Existing files to modify
| File | Change |
|------|--------|
| `types/database.ts` | Add `icon` and `color` fields to visions types |

---

## Task 1: Add icon/color columns to visions table + update types

The spec requires each vision to have a color and icon. The current `visions` table is missing these fields.

**Files:**
- Modify: `types/database.ts`
- SQL migration on Supabase

- [ ] **Step 1: Run SQL migration on Supabase**

Go to Supabase SQL Editor (https://tzyzaygqvxkazdgeyvha.supabase.co) and run:

```sql
ALTER TABLE visions ADD COLUMN icon text NOT NULL DEFAULT 'target';
ALTER TABLE visions ADD COLUMN color text NOT NULL DEFAULT '#6C5CE7';
```

- [ ] **Step 2: Update database types**

In `types/database.ts`, update the `visions` table types.

Add to `visions.Row` (after `description`):
```typescript
          icon: string;
          color: string;
```

Add to `visions.Insert` (after `description`):
```typescript
          icon?: string;
          color?: string;
```

Add to `visions.Update` (after `description`):
```typescript
          icon?: string;
          color?: string;
```

- [ ] **Step 3: Verify types compile**

Run: `cd life-tracker && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add types/database.ts
git commit -m "feat(objectives): add icon and color fields to visions types"
```

---

## Task 2: Create visionStore

Zustand persisted store for visions with Supabase sync.

**Files:**
- Create: `stores/visionStore.ts`

- [ ] **Step 1: Create the store**

Create `stores/visionStore.ts`:

```typescript
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
```

- [ ] **Step 2: Verify types compile**

Run: `cd life-tracker && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add stores/visionStore.ts
git commit -m "feat(objectives): create visionStore with Supabase sync"
```

---

## Task 3: Create objectiveStore

Zustand persisted store for objectives and objective_updates.

**Files:**
- Create: `stores/objectiveStore.ts`

- [ ] **Step 1: Create the store**

Create `stores/objectiveStore.ts`:

```typescript
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
```

- [ ] **Step 2: Verify types compile**

Run: `cd life-tracker && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add stores/objectiveStore.ts
git commit -m "feat(objectives): create objectiveStore with updates and Supabase sync"
```

---

## Task 4: Create ProgressBar component

Reusable horizontal progress bar for objectives. Will also be used elsewhere.

**Files:**
- Create: `components/ui/ProgressBar.tsx`

- [ ] **Step 1: Create the component**

Create `components/ui/ProgressBar.tsx`:

```typescript
import { View } from "react-native";
import { colors } from "../../lib/theme";

type Props = {
  progress: number; // 0 to 1
  color?: string;
  height?: number;
  className?: string;
};

export function ProgressBar({
  progress,
  color = colors.primary,
  height = 6,
  className = "",
}: Props) {
  const clamped = Math.min(Math.max(progress, 0), 1);

  return (
    <View
      className={`w-full rounded-full overflow-hidden ${className}`}
      style={{ height, backgroundColor: colors.surfaceLight }}
    >
      <View
        style={{
          width: `${clamped * 100}%`,
          height,
          backgroundColor: color,
          borderRadius: 9999,
        }}
      />
    </View>
  );
}
```

- [ ] **Step 2: Verify types compile**

Run: `cd life-tracker && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/ui/ProgressBar.tsx
git commit -m "feat(ui): create reusable ProgressBar component"
```

---

## Task 5: Create VisionForm (bottom sheet content)

Form for creating and editing visions. Rendered inside an existing BottomSheet.

**Files:**
- Create: `components/objectives/VisionForm.tsx`

- [ ] **Step 1: Create the component**

Create `components/objectives/VisionForm.tsx`:

```typescript
import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { Button } from "../ui/Button";
import { colors } from "../../lib/theme";
import type { Tables } from "../../types/database";

const VISION_COLORS = [
  "#6C5CE7", "#a855f7", "#22c55e", "#f59e0b",
  "#ef4444", "#3b82f6", "#ec4899", "#14b8a6",
];

const VISION_ICONS = [
  "target", "heart", "star", "zap",
  "book", "briefcase", "globe", "trophy",
];

type Props = {
  initial?: Tables<"visions">;
  onSubmit: (data: { title: string; description: string; icon: string; color: string }) => void;
  onCancel: () => void;
  loading?: boolean;
};

export function VisionForm({ initial, onSubmit, onCancel, loading }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "target");
  const [color, setColor] = useState(initial?.color ?? "#6C5CE7");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), description: description.trim(), icon, color });
  };

  return (
    <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
      {/* Title */}
      <Text className="text-text-secondary text-sm mb-1">Nom de la vision</Text>
      <TextInput
        className="bg-surface-light text-text rounded-button px-4 py-3 mb-4 text-base"
        placeholder="Ex: Etre en excellente forme"
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
      />

      {/* Description */}
      <Text className="text-text-secondary text-sm mb-1">Description (optionnel)</Text>
      <TextInput
        className="bg-surface-light text-text rounded-button px-4 py-3 mb-4 text-base"
        placeholder="Ce que cette vision represente..."
        placeholderTextColor={colors.textMuted}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={2}
      />

      {/* Color picker */}
      <Text className="text-text-secondary text-sm mb-2">Couleur</Text>
      <View className="flex-row flex-wrap gap-3 mb-4">
        {VISION_COLORS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setColor(c)}
            className="items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: c,
              borderWidth: color === c ? 3 : 0,
              borderColor: colors.text,
            }}
          />
        ))}
      </View>

      {/* Icon picker */}
      <Text className="text-text-secondary text-sm mb-2">Icone</Text>
      <View className="flex-row flex-wrap gap-3 mb-6">
        {VISION_ICONS.map((i) => (
          <Pressable
            key={i}
            onPress={() => setIcon(i)}
            className="items-center justify-center"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: icon === i ? colors.primary : colors.surfaceLight,
            }}
          >
            <Text className="text-text text-sm">{i}</Text>
          </Pressable>
        ))}
      </View>

      {/* Actions */}
      <View className="flex-row gap-3">
        <Button
          title="Annuler"
          variant="secondary"
          onPress={onCancel}
          className="flex-1"
        />
        <Button
          title={initial ? "Modifier" : "Creer"}
          onPress={handleSubmit}
          loading={loading}
          disabled={!title.trim()}
          className="flex-1"
        />
      </View>
    </ScrollView>
  );
}
```

- [ ] **Step 2: Verify types compile**

Run: `cd life-tracker && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/objectives/VisionForm.tsx
git commit -m "feat(objectives): create VisionForm component"
```

---

## Task 6: Create ObjectiveForm (bottom sheet content)

Form for creating/editing a measurable objective.

**Files:**
- Create: `components/objectives/ObjectiveForm.tsx`

- [ ] **Step 1: Create the component**

Create `components/objectives/ObjectiveForm.tsx`:

```typescript
import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { Button } from "../ui/Button";
import { colors } from "../../lib/theme";
import type { Tables } from "../../types/database";

type Props = {
  visions: Tables<"visions">[];
  initialVisionId?: string;
  initial?: Tables<"objectives">;
  onSubmit: (data: {
    vision_id: string;
    title: string;
    description: string;
    unit: string;
    current_value: number;
    target_value: number;
    deadline: string;
  }) => void;
  onCancel: () => void;
  loading?: boolean;
};

export function ObjectiveForm({ visions, initialVisionId, initial, onSubmit, onCancel, loading }: Props) {
  const [visionId, setVisionId] = useState(initial?.vision_id ?? initialVisionId ?? visions[0]?.id ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [unit, setUnit] = useState(initial?.unit ?? "");
  const [currentValue, setCurrentValue] = useState(String(initial?.current_value ?? "0"));
  const [targetValue, setTargetValue] = useState(String(initial?.target_value ?? ""));
  const [deadline, setDeadline] = useState(initial?.deadline ?? "");

  const handleSubmit = () => {
    if (!title.trim() || !visionId || !targetValue || !deadline) return;
    onSubmit({
      vision_id: visionId,
      title: title.trim(),
      description: description.trim(),
      unit: unit.trim(),
      current_value: parseFloat(currentValue) || 0,
      target_value: parseFloat(targetValue),
      deadline,
    });
  };

  return (
    <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
      {/* Vision selector */}
      <Text className="text-text-secondary text-sm mb-1">Vision parente</Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {visions.map((v) => (
          <Pressable
            key={v.id}
            onPress={() => setVisionId(v.id)}
            className="px-3 py-2 rounded-button"
            style={{
              backgroundColor: visionId === v.id ? v.color : colors.surfaceLight,
            }}
          >
            <Text className="text-text text-sm">{v.title}</Text>
          </Pressable>
        ))}
      </View>

      {/* Title */}
      <Text className="text-text-secondary text-sm mb-1">Nom de l'objectif</Text>
      <TextInput
        className="bg-surface-light text-text rounded-button px-4 py-3 mb-4 text-base"
        placeholder="Ex: Bench press 100kg"
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
      />

      {/* Description */}
      <Text className="text-text-secondary text-sm mb-1">Description (optionnel)</Text>
      <TextInput
        className="bg-surface-light text-text rounded-button px-4 py-3 mb-4 text-base"
        placeholder="Details supplementaires..."
        placeholderTextColor={colors.textMuted}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* Unit */}
      <Text className="text-text-secondary text-sm mb-1">Unite de mesure</Text>
      <TextInput
        className="bg-surface-light text-text rounded-button px-4 py-3 mb-4 text-base"
        placeholder="Ex: kg, km, min, %"
        placeholderTextColor={colors.textMuted}
        value={unit}
        onChangeText={setUnit}
      />

      {/* Current + Target values */}
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <Text className="text-text-secondary text-sm mb-1">Valeur actuelle</Text>
          <TextInput
            className="bg-surface-light text-text rounded-button px-4 py-3 text-base"
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            value={currentValue}
            onChangeText={setCurrentValue}
            keyboardType="numeric"
          />
        </View>
        <View className="flex-1">
          <Text className="text-text-secondary text-sm mb-1">Valeur cible</Text>
          <TextInput
            className="bg-surface-light text-text rounded-button px-4 py-3 text-base"
            placeholder="100"
            placeholderTextColor={colors.textMuted}
            value={targetValue}
            onChangeText={setTargetValue}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Deadline */}
      <Text className="text-text-secondary text-sm mb-1">Deadline (AAAA-MM-JJ)</Text>
      <TextInput
        className="bg-surface-light text-text rounded-button px-4 py-3 mb-6 text-base"
        placeholder="2026-09-01"
        placeholderTextColor={colors.textMuted}
        value={deadline}
        onChangeText={setDeadline}
      />

      {/* Actions */}
      <View className="flex-row gap-3">
        <Button title="Annuler" variant="secondary" onPress={onCancel} className="flex-1" />
        <Button
          title={initial ? "Modifier" : "Creer"}
          onPress={handleSubmit}
          loading={loading}
          disabled={!title.trim() || !visionId || !targetValue || !deadline}
          className="flex-1"
        />
      </View>
    </ScrollView>
  );
}
```

- [ ] **Step 2: Verify types compile**

Run: `cd life-tracker && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/objectives/ObjectiveForm.tsx
git commit -m "feat(objectives): create ObjectiveForm component"
```

---

## Task 7: Create ObjectiveRow component

Displays one objective with name, progress bar, deadline, and ahead/behind indicator.

**Files:**
- Create: `components/objectives/ObjectiveRow.tsx`

- [ ] **Step 1: Create the component**

Create `components/objectives/ObjectiveRow.tsx`:

```typescript
import { View, Text, Pressable } from "react-native";
import { ProgressBar } from "../ui/ProgressBar";
import { colors } from "../../lib/theme";
import type { Tables } from "../../types/database";

type Props = {
  objective: Tables<"objectives">;
  visionColor?: string;
  onPress: () => void;
};

function getDeadlineStatus(objective: Tables<"objectives">): {
  label: string;
  color: string;
} {
  if (!objective.deadline || !objective.target_value) {
    return { label: "", color: colors.textMuted };
  }

  const now = Date.now();
  const created = new Date(objective.created_at).getTime();
  const deadline = new Date(objective.deadline).getTime();
  const totalDuration = deadline - created;
  const elapsed = now - created;

  if (totalDuration <= 0 || elapsed <= 0) {
    return { label: "", color: colors.textMuted };
  }

  const expectedProgress = Math.min(elapsed / totalDuration, 1);
  const actualProgress = objective.current_value / objective.target_value;

  if (now > deadline) {
    return actualProgress >= 1
      ? { label: "Atteint !", color: colors.success }
      : { label: "Expire", color: colors.danger };
  }

  const diff = actualProgress - expectedProgress;
  if (diff >= 0) {
    return { label: "En avance", color: colors.success };
  } else if (diff > -0.15) {
    return { label: "En rythme", color: colors.textSecondary };
  } else {
    return { label: "En retard", color: colors.warning };
  }
}

function formatDeadline(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export function ObjectiveRow({ objective, visionColor, onPress }: Props) {
  const progress =
    objective.target_value && objective.target_value > 0
      ? objective.current_value / objective.target_value
      : 0;
  const status = getDeadlineStatus(objective);

  return (
    <Pressable onPress={onPress} className="py-3 active:opacity-80">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-text text-base flex-1 mr-2" numberOfLines={1}>
          {objective.title}
        </Text>
        {status.label ? (
          <Text className="text-xs font-medium" style={{ color: status.color }}>
            {status.label}
          </Text>
        ) : null}
      </View>

      <ProgressBar progress={progress} color={visionColor ?? colors.primary} className="mb-1" />

      <View className="flex-row items-center justify-between">
        <Text className="text-text-muted text-xs">
          {objective.current_value}{objective.unit ? ` ${objective.unit}` : ""} / {objective.target_value ?? "?"}{objective.unit ? ` ${objective.unit}` : ""}
        </Text>
        {objective.deadline && (
          <Text className="text-text-muted text-xs">{formatDeadline(objective.deadline)}</Text>
        )}
      </View>
    </Pressable>
  );
}
```

- [ ] **Step 2: Verify types compile**

Run: `cd life-tracker && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/objectives/ObjectiveRow.tsx
git commit -m "feat(objectives): create ObjectiveRow with progress and deadline status"
```

---

## Task 8: Create VisionCard component

Groups objectives under a vision header. Shows vision color/icon.

**Files:**
- Create: `components/objectives/VisionCard.tsx`

- [ ] **Step 1: Create the component**

Create `components/objectives/VisionCard.tsx`:

```typescript
import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card } from "../ui/Card";
import { ObjectiveRow } from "./ObjectiveRow";
import { colors } from "../../lib/theme";
import type { Tables } from "../../types/database";

type Props = {
  vision: Tables<"visions">;
  objectives: Tables<"objectives">[];
  onPressObjective: (objective: Tables<"objectives">) => void;
  onAddObjective: () => void;
  onEditVision: () => void;
  onDeleteVision: () => void;
};

export function VisionCard({
  vision,
  objectives,
  onPressObjective,
  onAddObjective,
  onEditVision,
  onDeleteVision,
}: Props) {
  return (
    <Card className="mb-4">
      {/* Vision header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View
            className="items-center justify-center mr-3"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: vision.color + "20",
            }}
          >
            <Feather
              name={vision.icon as any}
              size={18}
              color={vision.color}
            />
          </View>
          <View className="flex-1">
            <Text className="text-text text-base font-bold" numberOfLines={1}>
              {vision.title}
            </Text>
            {vision.description ? (
              <Text className="text-text-muted text-xs" numberOfLines={1}>
                {vision.description}
              </Text>
            ) : null}
          </View>
        </View>

        <View className="flex-row gap-1">
          <Pressable onPress={onEditVision} className="p-2 active:opacity-60">
            <Feather name="edit-2" size={16} color={colors.textMuted} />
          </Pressable>
          <Pressable onPress={onDeleteVision} className="p-2 active:opacity-60">
            <Feather name="trash-2" size={16} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>

      {/* Objectives list */}
      {objectives.length === 0 ? (
        <Text className="text-text-muted text-sm py-2">Aucun objectif pour le moment</Text>
      ) : (
        objectives.map((obj) => (
          <ObjectiveRow
            key={obj.id}
            objective={obj}
            visionColor={vision.color}
            onPress={() => onPressObjective(obj)}
          />
        ))
      )}

      {/* Add objective button */}
      <Pressable
        onPress={onAddObjective}
        className="flex-row items-center justify-center py-2 mt-2 rounded-button active:opacity-60"
        style={{ backgroundColor: vision.color + "15" }}
      >
        <Feather name="plus" size={16} color={vision.color} />
        <Text className="text-sm font-medium ml-1" style={{ color: vision.color }}>
          Ajouter un objectif
        </Text>
      </Pressable>
    </Card>
  );
}
```

- [ ] **Step 2: Verify types compile**

Run: `cd life-tracker && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/objectives/VisionCard.tsx
git commit -m "feat(objectives): create VisionCard component"
```

---

## Task 9: Create UpdateValueForm (bottom sheet content)

Quick form to log a new value update on an objective.

**Files:**
- Create: `components/objectives/UpdateValueForm.tsx`

- [ ] **Step 1: Create the component**

Create `components/objectives/UpdateValueForm.tsx`:

```typescript
import { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { Button } from "../ui/Button";
import { colors } from "../../lib/theme";
import type { Tables } from "../../types/database";

type Props = {
  objective: Tables<"objectives">;
  onSubmit: (newValue: number, note: string) => void;
  onCancel: () => void;
  loading?: boolean;
};

export function UpdateValueForm({ objective, onSubmit, onCancel, loading }: Props) {
  const [value, setValue] = useState(String(objective.current_value));
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    onSubmit(numValue, note.trim());
  };

  return (
    <View>
      <Text className="text-text text-base font-bold mb-1">{objective.title}</Text>
      <Text className="text-text-muted text-sm mb-4">
        Actuel : {objective.current_value} {objective.unit} → Cible : {objective.target_value} {objective.unit}
      </Text>

      <Text className="text-text-secondary text-sm mb-1">Nouvelle valeur</Text>
      <TextInput
        className="bg-surface-light text-text rounded-button px-4 py-3 mb-4 text-base"
        placeholder={String(objective.current_value)}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={setValue}
        keyboardType="numeric"
        autoFocus
      />

      <Text className="text-text-secondary text-sm mb-1">Note (optionnel)</Text>
      <TextInput
        className="bg-surface-light text-text rounded-button px-4 py-3 mb-6 text-base"
        placeholder="Observations, contexte..."
        placeholderTextColor={colors.textMuted}
        value={note}
        onChangeText={setNote}
        multiline
      />

      <View className="flex-row gap-3">
        <Button title="Annuler" variant="secondary" onPress={onCancel} className="flex-1" />
        <Button
          title="Mettre a jour"
          onPress={handleSubmit}
          loading={loading}
          disabled={isNaN(parseFloat(value))}
          className="flex-1"
        />
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Verify types compile**

Run: `cd life-tracker && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/objectives/UpdateValueForm.tsx
git commit -m "feat(objectives): create UpdateValueForm component"
```

---

## Task 10: Create ProgressChart (SVG evolution chart)

Custom SVG chart showing real progression vs ideal linear curve.

**Files:**
- Create: `components/objectives/ProgressChart.tsx`

- [ ] **Step 1: Create the component**

Create `components/objectives/ProgressChart.tsx`:

```typescript
import { View, Text } from "react-native";
import Svg, { Line, Polyline, Circle, Rect } from "react-native-svg";
import { colors } from "../../lib/theme";
import type { Tables } from "../../types/database";

type Props = {
  objective: Tables<"objectives">;
  updates: Tables<"objective_updates">[];
  width?: number;
  height?: number;
};

export function ProgressChart({
  objective,
  updates,
  width = 320,
  height = 180,
}: Props) {
  const padding = { top: 16, right: 16, bottom: 24, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const startDate = new Date(objective.created_at).getTime();
  const endDate = objective.deadline
    ? new Date(objective.deadline).getTime()
    : Date.now() + 30 * 24 * 60 * 60 * 1000;
  const totalDuration = endDate - startDate;

  const startValue = 0;
  const targetValue = objective.target_value ?? objective.current_value;
  const valueRange = targetValue - startValue || 1;

  // Build data points from updates (add start point)
  const dataPoints: { time: number; value: number }[] = [
    { time: startDate, value: startValue },
  ];
  let runningValue = startValue;
  for (const u of updates) {
    runningValue = u.new_value;
    dataPoints.push({ time: new Date(u.created_at).getTime(), value: runningValue });
  }
  // Add current state if no recent update
  if (dataPoints.length === 1 || dataPoints[dataPoints.length - 1].value !== objective.current_value) {
    dataPoints.push({ time: Date.now(), value: objective.current_value });
  }

  const toX = (time: number) =>
    padding.left + ((time - startDate) / totalDuration) * chartW;
  const toY = (value: number) =>
    padding.top + chartH - ((value - startValue) / valueRange) * chartH;

  // Real curve polyline points
  const realPoints = dataPoints
    .map((p) => `${toX(p.time)},${toY(p.value)}`)
    .join(" ");

  // Ideal line: start → target
  const idealStartX = padding.left;
  const idealStartY = toY(startValue);
  const idealEndX = padding.left + chartW;
  const idealEndY = toY(targetValue);

  // Y axis labels
  const yLabels = [startValue, Math.round(targetValue / 2), targetValue];

  return (
    <View>
      <Svg width={width} height={height}>
        {/* Background grid */}
        <Rect
          x={padding.left}
          y={padding.top}
          width={chartW}
          height={chartH}
          fill={colors.surface}
          rx={8}
        />

        {/* Y axis labels */}
        {yLabels.map((val) => (
          <Line
            key={val}
            x1={padding.left}
            y1={toY(val)}
            x2={padding.left + chartW}
            y2={toY(val)}
            stroke={colors.surfaceLight}
            strokeWidth={1}
            strokeDasharray="4,4"
          />
        ))}

        {/* Ideal line (dashed) */}
        <Line
          x1={idealStartX}
          y1={idealStartY}
          x2={idealEndX}
          y2={idealEndY}
          stroke={colors.textMuted}
          strokeWidth={1.5}
          strokeDasharray="6,4"
        />

        {/* Real curve */}
        <Polyline
          points={realPoints}
          fill="none"
          stroke={colors.primary}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <Circle
            key={i}
            cx={toX(p.time)}
            cy={toY(p.value)}
            r={3.5}
            fill={colors.primary}
          />
        ))}
      </Svg>

      {/* Legend */}
      <View className="flex-row items-center gap-4 mt-2 px-2">
        <View className="flex-row items-center gap-1">
          <View style={{ width: 12, height: 3, backgroundColor: colors.primary, borderRadius: 2 }} />
          <Text className="text-text-muted text-xs">Reel</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View style={{ width: 12, height: 1, backgroundColor: colors.textMuted, borderRadius: 1 }} />
          <Text className="text-text-muted text-xs">Ideal</Text>
        </View>
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Verify types compile**

Run: `cd life-tracker && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/objectives/ProgressChart.tsx
git commit -m "feat(objectives): create SVG ProgressChart with real vs ideal curves"
```

---

## Task 11: Create ObjectiveDetail component

Full detail view for one objective: chart, update history, quick update button.

**Files:**
- Create: `components/objectives/ObjectiveDetail.tsx`

- [ ] **Step 1: Create the component**

Create `components/objectives/ObjectiveDetail.tsx`:

```typescript
import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ProgressBar } from "../ui/ProgressBar";
import { ProgressChart } from "./ProgressChart";
import { useObjectiveStore } from "../../stores/objectiveStore";
import { colors } from "../../lib/theme";
import type { Tables } from "../../types/database";

type Props = {
  objective: Tables<"objectives">;
  visionColor?: string;
  onUpdate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ObjectiveDetail({
  objective,
  visionColor,
  onUpdate,
  onEdit,
  onDelete,
  onClose,
}: Props) {
  const { updates, fetchUpdates } = useObjectiveStore();
  const objUpdates = updates[objective.id] || [];
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - 64; // account for padding

  useEffect(() => {
    fetchUpdates(objective.id);
  }, [objective.id]);

  const progress =
    objective.target_value && objective.target_value > 0
      ? objective.current_value / objective.target_value
      : 0;

  return (
    <ScrollView className="flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Pressable onPress={onClose} className="p-1 active:opacity-60">
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <View className="flex-row gap-2">
          <Pressable onPress={onEdit} className="p-2 active:opacity-60">
            <Feather name="edit-2" size={18} color={colors.textMuted} />
          </Pressable>
          <Pressable onPress={onDelete} className="p-2 active:opacity-60">
            <Feather name="trash-2" size={18} color={colors.danger} />
          </Pressable>
        </View>
      </View>

      {/* Title + progress */}
      <Text className="text-text text-xl font-bold mb-2">{objective.title}</Text>
      {objective.description ? (
        <Text className="text-text-secondary text-sm mb-3">{objective.description}</Text>
      ) : null}

      <View className="flex-row items-center gap-3 mb-1">
        <Text className="text-text text-2xl font-bold">
          {objective.current_value}
        </Text>
        <Text className="text-text-muted text-base">
          / {objective.target_value} {objective.unit}
        </Text>
      </View>
      <ProgressBar
        progress={progress}
        color={visionColor ?? colors.primary}
        height={8}
        className="mb-2"
      />
      <Text className="text-text-muted text-xs mb-6">
        {Math.round(progress * 100)}% complete
        {objective.deadline && ` — Deadline : ${new Date(objective.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`}
      </Text>

      {/* Update button */}
      <Pressable
        onPress={onUpdate}
        className="flex-row items-center justify-center py-3 rounded-button mb-6 active:opacity-80"
        style={{ backgroundColor: (visionColor ?? colors.primary) + "20" }}
      >
        <Feather name="trending-up" size={18} color={visionColor ?? colors.primary} />
        <Text className="font-semibold ml-2" style={{ color: visionColor ?? colors.primary }}>
          Mettre a jour la progression
        </Text>
      </Pressable>

      {/* Chart */}
      <Text className="text-text text-base font-bold mb-3">Evolution</Text>
      {objUpdates.length > 0 ? (
        <ProgressChart
          objective={objective}
          updates={objUpdates}
          width={chartWidth}
          height={200}
        />
      ) : (
        <View className="bg-surface rounded-card p-6 items-center mb-4">
          <Text className="text-text-muted text-sm">
            Aucune mise a jour pour le moment
          </Text>
        </View>
      )}

      {/* Update history */}
      <Text className="text-text text-base font-bold mt-6 mb-3">Historique</Text>
      {objUpdates.length === 0 ? (
        <Text className="text-text-muted text-sm">Pas encore de mises a jour</Text>
      ) : (
        [...objUpdates].reverse().map((u) => (
          <View key={u.id} className="flex-row items-start py-3 border-b border-surface-light">
            <View
              className="items-center justify-center mr-3 mt-1"
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: (visionColor ?? colors.primary) + "20",
              }}
            >
              <Feather
                name={u.new_value > u.previous_value ? "arrow-up" : "arrow-down"}
                size={14}
                color={u.new_value > u.previous_value ? colors.success : colors.warning}
              />
            </View>
            <View className="flex-1">
              <Text className="text-text text-sm">
                {u.previous_value} → {u.new_value} {objective.unit}
              </Text>
              {u.note ? (
                <Text className="text-text-muted text-xs mt-1">{u.note}</Text>
              ) : null}
              <Text className="text-text-muted text-xs mt-1">{formatDate(u.created_at)}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}
```

- [ ] **Step 2: Verify types compile**

Run: `cd life-tracker && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add components/objectives/ObjectiveDetail.tsx
git commit -m "feat(objectives): create ObjectiveDetail with chart and history"
```

---

## Task 12: Build main Objectives screen

Replace the placeholder with the full objectives screen: visions list, bottom sheets, confirm modals, and detail view.

**Files:**
- Modify: `app/(tabs)/objectives.tsx`

- [ ] **Step 1: Replace the placeholder screen**

Replace entire content of `app/(tabs)/objectives.tsx` with:

```typescript
import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import GorhomBottomSheet from "@gorhom/bottom-sheet";
import { SafeScreen } from "../../components/SafeScreen";
import { BottomSheet } from "../../components/ui/BottomSheet";
import { Button } from "../../components/ui/Button";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { VisionCard } from "../../components/objectives/VisionCard";
import { VisionForm } from "../../components/objectives/VisionForm";
import { ObjectiveForm } from "../../components/objectives/ObjectiveForm";
import { ObjectiveDetail } from "../../components/objectives/ObjectiveDetail";
import { UpdateValueForm } from "../../components/objectives/UpdateValueForm";
import { useVisionStore } from "../../stores/visionStore";
import { useObjectiveStore } from "../../stores/objectiveStore";
import { colors } from "../../lib/theme";
import type { Tables } from "../../types/database";

type SheetMode =
  | { type: "none" }
  | { type: "addVision" }
  | { type: "editVision"; vision: Tables<"visions"> }
  | { type: "addObjective"; visionId: string }
  | { type: "editObjective"; objective: Tables<"objectives"> }
  | { type: "updateValue"; objective: Tables<"objectives"> }
  | { type: "detail"; objective: Tables<"objectives">; visionColor: string };

type ConfirmAction =
  | { type: "none" }
  | { type: "deleteVision"; vision: Tables<"visions"> }
  | { type: "deleteObjective"; objective: Tables<"objectives"> };

export default function ObjectivesScreen() {
  const { visions, loading: visionsLoading, fetchVisions, addVision, updateVision, deleteVision } = useVisionStore();
  const { objectives, loading: objectivesLoading, fetchObjectives, addObjective, updateObjective, deleteObjective, logUpdate, getObjectivesByVision } = useObjectiveStore();

  const sheetRef = useRef<GorhomBottomSheet>(null);
  const [sheetMode, setSheetMode] = useState<SheetMode>({ type: "none" });
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>({ type: "none" });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchVisions();
    fetchObjectives();
  }, []);

  // --- Sheet helpers ---
  const openSheet = useCallback((mode: SheetMode) => {
    setSheetMode(mode);
    setTimeout(() => sheetRef.current?.snapToIndex(0), 50);
  }, []);

  const closeSheet = useCallback(() => {
    sheetRef.current?.close();
    setSheetMode({ type: "none" });
  }, []);

  // --- Vision CRUD handlers ---
  const handleAddVision = async (data: { title: string; description: string; icon: string; color: string }) => {
    setFormLoading(true);
    await addVision(data);
    setFormLoading(false);
    closeSheet();
  };

  const handleEditVision = async (data: { title: string; description: string; icon: string; color: string }) => {
    if (sheetMode.type !== "editVision") return;
    setFormLoading(true);
    await updateVision(sheetMode.vision.id, data);
    setFormLoading(false);
    closeSheet();
  };

  const handleDeleteVision = async () => {
    if (confirmAction.type !== "deleteVision") return;
    await deleteVision(confirmAction.vision.id);
    setConfirmAction({ type: "none" });
  };

  // --- Objective CRUD handlers ---
  const handleAddObjective = async (data: {
    vision_id: string;
    title: string;
    description: string;
    unit: string;
    current_value: number;
    target_value: number;
    deadline: string;
  }) => {
    setFormLoading(true);
    await addObjective(data);
    setFormLoading(false);
    closeSheet();
  };

  const handleEditObjective = async (data: {
    vision_id: string;
    title: string;
    description: string;
    unit: string;
    current_value: number;
    target_value: number;
    deadline: string;
  }) => {
    if (sheetMode.type !== "editObjective") return;
    setFormLoading(true);
    await updateObjective(sheetMode.objective.id, data);
    setFormLoading(false);
    closeSheet();
  };

  const handleDeleteObjective = async () => {
    if (confirmAction.type !== "deleteObjective") return;
    await deleteObjective(confirmAction.objective.id);
    setConfirmAction({ type: "none" });
    // If we were viewing detail, go back to list
    if (sheetMode.type === "detail") closeSheet();
  };

  const handleLogUpdate = async (newValue: number, note: string) => {
    if (sheetMode.type !== "updateValue") return;
    setFormLoading(true);
    await logUpdate(sheetMode.objective.id, newValue, note);
    setFormLoading(false);
    closeSheet();
  };

  // --- Render helpers ---
  const loading = visionsLoading || objectivesLoading;

  const renderSheetContent = () => {
    switch (sheetMode.type) {
      case "addVision":
        return (
          <VisionForm
            onSubmit={handleAddVision}
            onCancel={closeSheet}
            loading={formLoading}
          />
        );
      case "editVision":
        return (
          <VisionForm
            initial={sheetMode.vision}
            onSubmit={handleEditVision}
            onCancel={closeSheet}
            loading={formLoading}
          />
        );
      case "addObjective":
        return (
          <ObjectiveForm
            visions={visions}
            initialVisionId={sheetMode.visionId}
            onSubmit={handleAddObjective}
            onCancel={closeSheet}
            loading={formLoading}
          />
        );
      case "editObjective":
        return (
          <ObjectiveForm
            visions={visions}
            initial={sheetMode.objective}
            onSubmit={handleEditObjective}
            onCancel={closeSheet}
            loading={formLoading}
          />
        );
      case "updateValue":
        return (
          <UpdateValueForm
            objective={sheetMode.objective}
            onSubmit={handleLogUpdate}
            onCancel={closeSheet}
            loading={formLoading}
          />
        );
      case "detail":
        return (
          <ObjectiveDetail
            objective={sheetMode.objective}
            visionColor={sheetMode.visionColor}
            onUpdate={() => {
              closeSheet();
              setTimeout(() => openSheet({ type: "updateValue", objective: sheetMode.objective }), 300);
            }}
            onEdit={() => {
              closeSheet();
              setTimeout(() => openSheet({ type: "editObjective", objective: sheetMode.objective }), 300);
            }}
            onDelete={() => setConfirmAction({ type: "deleteObjective", objective: sheetMode.objective })}
            onClose={closeSheet}
          />
        );
      default:
        return null;
    }
  };

  const sheetTitle = (() => {
    switch (sheetMode.type) {
      case "addVision": return "Nouvelle vision";
      case "editVision": return "Modifier la vision";
      case "addObjective": return "Nouvel objectif";
      case "editObjective": return "Modifier l'objectif";
      case "updateValue": return "Mise a jour";
      case "detail": return undefined;
      default: return undefined;
    }
  })();

  const snapPoints = sheetMode.type === "detail" ? ["85%"] : ["70%", "90%"];

  return (
    <SafeScreen>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4 mt-2">
        <Text className="text-text text-2xl font-bold">Objectifs</Text>
        <Pressable
          onPress={() => openSheet({ type: "addVision" })}
          className="flex-row items-center bg-primary px-3 py-2 rounded-button active:opacity-80"
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text className="text-white text-sm font-semibold ml-1">Vision</Text>
        </Pressable>
      </View>

      {/* Content */}
      {loading && visions.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : visions.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Feather name="target" size={48} color={colors.textMuted} />
          <Text className="text-text text-lg font-bold mt-4 mb-2">Aucune vision</Text>
          <Text className="text-text-secondary text-sm text-center mb-6">
            Commence par creer une vision — une grande direction de vie — puis ajoute des objectifs mesurables.
          </Text>
          <Button title="Creer ma premiere vision" onPress={() => openSheet({ type: "addVision" })} />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {visions.map((vision) => (
            <VisionCard
              key={vision.id}
              vision={vision}
              objectives={getObjectivesByVision(vision.id)}
              onPressObjective={(obj) =>
                openSheet({ type: "detail", objective: obj, visionColor: vision.color })
              }
              onAddObjective={() => openSheet({ type: "addObjective", visionId: vision.id })}
              onEditVision={() => openSheet({ type: "editVision", vision })}
              onDeleteVision={() => setConfirmAction({ type: "deleteVision", vision })}
            />
          ))}
          {/* Spacer for bottom tabs */}
          <View className="h-4" />
        </ScrollView>
      )}

      {/* Bottom Sheet */}
      <BottomSheet
        ref={sheetRef}
        title={sheetTitle}
        snapPoints={snapPoints}
        onClose={() => setSheetMode({ type: "none" })}
      >
        {renderSheetContent()}
      </BottomSheet>

      {/* Confirm Modal — delete vision */}
      <ConfirmModal
        visible={confirmAction.type === "deleteVision"}
        title="Supprimer cette vision ?"
        message="Tous les objectifs associes seront egalement supprimes. Cette action est irreversible."
        confirmLabel="Supprimer"
        onConfirm={handleDeleteVision}
        onCancel={() => setConfirmAction({ type: "none" })}
      />

      {/* Confirm Modal — delete objective */}
      <ConfirmModal
        visible={confirmAction.type === "deleteObjective"}
        title="Supprimer cet objectif ?"
        message="L'historique des mises a jour sera perdu. Cette action est irreversible."
        confirmLabel="Supprimer"
        onConfirm={handleDeleteObjective}
        onCancel={() => setConfirmAction({ type: "none" })}
      />
    </SafeScreen>
  );
}
```

- [ ] **Step 2: Verify types compile**

Run: `cd life-tracker && npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Test manually**

Run: `cd life-tracker && npx expo start`

Verify:
1. Objectives tab shows empty state with "Creer ma premiere vision" button
2. Tap the button → vision form bottom sheet opens
3. Create a vision → it appears as a card
4. Tap "Ajouter un objectif" → objective form opens
5. Create an objective → it appears under the vision with progress bar
6. Tap an objective → detail view opens in bottom sheet
7. Tap "Mettre a jour la progression" → update form opens
8. Log a value → chart and history appear
9. Delete actions show confirmation modals

- [ ] **Step 4: Commit**

```bash
git add app/(tabs)/objectives.tsx
git commit -m "feat(objectives): build full Objectives screen with visions, CRUD, detail view"
```

---

## Task Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Add icon/color to visions + update types | `types/database.ts` + SQL |
| 2 | Create visionStore | `stores/visionStore.ts` |
| 3 | Create objectiveStore | `stores/objectiveStore.ts` |
| 4 | Create ProgressBar | `components/ui/ProgressBar.tsx` |
| 5 | Create VisionForm | `components/objectives/VisionForm.tsx` |
| 6 | Create ObjectiveForm | `components/objectives/ObjectiveForm.tsx` |
| 7 | Create ObjectiveRow | `components/objectives/ObjectiveRow.tsx` |
| 8 | Create VisionCard | `components/objectives/VisionCard.tsx` |
| 9 | Create UpdateValueForm | `components/objectives/UpdateValueForm.tsx` |
| 10 | Create ProgressChart | `components/objectives/ProgressChart.tsx` |
| 11 | Create ObjectiveDetail | `components/objectives/ObjectiveDetail.tsx` |
| 12 | Build main Objectives screen | `app/(tabs)/objectives.tsx` |
