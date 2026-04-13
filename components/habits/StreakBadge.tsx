import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../lib/theme";

type Props = {
  current: number;
  warning?: boolean;
};

export function StreakBadge({ current, warning }: Props) {
  if (current === 0) return null;

  return (
    <View className="flex-row items-center gap-1">
      <Feather
        name="zap"
        size={14}
        color={warning ? colors.warning : colors.primaryLight}
      />
      <Text
        className="text-xs font-bold"
        style={{ color: warning ? colors.warning : colors.primaryLight }}
      >
        {current}
      </Text>
    </View>
  );
}
