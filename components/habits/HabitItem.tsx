import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../lib/theme";
import { StreakBadge } from "./StreakBadge";
import type { Tables } from "../../types/database";

type Props = {
  habit: Tables<"habits">;
  completed: boolean;
  streak: { current: number; warning: boolean };
  onToggle: () => void;
  onPress: () => void;
  onLongPress?: () => void;
};

export function HabitItem({ habit, completed, streak, onToggle, onPress, onLongPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      className="flex-row items-center py-3 px-3 active:opacity-80"
    >
      {/* Checkbox */}
      <Pressable
        onPress={onToggle}
        hitSlop={8}
        className={`w-7 h-7 rounded-full items-center justify-center mr-3 border-2 ${
          completed
            ? "bg-primary border-primary"
            : "border-text-muted"
        }`}
      >
        {completed && <Feather name="check" size={16} color="#fff" />}
      </Pressable>

      {/* Icon */}
      <View
        className="w-8 h-8 rounded-lg items-center justify-center mr-3"
        style={{ backgroundColor: (habit.color || colors.primary) + "20" }}
      >
        <Feather
          name={(habit.icon as any) || "circle"}
          size={16}
          color={habit.color || colors.primary}
        />
      </View>

      {/* Name */}
      <Text
        className={`flex-1 text-base ${
          completed ? "text-text-muted line-through" : "text-text"
        }`}
      >
        {habit.name}
      </Text>

      {/* Streak */}
      <StreakBadge current={streak.current} warning={streak.warning} />

      {/* Chevron */}
      <Feather name="chevron-right" size={18} color={colors.textMuted} style={{ marginLeft: 8 }} />
    </Pressable>
  );
}
