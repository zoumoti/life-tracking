import { useState } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeScreen } from "../../../components/SafeScreen";
import { Button } from "../../../components/ui/Button";
import { useRunningStore } from "../../../stores/runningStore";
import { formatPace } from "../../../lib/formatters";
import { RUNNING_TYPES, RUNNING_TYPE_LABELS } from "../../../lib/constants";
import { useColors } from "../../../lib/theme";
import type { RunningType } from "../../../lib/constants";

export default function AddRunScreen() {
  const c = useColors();
  const router = useRouter();
  const { addRun } = useRunningStore();
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [type, setType] = useState<RunningType>("easy");
  const [effort, setEffort] = useState(3);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const distanceNum = parseFloat(distance) || 0;
  const durationNum = parseFloat(duration) || 0;

  const handleSave = async () => {
    if (distanceNum <= 0 || durationNum <= 0) return;
    setLoading(true);

    const today = new Date().toISOString().split("T")[0];
    const { error } = await addRun({
      date: today,
      distance_km: distanceNum,
      duration_minutes: durationNum,
      type,
      perceived_effort: effort,
      notes: notes.trim() || null,
    });

    setLoading(false);
    if (!error) {
      router.back();
    }
  };

  return (
    <SafeScreen>
      <View className="flex-row items-center mb-6">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={c.text} />
        </Pressable>
        <Text style={{ color: c.text }} className="text-xl font-bold ml-2">Nouvelle course</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={{ color: c.textSecondary }} className="text-sm mb-2">Distance (km)</Text>
        <TextInput
          style={{ backgroundColor: c.surface, color: c.text }}
          className="rounded-button px-4 py-3 mb-4 text-base"
          placeholder="8.5"
          placeholderTextColor={c.textMuted}
          keyboardType="numeric"
          value={distance}
          onChangeText={setDistance}
        />

        <Text style={{ color: c.textSecondary }} className="text-sm mb-2">Duree (minutes)</Text>
        <TextInput
          style={{ backgroundColor: c.surface, color: c.text }}
          className="rounded-button px-4 py-3 mb-4 text-base"
          placeholder="45"
          placeholderTextColor={c.textMuted}
          keyboardType="numeric"
          value={duration}
          onChangeText={setDuration}
        />

        <View style={{ backgroundColor: c.surface }} className="rounded-card px-4 py-3 mb-4">
          <Text style={{ color: c.textSecondary }} className="text-sm">Allure</Text>
          <Text style={{ color: c.primary }} className="font-bold text-xl">
            {distanceNum > 0 && durationNum > 0
              ? `${formatPace(durationNum, distanceNum)} /km`
              : "--:-- /km"}
          </Text>
        </View>

        <Text style={{ color: c.textSecondary }} className="text-sm mb-2">Type</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {RUNNING_TYPES.map((t) => (
            <Pressable
              key={t}
              style={{ backgroundColor: type === t ? c.primary : c.surface }}
              className="px-4 py-2 rounded-button"
              onPress={() => setType(t)}
            >
              <Text style={{ color: type === t ? c.primaryOnText : c.text }} className={`text-sm ${type === t ? "font-bold" : ""}`}>
                {RUNNING_TYPE_LABELS[t]}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ color: c.textSecondary }} className="text-sm mb-2">Ressenti</Text>
        <View className="flex-row justify-around mb-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable
              key={n}
              onPress={() => setEffort(n)}
              style={{ backgroundColor: effort === n ? c.primary : c.surface }}
              className="w-12 h-12 rounded-full items-center justify-center"
            >
              <Text style={{ color: effort === n ? c.primaryOnText : c.text }} className={`text-base ${effort === n ? "font-bold" : ""}`}>
                {n}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ color: c.textSecondary }} className="text-sm mb-2">Notes (optionnel)</Text>
        <TextInput
          style={{ backgroundColor: c.surface, color: c.text }}
          className="rounded-button px-4 py-3 mb-6 text-sm"
          placeholder="Comment s'est passee la course..."
          placeholderTextColor={c.textMuted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
          value={notes}
          onChangeText={setNotes}
        />

        <Button
          title="Enregistrer"
          onPress={handleSave}
          loading={loading}
          disabled={distanceNum <= 0 || durationNum <= 0}
        />
      </ScrollView>
    </SafeScreen>
  );
}
