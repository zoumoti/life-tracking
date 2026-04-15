import { useRef, useCallback, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { BottomSheetModal, BottomSheetSectionList } from "@gorhom/bottom-sheet";
import { Feather } from "@expo/vector-icons";
import { BottomSheet } from "../ui/BottomSheet";
import { Button } from "../ui/Button";
import { useExerciseStore } from "../../stores/exerciseStore";
import { MUSCLE_GROUPS, type MuscleGroup } from "../../lib/constants";
import { useColors } from "../../lib/theme";
import type { Tables } from "../../types/database";

type Props = {
  onSelect: (exercise: Tables<"exercises">) => void;
};

export function ExercisePickerSheet({ onSelect }: Props) {
  const c = useColors();
  const sheetRef = useRef<BottomSheetModal>(null);
  const { exercises, addExercise } = useExerciseStore();
  const [search, setSearch] = useState("");
  const [addMode, setAddMode] = useState(false);
  const [newName, setNewName] = useState("");
  const [newGroup, setNewGroup] = useState<MuscleGroup>(MUSCLE_GROUPS[0]);

  const open = useCallback(() => {
    sheetRef.current?.present();
  }, []);

  const close = useCallback(() => {
    sheetRef.current?.dismiss();
    setSearch("");
    setAddMode(false);
    setNewName("");
  }, []);

  const filtered = exercises.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const sections = MUSCLE_GROUPS.map((group) => ({
    title: group.charAt(0).toUpperCase() + group.slice(1),
    data: filtered.filter((e) => e.muscle_group === group),
  })).filter((s) => s.data.length > 0);

  const noResults = search.length > 0 && filtered.length === 0;

  const handleAddExercise = async () => {
    if (!newName.trim()) return;
    const result = await addExercise(newName.trim(), newGroup);
    if (!result.error) {
      setAddMode(false);
      setNewName("");
      setSearch("");
    }
  };

  return {
    open,
    close,
    sheet: (
      <BottomSheet ref={sheetRef} title="Choisir un exercice" snapPoints={["70%", "90%"]} scrollable={false}>
        <TextInput
          className="rounded-button px-4 py-3 mb-3 text-sm"
          style={{ backgroundColor: c.surfaceLight, color: c.text }}
          placeholder="Rechercher..."
          placeholderTextColor={c.textMuted}
          value={search}
          onChangeText={(t) => { setSearch(t); setAddMode(false); }}
        />

        {addMode ? (
          <View className="mt-2">
            <Text className="text-sm mb-2" style={{ color: c.textSecondary }}>Nom de l'exercice</Text>
            <TextInput
              className="rounded-button px-4 py-3 mb-4 text-sm"
              style={{ backgroundColor: c.surfaceLight, color: c.text }}
              placeholder="Ex: Curl incliné"
              placeholderTextColor={c.textMuted}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <Text className="text-sm mb-2" style={{ color: c.textSecondary }}>Groupe musculaire</Text>
            <View className="flex-row flex-wrap gap-2 mb-4">
              {MUSCLE_GROUPS.map((g) => (
                <Pressable
                  key={g}
                  style={{ backgroundColor: newGroup === g ? c.primary : c.surfaceLight }}
                  className="px-3 py-2 rounded-button"
                  onPress={() => setNewGroup(g)}
                >
                  <Text
                    className={`text-sm ${newGroup === g ? "font-bold" : ""}`}
                    style={{ color: newGroup === g ? c.primaryOnText : c.text }}
                  >
                    {g.charAt(0).toUpperCase() + g.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View className="flex-row gap-3">
              <Button title="Annuler" variant="secondary" onPress={() => setAddMode(false)} className="flex-1" />
              <Button title="Ajouter" onPress={handleAddExercise} disabled={!newName.trim()} className="flex-1" />
            </View>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            {noResults && (
              <Pressable
                onPress={() => { setAddMode(true); setNewName(search); }}
                className="flex-row items-center justify-center py-3 mb-3 rounded-button active:opacity-70"
                style={{ backgroundColor: c.primary + "1A" }}
              >
                <Feather name="plus" size={16} color={c.primary} />
                <Text className="text-sm font-medium ml-2" style={{ color: c.primary }}>
                  Creer "{search}"
                </Text>
              </Pressable>
            )}
            <BottomSheetSectionList
              sections={sections}
              keyExtractor={(item) => item.id}
              renderSectionHeader={({ section }) => (
                <Text className="font-bold text-sm py-2" style={{ color: c.primary, backgroundColor: c.surface }}>
                  {section.title}
                </Text>
              )}
              renderItem={({ item }) => (
                <Pressable
                  className="py-3 active:opacity-70"
                  style={{ borderBottomWidth: 1, borderBottomColor: c.surfaceLight }}
                  onPress={() => {
                    onSelect(item);
                    close();
                  }}
                >
                  <Text className="text-sm" style={{ color: c.text }}>{item.name}</Text>
                  {item.secondary_muscle_group && (
                    <Text className="text-xs mt-1" style={{ color: c.textMuted }}>
                      + {item.secondary_muscle_group}
                    </Text>
                  )}
                </Pressable>
              )}
              stickySectionHeadersEnabled
              contentContainerStyle={{ paddingBottom: 40 }}
            />
          </View>
        )}
      </BottomSheet>
    ),
  };
}
