import { View } from "react-native";
import { ProgressCircle } from "../ui/ProgressCircle";

type Props = {
  completed: number;
  total: number;
};

export function HomeDayProgress({ completed, total }: Props) {
  const progress = total === 0 ? 0 : completed / total;
  const pct = Math.round(progress * 100);

  return (
    <View className="items-center mb-6">
      <ProgressCircle
        progress={progress}
        size={120}
        label={`${pct}%`}
        sublabel={`${completed}/${total} habitudes`}
      />
    </View>
  );
}
