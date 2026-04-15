import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "../../lib/theme";

type Props = {
  current: number;
  warning?: boolean;
  isAvoid?: boolean;
};

export function StreakBadge({ current, warning, isAvoid }: Props) {
  const c = useColors();
  if (current === 0) return null;

  const badgeColor = warning ? c.warning : isAvoid ? c.success : c.primaryLight;

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
