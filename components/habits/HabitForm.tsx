import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Feather } from "@expo/vector-icons";
import { useColors } from "../../lib/theme";
import { Button } from "../ui/Button";
import { IconPicker } from "./IconPicker";
import { HABIT_MOMENT_LABELS, type HabitMoment } from "../../lib/constants";
import type { Tables } from "../../types/database";
import { DAY_LABELS } from "../../lib/dateUtils";

type FrequencyType = "daily" | "specific_days" | "x_per_week";
type HabitType = "positive" | "avoid";

export type HabitFormData = {
  name: string;
  icon: string;
  color: string;
  habit_type: HabitType;
  frequency_type: FrequencyType;
  frequency_value: number;
  frequency_days: number[];
  time_of_day: HabitMoment;
  reminder_time: string | null;
};

type Props = {
  initial?: Tables<"habits">;
  onSubmit: (data: HabitFormData) => void;
  onCancel: () => void;
  loading?: boolean;
};

const FREQUENCY_OPTIONS: { value: FrequencyType; label: string }[] = [
  { value: "daily", label: "Tous les jours" },
  { value: "specific_days", label: "Certains jours" },
  { value: "x_per_week", label: "X fois / semaine" },
];

const HABIT_COLORS = [
  "#D4AA40", "#E8C860", "#3b82f6", "#06b6d4",
  "#22c55e", "#eab308", "#f97316", "#ef4444",
];

export function HabitForm({ initial, onSubmit, onCancel, loading }: Props) {
  const c = useColors();
  const [habitType, setHabitType] = useState<HabitType>(initial?.habit_type ?? "positive");
  const [name, setName] = useState(initial?.name ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "star");
  const [color, setColor] = useState(initial?.color ?? "#D4AA40");
  const [frequencyType, setFrequencyType] = useState<FrequencyType>(
    initial?.frequency_type ?? "daily"
  );
  const [frequencyValue, setFrequencyValue] = useState(initial?.frequency_value ?? 1);
  const [frequencyDays, setFrequencyDays] = useState<number[]>(
    initial?.frequency_days ?? []
  );
  const [timeOfDay, setTimeOfDay] = useState<HabitMoment>(
    initial?.time_of_day ?? "anytime"
  );
  const [reminderTime, setReminderTime] = useState<string | null>(
    initial?.reminder_time ?? null
  );
  const [showTimePicker, setShowTimePicker] = useState(false);

  const toggleDay = (day: number) => {
    setFrequencyDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      icon,
      color,
      habit_type: habitType,
      frequency_type: frequencyType,
      frequency_value: frequencyValue,
      frequency_days: frequencyDays,
      time_of_day: timeOfDay,
      reminder_time: reminderTime,
    });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      {/* Habit Type Toggle */}
      <Text className="text-sm mb-2" style={{ color: c.textSecondary }}>Type d'habitude</Text>
      <View className="flex-row rounded-button p-1 mb-4" style={{ backgroundColor: c.surface }}>
        <Pressable
          onPress={() => setHabitType("positive")}
          className="flex-1 flex-row items-center justify-center py-2 rounded-button gap-2"
          style={habitType === "positive" ? { backgroundColor: c.primary } : undefined}
        >
          <Feather
            name="check-circle"
            size={16}
            color={habitType === "positive" ? c.primaryOnText : c.textSecondary}
          />
          <Text
            className="text-sm font-semibold"
            style={{ color: habitType === "positive" ? c.primaryOnText : c.textSecondary }}
          >
            Faire
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setHabitType("avoid")}
          className="flex-1 flex-row items-center justify-center py-2 rounded-button gap-2"
          style={habitType === "avoid" ? { backgroundColor: c.primary } : undefined}
        >
          <Feather
            name="shield"
            size={16}
            color={habitType === "avoid" ? c.primaryOnText : c.textSecondary}
          />
          <Text
            className="text-sm font-semibold"
            style={{ color: habitType === "avoid" ? c.primaryOnText : c.textSecondary }}
          >
            Eviter
          </Text>
        </Pressable>
      </View>

      {/* Name */}
      <Text className="text-sm mb-1" style={{ color: c.textSecondary }}>
        {habitType === "positive" ? "Que veux-tu faire ?" : "Que veux-tu eviter ?"}
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={habitType === "positive" ? "Ex: Meditation" : "Ex: Pas de reseaux sociaux"}
        placeholderTextColor={c.textMuted}
        className="rounded-button px-4 py-3 text-base mb-4"
        style={{ backgroundColor: c.surfaceLight, color: c.text }}
      />

      {/* Icon Picker */}
      <IconPicker selected={icon} onSelect={setIcon} />

      {/* Color Picker */}
      <Text className="text-sm mb-2 mt-4" style={{ color: c.textSecondary }}>Couleur</Text>
      <View className="flex-row gap-2 mb-4">
        {HABIT_COLORS.map((clr) => (
          <Pressable
            key={clr}
            onPress={() => setColor(clr)}
            className={`w-8 h-8 rounded-full items-center justify-center ${
              color === clr ? "border-2 border-white" : ""
            }`}
            style={{ backgroundColor: clr }}
          >
            {color === clr && <Feather name="check" size={14} color="#fff" />}
          </Pressable>
        ))}
      </View>

      {/* Frequency */}
      <Text className="text-sm mb-2" style={{ color: c.textSecondary }}>Frequence</Text>
      <View className="flex-row gap-2 mb-3">
        {FREQUENCY_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => setFrequencyType(opt.value)}
            className="flex-1 py-2 rounded-button items-center"
            style={{ backgroundColor: frequencyType === opt.value ? c.primary : c.surfaceLight }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: frequencyType === opt.value ? c.primaryOnText : c.textSecondary }}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Specific days picker */}
      {frequencyType === "specific_days" && (
        <View className="flex-row gap-2 mb-4">
          {DAY_LABELS.map((label, i) => (
            <Pressable
              key={i}
              onPress={() => toggleDay(i)}
              className="flex-1 py-2 rounded-lg items-center"
              style={{ backgroundColor: frequencyDays.includes(i) ? c.primary : c.surfaceLight }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: frequencyDays.includes(i) ? c.primaryOnText : c.textSecondary }}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* X per week value */}
      {frequencyType === "x_per_week" && (
        <View className="flex-row items-center gap-3 mb-4">
          <Pressable
            onPress={() => setFrequencyValue(Math.max(1, frequencyValue - 1))}
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{ backgroundColor: c.surfaceLight }}
          >
            <Feather name="minus" size={16} color={c.text} />
          </Pressable>
          <Text className="text-lg font-bold" style={{ color: c.text }}>{frequencyValue}</Text>
          <Pressable
            onPress={() => setFrequencyValue(Math.min(7, frequencyValue + 1))}
            className="w-8 h-8 rounded-full items-center justify-center"
            style={{ backgroundColor: c.surfaceLight }}
          >
            <Feather name="plus" size={16} color={c.text} />
          </Pressable>
          <Text className="text-sm" style={{ color: c.textSecondary }}>fois par semaine</Text>
        </View>
      )}

      {/* Time of Day */}
      <Text className="text-sm mb-2" style={{ color: c.textSecondary }}>Moment de la journee</Text>
      <View className="flex-row gap-2 mb-6">
        {(Object.entries(HABIT_MOMENT_LABELS) as [HabitMoment, string][]).map(
          ([key, label]) => (
            <Pressable
              key={key}
              onPress={() => setTimeOfDay(key)}
              className="flex-1 py-2 rounded-button items-center"
              style={{ backgroundColor: timeOfDay === key ? c.primary : c.surfaceLight }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: timeOfDay === key ? c.primaryOnText : c.textSecondary }}
              >
                {label}
              </Text>
            </Pressable>
          )
        )}
      </View>

      {/* Reminder Time */}
      <Text className="text-sm mb-2" style={{ color: c.textSecondary }}>Rappel</Text>
      <View className="flex-row items-center gap-3 mb-6">
        <Pressable
          onPress={() => {
            if (reminderTime) {
              setReminderTime(null);
            } else {
              setReminderTime("08:00");
              setShowTimePicker(true);
            }
          }}
          className="flex-row items-center gap-2 px-4 py-3 rounded-button flex-1"
          style={{ backgroundColor: c.surfaceLight }}
        >
          <Feather
            name={reminderTime ? "bell" : "bell-off"}
            size={16}
            color={reminderTime ? c.primary : c.textMuted}
          />
          <Text style={{ color: reminderTime ? c.text : c.textMuted }} className="text-base">
            {reminderTime ? `Tous les jours a ${reminderTime}` : "Aucun rappel"}
          </Text>
        </Pressable>
        {reminderTime && (
          <Pressable
            onPress={() => setShowTimePicker(true)}
            className="px-3 py-3 rounded-button"
            style={{ backgroundColor: c.primary }}
          >
            <Feather name="edit-2" size={16} color={c.primaryOnText} />
          </Pressable>
        )}
      </View>
      {showTimePicker && (
        <DateTimePicker
          value={(() => {
            const d = new Date();
            if (reminderTime) {
              const [h, m] = reminderTime.split(":").map(Number);
              d.setHours(h, m, 0, 0);
            }
            return d;
          })()}
          mode="time"
          is24Hour={true}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, selected) => {
            setShowTimePicker(Platform.OS === "ios");
            if (selected) {
              const h = String(selected.getHours()).padStart(2, "0");
              const m = String(selected.getMinutes()).padStart(2, "0");
              setReminderTime(`${h}:${m}`);
            }
          }}
        />
      )}

      {/* Submit */}
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button title="Annuler" onPress={onCancel} variant="secondary" />
        </View>
        <View className="flex-1">
          <Button
            title={initial ? "Modifier" : "Creer"}
            onPress={handleSubmit}
            loading={loading}
            disabled={!name.trim()}
          />
        </View>
      </View>
    </ScrollView>
  );
}
