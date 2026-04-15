import { View, Text } from "react-native";
import { useColors } from "../../lib/theme";
import { Card } from "../ui/Card";
import { FinanceTransactionRow } from "./FinanceTransactionRow";
import type { Transaction, FinanceCategory } from "../../types/finance";

type Props = {
  transactions: Transaction[];
  categories: FinanceCategory[];
  onTransactionPress: (tx: Transaction) => void;
};

function formatAmount(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " \u20AC";
}

export function FinanceTransactionList({ transactions, categories, onTransactionPress }: Props) {
  const c = useColors();

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <View>
      {/* Monthly totals */}
      <View className="flex-row gap-3 mb-4">
        <Card className="flex-1">
          <Text className="text-xs" style={{ color: c.textSecondary }}>Depenses</Text>
          <Text className="text-base font-bold" style={{ color: "#ef4444" }}>
            -{formatAmount(totalExpenses)}
          </Text>
        </Card>
        <Card className="flex-1">
          <Text className="text-xs" style={{ color: c.textSecondary }}>Revenus</Text>
          <Text className="text-base font-bold" style={{ color: "#22c55e" }}>
            +{formatAmount(totalIncome)}
          </Text>
        </Card>
      </View>

      {/* Transaction list */}
      <Card>
        <Text className="text-base font-bold mb-2" style={{ color: c.text }}>
          Transactions ({transactions.length})
        </Text>
        {transactions.length === 0 ? (
          <Text className="text-sm py-4 text-center" style={{ color: c.textMuted }}>
            Aucune transaction ce mois-ci
          </Text>
        ) : (
          transactions.map((tx) => (
            <FinanceTransactionRow
              key={tx.id}
              transaction={tx}
              categories={categories}
              onPress={onTransactionPress}
            />
          ))
        )}
      </Card>
    </View>
  );
}
