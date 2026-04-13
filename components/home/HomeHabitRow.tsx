import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { StreakBadge } from "../habits/StreakBadge";
import { colors } from "../../lib/theme";
import type { Tables } from "../../types/database";

type Props = {
  habit: Tables<"habits">;
  completed: boolean;
  streak: { current: number; warning: boolean };
  onToggle: () => void;
};

export function HomeHabitRow({ habit, completed, streak, onToggle }: Props) {
  const isAvoid = habit.habit_type === "avoid";

  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center py-3 px-3 active:opacity-80"
    >
      <View
        className={`w-6 h-6 rounded-full items-center justify-center mr-3 border-2 ${
          completed
            ? isAvoid
              ? "border-success"
              : "border-primary"
            : "border-text-muted"
        }`}
        style={
          completed
            ? { backgroundColor: isAvoid ? colors.success : colors.primary, borderColor: isAvoid ? colors.success : colors.primary }
            : undefined
        }
      >
        {completed && (
          <Feather name={isAvoid ? "shield" : "check"} size={12} color="#fff" />
        )}
      </View>

      <View
        className="w-7 h-7 rounded-md items-center justify-center mr-3"
        style={{ backgroundColor: (habit.color || colors.primary) + "20" }}
      >
        <Feather
          name={(habit.icon as any) || "circle"}
          size={14}
          color={habit.color || colors.primary}
        />
      </View>

      <Text
        className={`flex-1 text-sm ${
          completed ? "text-text-muted line-through" : "text-text"
        }`}
      >
        {habit.name}
      </Text>

      <StreakBadge current={streak.current} warning={streak.warning} isAvoid={isAvoid} />
    </Pressable>
  );
}
