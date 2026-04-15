import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeScreen } from "../../../components/SafeScreen";
import { Card } from "../../../components/ui/Card";
import { useWorkoutStore } from "../../../stores/workoutStore";
import { useExerciseStore } from "../../../stores/exerciseStore";
import { formatDateLong, formatDuration } from "../../../lib/formatters";
import { useColors } from "../../../lib/theme";
import type { Tables } from "../../../types/database";

type HistorySession = Tables<"workout_sessions"> & {
  sets: Tables<"workout_sets">[];
};

export default function WorkoutDetailScreen() {
  const c = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { fetchSessionDetail } = useWorkoutStore();
  const { exercises: allExercises } = useExerciseStore();
  const [session, setSession] = useState<HistorySession | null>(null);

  useEffect(() => {
    if (id) {
      fetchSessionDetail(id).then(setSession);
    }
  }, [id]);

  if (!session) {
    return (
      <SafeScreen>
        <Text style={{ color: c.textSecondary }} className="text-center mt-12">Chargement...</Text>
      </SafeScreen>
    );
  }

  const duration = session.finished_at && session.started_at
    ? new Date(session.finished_at).getTime() - new Date(session.started_at).getTime()
    : 0;
  const totalVolume = session.sets.reduce((sum, s) => sum + s.weight_kg * s.reps, 0);

  // Group sets by exercise
  const exerciseGroups: { exerciseId: string; exerciseName: string; sets: Tables<"workout_sets">[] }[] = [];
  for (const s of session.sets) {
    let group = exerciseGroups.find((g) => g.exerciseId === s.exercise_id);
    if (!group) {
      const exercise = allExercises.find((e) => e.id === s.exercise_id);
      group = { exerciseId: s.exercise_id, exerciseName: exercise?.name ?? "Exercice inconnu", sets: [] };
      exerciseGroups.push(group);
    }
    group.sets.push(s);
  }

  return (
    <SafeScreen>
      <View className="flex-row items-center mb-4">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={c.text} />
        </Pressable>
        <Text style={{ color: c.text }} className="text-xl font-bold ml-2">{session.name}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: c.surface }} className="flex-row justify-around mb-6 rounded-card py-4">
          <View className="items-center">
            <Text style={{ color: c.text }} className="font-bold text-lg">{formatDuration(duration)}</Text>
            <Text style={{ color: c.textSecondary }} className="text-xs">Duree</Text>
          </View>
          <View className="items-center">
            <Text style={{ color: c.text }} className="font-bold text-lg">{Math.round(totalVolume)} kg</Text>
            <Text style={{ color: c.textSecondary }} className="text-xs">Volume</Text>
          </View>
          <View className="items-center">
            <Text style={{ color: c.text }} className="font-bold text-lg">{session.sets.length}</Text>
            <Text style={{ color: c.textSecondary }} className="text-xs">Series</Text>
          </View>
        </View>

        <Text style={{ color: c.textSecondary }} className="text-sm mb-3">
          {formatDateLong(session.started_at)}
        </Text>

        {exerciseGroups.map((group) => (
          <Card key={group.exerciseId} className="mb-3">
            <Text style={{ color: c.text }} className="font-bold text-base mb-2">{group.exerciseName}</Text>
            {group.sets
              .sort((a, b) => a.set_number - b.set_number)
              .map((s) => (
                <View key={s.id} className="flex-row items-center py-1">
                  <Text style={{ color: c.textMuted }} className="text-sm w-8">{s.set_number}</Text>
                  <Text style={{ color: c.text }} className="text-sm flex-1">{s.weight_kg} kg</Text>
                  <Text style={{ color: c.text }} className="text-sm">{s.reps} reps</Text>
                </View>
              ))}
          </Card>
        ))}
      </ScrollView>
    </SafeScreen>
  );
}
