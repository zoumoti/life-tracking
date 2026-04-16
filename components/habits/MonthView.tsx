import { useMemo } from "react";
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
import { useColors } from "../../lib/theme";
import type { Tables } from "../../types/database";

type Props = {
  habits: Tables<"habits">[];
  completions: Record<string, boolean>;
  year: number;
  month: number; // 0-indexed
  onChangeMonth: (delta: number) => void;
};

export function MonthView({ habits, completions, year, month, onChangeMonth }: Props) {
  const c = useColors();
  const grid = getMonthGrid(year, month);
  const todayStr = toDateString();

  // Precompute intensity map (avoids recalculating 42 times per render)
  const intensityMap = useMemo(() => {
    const map: Record<string, number> = {};
    grid.forEach((dateStr) => {
      const dateObj = parseDate(dateStr);
      if (dateObj.getMonth() !== month) {
        map[dateStr] = 0;
        return;
      }
      const activeHabits = habits.filter((h) => isHabitScheduledForDate(h, dateStr));
      if (activeHabits.length === 0) {
        map[dateStr] = 0;
        return;
      }
      const completed = activeHabits.filter(
        (h) => completions[`${h.id}:${dateStr}`]
      ).length;
      map[dateStr] = completed / activeHabits.length;
    });
    return map;
  }, [habits, completions, year, month]);

  function intensityColor(intensity: number): string {
    if (intensity === 0) return c.surface;
    if (intensity < 0.34) return c.primary + "30";
    if (intensity < 0.67) return c.primary + "70";
    return c.primary;
  }

  return (
    <View>
      {/* Month navigation */}
      <View className="flex-row items-center justify-between mb-4 px-2">
        <Pressable onPress={() => onChangeMonth(-1)} hitSlop={12}>
          <Feather name="chevron-left" size={22} color={c.text} />
        </Pressable>
        <Text className="text-lg font-bold" style={{ color: c.text }}>
          {MONTH_LABELS[month]} {year}
        </Text>
        <Pressable onPress={() => onChangeMonth(1)} hitSlop={12}>
          <Feather name="chevron-right" size={22} color={c.text} />
        </Pressable>
      </View>

      {/* Day-of-week headers */}
      <View className="flex-row mb-1 px-1">
        {DAY_LABELS_SHORT.map((label, i) => (
          <View key={i} className="flex-1 items-center">
            <Text className="text-xs" style={{ color: c.textMuted }}>{label}</Text>
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
            const intensity = intensityMap[dateStr] ?? 0;

            return (
              <View key={dateStr} className="flex-1 items-center py-1">
                <View
                  className="w-8 h-8 rounded-lg items-center justify-center"
                  style={[
                    {
                      backgroundColor: isCurrentMonth
                        ? intensityColor(intensity)
                        : "transparent",
                    },
                    isT ? { borderWidth: 1, borderColor: c.primary } : undefined,
                  ]}
                >
                  <Text
                    className={`text-xs ${!isCurrentMonth ? "opacity-30" : ""} ${isT ? "font-bold" : ""}`}
                    style={{ color: !isCurrentMonth ? c.textMuted : isT ? c.primary : c.text }}
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
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: c.surface }} />
          <Text className="text-xs" style={{ color: c.textMuted }}>0%</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: c.primary + "30" }} />
          <Text className="text-xs" style={{ color: c.textMuted }}>&lt;34%</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: c.primary + "70" }} />
          <Text className="text-xs" style={{ color: c.textMuted }}>&lt;67%</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: c.primary }} />
          <Text className="text-xs" style={{ color: c.textMuted }}>100%</Text>
        </View>
      </View>
    </View>
  );
}
