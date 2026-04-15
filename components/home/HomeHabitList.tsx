import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Card } from "../ui/Card";
import { HomeHabitRow } from "./HomeHabitRow";
import { useColors } from "../../lib/theme";
import type { Tables } from "../../types/database";

type HabitWithMeta = {
  habit: Tables<"habits">;
  completed: boolean;
  streak: { current: number; warning: boolean };
};

type Props = {
  items: HabitWithMeta[];
  allDone: boolean;
  onToggle: (habitId: string) => void;
};

export function HomeHabitList({ items, allDone, onToggle }: Props) {
  const c = useColors();

  if (items.length === 0) return null;

  const sorted = [...items].sort((a, b) => (a.completed ? 1 : 0) - (b.completed ? 1 : 0));

  return (
    <View className="mb-4">
      <Text className="font-bold text-base mb-2" style={{ color: c.text }}>Habitudes</Text>

      {allDone && (
        <View
          className="flex-row items-center rounded-card px-4 py-2 mb-2"
          style={{ backgroundColor: c.success + "1A" }}
        >
          <Feather name="check-circle" size={18} color={c.success} />
          <Text className="text-sm font-semibold ml-2" style={{ color: c.success }}>
            Bravo, tout est fait !
          </Text>
        </View>
      )}

      <Card className="p-0">
        {sorted.map((item, index) => (
          <View key={item.habit.id}>
            {index > 0 && <View className="h-px mx-3" style={{ backgroundColor: c.surface }} />}
            <HomeHabitRow
              habit={item.habit}
              completed={item.completed}
              streak={item.streak}
              onToggle={() => onToggle(item.habit.id)}
            />
          </View>
        ))}
      </Card>
    </View>
  );
}
