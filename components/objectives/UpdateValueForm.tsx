import { useState } from "react";
import { View, Text, TextInput } from "react-native";
import { Button } from "../ui/Button";
import { colors } from "../../lib/theme";
import type { Tables } from "../../types/database";

type Props = {
  objective: Tables<"objectives">;
  onSubmit: (newValue: number, note: string) => void;
  onCancel: () => void;
  loading?: boolean;
};

export function UpdateValueForm({ objective, onSubmit, onCancel, loading }: Props) {
  const [value, setValue] = useState(String(objective.current_value));
  const [note, setNote] = useState("");

  const handleSubmit = () => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    onSubmit(numValue, note.trim());
  };

  return (
    <View>
      <Text className="text-text text-base font-bold mb-1">{objective.title}</Text>
      <Text className="text-text-muted text-sm mb-4">
        Actuel : {objective.current_value} {objective.unit} → Cible : {objective.target_value} {objective.unit}
      </Text>

      <Text className="text-text-secondary text-sm mb-1">Nouvelle valeur</Text>
      <TextInput
        className="bg-surface-light text-text rounded-button px-4 py-3 mb-4 text-base"
        placeholder={String(objective.current_value)}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={setValue}
        keyboardType="numeric"
        autoFocus
      />

      <Text className="text-text-secondary text-sm mb-1">Note (optionnel)</Text>
      <TextInput
        className="bg-surface-light text-text rounded-button px-4 py-3 mb-6 text-base"
        placeholder="Observations, contexte..."
        placeholderTextColor={colors.textMuted}
        value={note}
        onChangeText={setNote}
        multiline
      />

      <View className="flex-row gap-3">
        <Button title="Annuler" variant="secondary" onPress={onCancel} className="flex-1" />
        <Button
          title="Mettre a jour"
          onPress={handleSubmit}
          loading={loading}
          disabled={isNaN(parseFloat(value))}
          className="flex-1"
        />
      </View>
    </View>
  );
}
