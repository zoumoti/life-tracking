import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { StreakBadge } from "../habits/StreakBadge";
import { useColors } from "../../lib/theme";
import type { Tables } from "../../types/database";

type Props = {
  habit: Tables<"habits">;
  completed: boolean;
  streak: { current: number; warning: boolean };
  onToggle: () => void;
};

export function HomeHabitRow({ habit, completed, streak, onToggle }: Props) {
  const c = useColors();
  const isAvoid = habit.habit_type === "avoid";

  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center py-3 px-3 active:opacity-80"
    >
      <View
        className="w-6 h-6 rounded-full items-center justify-center mr-3 border-2"
        style={
          completed
            ? {
                backgroundColor: isAvoid ? c.success : c.primary,
                borderColor: isAvoid ? c.success : c.primary,
              }
            : { borderColor: c.textMuted }
        }
      >
        {completed && (
          <Feather name={isAvoid ? "shield" : "check"} size={12} color={isAvoid ? "#fff" : c.primaryOnText} />
        )}
      </View>

      <View
        className="w-7 h-7 rounded-md items-center justify-center mr-3"
        style={{ backgroundColor: (habit.color || c.primary) + "20" }}
      >
        <Feather
          name={(habit.icon as any) || "circle"}
          size={14}
          color={habit.color || c.primary}
        />
      </View>

      <Text
        className={`flex-1 text-sm ${completed ? "line-through" : ""}`}
        style={{ color: completed ? c.textMuted : c.text }}
      >
        {habit.name}
      </Text>

      <StreakBadge current={streak.current} warning={streak.warning} isAvoid={isAvoid} />
    </Pressable>
  );
}
