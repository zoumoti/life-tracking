import { View, Text, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../lib/theme";
import { getWeekDates, DAY_LABELS_SHORT, parseDate, toDateString } from "../../lib/dateUtils";
import { isHabitScheduledForDate } from "../../lib/habitUtils";
import type { Tables } from "../../types/database";

type Props = {
  habits: Tables<"habits">[];
  completions: Record<string, boolean>;
  weekOffset?: number;
};

export function WeekView({ habits, completions, weekOffset = 0 }: Props) {
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
                className={`text-xs font-semibold ${
                  isT ? "text-primary" : "text-text-muted"
                }`}
              >
                {DAY_LABELS_SHORT[i]}
              </Text>
              <Text
                className={`text-xs ${
                  isT ? "text-primary" : "text-text-muted"
                }`}
              >
                {parseDate(date).getDate()}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Habit rows */}
      {habits.map((habit) => (
        <View key={habit.id} className="flex-row items-center py-2 px-2 border-b border-surface">
          <View className="w-28 flex-row items-center">
            <Feather
              name={(habit.icon as any) || "circle"}
              size={14}
              color={habit.color || colors.primary}
            />
            <Text className="text-text text-xs ml-2" numberOfLines={1}>
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
                  <View className="w-6 h-6 rounded-full bg-surface" />
                ) : completed ? (
                  <View className="w-6 h-6 rounded-full bg-primary items-center justify-center">
                    <Feather name="check" size={12} color="#fff" />
                  </View>
                ) : (
                  <View className="w-6 h-6 rounded-full bg-surface border border-text-muted" />
                )}
              </View>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}
