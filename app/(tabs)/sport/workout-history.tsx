import { useEffect } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeScreen } from "../../../components/SafeScreen";
import { Card } from "../../../components/ui/Card";
import { useWorkoutStore } from "../../../stores/workoutStore";
import { formatDateShort, formatDuration } from "../../../lib/formatters";
import { colors } from "../../../lib/theme";

export default function WorkoutHistoryScreen() {
  const router = useRouter();
  const { sessions, sessionsLoading, fetchSessions } = useWorkoutStore();

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <SafeScreen>
      <View className="flex-row items-center mb-4">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={colors.text} />
        </Pressable>
        <Text className="text-text text-xl font-bold ml-2">Historique</Text>
      </View>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const duration = item.finished_at && item.started_at
            ? new Date(item.finished_at).getTime() - new Date(item.started_at).getTime()
            : 0;
          const totalVolume = item.sets.reduce((sum, s) => sum + s.weight_kg * s.reps, 0);
          const totalSets = item.sets.length;

          return (
            <Card
              onPress={() => router.push({ pathname: "/(tabs)/sport/workout-detail" as any, params: { id: item.id } })}
              className="mb-3"
            >
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-text font-bold text-base">{item.name}</Text>
                  <Text className="text-text-secondary text-sm mt-1">
                    {formatDateShort(item.started_at)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-text-secondary text-sm">{formatDuration(duration)}</Text>
                  <Text className="text-text-muted text-xs mt-1">
                    {Math.round(totalVolume)} kg · {totalSets} series
                  </Text>
                </View>
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          !sessionsLoading ? (
            <View className="items-center mt-12">
              <Feather name="calendar" size={48} color={colors.textMuted} />
              <Text className="text-text-secondary mt-4">Aucune seance</Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeScreen>
  );
}
