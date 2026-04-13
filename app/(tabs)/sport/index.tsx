import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeScreen } from "../../../components/SafeScreen";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { useWorkoutStore } from "../../../stores/workoutStore";
import { useRunningStore } from "../../../stores/runningStore";
import { useExerciseStore } from "../../../stores/exerciseStore";
import { formatDuration, formatDateShort, formatPace } from "../../../lib/formatters";
import { colors } from "../../../lib/theme";

function useTimer(startedAt: number | null) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startedAt) return;
    const interval = setInterval(() => setElapsed(Date.now() - startedAt), 1000);
    return () => clearInterval(interval);
  }, [startedAt]);
  return elapsed;
}

export default function SportHubScreen() {
  const router = useRouter();
  const { currentSession, programs, fetchPrograms, startSession } = useWorkoutStore();
  const { fetchRuns, getStats, runs } = useRunningStore();
  const { fetchExercises } = useExerciseStore();
  const elapsed = useTimer(currentSession?.startedAt ?? null);

  useEffect(() => {
    fetchPrograms();
    fetchRuns();
    fetchExercises();
  }, []);

  const stats = getStats();
  const lastRun = runs[0];

  const handleFreeSession = () => {
    startSession();
    router.push("/(tabs)/sport/active-workout" as any);
  };

  return (
    <SafeScreen>
      <Text className="text-text text-2xl font-bold mb-6">Sport</Text>

      {/* Active session banner */}
      {currentSession && (
        <Pressable
          onPress={() => router.push("/(tabs)/sport/active-workout" as any)}
          className="bg-primary/20 border border-primary rounded-card px-4 py-3 mb-4 flex-row items-center justify-between active:opacity-80"
        >
          <View className="flex-row items-center">
            <Feather name="activity" size={20} color={colors.primary} />
            <Text className="text-primary font-bold text-base ml-2">
              Seance en cours
            </Text>
          </View>
          <Text className="text-primary font-bold text-lg">
            {formatDuration(elapsed)}
          </Text>
        </Pressable>
      )}

      {/* Muscu section */}
      <Card className="mb-4">
        <Text className="text-text font-bold text-lg mb-3">Musculation</Text>

        {!currentSession && (
          <View className="gap-2 mb-3">
            <Button title="Seance libre" onPress={handleFreeSession} />
            {programs.length > 0 && (
              <View>
                <Text className="text-text-secondary text-xs mb-2 mt-2">Depuis un programme :</Text>
                {programs.slice(0, 3).map((p) => (
                  <Pressable
                    key={p.id}
                    className="flex-row items-center justify-between py-2 border-b border-surface-light active:opacity-70"
                    onPress={() => {
                      const exercises = p.exercises
                        .sort((a, b) => a.sort_order - b.sort_order)
                        .map((pe) => ({ id: pe.exercise.id, name: pe.exercise.name }));
                      startSession(p.id, p.name, exercises);
                      router.push("/(tabs)/sport/active-workout" as any);
                    }}
                  >
                    <Text className="text-text text-sm">{p.name}</Text>
                    <Feather name="play" size={16} color={colors.primary} />
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        )}

        <View className="flex-row gap-2 mt-2">
          <Pressable
            onPress={() => router.push("/(tabs)/sport/programs" as any)}
            className="flex-1 bg-surface-light rounded-button py-2 items-center active:opacity-70"
          >
            <Text className="text-text-secondary text-sm">Programmes</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/(tabs)/sport/exercises" as any)}
            className="flex-1 bg-surface-light rounded-button py-2 items-center active:opacity-70"
          >
            <Text className="text-text-secondary text-sm">Exercices</Text>
          </Pressable>
          <Pressable
            onPress={() => router.push("/(tabs)/sport/workout-history" as any)}
            className="flex-1 bg-surface-light rounded-button py-2 items-center active:opacity-70"
          >
            <Text className="text-text-secondary text-sm">Historique</Text>
          </Pressable>
        </View>
      </Card>

      {/* Course section */}
      <Card>
        <Text className="text-text font-bold text-lg mb-3">Course a pied</Text>

        <View className="flex-row justify-around mb-3">
          <View className="items-center">
            <Text className="text-text font-bold text-base">
              {Math.round(stats.thisWeekDistance * 10) / 10} km
            </Text>
            <Text className="text-text-muted text-xs">Cette semaine</Text>
          </View>
          {lastRun && (
            <View className="items-center">
              <Text className="text-text font-bold text-base">
                {formatPace(lastRun.duration_minutes, lastRun.distance_km)} /km
              </Text>
              <Text className="text-text-muted text-xs">
                Derniere ({formatDateShort(lastRun.date)})
              </Text>
            </View>
          )}
        </View>

        <View className="flex-row gap-2">
          <Button
            title="Logger une course"
            onPress={() => router.push("/(tabs)/sport/add-run" as any)}
            className="flex-1"
          />
          <Pressable
            onPress={() => router.push("/(tabs)/sport/running" as any)}
            className="bg-surface-light rounded-button py-3 px-4 items-center justify-center active:opacity-70"
          >
            <Feather name="bar-chart-2" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
      </Card>
    </SafeScreen>
  );
}
