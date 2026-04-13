import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { Button } from "../ui/Button";
import { colors } from "../../lib/theme";
import type { Tables } from "../../types/database";

type Props = {
  visions: Tables<"visions">[];
  initialVisionId?: string;
  initial?: Tables<"objectives">;
  onSubmit: (data: {
    vision_id: string;
    title: string;
    description: string;
    unit: string;
    current_value: number;
    target_value: number;
    deadline: string;
  }) => void;
  onCancel: () => void;
  loading?: boolean;
};

export function ObjectiveForm({ visions, initialVisionId, initial, onSubmit, onCancel, loading }: Props) {
  const [visionId, setVisionId] = useState(initial?.vision_id ?? initialVisionId ?? visions[0]?.id ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [unit, setUnit] = useState(initial?.unit ?? "");
  const [currentValue, setCurrentValue] = useState(String(initial?.current_value ?? "0"));
  const [targetValue, setTargetValue] = useState(String(initial?.target_value ?? ""));
  const [deadline, setDeadline] = useState(initial?.deadline ?? "");

  const handleSubmit = () => {
    if (!title.trim() || !visionId || !targetValue || !deadline) return;
    onSubmit({
      vision_id: visionId,
      title: title.trim(),
      description: description.trim(),
      unit: unit.trim(),
      current_value: parseFloat(currentValue) || 0,
      target_value: parseFloat(targetValue),
      deadline,
    });
  };

  return (
    <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
      {/* Vision selector */}
      <Text className="text-text-secondary text-sm mb-1">Vision parente</Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {visions.map((v) => (
          <Pressable
            key={v.id}
            onPress={() => setVisionId(v.id)}
            className="px-3 py-2 rounded-button"
            style={{
              backgroundColor: visionId === v.id ? v.color : colors.surfaceLight,
            }}
          >
            <Text className="text-text text-sm">{v.title}</Text>
          </Pressable>
        ))}
      </View>

      {/* Title */}
      <Text className="text-text-secondary text-sm mb-1">Nom de l'objectif</Text>
      <TextInput
        className="bg-surface-light text-text rounded-button px-4 py-3 mb-4 text-base"
        placeholder="Ex: Bench press 100kg"
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
      />

      {/* Description */}
      <Text className="text-text-secondary text-sm mb-1">Description (optionnel)</Text>
      <TextInput
        className="bg-surface-light text-text rounded-button px-4 py-3 mb-4 text-base"
        placeholder="Details supplementaires..."
        placeholderTextColor={colors.textMuted}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* Unit */}
      <Text className="text-text-secondary text-sm mb-1">Unite de mesure</Text>
      <TextInput
        className="bg-surface-light text-text rounded-button px-4 py-3 mb-4 text-base"
        placeholder="Ex: kg, km, min, %"
        placeholderTextColor={colors.textMuted}
        value={unit}
        onChangeText={setUnit}
      />

      {/* Current + Target values */}
      <View className="flex-row gap-3 mb-4">
        <View className="flex-1">
          <Text className="text-text-secondary text-sm mb-1">Valeur actuelle</Text>
          <TextInput
            className="bg-surface-light text-text rounded-button px-4 py-3 text-base"
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            value={currentValue}
            onChangeText={setCurrentValue}
            keyboardType="numeric"
          />
        </View>
        <View className="flex-1">
          <Text className="text-text-secondary text-sm mb-1">Valeur cible</Text>
          <TextInput
            className="bg-surface-light text-text rounded-button px-4 py-3 text-base"
            placeholder="100"
            placeholderTextColor={colors.textMuted}
            value={targetValue}
            onChangeText={setTargetValue}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Deadline */}
      <Text className="text-text-secondary text-sm mb-1">Deadline (AAAA-MM-JJ)</Text>
      <TextInput
        className="bg-surface-light text-text rounded-button px-4 py-3 mb-6 text-base"
        placeholder="2026-09-01"
        placeholderTextColor={colors.textMuted}
        value={deadline}
        onChangeText={setDeadline}
      />

      {/* Actions */}
      <View className="flex-row gap-3">
        <Button title="Annuler" variant="secondary" onPress={onCancel} className="flex-1" />
        <Button
          title={initial ? "Modifier" : "Creer"}
          onPress={handleSubmit}
          loading={loading}
          disabled={!title.trim() || !visionId || !targetValue || !deadline}
          className="flex-1"
        />
      </View>
    </ScrollView>
  );
}
