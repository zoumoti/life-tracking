import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Button } from "../ui/Button";
import { useColors } from "../../lib/theme";
import type { Tables } from "../../types/database";

const VISION_COLORS = [
  "#D4AA40", "#E8C860", "#22c55e", "#f59e0b",
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
  const c = useColors();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "target");
  const [color, setColor] = useState(initial?.color ?? "#D4AA40");

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), description: description.trim(), icon, color });
  };

  return (
    <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
      {/* Title */}
      <Text className="text-sm mb-1" style={{ color: c.textSecondary }}>Nom de la vision</Text>
      <TextInput
        className="rounded-button px-4 py-3 mb-4 text-base"
        style={{ backgroundColor: c.surfaceLight, color: c.text }}
        placeholder="Ex: Etre en excellente forme"
        placeholderTextColor={c.textMuted}
        value={title}
        onChangeText={setTitle}
      />

      {/* Description */}
      <Text className="text-sm mb-1" style={{ color: c.textSecondary }}>Description (optionnel)</Text>
      <TextInput
        className="rounded-button px-4 py-3 mb-4 text-base"
        style={{ backgroundColor: c.surfaceLight, color: c.text }}
        placeholder="Ce que cette vision represente..."
        placeholderTextColor={c.textMuted}
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={2}
      />

      {/* Color picker */}
      <Text className="text-sm mb-2" style={{ color: c.textSecondary }}>Couleur</Text>
      <View className="flex-row flex-wrap gap-3 mb-4">
        {VISION_COLORS.map((vc) => (
          <Pressable
            key={vc}
            onPress={() => setColor(vc)}
            className="items-center justify-center"
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: vc,
              borderWidth: color === vc ? 3 : 0,
              borderColor: c.text,
            }}
          />
        ))}
      </View>

      {/* Icon picker */}
      <Text className="text-sm mb-2" style={{ color: c.textSecondary }}>Icone</Text>
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
              backgroundColor: icon === i ? c.primary : c.surfaceLight,
            }}
          >
            <Feather name={i as any} size={20} color={icon === i ? c.primaryOnText : c.textSecondary} />
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
