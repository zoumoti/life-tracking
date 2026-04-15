import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "../../lib/theme";
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
  const c = useColors();
  const isAvoid = habit.habit_type === "avoid";

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      className="flex-row items-center py-3 px-3 active:opacity-80"
    >
      {/* Checkbox — shield for avoid habits, check for positive */}
      <Pressable
        onPress={onToggle}
        hitSlop={8}
        className="w-7 h-7 rounded-full items-center justify-center mr-3 border-2"
        style={
          completed
            ? isAvoid
              ? { backgroundColor: c.success, borderColor: c.success }
              : { backgroundColor: c.primary, borderColor: c.primary }
            : { borderColor: c.textMuted }
        }
      >
        {completed && (
          <Feather name={isAvoid ? "shield" : "check"} size={isAvoid ? 14 : 16} color={isAvoid ? "#fff" : c.primaryOnText} />
        )}
      </Pressable>

      {/* Icon */}
      <View
        className="w-8 h-8 rounded-lg items-center justify-center mr-3"
        style={{ backgroundColor: (habit.color || c.primary) + "20" }}
      >
        <Feather
          name={(habit.icon as any) || "circle"}
          size={16}
          color={habit.color || c.primary}
        />
      </View>

      {/* Name */}
      <Text
        className={`flex-1 text-base ${completed ? "line-through" : ""}`}
        style={{ color: completed ? c.textMuted : c.text }}
      >
        {habit.name}
      </Text>

      {/* Streak */}
      <StreakBadge current={streak.current} warning={streak.warning} isAvoid={isAvoid} />

      {/* Chevron */}
      <Feather name="chevron-right" size={18} color={c.textMuted} style={{ marginLeft: 8 }} />
    </Pressable>
  );
}
