import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  getMonthGrid,
  DAY_LABELS_SHORT,
  MONTH_LABELS,
  toDateString,
  parseDate,
} from "../../lib/dateUtils";
import { isHabitScheduledForDate } from "../../lib/habitUtils";
import { colors } from "../../lib/theme";
import type { Tables } from "../../types/database";

type Props = {
  habits: Tables<"habits">[];
  completions: Record<string, boolean>;
  year: number;
  month: number; // 0-indexed
  onChangeMonth: (delta: number) => void;
};

export function MonthView({ habits, completions, year, month, onChangeMonth }: Props) {
  const grid = getMonthGrid(year, month);
  const todayStr = toDateString();

  function dayIntensity(dateStr: string): number {
    const activeHabits = habits.filter((h) => isHabitScheduledForDate(h, dateStr));
    if (activeHabits.length === 0) return 0;
    const completed = activeHabits.filter(
      (h) => completions[`${h.id}:${dateStr}`]
    ).length;
    return completed / activeHabits.length;
  }

  function intensityColor(intensity: number): string {
    if (intensity === 0) return colors.surface;
    if (intensity < 0.34) return colors.primary + "30";
    if (intensity < 0.67) return colors.primary + "70";
    return colors.primary;
  }

  return (
    <View>
      {/* Month navigation */}
      <View className="flex-row items-center justify-between mb-4 px-2">
        <Pressable onPress={() => onChangeMonth(-1)} hitSlop={12}>
          <Feather name="chevron-left" size={22} color={colors.text} />
        </Pressable>
        <Text className="text-text text-lg font-bold">
          {MONTH_LABELS[month]} {year}
        </Text>
        <Pressable onPress={() => onChangeMonth(1)} hitSlop={12}>
          <Feather name="chevron-right" size={22} color={colors.text} />
        </Pressable>
      </View>

      {/* Day-of-week headers */}
      <View className="flex-row mb-1 px-1">
        {DAY_LABELS_SHORT.map((label, i) => (
          <View key={i} className="flex-1 items-center">
            <Text className="text-text-muted text-xs">{label}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      {Array.from({ length: 6 }, (_, row) => (
        <View key={row} className="flex-row px-1 mb-1">
          {Array.from({ length: 7 }, (_, col) => {
            const idx = row * 7 + col;
            const dateStr = grid[idx];
            const dateObj = parseDate(dateStr);
            const isCurrentMonth = dateObj.getMonth() === month;
            const isT = dateStr === todayStr;
            const intensity = isCurrentMonth ? dayIntensity(dateStr) : 0;

            return (
              <View key={dateStr} className="flex-1 items-center py-1">
                <View
                  className={`w-8 h-8 rounded-lg items-center justify-center ${
                    isT ? "border border-primary" : ""
                  }`}
                  style={{
                    backgroundColor: isCurrentMonth
                      ? intensityColor(intensity)
                      : "transparent",
                  }}
                >
                  <Text
                    className={`text-xs ${
                      !isCurrentMonth
                        ? "text-text-muted opacity-30"
                        : isT
                        ? "text-primary font-bold"
                        : "text-text"
                    }`}
                  >
                    {dateObj.getDate()}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ))}

      {/* Legend */}
      <View className="flex-row items-center justify-center gap-3 mt-3">
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.surface }} />
          <Text className="text-text-muted text-xs">0%</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.primary + "30" }} />
          <Text className="text-text-muted text-xs">&lt;34%</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.primary + "70" }} />
          <Text className="text-text-muted text-xs">&lt;67%</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.primary }} />
          <Text className="text-text-muted text-xs">100%</Text>
        </View>
      </View>
    </View>
  );
}
