import { View, Text, TextInput, Pressable } from "react-native";
import { useState } from "react";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../lib/theme";

type Props = {
  index: number;
  completed?: { weightKg: number; reps: number };
  defaultWeight?: number;
  defaultReps?: number;
  onValidate?: (weightKg: number, reps: number) => void;
};

export function SetRow({ index, completed, defaultWeight, defaultReps, onValidate }: Props) {
  const [weight, setWeight] = useState(String(defaultWeight ?? ""));
  const [reps, setReps] = useState(String(defaultReps ?? ""));

  if (completed) {
    return (
      <View className="flex-row items-center py-2 px-3 bg-surface-light/30 rounded-sm mb-1">
        <Text className="text-text-secondary w-8 text-sm">{index + 1}</Text>
        <Text className="text-text flex-1 text-sm">{completed.weightKg} kg</Text>
        <Text className="text-text flex-1 text-sm">{completed.reps} reps</Text>
        <Feather name="check" size={16} color={colors.success} />
      </View>
    );
  }

  return (
    <View className="flex-row items-center py-2 px-3 bg-surface rounded-sm mb-1">
      <Text className="text-text-secondary w-8 text-sm">{index + 1}</Text>
      <TextInput
        className="text-text flex-1 text-sm bg-surface-light rounded-sm px-2 py-1 mr-2"
        placeholder="kg"
        placeholderTextColor={colors.textMuted}
        keyboardType="numeric"
        value={weight}
        onChangeText={setWeight}
      />
      <TextInput
        className="text-text flex-1 text-sm bg-surface-light rounded-sm px-2 py-1 mr-2"
        placeholder="reps"
        placeholderTextColor={colors.textMuted}
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
        className="bg-primary rounded-full w-8 h-8 items-center justify-center active:opacity-80"
      >
        <Feather name="check" size={16} color="#fff" />
      </Pressable>
    </View>
  );
}
