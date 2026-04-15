import { View, Pressable, Text } from "react-native";
import { useColors } from "../../lib/theme";
import type { TaskFilter } from "../../types/task";

type Props = {
  active: TaskFilter;
  onChange: (filter: TaskFilter) => void;
};

const FILTERS: { key: TaskFilter; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "today", label: "Aujourd'hui" },
  { key: "week", label: "Semaine" },
  { key: "no_date", label: "Sans date" },
];

export function TaskFilters({ active, onChange }: Props) {
  const c = useColors();

  return (
    <View className="flex-row mb-4 gap-2">
      {FILTERS.map(({ key, label }) => {
        const isActive = active === key;
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            className="px-3 py-1.5 rounded-full"
            style={{
              backgroundColor: isActive ? c.primary : c.surface,
            }}
          >
            <Text
              className="text-sm font-semibold"
              style={{
                color: isActive ? c.primaryOnText : c.textSecondary,
              }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
