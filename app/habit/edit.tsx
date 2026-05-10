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
