import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, TextInput } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeScreen } from "../../../components/SafeScreen";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { useWorkoutStore } from "../../../stores/workoutStore";
import { useColors } from "../../../lib/theme";

export default function ProgramsScreen() {
  const c = useColors();
  const router = useRouter();
  const { programs, programsLoading, fetchPrograms, createProgram } = useWorkoutStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const { id } = await createProgram(newName.trim());
    setNewName("");
    setShowCreate(false);
    if (id) {
      router.push({ pathname: "/(tabs)/sport/program-detail", params: { id } });
    }
  };

  return (
    <SafeScreen>
      <View className="flex-row items-center justify-between mb-4">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={c.text} />
        </Pressable>
        <Text style={{ color: c.text }} className="text-xl font-bold">Programmes</Text>
        <Pressable onPress={() => setShowCreate(true)} className="p-2">
          <Feather name="plus" size={24} color={c.primary} />
        </Pressable>
      </View>

      {showCreate && (
        <Card className="mb-4">
          <TextInput
            style={{ backgroundColor: c.surfaceLight, color: c.text }}
            className="rounded-button px-4 py-3 mb-3 text-sm"
            placeholder="Nom du programme"
            placeholderTextColor={c.textMuted}
            value={newName}
            onChangeText={setNewName}
            autoFocus
          />
          <View className="flex-row gap-3">
            <Button title="Annuler" variant="secondary" onPress={() => { setShowCreate(false); setNewName(""); }} className="flex-1" />
            <Button title="Creer" onPress={handleCreate} className="flex-1" />
          </View>
        </Card>
      )}

      <FlatList
        data={programs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card
            onPress={() => router.push({ pathname: "/(tabs)/sport/program-detail", params: { id: item.id } })}
            className="mb-3"
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text style={{ color: c.text }} className="font-bold text-base">{item.name}</Text>
                <Text style={{ color: c.textSecondary }} className="text-sm mt-1">
                  {item.exercises?.length ?? 0} exercice{(item.exercises?.length ?? 0) > 1 ? "s" : ""}
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={c.textMuted} />
            </View>
          </Card>
        )}
        ListEmptyComponent={
          !programsLoading ? (
            <View className="items-center mt-12">
              <Feather name="clipboard" size={48} color={c.textMuted} />
              <Text style={{ color: c.textSecondary }} className="mt-4">Aucun programme</Text>
              <Text style={{ color: c.textMuted }} className="text-sm mt-1">Cree ton premier programme d'entrainement</Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeScreen>
  );
}
