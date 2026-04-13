import { Modal, View, Text } from "react-native";
import { Button } from "../ui/Button";
import { Feather } from "@expo/vector-icons";
import { formatDuration } from "../../lib/formatters";
import { colors } from "../../lib/theme";

type Props = {
  visible: boolean;
  duration: number;
  totalVolume: number;
  totalSets: number;
  records: { exerciseName: string; weight: number }[];
  onClose: () => void;
};

export function WorkoutSummary({ visible, duration, totalVolume, totalSets, records, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-surface rounded-t-3xl px-6 pt-6 pb-10">
          <Text className="text-text text-xl font-bold text-center mb-6">
            Seance terminee !
          </Text>

          <View className="flex-row justify-around mb-6">
            <View className="items-center">
              <Feather name="clock" size={24} color={colors.primary} />
              <Text className="text-text font-bold text-lg mt-1">{formatDuration(duration)}</Text>
              <Text className="text-text-secondary text-xs">Duree</Text>
            </View>
            <View className="items-center">
              <Feather name="trending-up" size={24} color={colors.primary} />
              <Text className="text-text font-bold text-lg mt-1">
                {Math.round(totalVolume).toLocaleString()} kg
              </Text>
              <Text className="text-text-secondary text-xs">Volume</Text>
            </View>
            <View className="items-center">
              <Feather name="layers" size={24} color={colors.primary} />
              <Text className="text-text font-bold text-lg mt-1">{totalSets}</Text>
              <Text className="text-text-secondary text-xs">Series</Text>
            </View>
          </View>

          {records.length > 0 && (
            <View className="bg-primary/10 rounded-card p-4 mb-6">
              <Text className="text-primary font-bold text-sm mb-2">
                Records battus !
              </Text>
              {records.map((r) => (
                <Text key={r.exerciseName} className="text-text text-sm">
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
