import { View } from "react-native";
import { colors } from "../../lib/theme";

type Props = {
  progress: number; // 0 to 1
  color?: string;
  height?: number;
  className?: string;
};

export function ProgressBar({
  progress,
  color = colors.primary,
  height = 6,
  className = "",
}: Props) {
  const clamped = Math.min(Math.max(progress, 0), 1);

  return (
    <View
      className={`w-full rounded-full overflow-hidden ${className}`}
      style={{ height, backgroundColor: colors.surfaceLight }}
    >
      <View
        style={{
          width: `${clamped * 100}%`,
          height,
          backgroundColor: color,
          borderRadius: 9999,
        }}
      />
    </View>
  );
}
