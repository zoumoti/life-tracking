import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { SafeScreen } from "../../components/SafeScreen";
import { Card } from "../../components/ui/Card";
import { BottomSheet } from "../../components/ui/BottomSheet";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { HabitItem } from "../../components/habits/HabitItem";
import { HabitForm } from "../../components/habits/HabitForm";
import { WeekView } from "../../components/habits/WeekView";
import { MonthView } from "../../components/habits/MonthView";
import { useHabitStore } from "../../stores/habitStore";
import { toDateString, addDays } from "../../lib/dateUtils";
import { isHabitScheduledForDate, calculateStreak } from "../../lib/habitUtils";
import { useColors } from "../../lib/theme";

type ViewMode = "day" | "week" | "month";

export default function HabitsScreen() {
  const c = useColors();
  const router = useRouter();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [monthYear, setMonthYear] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const {
    habits,
    completions,
    loading,
    fetchHabits,
    fetchCompletions,
    createHabit,
    deleteHabit,
    toggleCompletion,
    getCompletedDatesForHabit,
  } = useHabitStore();

  const today = toDateString();

  // Initial fetch
  useEffect(() => {
    fetchHabits();
    // Fetch 90 days of completions for streak calculations
    fetchCompletions(addDays(today, -90), today);
  }, []);

  // Habits scheduled for today
  const todayHabits = useMemo(
    () => habits.filter((h) => isHabitScheduledForDate(h, today)),
    [habits, today]
  );

  // Sort: uncompleted first, then completed
  const sortedTodayHabits = useMemo(() => {
    return [...todayHabits].sort((a, b) => {
      const aCompleted = completions[`${a.id}:${today}`] ? 1 : 0;
      const bCompleted = completions[`${b.id}:${today}`] ? 1 : 0;
      return aCompleted - bCompleted;
    });
  }, [todayHabits, completions, today]);

  const completedCount = useMemo(
    () => todayHabits.filter((h) => completions[`${h.id}:${today}`]).length,
    [todayHabits, completions, today]
  );

  const handleCreate = useCallback(
    async (data: any) => {
      await createHabit({
        name: data.name,
        icon: data.icon,
        color: data.color,
        habit_type: data.habit_type,
        frequency_type: data.frequency_type,
        frequency_value: data.frequency_value,
        frequency_days: data.frequency_days.length > 0 ? data.frequency_days : null,
        time_of_day: data.time_of_day,
      });
      setCreating(false);
      bottomSheetRef.current?.dismiss();
    },
    [createHabit]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteTarget) {
      await deleteHabit(deleteTarget);
      setDeleteTarget(null);
    }
  }, [deleteTarget, deleteHabit]);

  const openCreate = () => {
    setCreating(true);
    bottomSheetRef.current?.present();
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

  return (
    <SafeScreen>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4 mt-2">
        <Text style={{ color: c.text }} className="text-2xl font-bold">Habitudes</Text>
        {viewMode === "day" && (
          <Text style={{ color: c.textSecondary }} className="text-sm">
            {completedCount}/{todayHabits.length}
          </Text>
        )}
      </View>

      {/* View mode tabs */}
      <View style={{ backgroundColor: c.surface }} className="flex-row rounded-button p-1 mb-4">
        {(["day", "week", "month"] as ViewMode[]).map((mode) => (
          <Pressable
            key={mode}
            onPress={() => setViewMode(mode)}
            className="flex-1 py-2 rounded-button items-center"
            style={viewMode === mode ? { backgroundColor: c.primary } : undefined}
          >
            <Text
              style={{ color: viewMode === mode ? c.primaryOnText : c.textSecondary }}
              className="text-sm font-semibold"
            >
              {mode === "day" ? "Jour" : mode === "week" ? "Semaine" : "Mois"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      {viewMode === "day" && (
        <>
          {sortedTodayHabits.length === 0 && !loading ? (
            <View className="flex-1 items-center justify-center">
              <Feather name="plus-circle" size={48} color={c.textMuted} />
              <Text style={{ color: c.textSecondary }} className="text-base mt-4">
                Aucune habitude pour aujourd'hui
              </Text>
              <Text style={{ color: c.textMuted }} className="text-sm mt-1">
                Appuie sur + pour en creer une
              </Text>
            </View>
          ) : (
            <Card className="p-0">
              <FlatList
                data={sortedTodayHabits}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => {
                  const completed = !!completions[`${item.id}:${today}`];
                  const dates = getCompletedDatesForHabit(item.id);
                  const streak = calculateStreak(item, dates, today);
                  return (
                    <HabitItem
                      habit={item}
                      completed={completed}
                      streak={streak}
                      onToggle={() => toggleCompletion(item.id, today)}
                      onPress={() => router.push(`/habit/${item.id}` as any)}
                      onLongPress={() => setDeleteTarget(item.id)}
                    />
                  );
                }}
                ItemSeparatorComponent={() => (
                  <View style={{ height: 1, backgroundColor: c.surface }} className="mx-3" />
                )}
              />
            </Card>
          )}
        </>
      )}

      {viewMode === "week" && (
        <Card>
          <WeekView habits={habits} completions={completions} />
        </Card>
      )}

      {viewMode === "month" && (
        <Card>
          <MonthView
            habits={habits}
            completions={completions}
            year={monthYear.year}
            month={monthYear.month}
            onChangeMonth={handleChangeMonth}
          />
        </Card>
      )}

      {/* FAB */}
      <Pressable
        onPress={openCreate}
        className="absolute bottom-6 right-4 w-14 h-14 rounded-full items-center justify-center active:opacity-80"
        style={{ elevation: 4, backgroundColor: c.primary }}
      >
        <Feather name="plus" size={28} color="#1a1608" />
      </Pressable>

      {/* Create Habit Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        title="Nouvelle habitude"
        snapPoints={["70%", "90%"]}
        onClose={() => setCreating(false)}
      >
        {creating && (
          <HabitForm
            onSubmit={handleCreate}
            onCancel={() => {
              setCreating(false);
              bottomSheetRef.current?.dismiss();
            }}
          />
        )}
      </BottomSheet>

      {/* Delete Confirmation */}
      <ConfirmModal
        visible={!!deleteTarget}
        title="Supprimer l'habitude"
        message="Es-tu sur ? Cette action est irreversible. L'historique sera perdu."
        confirmLabel="Supprimer"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </SafeScreen>
  );
}
