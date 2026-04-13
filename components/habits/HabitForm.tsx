import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../lib/theme";
import { Button } from "../ui/Button";
import { IconPicker } from "./IconPicker";
import { HABIT_MOMENT_LABELS, type HabitMoment } from "../../lib/constants";
import type { Tables } from "../../types/database";
import { DAY_LABELS } from "../../lib/dateUtils";

type FrequencyType = "daily" | "specific_days" | "x_per_week";

type HabitFormData = {
  name: string;
  icon: string;
  color: string;
  frequency_type: FrequencyType;
  frequency_value: number;
  frequency_days: number[];
  time_of_day: HabitMoment;
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
  "#6C5CE7", "#a855f7", "#3b82f6", "#06b6d4",
  "#22c55e", "#eab308", "#f97316", "#ef4444",
];

export function HabitForm({ initial, onSubmit, onCancel, loading }: Props) {
  const [name, setName] = useState(initial?.name ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "star");
  const [color, setColor] = useState(initial?.color ?? "#6C5CE7");
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
      frequency_type: frequencyType,
      frequency_value: frequencyValue,
      frequency_days: frequencyDays,
      time_of_day: timeOfDay,
    });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      {/* Name */}
      <Text className="text-text-secondary text-sm mb-1">Nom</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Ex: Meditation"
        placeholderTextColor={colors.textMuted}
        className="bg-surface-light rounded-button px-4 py-3 text-text text-base mb-4"
      />

      {/* Icon Picker */}
      <IconPicker selected={icon} onSelect={setIcon} />

      {/* Color Picker */}
      <Text className="text-text-secondary text-sm mb-2 mt-4">Couleur</Text>
      <View className="flex-row gap-2 mb-4">
        {HABIT_COLORS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setColor(c)}
            className={`w-8 h-8 rounded-full items-center justify-center ${
              color === c ? "border-2 border-white" : ""
            }`}
            style={{ backgroundColor: c }}
          >
            {color === c && <Feather name="check" size={14} color="#fff" />}
          </Pressable>
        ))}
      </View>

      {/* Frequency */}
      <Text className="text-text-secondary text-sm mb-2">Frequence</Text>
      <View className="flex-row gap-2 mb-3">
        {FREQUENCY_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => setFrequencyType(opt.value)}
            className={`flex-1 py-2 rounded-button items-center ${
              frequencyType === opt.value ? "bg-primary" : "bg-surface-light"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                frequencyType === opt.value ? "text-white" : "text-text-secondary"
              }`}
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
              className={`flex-1 py-2 rounded-lg items-center ${
                frequencyDays.includes(i) ? "bg-primary" : "bg-surface-light"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  frequencyDays.includes(i) ? "text-white" : "text-text-secondary"
                }`}
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
            className="w-8 h-8 rounded-full bg-surface-light items-center justify-center"
          >
            <Feather name="minus" size={16} color={colors.text} />
          </Pressable>
          <Text className="text-text text-lg font-bold">{frequencyValue}</Text>
          <Pressable
            onPress={() => setFrequencyValue(Math.min(7, frequencyValue + 1))}
            className="w-8 h-8 rounded-full bg-surface-light items-center justify-center"
          >
            <Feather name="plus" size={16} color={colors.text} />
          </Pressable>
          <Text className="text-text-secondary text-sm">fois par semaine</Text>
        </View>
      )}

      {/* Time of Day */}
      <Text className="text-text-secondary text-sm mb-2">Moment de la journee</Text>
      <View className="flex-row gap-2 mb-6">
        {(Object.entries(HABIT_MOMENT_LABELS) as [HabitMoment, string][]).map(
          ([key, label]) => (
            <Pressable
              key={key}
              onPress={() => setTimeOfDay(key)}
              className={`flex-1 py-2 rounded-button items-center ${
                timeOfDay === key ? "bg-primary" : "bg-surface-light"
              }`}
            >
              <Text
                className={`text-xs font-semibold ${
                  timeOfDay === key ? "text-white" : "text-text-secondary"
                }`}
              >
                {label}
              </Text>
            </Pressable>
          )
        )}
      </View>

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
