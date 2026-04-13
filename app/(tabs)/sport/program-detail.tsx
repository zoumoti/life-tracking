import { useEffect, useState, useMemo } from "react";
import { View, Text, FlatList, Pressable, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeScreen } from "../../../components/SafeScreen";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { ConfirmModal } from "../../../components/ui/ConfirmModal";
import { ExercisePickerSheet } from "../../../components/sport/ExercisePickerSheet";
import { useWorkoutStore } from "../../../stores/workoutStore";
import { useExerciseStore } from "../../../stores/exerciseStore";
import { colors } from "../../../lib/theme";

export default function ProgramDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { programs, updateProgram, deleteProgram, addExerciseToProgram, removeExerciseFromProgram, startSession } = useWorkoutStore();
  const { fetchExercises } = useExerciseStore();
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const program = useMemo(() => programs.find((p) => p.id === id), [programs, id]);

  useEffect(() => {
    fetchExercises();
    if (program) setName(program.name);
  }, [program?.id]);

  const exercisePicker = ExercisePickerSheet({
    onSelect: async (exercise) => {
      if (!id) return;
      const sortOrder = (program?.exercises?.length ?? 0) + 1;
      await addExerciseToProgram(id, exercise.id, sortOrder);
    },
  });

  const handleSaveName = async () => {
    if (!id || !name.trim()) return;
    await updateProgram(id, { name: name.trim() });
    setEditingName(false);
  };

  const handleDelete = async () => {
    if (!id) return;
    await deleteProgram(id);
    setConfirmDelete(false);
    router.back();
  };

  const handleLaunch = () => {
    if (!program) return;
    const exercises = program.exercises
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((pe) => ({ id: pe.exercise.id, name: pe.exercise.name }));
    startSession(program.id, program.name, exercises);
    router.push("/(tabs)/sport/active-workout" as never);
  };

  if (!program) {
    return (
      <SafeScreen>
        <Text className="text-text-secondary text-center mt-12">Programme introuvable</Text>
      </SafeScreen>
    );
  }

  const sortedExercises = [...(program.exercises ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <SafeScreen>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={colors.text} />
        </Pressable>
        {editingName ? (
          <View className="flex-1 flex-row items-center mx-2">
            <TextInput
              className="flex-1 bg-surface text-text rounded-button px-3 py-2 text-base"
              value={name}
              onChangeText={setName}
              autoFocus
              onSubmitEditing={handleSaveName}
            />
            <Pressable onPress={handleSaveName} className="p-2 ml-2">
              <Feather name="check" size={20} color={colors.success} />
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setEditingName(true)} className="flex-row items-center">
            <Text className="text-text text-xl font-bold">{program.name}</Text>
            <Feather name="edit-2" size={14} color={colors.textMuted} style={{ marginLeft: 8 }} />
          </Pressable>
        )}
        <View className="w-10" />
      </View>

      {/* Exercises */}
      <FlatList
        data={sortedExercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Card className="mb-2">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <Text className="text-text-muted text-sm w-6">{index + 1}</Text>
                <Text className="text-text text-sm">{item.exercise.name}</Text>
              </View>
              <Pressable
                onPress={() => removeExerciseFromProgram(item.id)}
                className="p-2"
              >
                <Feather name="x" size={16} color={colors.danger} />
              </Pressable>
            </View>
          </Card>
        )}
        ListFooterComponent={
          <View className="mt-4 gap-3">
            <Button
              title="Ajouter un exercice"
              variant="secondary"
              onPress={exercisePicker.open}
            />
            <Button
              title="Lancer ce programme"
              onPress={handleLaunch}
              disabled={sortedExercises.length === 0}
            />
            <Button
              title="Supprimer le programme"
              variant="destructive"
              onPress={() => setConfirmDelete(true)}
            />
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {exercisePicker.sheet}

      <ConfirmModal
        visible={confirmDelete}
        title="Supprimer le programme"
        message={`Supprimer "${program.name}" ? Cette action est irreversible.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </SafeScreen>
  );
}
