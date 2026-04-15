import { useEffect } from "react";
import { View, Text, ScrollView, Pressable, Dimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ProgressBar } from "../ui/ProgressBar";
import { ProgressChart } from "./ProgressChart";
import { useObjectiveStore } from "../../stores/objectiveStore";
import { useColors } from "../../lib/theme";
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
  const c = useColors();
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
          <Feather name="arrow-left" size={22} color={c.text} />
        </Pressable>
        <View className="flex-row gap-2">
          <Pressable onPress={onEdit} className="p-2 active:opacity-60">
            <Feather name="edit-2" size={18} color={c.textMuted} />
          </Pressable>
          <Pressable onPress={onDelete} className="p-2 active:opacity-60">
            <Feather name="trash-2" size={18} color={c.danger} />
          </Pressable>
        </View>
      </View>

      {/* Title + progress */}
      <Text className="text-xl font-bold mb-2" style={{ color: c.text }}>{objective.title}</Text>
      {objective.description ? (
        <Text className="text-sm mb-3" style={{ color: c.textSecondary }}>{objective.description}</Text>
      ) : null}

      <View className="flex-row items-center gap-3 mb-1">
        <Text className="text-2xl font-bold" style={{ color: c.text }}>
          {objective.current_value}
        </Text>
        <Text className="text-base" style={{ color: c.textMuted }}>
          / {objective.target_value} {objective.unit}
        </Text>
      </View>
      <ProgressBar
        progress={progress}
        color={visionColor ?? c.primary}
        height={8}
        className="mb-2"
      />
      <Text className="text-xs mb-6" style={{ color: c.textMuted }}>
        {Math.round(progress * 100)}% complete
        {objective.deadline && ` — Deadline : ${new Date(objective.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}`}
      </Text>

      {/* Update button */}
      <Pressable
        onPress={onUpdate}
        className="flex-row items-center justify-center py-3 rounded-button mb-6 active:opacity-80"
        style={{ backgroundColor: (visionColor ?? c.primary) + "20" }}
      >
        <Feather name="trending-up" size={18} color={visionColor ?? c.primary} />
        <Text className="font-semibold ml-2" style={{ color: visionColor ?? c.primary }}>
          Mettre a jour la progression
        </Text>
      </Pressable>

      {/* Chart */}
      <Text className="text-base font-bold mb-3" style={{ color: c.text }}>Evolution</Text>
      {objUpdates.length > 0 ? (
        <ProgressChart
          objective={objective}
          updates={objUpdates}
          width={chartWidth}
          height={200}
        />
      ) : (
        <View className="rounded-card p-6 items-center mb-4" style={{ backgroundColor: c.surface }}>
          <Text className="text-sm" style={{ color: c.textMuted }}>
            Aucune mise a jour pour le moment
          </Text>
        </View>
      )}

      {/* Update history */}
      <Text className="text-base font-bold mt-6 mb-3" style={{ color: c.text }}>Historique</Text>
      {objUpdates.length === 0 ? (
        <Text className="text-sm" style={{ color: c.textMuted }}>Pas encore de mises a jour</Text>
      ) : (
        [...objUpdates].reverse().map((u) => (
          <View key={u.id} className="flex-row items-start py-3" style={{ borderBottomWidth: 1, borderBottomColor: c.surfaceLight }}>
            <View
              className="items-center justify-center mr-3 mt-1"
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: (visionColor ?? c.primary) + "20",
              }}
            >
              <Feather
                name={u.new_value > u.previous_value ? "arrow-up" : "arrow-down"}
                size={14}
                color={u.new_value > u.previous_value ? c.success : c.warning}
              />
            </View>
            <View className="flex-1">
              <Text className="text-sm" style={{ color: c.text }}>
                {u.previous_value} → {u.new_value} {objective.unit}
              </Text>
              {u.note ? (
                <Text className="text-xs mt-1" style={{ color: c.textMuted }}>{u.note}</Text>
              ) : null}
              <Text className="text-xs mt-1" style={{ color: c.textMuted }}>{formatDate(u.created_at)}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}
