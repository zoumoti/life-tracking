import { Modal, View, Text } from "react-native";
import { Button } from "../ui/Button";
import { Feather } from "@expo/vector-icons";
import { formatDuration } from "../../lib/formatters";
import { useColors } from "../../lib/theme";

type Props = {
  visible: boolean;
  duration: number;
  totalVolume: number;
  totalSets: number;
  records: { exerciseName: string; weight: number }[];
  onClose: () => void;
};

export function WorkoutSummary({ visible, duration, totalVolume, totalSets, records, onClose }: Props) {
  const c = useColors();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-end">
        <View className="rounded-t-3xl px-6 pt-6 pb-10" style={{ backgroundColor: c.surface }}>
          <Text className="text-xl font-bold text-center mb-6" style={{ color: c.text }}>
            Seance terminee !
          </Text>

          <View className="flex-row justify-around mb-6">
            <View className="items-center">
              <Feather name="clock" size={24} color={c.primary} />
              <Text className="font-bold text-lg mt-1" style={{ color: c.text }}>{formatDuration(duration)}</Text>
              <Text className="text-xs" style={{ color: c.textSecondary }}>Duree</Text>
            </View>
            <View className="items-center">
              <Feather name="trending-up" size={24} color={c.primary} />
              <Text className="font-bold text-lg mt-1" style={{ color: c.text }}>
                {Math.round(totalVolume).toLocaleString()} kg
              </Text>
              <Text className="text-xs" style={{ color: c.textSecondary }}>Volume</Text>
            </View>
            <View className="items-center">
              <Feather name="layers" size={24} color={c.primary} />
              <Text className="font-bold text-lg mt-1" style={{ color: c.text }}>{totalSets}</Text>
              <Text className="text-xs" style={{ color: c.textSecondary }}>Series</Text>
            </View>
          </View>

          {records.length > 0 && (
            <View className="rounded-card p-4 mb-6" style={{ backgroundColor: c.primary + "1A" }}>
              <Text className="font-bold text-sm mb-2" style={{ color: c.primary }}>
                Records battus !
              </Text>
              {records.map((r) => (
                <Text key={r.exerciseName} className="text-sm" style={{ color: c.text }}>
                  {r.exerciseName} — {r.weight} kg
                </Text>
              ))}
            </View>
          )}

          <Button title="Fermer" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}
