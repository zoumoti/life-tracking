import { View, Text, Pressable } from "react-native";
import { useColors } from "../../lib/theme";
import type { Transaction } from "../../types/finance";
import type { FinanceCategory } from "../../types/finance";

type Props = {
  transaction: Transaction;
  categories: FinanceCategory[];
  onPress: (tx: Transaction) => void;
};

function formatAmount(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " \u20AC";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function FinanceTransactionRow({ transaction, categories, onPress }: Props) {
  const c = useColors();

  const cat = categories.find((cat) => cat.name === transaction.category);
  const icon = cat?.icon ?? (transaction.type === "transfer" ? "\u21C4" : "\u2022");

  const amountColor =
    transaction.type === "expense"
      ? "#ef4444"
      : transaction.type === "income"
      ? "#22c55e"
      : "#3b82f6";

  const sign = transaction.type === "expense" ? "-" : transaction.type === "income" ? "+" : "";

  return (
    <Pressable
      onPress={() => onPress(transaction)}
      className="flex-row items-center py-3 active:opacity-70"
      style={{ borderBottomWidth: 0.5, borderBottomColor: c.surfaceLight }}
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mr-3"
        style={{ backgroundColor: c.surfaceLight }}
      >
        <Text className="text-lg">{icon}</Text>
      </View>

      <View className="flex-1">
        <Text className="text-sm font-medium" style={{ color: c.text }} numberOfLines={1}>
          {transaction.description || transaction.category || "Transfert"}
        </Text>
        <Text className="text-xs mt-0.5" style={{ color: c.textMuted }}>
          {transaction.category ? transaction.category + " \u00B7 " : ""}
          {formatDate(transaction.date)}
        </Text>
      </View>

      <Text className="text-sm font-bold" style={{ color: amountColor }}>
        {sign}{formatAmount(transaction.amount)}
      </Text>
    </Pressable>
  );
}
