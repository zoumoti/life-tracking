import { View, Text } from "react-native";

type Props = {
  data: { label: string; value: number }[];
  unit?: string;
  height?: number;
};

export function SimpleBarChart({ data, unit = "", height = 120 }: Props) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <View className="flex-row items-end justify-around" style={{ height }}>
      {data.map((item, i) => {
        const barHeight = (item.value / maxValue) * height * 0.8;
        return (
          <View key={i} className="items-center flex-1 mx-1">
            <Text className="text-text-secondary text-xs mb-1">
              {item.value}{unit}
            </Text>
            <View
              className="bg-primary rounded-t-sm w-full"
              style={{ height: Math.max(barHeight, 4) }}
            />
            <Text className="text-text-muted text-xs mt-1">{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}
