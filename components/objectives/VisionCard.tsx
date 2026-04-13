import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card } from "../ui/Card";
import { ObjectiveRow } from "./ObjectiveRow";
import { colors } from "../../lib/theme";
import type { Tables } from "../../types/database";

type Props = {
  vision: Tables<"visions">;
  objectives: Tables<"objectives">[];
  onPressObjective: (objective: Tables<"objectives">) => void;
  onAddObjective: () => void;
  onEditVision: () => void;
  onDeleteVision: () => void;
};

export function VisionCard({
  vision,
  objectives,
  onPressObjective,
  onAddObjective,
  onEditVision,
  onDeleteVision,
}: Props) {
  return (
    <Card className="mb-4">
      {/* Vision header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center flex-1">
          <View
            className="items-center justify-center mr-3"
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: vision.color + "20",
            }}
          >
            <Feather
              name={vision.icon as any}
              size={18}
              color={vision.color}
            />
          </View>
          <View className="flex-1">
            <Text className="text-text text-base font-bold" numberOfLines={1}>
              {vision.title}
            </Text>
            {vision.description ? (
              <Text className="text-text-muted text-xs" numberOfLines={1}>
                {vision.description}
              </Text>
            ) : null}
          </View>
        </View>

        <View className="flex-row gap-1">
          <Pressable onPress={onEditVision} className="p-2 active:opacity-60">
            <Feather name="edit-2" size={16} color={colors.textMuted} />
          </Pressable>
          <Pressable onPress={onDeleteVision} className="p-2 active:opacity-60">
            <Feather name="trash-2" size={16} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>

      {/* Objectives list */}
      {objectives.length === 0 ? (
        <Text className="text-text-muted text-sm py-2">Aucun objectif pour le moment</Text>
      ) : (
        objectives.map((obj) => (
          <ObjectiveRow
            key={obj.id}
            objective={obj}
            visionColor={vision.color}
            onPress={() => onPressObjective(obj)}
          />
        ))
      )}

      {/* Add objective button */}
      <Pressable
        onPress={onAddObjective}
        className="flex-row items-center justify-center py-2 mt-2 rounded-button active:opacity-60"
        style={{ backgroundColor: vision.color + "15" }}
      >
        <Feather name="plus" size={16} color={vision.color} />
        <Text className="text-sm font-medium ml-1" style={{ color: vision.color }}>
          Ajouter un objectif
        </Text>
      </Pressable>
    </Card>
  );
}
