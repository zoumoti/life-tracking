import { View, Text } from "react-native";
import { useColors } from "../../lib/theme";

type Props = {
  data: { label: string; value: number }[];
  unit?: string;
  height?: number;
};

export function SimpleBarChart({ data, unit = "", height = 120 }: Props) {
  const c = useColors();
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <View className="flex-row items-end justify-around" style={{ height }}>
      {data.map((item, i) => {
        const barHeight = (item.value / maxValue) * height * 0.8;
        return (
          <View key={i} className="items-center flex-1 mx-1">
            <Text className="text-xs mb-1" style={{ color: c.textSecondary }}>
              {item.value}{unit}
            </Text>
            <View
              className="rounded-t-sm w-full"
              style={{ height: Math.max(barHeight, 4), backgroundColor: c.primary }}
            />
            <Text className="text-xs mt-1" style={{ color: c.textMuted }}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}
