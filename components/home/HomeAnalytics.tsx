import { useMemo } from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card } from "../ui/Card";
import { useColors } from "../../lib/theme";
import { toDateString, addDays, parseDate, isoDayOfWeek } from "../../lib/dateUtils";
import { isHabitScheduledForDate } from "../../lib/habitUtils";
import type { Tables } from "../../types/database";

const DAY_LABELS = ["L", "M", "M", "J", "V", "S", "D"];

type Props = {
  habits: Tables<"habits">[];
  completions: Record<string, boolean>;
  workoutCount: number;
  workoutVolume: number;
  runDistanceKm: number;
  runCount: number;
};

export function HomeAnalytics({
  habits,
  completions,
  workoutCount,
  workoutVolume,
  runDistanceKm,
  runCount,
}: Props) {
  const c = useColors();
  const today = toDateString();

  // Calculate last 7 days habit completion rates (memoized)
  const { weekData, avgRate } = useMemo(() => {
    const data = Array.from({ length: 7 }, (_, i) => {
      const date = addDays(today, i - 6);
      const scheduled = habits.filter((h) => isHabitScheduledForDate(h, date));
      const completed = scheduled.filter((h) => completions[`${h.id}:${date}`]);
      const rate = scheduled.length > 0 ? completed.length / scheduled.length : 0;
      const dayOfWeek = isoDayOfWeek(parseDate(date));
      return { date, rate, label: DAY_LABELS[dayOfWeek], isToday: date === today };
    });
    const avg = data.reduce((sum, d) => sum + d.rate, 0) / 7;
    return { weekData: data, avgRate: avg };
  }, [habits, completions, today]);

  return (
    <View className="mb-4">
      <Text className="font-bold text-base mb-2" style={{ color: c.text }}>
        Cette semaine
      </Text>

      {/* Habit weekly chart */}
      <Card className="mb-3">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Feather name="trending-up" size={16} color={c.primary} />
            <Text className="font-semibold text-sm ml-2" style={{ color: c.text }}>
              Habitudes
            </Text>
          </View>
          <Text className="text-sm font-bold" style={{ color: c.primary }}>
            {Math.round(avgRate * 100)}%
          </Text>
        </View>

        <View className="flex-row items-end justify-between" style={{ height: 80 }}>
          {weekData.map((day, i) => {
            const barHeight = Math.max(day.rate * 64, day.rate > 0 ? 6 : 2);
            return (
              <View key={i} className="flex-1 items-center">
                <View
                  style={{
                    width: 20,
                    height: barHeight,
                    borderRadius: 4,
                    backgroundColor:
                      day.rate === 1
                        ? c.primary
                        : day.rate > 0
                        ? c.primary + "60"
                        : c.surfaceLight,
                  }}
                />
                <Text
                  className="text-xs mt-1"
                  style={{
                    color: day.isToday ? c.primary : c.textMuted,
                    fontWeight: day.isToday ? "700" : "400",
                  }}
                >
                  {day.label}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Sport + Running row */}
      <View className="flex-row gap-3">
        <Card className="flex-1">
          <View className="flex-row items-center mb-2">
            <Feather name="activity" size={14} color={c.primary} />
            <Text className="text-xs font-semibold ml-1" style={{ color: c.textSecondary }}>
              Musculation
            </Text>
          </View>
          <Text className="text-xl font-bold" style={{ color: c.text }}>
            {workoutCount}
          </Text>
          <Text className="text-xs" style={{ color: c.textMuted }}>
            {workoutCount === 1 ? "seance" : "seances"}
          </Text>
          {workoutVolume > 0 && (
            <Text className="text-xs mt-1" style={{ color: c.primary }}>
              {Math.round(workoutVolume)} kg total
            </Text>
          )}
        </Card>

        <Card className="flex-1">
          <View className="flex-row items-center mb-2">
            <Feather name="navigation" size={14} color={c.primary} />
            <Text className="text-xs font-semibold ml-1" style={{ color: c.textSecondary }}>
              Course
            </Text>
          </View>
          <Text className="text-xl font-bold" style={{ color: c.text }}>
            {Math.round(runDistanceKm * 10) / 10} km
          </Text>
          <Text className="text-xs" style={{ color: c.textMuted }}>
            {runCount} {runCount === 1 ? "sortie" : "sorties"}
          </Text>
        </Card>
      </View>
    </View>
  );
}
