import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { SafeScreen } from "../../../components/SafeScreen";
import { Card } from "../../../components/ui/Card";
import { ConfirmModal } from "../../../components/ui/ConfirmModal";
import { SetRow } from "../../../components/sport/SetRow";
import { RestTimer } from "../../../components/sport/RestTimer";
import { ExercisePickerSheet } from "../../../components/sport/ExercisePickerSheet";
import { WorkoutSummary } from "../../../components/sport/WorkoutSummary";
import { useWorkoutStore } from "../../../stores/workoutStore";
import { useExerciseStore } from "../../../stores/exerciseStore";
import { formatDuration } from "../../../lib/formatters";
import { useColors } from "../../../lib/theme";

function useTimer(startedAt: number | null) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startedAt) return;
    const interval = setInterval(() => {
      setElapsed(Date.now() - startedAt);
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);
  return elapsed;
}

export default function ActiveWorkoutScreen() {
  const c = useColors();
  const router = useRouter();
  const {
    currentSession,
    addExerciseToSession,
    addSet,
    startRestTimer,
    skipRestTimer,
    finishSession,
    lastSets,
    fetchLastSets,
  } = useWorkoutStore();
  const { fetchExercises } = useExerciseStore();

  const [confirmEnd, setConfirmEnd] = useState(false);
  const [summary, setSummary] = useState<{
    duration: number;
    totalVolume: number;
    totalSets: number;
    records: { exerciseName: string; weight: number }[];
  } | null>(null);

  const elapsed = useTimer(currentSession?.startedAt ?? null);

  // Fetch data when session starts; reset summary only for a NEW session (not when session ends)
  useEffect(() => {
    if (currentSession) {
      setSummary(null);
      fetchExercises();
      currentSession.exercises.forEach((e) => fetchLastSets(e.exerciseId));
    }
  }, [currentSession?.id]);

  const exercisePicker = ExercisePickerSheet({
    onSelect: (exercise) => {
      addExerciseToSession(exercise.id, exercise.name);
      fetchLastSets(exercise.id);
    },
  });

  const handleValidateSet = useCallback(
    (exerciseIndex: number, weightKg: number, reps: number) => {
      addSet(exerciseIndex, reps, weightKg);
      startRestTimer();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
    [addSet, startRestTimer]
  );

  const handleFinish = async () => {
    setConfirmEnd(false);
    const result = await finishSession();
    setSummary(result);
  };

  const handleSummaryClose = () => {
    setSummary(null);
    router.replace("/(tabs)/sport" as any);
  };

  // Show summary after finishing (currentSession is null but summary exists)
  if (summary) {
    return (
      <SafeScreen>
        <WorkoutSummary
          visible
          duration={summary.duration}
          totalVolume={summary.totalVolume}
          totalSets={summary.totalSets}
          records={summary.records}
          onClose={handleSummaryClose}
        />
      </SafeScreen>
    );
  }

  if (!currentSession) {
    return (
      <SafeScreen>
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: c.textSecondary }}>Aucune seance en cours</Text>
          <Pressable onPress={() => router.back()} className="mt-4">
            <Text style={{ color: c.primary }} className="font-semibold">Retour</Text>
          </Pressable>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      {/* Global timer header */}
      <View style={{ backgroundColor: c.surface }} className="flex-row items-center justify-between mb-4 rounded-card px-4 py-3">
        <View className="flex-row items-center">
          <Feather name="clock" size={20} color={c.primary} />
          <Text style={{ color: c.primary }} className="font-bold text-xl ml-2">
            {formatDuration(elapsed)}
          </Text>
        </View>
        <Pressable
          onPress={() => setConfirmEnd(true)}
          style={{ backgroundColor: c.danger }}
          className="px-4 py-2 rounded-button active:opacity-80"
        >
          <Text style={{ color: "#ffffff" }} className="font-semibold text-sm">Terminer</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {currentSession.exercises.map((exercise, exIndex) => {
          const lastSetInfo = lastSets[exercise.exerciseId];
          return (
            <Card key={`${exercise.exerciseId}-${exIndex}`} className="mb-4">
              <Text style={{ color: c.text }} className="font-bold text-base mb-1">
                {exercise.exerciseName}
              </Text>

              {lastSetInfo && lastSetInfo.length > 0 && (
                <Text style={{ color: c.textMuted }} className="text-xs mb-3">
                  Derniere fois : {lastSetInfo[0].weightKg}kg x {lastSetInfo[0].reps}
                </Text>
              )}

              {exercise.sets.map((s, setIndex) => (
                <SetRow
                  key={setIndex}
                  index={setIndex}
                  completed={{ weightKg: s.weightKg, reps: s.reps }}
                />
              ))}

              <SetRow
                index={exercise.sets.length}
                defaultWeight={
                  exercise.sets.length > 0
                    ? exercise.sets[exercise.sets.length - 1].weightKg
                    : lastSetInfo?.[0]?.weightKg
                }
                defaultReps={
                  exercise.sets.length > 0
                    ? exercise.sets[exercise.sets.length - 1].reps
                    : lastSetInfo?.[0]?.reps
                }
                onValidate={(w, r) => handleValidateSet(exIndex, w, r)}
              />
            </Card>
          );
        })}

        {currentSession.restTimerStart && (
          <RestTimer
            startTime={currentSession.restTimerStart}
            onSkip={skipRestTimer}
          />
        )}

        <Pressable
          onPress={exercisePicker.open}
          style={{ borderColor: c.surfaceLight }}
          className="flex-row items-center justify-center py-4 mb-8 border border-dashed rounded-card active:opacity-70"
        >
          <Feather name="plus" size={20} color={c.primary} />
          <Text style={{ color: c.primary }} className="font-semibold text-sm ml-2">
            Ajouter un exercice
          </Text>
        </Pressable>
      </ScrollView>

      {exercisePicker.sheet}

      <ConfirmModal
        visible={confirmEnd}
        title="Terminer la seance ?"
        message="La seance sera sauvegardee et tu pourras consulter le resume."
        confirmLabel="Terminer"
        destructive={false}
        onConfirm={handleFinish}
        onCancel={() => setConfirmEnd(false)}
      />

    </SafeScreen>
  );
}
