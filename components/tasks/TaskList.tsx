import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "../../lib/theme";
import { TaskRow } from "./TaskRow";
import type { Task, TaskPriority } from "../../types/task";

type Props = {
  tasks: Task[];
  onTaskPress: (task: Task) => void;
  onToggle: (id: string) => void;
};

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 0,
  normal: 1,
  low: 2,
};

function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    // Sort by due date first (null = end), then by priority
    if (a.due_date && b.due_date) {
      const dateCmp = a.due_date.localeCompare(b.due_date);
      if (dateCmp !== 0) return dateCmp;
    } else if (a.due_date && !b.due_date) {
      return -1;
    } else if (!a.due_date && b.due_date) {
      return 1;
    }
    return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  });
}

export function TaskList({ tasks, onTaskPress, onToggle }: Props) {
  const c = useColors();
  const [showCompleted, setShowCompleted] = useState(false);

  const pending = sortTasks(tasks.filter((t) => !t.completed));
  const completed = tasks.filter((t) => t.completed);

  return (
    <View>
      {/* Pending tasks */}
      {pending.length === 0 && completed.length === 0 && (
        <View className="items-center py-12">
          <Feather name="check-square" size={48} color={c.textMuted} />
          <Text className="mt-3 text-base" style={{ color: c.textMuted }}>
            Aucune tache
          </Text>
        </View>
      )}

      {pending.map((task) => (
        <TaskRow
          key={task.id}
          task={task}
          onPress={onTaskPress}
          onToggle={onToggle}
        />
      ))}

      {/* Completed section */}
      {completed.length > 0 && (
        <View className="mt-4">
          <Pressable
            onPress={() => setShowCompleted(!showCompleted)}
            className="flex-row items-center py-2"
          >
            <Feather
              name={showCompleted ? "chevron-down" : "chevron-right"}
              size={18}
              color={c.textSecondary}
            />
            <Text className="ml-2 text-sm font-semibold" style={{ color: c.textSecondary }}>
              Completees ({completed.length})
            </Text>
          </Pressable>

          {showCompleted &&
            completed.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onPress={onTaskPress}
                onToggle={onToggle}
              />
            ))}
        </View>
      )}
    </View>
  );
}
