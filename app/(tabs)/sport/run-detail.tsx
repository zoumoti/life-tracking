import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { SafeScreen } from "../../../components/SafeScreen";
import { Card } from "../../../components/ui/Card";
import { ConfirmModal } from "../../../components/ui/ConfirmModal";
import { useRunningStore } from "../../../stores/runningStore";
import { formatDateLong, formatPace } from "../../../lib/formatters";
import { RUNNING_TYPE_LABELS } from "../../../lib/constants";
import { useColors } from "../../../lib/theme";
import type { RunningType } from "../../../lib/constants";

export default function RunDetailScreen() {
  const c = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { runs, deleteRun } = useRunningStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const run = runs.find((r) => r.id === id);

  const handleDelete = async () => {
    if (!id) return;
    await deleteRun(id);
    router.back();
  };

  if (!run) {
    return (
      <SafeScreen>
        <View className="flex-1 items-center justify-center">
          <Text style={{ color: c.textSecondary }}>Course introuvable</Text>
          <Pressable onPress={() => router.back()} className="mt-4">
            <Text style={{ color: c.primary }} className="font-semibold">Retour</Text>
          </Pressable>
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View className="flex-row items-center justify-between mb-4">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={c.text} />
        </Pressable>
        <Text style={{ color: c.text }} className="text-xl font-bold">Detail course</Text>
        <Pressable onPress={() => setShowMenu((v) => !v)} className="p-2">
          <Feather name="more-vertical" size={22} color={c.text} />
        </Pressable>
      </View>

      {showMenu && (
        <View
          className="absolute right-4 top-14 z-50 rounded-xl py-2 px-1"
          style={{ backgroundColor: c.surface, elevation: 8 }}
        >
          <Pressable
            onPress={() => {
              setShowMenu(false);
              router.push({ pathname: "/(tabs)/sport/add-run", params: { editId: run.id } } as any);
            }}
            className="flex-row items-center px-4 py-3"
          >
            <Feather name="edit-2" size={16} color={c.text} />
            <Text className="ml-3 text-sm" style={{ color: c.text }}>Modifier</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              setShowMenu(false);
              setShowDelete(true);
            }}
            className="flex-row items-center px-4 py-3"
          >
            <Feather name="trash-2" size={16} color={c.danger} />
            <Text className="ml-3 text-sm" style={{ color: c.danger }}>Supprimer</Text>
          </Pressable>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-lg font-bold mb-4" style={{ color: c.text }}>
          {formatDateLong(run.date)}
        </Text>

        <View style={{ backgroundColor: c.surface }} className="flex-row justify-around mb-4 rounded-card py-4">
          <View className="items-center">
            <Text style={{ color: c.primary }} className="font-bold text-2xl">
              {run.distance_km} km
            </Text>
            <Text style={{ color: c.textSecondary }} className="text-xs">Distance</Text>
          </View>
          <View className="items-center">
            <Text style={{ color: c.primary }} className="font-bold text-2xl">
              {run.duration_minutes} min
            </Text>
            <Text style={{ color: c.textSecondary }} className="text-xs">Duree</Text>
          </View>
          <View className="items-center">
            <Text style={{ color: c.primary }} className="font-bold text-2xl">
              {formatPace(run.duration_minutes, run.distance_km)}
            </Text>
            <Text style={{ color: c.textSecondary }} className="text-xs">/km</Text>
          </View>
        </View>

        <Card className="mb-4">
          <View className="flex-row justify-between mb-3">
            <Text style={{ color: c.textSecondary }} className="text-sm">Type</Text>
            <Text style={{ color: c.text }} className="font-semibold text-sm">
              {RUNNING_TYPE_LABELS[run.type as RunningType]}
            </Text>
          </View>
          <View className="flex-row justify-between items-center mb-3">
            <Text style={{ color: c.textSecondary }} className="text-sm">Ressenti</Text>
            <View className="flex-row items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <View
                  key={i}
                  style={{ backgroundColor: i < run.perceived_effort ? c.primary : c.surfaceLight }}
                  className="w-3 h-3 rounded-full mx-0.5"
                />
              ))}
            </View>
          </View>
          {run.notes && (
            <View>
              <Text style={{ color: c.textSecondary }} className="text-sm mb-1">Notes</Text>
              <Text style={{ color: c.text }} className="text-sm">{run.notes}</Text>
            </View>
          )}
        </Card>
      </ScrollView>

      <ConfirmModal
        visible={showDelete}
        title="Supprimer la course"
        message="Es-tu sur de vouloir supprimer cette course ?"
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </SafeScreen>
  );
}
