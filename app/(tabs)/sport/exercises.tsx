import { useEffect, useState, useRef } from "react";
import { View, Text, TextInput, SectionList, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { SafeScreen } from "../../../components/SafeScreen";
import { BottomSheet } from "../../../components/ui/BottomSheet";
import { Button } from "../../../components/ui/Button";
import { ConfirmModal } from "../../../components/ui/ConfirmModal";
import { useExerciseStore } from "../../../stores/exerciseStore";
import { useWorkoutStore } from "../../../stores/workoutStore";
import { MUSCLE_GROUPS, type MuscleGroup } from "../../../lib/constants";
import { useColors } from "../../../lib/theme";
import { useRouter } from "expo-router";
import type { Tables } from "../../../types/database";

export default function ExercisesScreen() {
  const c = useColors();
  const router = useRouter();
  const { exercises, loading, fetchExercises, addExercise, deleteExercise } = useExerciseStore();
  const { lastSets, fetchLastSets } = useWorkoutStore();
  const [search, setSearch] = useState("");
  const [newName, setNewName] = useState("");
  const [newGroup, setNewGroup] = useState<MuscleGroup>(MUSCLE_GROUPS[0]);
  const [selectedExercise, setSelectedExercise] = useState<Tables<"exercises"> | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const addSheetRef = useRef<BottomSheetModal>(null);
  const detailSheetRef = useRef<BottomSheetModal>(null);

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
      addSheetRef.current?.dismiss();
    }
  };

  const handleSelectExercise = async (exercise: Tables<"exercises">) => {
    setSelectedExercise(exercise);
    await fetchLastSets(exercise.id);
    detailSheetRef.current?.present();
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    await deleteExercise(confirmDeleteId);
    setConfirmDeleteId(null);
    detailSheetRef.current?.dismiss();
  };

  return (
    <SafeScreen>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={c.text} />
        </Pressable>
        <Text style={{ color: c.text }} className="text-xl font-bold">Exercices</Text>
        <Pressable onPress={() => addSheetRef.current?.present()} className="p-2">
          <Feather name="plus" size={24} color={c.primary} />
        </Pressable>
      </View>

      {/* Search */}
      <TextInput
        style={{ backgroundColor: c.surface, color: c.text }}
        className="rounded-button px-4 py-3 mb-4 text-sm"
        placeholder="Rechercher un exercice..."
        placeholderTextColor={c.textMuted}
        value={search}
        onChangeText={setSearch}
      />

      {/* List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View style={{ backgroundColor: c.background }} className="py-2">
            <Text style={{ color: c.primary }} className="font-bold text-sm">{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable
            style={{ borderBottomColor: c.surface }}
            className="py-3 border-b active:opacity-70"
            onPress={() => handleSelectExercise(item)}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-1">
                <Text style={{ color: c.text }} className="text-sm">{item.name}</Text>
                {item.secondary_muscle_group && (
                  <Text style={{ color: c.textMuted }} className="text-xs">+ {item.secondary_muscle_group}</Text>
                )}
              </View>
              {item.user_id && (
                <View style={{ backgroundColor: c.primary + "33" }} className="px-2 py-1 rounded-sm">
                  <Text style={{ color: c.primary }} className="text-xs">Custom</Text>
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
          style={{ backgroundColor: c.surfaceLight, color: c.text }}
          className="rounded-button px-4 py-3 mb-4 text-sm"
          placeholder="Nom de l'exercice"
          placeholderTextColor={c.textMuted}
          value={newName}
          onChangeText={setNewName}
        />
        <Text style={{ color: c.textSecondary }} className="text-sm mb-2">Groupe musculaire</Text>
        <View className="flex-row flex-wrap gap-2 mb-6">
          {MUSCLE_GROUPS.map((g) => (
            <Pressable
              key={g}
              style={{ backgroundColor: newGroup === g ? c.primary : c.surfaceLight }}
              className="px-3 py-2 rounded-button"
              onPress={() => setNewGroup(g)}
            >
              <Text style={{ color: newGroup === g ? c.primaryOnText : c.text }} className={`text-sm ${newGroup === g ? "font-bold" : ""}`}>
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
            <Text style={{ color: c.textSecondary }} className="text-sm mb-1">
              {selectedExercise.muscle_group}
              {selectedExercise.secondary_muscle_group && ` / ${selectedExercise.secondary_muscle_group}`}
            </Text>
            {selectedExercise.description && (
              <Text style={{ color: c.textMuted }} className="text-xs mb-4">{selectedExercise.description}</Text>
            )}

            {lastSets[selectedExercise.id] && lastSets[selectedExercise.id].length > 0 && (
              <View className="mb-4">
                <Text style={{ color: c.text }} className="font-bold text-sm mb-2">Derniere seance</Text>
                {lastSets[selectedExercise.id].map((s, i) => (
                  <Text key={i} style={{ color: c.textSecondary }} className="text-sm">
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
