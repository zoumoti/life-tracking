import { View, Text, Pressable } from "react-native";
import { useMemo } from "react";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Card } from "../ui/Card";
import { useColors } from "../../lib/theme";
import { toDateString } from "../../lib/dateUtils";
import type { Task } from "../../types/task";

type Props = {
  tasks: Task[];
  onToggle: (id: string) => void;
};

export function HomeTasksCard({ tasks, onToggle }: Props) {
  const c = useColors();
  const router = useRouter();
  const today = toDateString();

  const todayTasks = useMemo(
    () => tasks.filter((t) => t.due_date === today && !t.completed),
    [tasks, today]
  );

  const visibleTasks = todayTasks.slice(0, 3);
  const remaining = todayTasks.length - 3;

  return (
    <View className="mb-4">
      <Text className="font-bold text-base mb-2" style={{ color: c.text }}>Taches</Text>

      <Card onPress={() => router.push("/(tabs)/tasks" as any)}>
        <Text className="font-bold text-sm" style={{ color: c.text }}>
          {todayTasks.length} tache{todayTasks.length !== 1 ? "s" : ""} aujourd'hui
        </Text>

        {visibleTasks.length > 0 && (
          <View className="mt-3">
            {visibleTasks.map((task) => (
              <Pressable
                key={task.id}
                onPress={(e) => {
                  e.stopPropagation();
                  onToggle(task.id);
                }}
                className="flex-row items-center py-1"
              >
                <Feather name="circle" size={18} color={c.textMuted} />
                <Text className="ml-2 text-sm flex-1" style={{ color: c.text }} numberOfLines={1}>
                  {task.title}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {remaining > 0 && (
          <Text className="text-xs mt-2" style={{ color: c.primary }}>
            +{remaining} autre{remaining !== 1 ? "s" : ""}
          </Text>
        )}
      </Card>
    </View>
  );
}
