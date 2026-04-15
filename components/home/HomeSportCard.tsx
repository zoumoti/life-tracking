import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useColors } from "../../lib/theme";

type Props = {
  currentSession: {
    id: string;
    name: string;
    startedAt: number;
  } | null;
  programs: {
    id: string;
    name: string;
    exercises: { exercise: { id: string; name: string }; sort_order: number }[];
  }[];
  onStartFreeSession: () => void;
  onStartProgram: (program: Props["programs"][0]) => void;
};

export function HomeSportCard({ currentSession, programs, onStartFreeSession, onStartProgram }: Props) {
  const c = useColors();
  const router = useRouter();

  return (
    <View className="mb-4">
      <Text className="font-bold text-base mb-2" style={{ color: c.text }}>Sport</Text>

      {currentSession ? (
        <Card
          onPress={() => router.push("/(tabs)/sport/active-workout" as any)}
          style={{ borderWidth: 1, borderColor: c.primary }}
        >
          <View className="flex-row items-center">
            <Feather name="activity" size={20} color={c.primary} />
            <View className="ml-3 flex-1">
              <Text className="font-bold text-sm" style={{ color: c.primary }}>Seance en cours</Text>
              <Text className="text-xs" style={{ color: c.textSecondary }}>{currentSession.name}</Text>
            </View>
            <Text className="font-bold" style={{ color: c.primary }}>Reprendre</Text>
          </View>
        </Card>
      ) : programs.length > 0 ? (
        <Card>
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-sm font-semibold" style={{ color: c.text }}>{programs[0].name}</Text>
              <Text className="text-xs" style={{ color: c.textMuted }}>
                {programs[0].exercises.length} exercices
              </Text>
            </View>
            <Button
              title="Demarrer"
              onPress={() => onStartProgram(programs[0])}
              className="px-4"
            />
          </View>
          <Pressable
            onPress={onStartFreeSession}
            className="mt-2 pt-2"
            style={{ borderTopWidth: 1, borderTopColor: c.surfaceLight }}
          >
            <Text className="text-xs text-center" style={{ color: c.textMuted }}>Seance libre ?</Text>
          </Pressable>
        </Card>
      ) : (
        <Pressable
          onPress={onStartFreeSession}
          className="py-2"
        >
          <Text className="text-sm" style={{ color: c.textMuted }}>Seance libre ?</Text>
        </Pressable>
      )}
    </View>
  );
}
