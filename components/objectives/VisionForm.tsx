import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { Button } from "../ui/Button";
import { colors } from "../../lib/theme";
import type { Tables } from "../../types/database";

const VISION_COLORS = [
  "#6C5CE7", "#a855f7", "#22c55e", "#f59e0b",
  "#ef4444", "#3b82f6", "#ec4899", "#14b8a6",
];

const VISION_ICONS = [
  "target", "heart", "star", "zap",
  "book", "briefcase", "globe", "trophy",
];

type Props = {
  initial?: Tables<"visions">;
  onSubmit: (data: { title: string; description: string; icon: string; color: string }) => void;
  onCancel: () => void;
  loading?: boolean;
};

export function VisionForm({ initial, onSubmit, onCancel, loading }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "target");
  const [color, setColor] = useState(initial?.color ?? "#6C5CE7");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), description: description.trim(), icon, color });
  };

  return (
    <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
      {/* Title */}
      <Text className="text-text-secondary text-sm mb-1">Nom de la vision</Text>
      <TextInput
        className="bg-surface-light text-text rounded-button px-4 py-3 mb-4 text-base"
        placeholder="Ex: Etre en excellente forme"
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
      />

      {/* Description */}
      <Text className="text-text-secondary text-sm mb-1">Description (optionnel)</Text>
      <TextInput
        className="bg-surface-light text-text rounded-button px-4 py-3 mb-4 text-base"
        placeholder="Ce que cette vision represente..."
        placeholderTextColor={colors.textMuted}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={2}
      />

      {/* Color picker */}
      <Text className="text-text-secondary text-sm mb-2">Couleur</Text>
      <View className="flex-row flex-wrap gap-3 mb-4">
        {VISION_COLORS.map((c) => (
          <Pressable
            key={c}
            onPress={() => setColor(c)}
            className="items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: c,
              borderWidth: color === c ? 3 : 0,
              borderColor: colors.text,
            }}
          />
        ))}
      </View>

      {/* Icon picker */}
      <Text className="text-text-secondary text-sm mb-2">Icone</Text>
      <View className="flex-row flex-wrap gap-3 mb-6">
        {VISION_ICONS.map((i) => (
          <Pressable
            key={i}
            onPress={() => setIcon(i)}
            className="items-center justify-center"
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: icon === i ? colors.primary : colors.surfaceLight,
            }}
          >
            <Text className="text-text text-sm">{i}</Text>
          </Pressable>
        ))}
      </View>

      {/* Actions */}
      <View className="flex-row gap-3">
        <Button
          title="Annuler"
          variant="secondary"
          onPress={onCancel}
          className="flex-1"
        />
        <Button
          title={initial ? "Modifier" : "Creer"}
          onPress={handleSubmit}
          loading={loading}
          disabled={!title.trim()}
          className="flex-1"
        />
      </View>
    </ScrollView>
  );
}
