import { useRef, useCallback, useState } from "react";
import { View, Text, TextInput, Pressable, SectionList } from "react-native";
import GorhomBottomSheet from "@gorhom/bottom-sheet";
import { BottomSheet } from "../ui/BottomSheet";
import { useExerciseStore } from "../../stores/exerciseStore";
import { MUSCLE_GROUPS } from "../../lib/constants";
import { colors } from "../../lib/theme";
import type { Tables } from "../../types/database";

type Props = {
  onSelect: (exercise: Tables<"exercises">) => void;
};

export function ExercisePickerSheet({ onSelect }: Props) {
  const sheetRef = useRef<GorhomBottomSheet>(null);
  const { exercises } = useExerciseStore();
  const [search, setSearch] = useState("");

  const open = useCallback(() => {
    sheetRef.current?.snapToIndex(0);
  }, []);

  const close = useCallback(() => {
    sheetRef.current?.close();
    setSearch("");
  }, []);

  const filtered = exercises.filter((e) =>
    e.name.toLowerCase().includes(search.toLowerCase())
  );

  const sections = MUSCLE_GROUPS.map((group) => ({
    title: group.charAt(0).toUpperCase() + group.slice(1),
    data: filtered.filter((e) => e.muscle_group === group),
  })).filter((s) => s.data.length > 0);

  return {
    open,
    close,
    sheet: (
      <BottomSheet ref={sheetRef} title="Choisir un exercice" snapPoints={["70%", "90%"]}>
        <TextInput
          className="bg-surface-light text-text rounded-button px-4 py-3 mb-4 text-sm"
          placeholder="Rechercher..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderSectionHeader={({ section }) => (
            <Text className="text-primary font-bold text-sm py-2 bg-background">
              {section.title}
            </Text>
          )}
          renderItem={({ item }) => (
            <Pressable
              className="py-3 border-b border-surface-light active:opacity-70"
              onPress={() => {
                onSelect(item);
                close();
              }}
            >
              <Text className="text-text text-sm">{item.name}</Text>
              {item.secondary_muscle_group && (
                <Text className="text-text-muted text-xs mt-1">
                  + {item.secondary_muscle_group}
                </Text>
              )}
            </Pressable>
          )}
        />
      </BottomSheet>
    ),
  };
}
