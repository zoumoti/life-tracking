import { View, Text, TextInput, Pressable } from "react-native";
import { useState } from "react";
import { Feather } from "@expo/vector-icons";
import { useColors } from "../../lib/theme";

type Props = {
  index: number;
  completed?: { weightKg: number; reps: number };
  defaultWeight?: number;
  defaultReps?: number;
  onValidate?: (weightKg: number, reps: number) => void;
};

export function SetRow({ index, completed, defaultWeight, defaultReps, onValidate }: Props) {
  const c = useColors();
  const [weight, setWeight] = useState(String(defaultWeight ?? ""));
  const [reps, setReps] = useState(String(defaultReps ?? ""));

  if (completed) {
    return (
      <View className="flex-row items-center py-2 px-3 rounded-sm mb-1" style={{ backgroundColor: c.surfaceLight + "4D" }}>
        <Text className="w-8 text-sm" style={{ color: c.textSecondary }}>{index + 1}</Text>
        <Text className="flex-1 text-sm" style={{ color: c.text }}>{completed.weightKg} kg</Text>
        <Text className="flex-1 text-sm" style={{ color: c.text }}>{completed.reps} reps</Text>
        <Feather name="check" size={16} color={c.success} />
      </View>
    );
  }

  return (
    <View className="flex-row items-center py-2 px-3 rounded-sm mb-1" style={{ backgroundColor: c.surface }}>
      <Text className="w-8 text-sm" style={{ color: c.textSecondary }}>{index + 1}</Text>
      <TextInput
        className="flex-1 text-sm rounded-sm px-2 py-1 mr-2"
        style={{ backgroundColor: c.surfaceLight, color: c.text }}
        placeholder="kg"
        placeholderTextColor={c.textMuted}
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
      />
      <TextInput
        className="flex-1 text-sm rounded-sm px-2 py-1 mr-2"
        style={{ backgroundColor: c.surfaceLight, color: c.text }}
        placeholder="reps"
        placeholderTextColor={c.textMuted}
        keyboardType="numeric"
        value={reps}
        onChangeText={setReps}
      />
      <Pressable
        onPress={() => {
          const w = parseFloat(weight);
          const r = parseInt(reps, 10);
          if (!isNaN(w) && !isNaN(r) && w > 0 && r > 0) {
            onValidate?.(w, r);
          }
        }}
        className="rounded-full w-8 h-8 items-center justify-center active:opacity-80"
        style={{ backgroundColor: c.primary }}
      >
        <Feather name="check" size={16} color={c.primaryOnText} />
      </Pressable>
    </View>
  );
}
