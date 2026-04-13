import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../lib/theme";

type Props = {
  current: number;
  warning?: boolean;
  isAvoid?: boolean;
};

export function StreakBadge({ current, warning, isAvoid }: Props) {
  if (current === 0) return null;

  const badgeColor = warning ? colors.warning : isAvoid ? colors.success : colors.primaryLight;

  return (
    <View className="flex-row items-center gap-1">
      <Feather
        name={isAvoid ? "shield" : "zap"}
        size={14}
        color={badgeColor}
      />
      <Text
        className="text-xs font-bold"
        style={{ color: badgeColor }}
      >
        {current}j
      </Text>
    </View>
  );
}
