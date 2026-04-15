import { View, Text, Pressable } from "react-native";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";
import { useColors } from "../../lib/theme";
import { daysBetween, toDateString } from "../../lib/dateUtils";
import type { Tables } from "../../types/database";

type Props = {
  objectives: Tables<"objectives">[];
  onPressObjective: () => void;
};

export function HomeObjectivesList({ objectives, onPressObjective }: Props) {
  const c = useColors();

  function getDeadlineStatus(objective: Tables<"objectives">): {
    label: string;
    color: string;
  } {
    if (!objective.deadline) return { label: "", color: c.textMuted };

    const today = toDateString();
    const totalDays = daysBetween(objective.deadline, objective.created_at.slice(0, 10));
    const elapsedDays = daysBetween(today, objective.created_at.slice(0, 10));

    if (totalDays <= 0) return { label: "Expire", color: c.danger };

    const timeProgress = Math.min(elapsedDays / totalDays, 1);
    const valueProgress =
      (objective.target_value ?? 0) > 0 ? (objective.current_value ?? 0) / (objective.target_value ?? 1) : 0;

    if (today > objective.deadline) return { label: "Expire", color: c.danger };
    if (valueProgress >= timeProgress) return { label: "En avance", color: c.success };
    return { label: "En retard", color: c.warning };
  }

  const activeObjectives = objectives
    .filter((o) => o.status === "in_progress")
    .sort((a, b) => {
      if (!a.deadline && !b.deadline) return 0;
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.localeCompare(b.deadline);
    })
    .slice(0, 3);

  if (activeObjectives.length === 0) return null;

  return (
    <View className="mb-4">
      <Text className="font-bold text-base mb-2" style={{ color: c.text }}>Objectifs</Text>

      <Card className="p-0">
        {activeObjectives.map((obj, index) => {
          const progress =
            (obj.target_value ?? 0) > 0
              ? Math.min((obj.current_value ?? 0) / (obj.target_value ?? 1), 1)
              : 0;
          const status = getDeadlineStatus(obj);

          return (
            <View key={obj.id}>
              {index > 0 && <View className="h-px mx-4" style={{ backgroundColor: c.surface }} />}
              <Pressable
                onPress={onPressObjective}
                className="px-4 py-3 active:opacity-80"
              >

              <View className="flex-row items-center justify-between mb-1">
                <Text className="text-sm flex-1 mr-2" numberOfLines={1} style={{ color: c.text }}>
                  {obj.title}
                </Text>
                {status.label ? (
                  <Text className="text-xs font-semibold" style={{ color: status.color }}>
                    {status.label}
                  </Text>
                ) : null}
              </View>

              <View className="flex-row items-center gap-2">
                <View className="flex-1">
                  <ProgressBar progress={progress} color={status.color} height={4} />
                </View>
                <Text className="text-xs" style={{ color: c.textMuted }}>
                  {Math.round(progress * 100)}%
                </Text>
              </View>
              </Pressable>
            </View>
          );
        })}
      </Card>
    </View>
  );
}
