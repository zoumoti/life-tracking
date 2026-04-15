import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "../../lib/theme";
import type { Task, TaskPriority } from "../../types/task";

type Props = {
  task: Task;
  onPress: (task: Task) => void;
  onToggle: (id: string) => void;
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  high: "#ef4444",
  normal: "#D4AA40",
  low: "#9a9590",
};

function formatDate(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

export function TaskRow({ task, onPress, onToggle }: Props) {
  const c = useColors();
  const priorityColor = PRIORITY_COLORS[task.priority];

  return (
    <Pressable
      onPress={() => onPress(task)}
      className="flex-row items-center py-3 active:opacity-70"
    >
      {/* Priority indicator */}
      <View
        className="w-1 rounded-full mr-3"
        style={{ backgroundColor: priorityColor, height: "100%", minHeight: 32 }}
      />

      {/* Checkbox */}
      <Pressable
        onPress={() => onToggle(task.id)}
        hitSlop={12}
        className="mr-3"
      >
        <Feather
          name={task.completed ? "check-circle" : "circle"}
          size={22}
          color={task.completed ? c.success : c.textMuted}
        />
      </Pressable>

      {/* Content */}
      <View className="flex-1">
        <Text
          className="text-base"
          style={{
            color: task.completed ? c.textMuted : c.text,
            textDecorationLine: task.completed ? "line-through" : "none",
          }}
        >
          {task.title}
        </Text>
        {task.due_date && (
          <Text className="text-xs mt-0.5" style={{ color: c.textSecondary }}>
            {formatDate(task.due_date)}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
