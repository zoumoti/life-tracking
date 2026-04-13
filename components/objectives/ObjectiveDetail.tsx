import { useEffect } from "react";
import { View, Text, ScrollView, Pressable, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ProgressBar } from "../ui/ProgressBar";
import { ProgressChart } from "./ProgressChart";
import { useObjectiveStore } from "../../stores/objectiveStore";
import { colors } from "../../lib/theme";
import type { Tables } from "../../types/database";

type Props = {
  objective: Tables<"objectives">;
  visionColor?: string;
  onUpdate: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onClose: () => void;
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ObjectiveDetail({
  objective,
  visionColor,
  onUpdate,
  onEdit,
  onDelete,
  onClose,
}: Props) {
  const { updates, fetchUpdates } = useObjectiveStore();
  const objUpdates = updates[objective.id] || [];
  const screenWidth = Dimensions.get("window").width;
  const chartWidth = screenWidth - 64; // account for padding

  useEffect(() => {
    fetchUpdates(objective.id);
  }, [objective.id]);

  const progress =
    objective.target_value && objective.target_value > 0
      ? objective.current_value / objective.target_value
      : 0;

  return (
    <ScrollView className="flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Pressable onPress={onClose} className="p-1 active:opacity-60">
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <View className="flex-row gap-2">
          <Pressable onPress={onEdit} className="p-2 active:opacity-60">
            <Feather name="edit-2" size={18} color={colors.textMuted} />
          </Pressable>
          <Pressable onPress={onDelete} className="p-2 active:opacity-60">
            <Feather name="trash-2" size={18} color={colors.danger} />
          </Pressable>
        </View>
      </View>

      {/* Title + progress */}
      <Text className="text-text text-xl font-bold mb-2">{objective.title}</Text>
      {objective.description ? (
        <Text className="text-text-secondary text-sm mb-3">{objective.description}</Text>
      ) : null}

      <View className="flex-row items-center gap-3 mb-1">
        <Text className="text-text text-2xl font-bold">
          {objective.current_value}
        </Text>
        <Text className="text-text-muted text-base">
          / {objective.target_value} {objective.unit}
        </Text>
      </View>
      <ProgressBar
        progress={progress}
        color={visionColor ?? colors.primary}
        height={8}
        className="mb-2"
      />
      <Text className="text-text-muted text-xs mb-6">
        {Math.round(progress * 100)}% complete
        {objective.deadline && ` — Deadline : ${new Date(objective.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`}
      </Text>

      {/* Update button */}
      <Pressable
        onPress={onUpdate}
        className="flex-row items-center justify-center py-3 rounded-button mb-6 active:opacity-80"
        style={{ backgroundColor: (visionColor ?? colors.primary) + "20" }}
      >
        <Feather name="trending-up" size={18} color={visionColor ?? colors.primary} />
        <Text className="font-semibold ml-2" style={{ color: visionColor ?? colors.primary }}>
          Mettre a jour la progression
        </Text>
      </Pressable>

      {/* Chart */}
      <Text className="text-text text-base font-bold mb-3">Evolution</Text>
      {objUpdates.length > 0 ? (
        <ProgressChart
          objective={objective}
          updates={objUpdates}
          width={chartWidth}
          height={200}
        />
      ) : (
        <View className="bg-surface rounded-card p-6 items-center mb-4">
          <Text className="text-text-muted text-sm">
            Aucune mise a jour pour le moment
          </Text>
        </View>
      )}

      {/* Update history */}
      <Text className="text-text text-base font-bold mt-6 mb-3">Historique</Text>
      {objUpdates.length === 0 ? (
        <Text className="text-text-muted text-sm">Pas encore de mises a jour</Text>
      ) : (
        [...objUpdates].reverse().map((u) => (
          <View key={u.id} className="flex-row items-start py-3 border-b border-surface-light">
            <View
              className="items-center justify-center mr-3 mt-1"
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: (visionColor ?? colors.primary) + "20",
              }}
            >
              <Feather
                name={u.new_value > u.previous_value ? "arrow-up" : "arrow-down"}
                size={14}
                color={u.new_value > u.previous_value ? colors.success : colors.warning}
              />
            </View>
            <View className="flex-1">
              <Text className="text-text text-sm">
                {u.previous_value} → {u.new_value} {objective.unit}
              </Text>
              {u.note ? (
                <Text className="text-text-muted text-xs mt-1">{u.note}</Text>
              ) : null}
              <Text className="text-text-muted text-xs mt-1">{formatDate(u.created_at)}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}
