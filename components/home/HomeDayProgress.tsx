import { useEffect, useRef } from "react";
import { View, Text } from "react-native";
import * as Haptics from "expo-haptics";
import { ProgressCircle } from "../ui/ProgressCircle";
import { useColors } from "../../lib/theme";

type Props = {
  completed: number;
  total: number;
  allDone: boolean;
};

function getMotivationalLabel(pct: number): string {
  if (pct === 0) return "C'est parti ! 💪";
  if (pct <= 25) return "Bon début !";
  if (pct <= 50) return "Continue comme ça 🔥";
  if (pct <= 75) return "Plus que quelques-unes !";
  if (pct < 100) return "Presque parfait ! 🎯";
  return "Journée parfaite ! 🏆";
}

export function HomeDayProgress({ completed, total, allDone }: Props) {
  const c = useColors();
  const progress = total === 0 ? 0 : completed / total;
  const pct = Math.round(progress * 100);
  const prevCompletedRef = useRef(completed);

  useEffect(() => {
    const justCompleted =
      allDone && prevCompletedRef.current < total && completed === total;

    if (justCompleted) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    prevCompletedRef.current = completed;
  }, [completed, total, allDone]);

  return (
    <View className="items-center mb-6">
      <ProgressCircle
        progress={progress}
        size={120}
        label={`${pct}%`}
        sublabel={`${completed}/${total} habitudes`}
      />
      <Text
        className="text-sm mt-3 font-semibold"
        style={{ color: pct === 100 ? c.primary : c.textSecondary }}
      >
        {getMotivationalLabel(pct)}
      </Text>
    </View>
  );
}
