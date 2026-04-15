import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { toDateString, isoDayOfWeek, parseDate, MONTH_LABELS, addDays } from "../../lib/dateUtils";
import { isHabitScheduledForDate } from "../../lib/habitUtils";
import { useColors } from "../../lib/theme";
import { useThemeStore } from "../../stores/themeStore";
import type { Tables } from "../../types/database";

const DAY_NAMES = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

type Props = {
  habits: Tables<"habits">[];
  completions: Record<string, boolean>;
};

function getMotivationalMessage(habits: Tables<"habits">[], completions: Record<string, boolean>, today: string): string {
  if (habits.length === 0) return "Chaque jour compte";

  const yesterday = addDays(today, -1);
  const twoDaysAgo = addDays(today, -2);

  const yesterdayHabits = habits.filter((h) => isHabitScheduledForDate(h, yesterday));
  const yesterdayAllDone =
    yesterdayHabits.length > 0 &&
    yesterdayHabits.every((h) => completions[`${h.id}:${yesterday}`]);

  if (yesterdayAllDone) return "Hier etait parfait, on recommence ?";

  const yesterdayDoneCount = yesterdayHabits.filter((h) => completions[`${h.id}:${yesterday}`]).length;
  const twoDaysAgoHabits = habits.filter((h) => isHabitScheduledForDate(h, twoDaysAgo));
  const twoDaysAgoDoneCount = twoDaysAgoHabits.filter((h) => completions[`${h.id}:${twoDaysAgo}`]).length;

  if (yesterdayDoneCount === 0 && twoDaysAgoDoneCount === 0 && yesterdayHabits.length > 0) {
    return "C'est le moment de reprendre";
  }

  const messages = [
    "Chaque jour compte",
    "Un pas a la fois",
    "La constance fait la difference",
    "Aujourd'hui est une nouvelle chance",
  ];
  return messages[new Date().getDate() % messages.length];
}

export function HomeHeader({ habits, completions }: Props) {
  const c = useColors();
  const { mode, toggleTheme } = useThemeStore();
  const today = toDateString();
  const date = parseDate(today);
  const dayName = DAY_NAMES[isoDayOfWeek(date)];
  const dayNum = date.getDate();
  const monthName = MONTH_LABELS[date.getMonth()];

  const message = getMotivationalMessage(habits, completions, today);

  return (
    <View className="mb-4 mt-2">
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-sm" style={{ color: c.textSecondary }}>
            {dayName} {dayNum} {monthName}
          </Text>
          <Text className="text-2xl font-bold mt-1" style={{ color: c.text }}>Aujourd'hui</Text>
        </View>
        <Pressable
          onPress={toggleTheme}
          className="w-10 h-10 rounded-full items-center justify-center active:opacity-70"
          style={{ backgroundColor: c.surfaceLight }}
        >
          <Feather
            name={mode === "dark" ? "sun" : "moon"}
            size={20}
            color={c.primary}
          />
        </Pressable>
      </View>
      <Text className="text-sm mt-1" style={{ color: c.primary }}>{message}</Text>
    </View>
  );
}
