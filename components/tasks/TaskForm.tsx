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
