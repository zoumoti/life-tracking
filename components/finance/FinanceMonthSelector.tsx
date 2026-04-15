import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "../../lib/theme";

const MONTHS = [
  "Janvier", "Fevrier", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Aout", "Septembre", "Octobre", "Novembre", "Decembre",
];

type Props = {
  month: number; // 1-12
  year: number;
  onChange: (month: number, year: number) => void;
};

export function FinanceMonthSelector({ month, year, onChange }: Props) {
  const c = useColors();

  const goPrev = () => {
    if (month === 1) onChange(12, year - 1);
    else onChange(month - 1, year);
  };

  const goNext = () => {
    if (month === 12) onChange(1, year + 1);
    else onChange(month + 1, year);
  };

  return (
    <View className="flex-row items-center justify-between py-3">
      <Pressable onPress={goPrev} className="p-2 active:opacity-60">
        <Feather name="chevron-left" size={22} color={c.text} />
      </Pressable>
      <Text className="text-lg font-bold" style={{ color: c.text }}>
        {MONTHS[month - 1]} {year}
      </Text>
      <Pressable onPress={goNext} className="p-2 active:opacity-60">
        <Feather name="chevron-right" size={22} color={c.text} />
      </Pressable>
    </View>
  );
}
