import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { colors } from "../../lib/theme";

type Props = {
  currentSession: {
    id: string;
    name: string;
    startedAt: number;
  } | null;
  programs: {
    id: string;
    name: string;
    exercises: any[];
  }[];
  onStartFreeSession: () => void;
};

export function HomeSportCard({ currentSession, programs, onStartFreeSession }: Props) {
  const router = useRouter();

  return (
    <View className="mb-4">
      <Text className="text-text font-bold text-base mb-2">Sport</Text>

      {currentSession ? (
        <Card
          onPress={() => router.push("/(tabs)/sport/active-workout" as any)}
          className="border border-primary"
        >
          <View className="flex-row items-center">
            <Feather name="activity" size={20} color={colors.primary} />
            <View className="ml-3 flex-1">
              <Text className="text-primary font-bold text-sm">Seance en cours</Text>
              <Text className="text-text-secondary text-xs">{currentSession.name}</Text>
            </View>
            <Text className="text-primary font-bold">Reprendre</Text>
          </View>
        </Card>
      ) : programs.length > 0 ? (
        <Card>
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-text text-sm font-semibold">{programs[0].name}</Text>
              <Text className="text-text-muted text-xs">
                {programs[0].exercises.length} exercices
              </Text>
            </View>
            <Button
              title="Demarrer"
              onPress={() => {
                router.push("/(tabs)/sport" as any);
              }}
              className="px-4"
            />
          </View>
          <Pressable
            onPress={onStartFreeSession}
            className="mt-2 pt-2 border-t border-surface-light"
          >
            <Text className="text-text-muted text-xs text-center">Seance libre ?</Text>
          </Pressable>
        </Card>
      ) : (
        <Pressable
          onPress={onStartFreeSession}
          className="py-2"
        >
          <Text className="text-text-muted text-sm">Seance libre ?</Text>
        </Pressable>
      )}
    </View>
  );
}
