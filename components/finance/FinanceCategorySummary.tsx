import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "../../lib/theme";
import { Card } from "../ui/Card";
import type { Transaction, FinanceCategory } from "../../types/finance";

type Props = {
  transactions: Transaction[];
  categories: FinanceCategory[];
};

function formatAmount(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " \u20AC";
}

export function FinanceCategorySummary({ transactions, categories }: Props) {
  const c = useColors();
  const [expanded, setExpanded] = useState(false);

  const expenses = transactions.filter((t) => t.type === "expense");
  const totalExpenses = expenses.reduce((sum, t) => sum + Number(t.amount), 0);

  // Group by category
  const byCat: Record<string, number> = {};
  expenses.forEach((t) => {
    const key = t.category || "Autre";
    byCat[key] = (byCat[key] || 0) + Number(t.amount);
  });

  const sorted = Object.entries(byCat)
    .map(([name, amount]) => ({
      name,
      amount,
      pct: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      icon: categories.find((cat) => cat.name === name)?.icon ?? "\u2022",
    }))
    .sort((a, b) => b.amount - a.amount);

  if (sorted.length === 0) return null;

  const displayed = expanded ? sorted : sorted.slice(0, 3);

  return (
    <Card>
      <Pressable
        onPress={() => setExpanded(!expanded)}
        className="flex-row items-center justify-between mb-2"
      >
        <Text className="text-base font-bold" style={{ color: c.text }}>
          Par categorie
        </Text>
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={18}
          color={c.textSecondary}
        />
      </Pressable>

      {displayed.map((item) => (
        <View key={item.name} className="flex-row items-center py-2">
          <Text className="text-lg mr-3">{item.icon}</Text>
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm font-medium" style={{ color: c.text }}>
                {item.name}
              </Text>
              <Text className="text-xs" style={{ color: c.textSecondary }}>
                {item.pct.toFixed(0)}%
              </Text>
            </View>
            {/* Progress bar */}
            <View
              className="h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: c.surfaceLight }}
            >
              <View
                className="h-full rounded-full"
                style={{
                  width: `${item.pct}%`,
                  backgroundColor: c.primary,
                }}
              />
            </View>
          </View>
          <Text className="text-sm font-bold ml-3" style={{ color: c.text }}>
            {formatAmount(item.amount)}
          </Text>
        </View>
      ))}

      {sorted.length > 3 && !expanded && (
        <Text className="text-xs text-center mt-2" style={{ color: c.textMuted }}>
          +{sorted.length - 3} categories...
        </Text>
      )}
    </Card>
  );
}
