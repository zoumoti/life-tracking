import { useEffect, useState, useRef } from "react";
import { View, Text, TextInput, SectionList, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import GorhomBottomSheet from "@gorhom/bottom-sheet";
import { SafeScreen } from "../../../components/SafeScreen";
import { BottomSheet } from "../../../components/ui/BottomSheet";
import { Button } from "../../../components/ui/Button";
import { ConfirmModal } from "../../../components/ui/ConfirmModal";
import { useExerciseStore } from "../../../stores/exerciseStore";
import { useWorkoutStore } from "../../../stores/workoutStore";
import { MUSCLE_GROUPS, type MuscleGroup } from "../../../lib/constants";
import { colors } from "../../../lib/theme";
import { useRouter } from "expo-router";
import type { Tables } from "../../../types/database";

export default function ExercisesScreen() {
  const router = useRouter();
  const { exercises, loading, fetchExercises, addExercise, deleteExercise } = useExerciseStore();
  const { lastSets, fetchLastSets } = useWorkoutStore();
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [newGroup, setNewGroup] = useState<MuscleGroup>(MUSCLE_GROUPS[0]);
  const [selectedExercise, setSelectedExercise] = useState<Tables<"exercises"> | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const addSheetRef = useRef<GorhomBottomSheet>(null);
  const detailSheetRef = useRef<GorhomBottomSheet>(null);

  useEffect(() => {
    fetchExercises();
  }, []);

  const filtered = exercises.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const sections = MUSCLE_GROUPS.map((group) => ({
    title: group.charAt(0).toUpperCase() + group.slice(1),
    data: filtered.filter((e) => e.muscle_group === group),
  })).filter((s) => s.data.length > 0);

  const handleAddExercise = async () => {
    if (!newName.trim()) return;
    const { error } = await addExercise({
      name: newName.trim(),
      muscle_group: newGroup,
    });
    if (!error) {
      setNewName("");
      addSheetRef.current?.close();
    }
  };

  const handleSelectExercise = async (exercise: Tables<"exercises">) => {
    setSelectedExercise(exercise);
    await fetchLastSets(exercise.id);
    detailSheetRef.current?.snapToIndex(0);
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    await deleteExercise(confirmDeleteId);
    setConfirmDeleteId(null);
    detailSheetRef.current?.close();
  };

  return (
    <SafeScreen>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={colors.text} />
        </Pressable>
        <Text className="text-text text-xl font-bold">Exercices</Text>
        <Pressable onPress={() => addSheetRef.current?.snapToIndex(0)} className="p-2">
          <Feather name="plus" size={24} color={colors.primary} />
        </Pressable>
      </View>

      {/* Search */}
      <TextInput
        className="bg-surface text-text rounded-button px-4 py-3 mb-4 text-sm"
        placeholder="Rechercher un exercice..."
        placeholderTextColor={colors.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      {/* List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View className="bg-background py-2">
            <Text className="text-primary font-bold text-sm">{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable
            className="py-3 border-b border-surface active:opacity-70"
            onPress={() => handleSelectExercise(item)}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text className="text-text text-sm">{item.name}</Text>
                {item.secondary_muscle_group && (
                  <Text className="text-text-muted text-xs">+ {item.secondary_muscle_group}</Text>
                )}
              </View>
              {item.user_id && (
                <View className="bg-primary/20 px-2 py-1 rounded-sm">
                  <Text className="text-primary text-xs">Custom</Text>
                </View>
              )}
            </View>
          </Pressable>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Add exercise bottom sheet */}
      <BottomSheet ref={addSheetRef} title="Nouvel exercice" snapPoints={["50%"]}>
        <TextInput
          className="bg-surface-light text-text rounded-button px-4 py-3 mb-4 text-sm"
          placeholder="Nom de l'exercice"
          placeholderTextColor={colors.textMuted}
          value={newName}
          onChangeText={setNewName}
        />
        <Text className="text-text-secondary text-sm mb-2">Groupe musculaire</Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {MUSCLE_GROUPS.map((g) => (
            <Pressable
              key={g}
              className={`px-3 py-2 rounded-button ${newGroup === g ? "bg-primary" : "bg-surface-light"}`}
              onPress={() => setNewGroup(g)}
            >
              <Text className={`text-sm ${newGroup === g ? "text-white font-bold" : "text-text"}`}>
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>
        <Button title="Ajouter" onPress={handleAddExercise} />
      </BottomSheet>

      {/* Exercise detail bottom sheet */}
      <BottomSheet ref={detailSheetRef} title={selectedExercise?.name ?? ""} snapPoints={["50%"]}>
        {selectedExercise && (
          <View>
            <Text className="text-text-secondary text-sm mb-1">
              {selectedExercise.muscle_group}
              {selectedExercise.secondary_muscle_group && ` / ${selectedExercise.secondary_muscle_group}`}
            </Text>
            {selectedExercise.description && (
              <Text className="text-text-muted text-xs mb-4">{selectedExercise.description}</Text>
            )}

            {lastSets[selectedExercise.id] && lastSets[selectedExercise.id].length > 0 && (
              <View className="mb-4">
                <Text className="text-text font-bold text-sm mb-2">Derniere seance</Text>
                {lastSets[selectedExercise.id].map((s, i) => (
                  <Text key={i} className="text-text-secondary text-sm">
                    Serie {i + 1} : {s.weightKg} kg x {s.reps}
                  </Text>
                ))}
              </View>
            )}

            {selectedExercise.user_id && (
              <Button
                title="Supprimer"
                variant="destructive"
                onPress={() => setConfirmDeleteId(selectedExercise.id)}
              />
            )}
          </View>
        )}
      </BottomSheet>

      {/* Confirm delete */}
      <ConfirmModal
        visible={!!confirmDeleteId}
        title="Supprimer l'exercice"
        message="Cette action est irreversible. Tes series passees seront conservees."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </SafeScreen>
  );
}
