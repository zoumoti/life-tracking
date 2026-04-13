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
  isAvoid?: boolean;
};

function StatBox({ icon, label, value, iconColor }: { icon: string; label: string; value: string; iconColor?: string }) {
  return (
    <View className="flex-1 bg-surface rounded-card p-3 items-center">
      <Feather name={icon as any} size={18} color={iconColor || colors.primary} />
      <Text className="text-text text-lg font-bold mt-1">{value}</Text>
      <Text className="text-text-muted text-xs mt-1">{label}</Text>
    </View>
  );
}

export function HabitStats({ currentStreak, bestStreak, completionRate, bestDay, worstDay, isAvoid }: Props) {
  const streakLabel = isAvoid ? "Jours sans" : "Streak actuel";
  const bestLabel = isAvoid ? "Record sans" : "Meilleur streak";
  const accentColor = isAvoid ? colors.success : colors.primary;

  return (
    <View>
      <View className="flex-row gap-3 mb-3">
        <StatBox icon={isAvoid ? "shield" : "zap"} label={streakLabel} value={`${currentStreak}j`} iconColor={accentColor} />
        <StatBox icon="award" label={bestLabel} value={`${bestStreak}j`} iconColor={accentColor} />
        <StatBox
          icon="percent"
          label={isAvoid ? "Resistance (30j)" : "Completion (30j)"}
          value={`${Math.round(completionRate * 100)}%`}
        />
      </View>
      <View className="flex-row gap-3">
        <StatBox icon="thumbs-up" label={isAvoid ? "Jour le plus fort" : "Meilleur jour"} value={DAY_LABELS[bestDay]} />
        <StatBox icon="thumbs-down" label={isAvoid ? "Jour le plus dur" : "Jour le plus rate"} value={DAY_LABELS[worstDay]} />
      </View>
    </View>
  );
}
