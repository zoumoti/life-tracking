import { forwardRef, useState, useEffect } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
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
    const [priority, setPriority] = useState<TaskPriority>("normal");
    const [notes, setNotes] = useState("");

    useEffect(() => {
      if (editingTask) {
        setTitle(editingTask.title);
        setDueDate(editingTask.due_date ?? "");
        setPriority(editingTask.priority);
        setNotes(editingTask.notes ?? "");
      } else {
        setTitle("");
        setDueDate("");
        setPriority("normal");
        setNotes("");
      }
    }, [editingTask]);

    const handleSave = () => {
      if (!title.trim()) return;
      onSave({
        title: title.trim(),
        due_date: dueDate.trim() || null,
        priority,
        notes: notes.trim() || null,
      });
    };

    return (
      <BottomSheet
        ref={ref}
        title={editingTask ? "Modifier" : "Nouvelle tache"}
        snapPoints={["65%", "85%"]}
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

        {/* Due date */}
        <Text className="text-sm font-semibold mb-1" style={{ color: c.textSecondary }}>
          Date (YYYY-MM-DD)
        </Text>
        <TextInput
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="2026-04-15"
          placeholderTextColor={c.textMuted}
          className="rounded-xl px-4 py-3 text-base mb-4"
          style={{ backgroundColor: c.surfaceLight, color: c.text }}
          keyboardType="numbers-and-punctuation"
        />

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
