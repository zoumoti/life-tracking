import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeScreen } from "../../../components/SafeScreen";
import { Card } from "../../../components/ui/Card";
import { ConfirmModal } from "../../../components/ui/ConfirmModal";
import { useWorkoutStore } from "../../../stores/workoutStore";
import { formatDateShort, formatDuration } from "../../../lib/formatters";
import { useColors } from "../../../lib/theme";

export default function WorkoutHistoryScreen() {
  const c = useColors();
  const router = useRouter();
  const { sessions, sessionsLoading, fetchSessions, deleteSession } = useWorkoutStore();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleDelete = async () => {
    if (deleteId) {
      await deleteSession(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <SafeScreen>
      <View className="flex-row items-center mb-4">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={c.text} />
        </Pressable>
        <Text style={{ color: c.text }} className="text-xl font-bold ml-2">Historique</Text>
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
                <View className="flex-1">
                  <Text style={{ color: c.text }} className="font-bold text-base">{item.name}</Text>
                  <Text style={{ color: c.textSecondary }} className="text-sm mt-1">
                    {formatDateShort(item.started_at)}
                  </Text>
                </View>
                <View className="items-end mr-3">
                  <Text style={{ color: c.textSecondary }} className="text-sm">{formatDuration(duration)}</Text>
                  <Text style={{ color: c.textMuted }} className="text-xs mt-1">
                    {Math.round(totalVolume)} kg · {totalSets} series
                  </Text>
                </View>
                <Pressable
                  onPress={() => setDeleteId(item.id)}
                  className="p-2 active:opacity-60"
                  hitSlop={8}
                >
                  <Feather name="trash-2" size={18} color={c.textMuted} />
                </Pressable>
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          !sessionsLoading ? (
            <View className="items-center mt-12">
              <Feather name="calendar" size={48} color={c.textMuted} />
              <Text style={{ color: c.textSecondary }} className="mt-4">Aucune seance</Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />

      <ConfirmModal
        visible={!!deleteId}
        title="Supprimer cette seance ?"
        message="L'historique des series sera perdu. Cette action est irreversible."
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </SafeScreen>
  );
}
