import { View, Text, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "../../lib/theme";
import { getWeekDates, DAY_LABELS_SHORT, parseDate, toDateString } from "../../lib/dateUtils";
import { isHabitScheduledForDate } from "../../lib/habitUtils";
import type { Tables } from "../../types/database";

type Props = {
  habits: Tables<"habits">[];
  completions: Record<string, boolean>;
  weekOffset?: number;
};

export function WeekView({ habits, completions, weekOffset = 0 }: Props) {
  const c = useColors();
  const today = new Date();
  today.setDate(today.getDate() + weekOffset * 7);
  const weekDates = getWeekDates(today);
  const todayStr = toDateString();

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Header row */}
      <View className="flex-row mb-2 px-2">
        <View className="w-28" />
        {weekDates.map((date, i) => {
          const isT = date === todayStr;
          return (
            <View key={date} className="flex-1 items-center">
              <Text
                className="text-xs font-semibold"
                style={{ color: isT ? c.primary : c.textMuted }}
              >
                {DAY_LABELS_SHORT[i]}
              </Text>
              <Text
                className="text-xs"
                style={{ color: isT ? c.primary : c.textMuted }}
              >
                {parseDate(date).getDate()}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Habit rows */}
      {habits.map((habit) => (
        <View
          key={habit.id}
          className="flex-row items-center py-2 px-2"
          style={{ borderBottomWidth: 1, borderBottomColor: c.surface }}
        >
          <View className="w-28 flex-row items-center">
            <Feather
              name={(habit.icon as any) || "circle"}
              size={14}
              color={habit.color || c.primary}
            />
            <Text className="text-xs ml-2" style={{ color: c.text }} numberOfLines={1}>
              {habit.name}
            </Text>
          </View>

          {weekDates.map((date) => {
            const scheduled = isHabitScheduledForDate(habit, date);
            const completed = completions[`${habit.id}:${date}`];
            const isFuture = date > todayStr;

            return (
              <View key={date} className="flex-1 items-center">
                {!scheduled || isFuture ? (
                  <View className="w-6 h-6 rounded-full" style={{ backgroundColor: c.surface }} />
                ) : completed ? (
                  <View className="w-6 h-6 rounded-full items-center justify-center" style={{ backgroundColor: c.primary }}>
                    <Feather name="check" size={12} color={c.primaryOnText} />
                  </View>
                ) : (
                  <View className="w-6 h-6 rounded-full border" style={{ backgroundColor: c.surface, borderColor: c.textMuted }} />
                )}
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}
