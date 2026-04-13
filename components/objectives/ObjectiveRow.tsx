import { View, Text, Pressable } from "react-native";
import { ProgressBar } from "../ui/ProgressBar";
import { colors } from "../../lib/theme";
import type { Tables } from "../../types/database";

type Props = {
  objective: Tables<"objectives">;
  visionColor?: string;
  onPress: () => void;
};

function getDeadlineStatus(objective: Tables<"objectives">): {
  label: string;
  color: string;
} {
  if (!objective.deadline || !objective.target_value) {
    return { label: "", color: colors.textMuted };
  }

  const now = Date.now();
  const created = new Date(objective.created_at).getTime();
  const deadline = new Date(objective.deadline).getTime();
  const totalDuration = deadline - created;
  const elapsed = now - created;

  if (totalDuration <= 0 || elapsed <= 0) {
    return { label: "", color: colors.textMuted };
  }

  const expectedProgress = Math.min(elapsed / totalDuration, 1);
  const actualProgress = objective.current_value / objective.target_value;

  if (now > deadline) {
    return actualProgress >= 1
      ? { label: "Atteint !", color: colors.success }
      : { label: "Expire", color: colors.danger };
  }

  const diff = actualProgress - expectedProgress;
  if (diff >= 0) {
    return { label: "En avance", color: colors.success };
  } else if (diff > -0.15) {
    return { label: "En rythme", color: colors.textSecondary };
  } else {
    return { label: "En retard", color: colors.warning };
  }
}

function formatDeadline(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export function ObjectiveRow({ objective, visionColor, onPress }: Props) {
  const progress =
    objective.target_value && objective.target_value > 0
      ? objective.current_value / objective.target_value
      : 0;
  const status = getDeadlineStatus(objective);

  return (
    <Pressable onPress={onPress} className="py-3 active:opacity-80">
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-text text-base flex-1 mr-2" numberOfLines={1}>
          {objective.title}
        </Text>
        {status.label ? (
          <Text className="text-xs font-medium" style={{ color: status.color }}>
            {status.label}
          </Text>
        ) : null}
      </View>

      <ProgressBar progress={progress} color={visionColor ?? colors.primary} className="mb-1" />

      <View className="flex-row items-center justify-between">
        <Text className="text-text-muted text-xs">
          {objective.current_value}{objective.unit ? ` ${objective.unit}` : ""} / {objective.target_value ?? "?"}{objective.unit ? ` ${objective.unit}` : ""}
        </Text>
        {objective.deadline && (
          <Text className="text-text-muted text-xs">{formatDeadline(objective.deadline)}</Text>
        )}
      </View>
    </Pressable>
  );
}
