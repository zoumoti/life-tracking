import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "../../lib/theme";

type Props = {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
};

export function ProgressCircle({
  progress,
  size = 100,
  strokeWidth = 8,
  label,
  sublabel,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(Math.max(progress, 0), 1));

  return (
    <View className="items-center">
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.surface}
            strokeWidth={strokeWidth}
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={colors.primary}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </Svg>
        {label && (
          <View
            className="absolute items-center justify-center"
            style={{ width: size, height: size }}
          >
            <Text className="text-text text-xl font-bold">{label}</Text>
          </View>
        )}
      </View>
      {sublabel && <Text className="text-text-secondary text-xs mt-2">{sublabel}</Text>}
    </View>
  );
}
