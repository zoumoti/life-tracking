import { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { Card } from "../../components/ui/Card";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { HabitStats } from "../../components/habits/HabitStats";
import { StreakChart } from "../../components/habits/StreakChart";
import { CompletionTrend } from "../../components/habits/CompletionTrend";
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

        {/* Completion Trend */}
        <Card className="mt-4">
          <CompletionTrend habit={habit} completedDates={completedDates} />
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
