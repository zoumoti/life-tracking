import { useEffect } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeScreen } from "../../../components/SafeScreen";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { SimpleBarChart } from "../../../components/sport/SimpleBarChart";
import { useRunningStore } from "../../../stores/runningStore";
import { formatDateShort, formatPace } from "../../../lib/formatters";
import { RUNNING_TYPE_LABELS } from "../../../lib/constants";
import { useColors } from "../../../lib/theme";
import type { RunningType } from "../../../lib/constants";

export default function RunningScreen() {
  const c = useColors();
  const router = useRouter();
  const { runs, loading, fetchRuns, getStats, getWeeklyDistances } = useRunningStore();

  useEffect(() => {
    fetchRuns();
  }, []);

  const stats = getStats();
  const weeklyData = getWeeklyDistances();

  return (
    <SafeScreen>
      <View className="flex-row items-center justify-between mb-4">
        <Pressable onPress={() => router.back()} className="p-2">
          <Feather name="arrow-left" size={24} color={c.text} />
        </Pressable>
        <Text style={{ color: c.text }} className="text-xl font-bold">Course a pied</Text>
        <Pressable onPress={() => router.push("/(tabs)/sport/add-run" as any)} className="p-2">
          <Feather name="plus" size={24} color={c.primary} />
        </Pressable>
      </View>

      <FlatList
        data={runs}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <View style={{ backgroundColor: c.surface }} className="flex-row justify-around mb-4 rounded-card py-4">
              <View className="items-center">
                <Text style={{ color: c.text }} className="font-bold text-lg">
                  {Math.round(stats.thisWeekDistance * 10) / 10} km
                </Text>
                <Text style={{ color: c.textSecondary }} className="text-xs">Cette semaine</Text>
              </View>
              <View className="items-center">
                <Text style={{ color: c.text }} className="font-bold text-lg">
                  {stats.avgPace > 0 ? formatPace(stats.avgPace, 1) : "--:--"}
                </Text>
                <Text style={{ color: c.textSecondary }} className="text-xs">Allure moy.</Text>
              </View>
              <View className="items-center">
                <Text style={{ color: c.text }} className="font-bold text-lg">{stats.totalRuns}</Text>
                <Text style={{ color: c.textSecondary }} className="text-xs">Courses</Text>
              </View>
            </View>

            {weeklyData.some((w) => w.value > 0) && (
              <Card className="mb-4">
                <Text style={{ color: c.text }} className="font-bold text-sm mb-3">Distance / semaine</Text>
                <SimpleBarChart data={weeklyData} unit=" km" />
              </Card>
            )}

            <Text style={{ color: c.textSecondary }} className="text-sm mb-2">Historique</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card className="mb-2">
            <View className="flex-row items-center justify-between">
              <View>
                <Text style={{ color: c.text }} className="font-bold text-sm">
                  {formatDateShort(item.date)} — {item.distance_km} km
                </Text>
                <Text style={{ color: c.textSecondary }} className="text-xs mt-1">
                  {RUNNING_TYPE_LABELS[item.type as RunningType]} · {formatPace(item.duration_minutes, item.distance_km)} /km
                </Text>
              </View>
              <View className="flex-row items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <View
                    key={i}
                    style={{ backgroundColor: i < item.perceived_effort ? c.primary : c.surfaceLight }}
                    className="w-2 h-2 rounded-full mx-0.5"
                  />
                ))}
              </View>
            </View>
          </Card>
        )}
        ListEmptyComponent={
          !loading ? (
            <View className="items-center mt-8">
              <Feather name="trending-up" size={48} color={c.textMuted} />
              <Text style={{ color: c.textSecondary }} className="mt-4">Aucune course</Text>
              <Button
                title="Logger ta premiere course"
                onPress={() => router.push("/(tabs)/sport/add-run" as any)}
                className="mt-4"
              />
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeScreen>
  );
}
