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
import { colors } from "../../lib/theme";

export default function HabitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { habits, completions, deleteHabit, getCompletedDatesForHabit, fetchCompletions } =
    useHabitStore();
  const [showDelete, setShowDelete] = useState(false);
  const [monthYear, setMonthYear] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const habit = habits.find((h) => h.id === id);
  const today = toDateString();

  // Fetch extended completions for this habit (1 year)
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
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-text-secondary">Habitude introuvable</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: habit.name,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <ScrollView className="flex-1 bg-background px-4 pt-4">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <View
            className="w-12 h-12 rounded-xl items-center justify-center mr-4"
            style={{ backgroundColor: (habit.color || colors.primary) + "20" }}
          >
            <Feather
              name={(habit.icon as any) || "circle"}
              size={24}
              color={habit.color || colors.primary}
            />
          </View>
          <View className="flex-1">
            <Text className="text-text text-xl font-bold">{habit.name}</Text>
            {streak.warning && (
              <View className="flex-row items-center mt-1">
                <Feather name="alert-triangle" size={14} color={colors.warning} />
                <Text className="text-xs ml-1" style={{ color: colors.warning }}>
                  Attention ! Un jour de plus et le streak tombe
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
        />

        {/* Streak Chart */}
        <Card className="mt-4">
          <StreakChart habit={habit} completedDates={completedDates} days={30} />
        </Card>

        {/* Calendar History */}
        <Card className="mt-4 mb-4">
          <Text className="text-text font-bold text-base mb-3">Historique</Text>
          <MonthView
            habits={[habit]}
            completions={completions}
            year={monthYear.year}
            month={monthYear.month}
            onChangeMonth={handleChangeMonth}
          />
        </Card>

        {/* Delete button */}
        <Pressable
          onPress={() => setShowDelete(true)}
          className="flex-row items-center justify-center py-4 mb-8"
        >
          <Feather name="trash-2" size={18} color={colors.danger} />
          <Text className="ml-2 font-semibold" style={{ color: colors.danger }}>
            Supprimer cette habitude
          </Text>
        </Pressable>
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
