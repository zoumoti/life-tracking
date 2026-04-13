import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../lib/theme";
import { DAY_LABELS } from "../../lib/dateUtils";

type Props = {
  currentStreak: number;
  bestStreak: number;
  completionRate: number; // 0-1
  bestDay: number;  // ISO day 0=Mon
  worstDay: number; // ISO day 0=Mon
};

function StatBox({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View className="flex-1 bg-surface rounded-card p-3 items-center">
      <Feather name={icon as any} size={18} color={colors.primary} />
      <Text className="text-text text-lg font-bold mt-1">{value}</Text>
      <Text className="text-text-muted text-xs mt-1">{label}</Text>
    </View>
  );
}

export function HabitStats({ currentStreak, bestStreak, completionRate, bestDay, worstDay }: Props) {
  return (
    <View>
      <View className="flex-row gap-3 mb-3">
        <StatBox icon="zap" label="Streak actuel" value={`${currentStreak}j`} />
        <StatBox icon="award" label="Meilleur streak" value={`${bestStreak}j`} />
        <StatBox
          icon="percent"
          label="Completion (30j)"
          value={`${Math.round(completionRate * 100)}%`}
        />
      </View>
      <View className="flex-row gap-3">
        <StatBox icon="thumbs-up" label="Meilleur jour" value={DAY_LABELS[bestDay]} />
        <StatBox icon="thumbs-down" label="Jour le plus rate" value={DAY_LABELS[worstDay]} />
      </View>
    </View>
  );
}
