import { View, Text } from "react-native";
import { useMemo } from "react";
import { useRouter } from "expo-router";
import { Card } from "../ui/Card";
import { useColors } from "../../lib/theme";
import type { Transaction, Account } from "../../types/finance";

type Props = {
  transactions: Transaction[];
  accounts: Account[];
};

export function HomeFinanceCard({ transactions, accounts }: Props) {
  const c = useColors();
  const router = useRouter();

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  const prevMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const prevYear = thisMonth === 0 ? thisYear - 1 : thisYear;

  const thisMonthExpenses = useMemo(
    () =>
      transactions
        .filter((t) => {
          if (t.type !== "expense") return false;
          const d = new Date(t.date);
          return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
        })
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions, thisMonth, thisYear]
  );

  const prevMonthExpenses = useMemo(
    () =>
      transactions
        .filter((t) => {
          if (t.type !== "expense") return false;
          const d = new Date(t.date);
          return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
        })
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions, prevMonth, prevYear]
  );

  const evolution = prevMonthExpenses > 0
    ? Math.round(((thisMonthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100)
    : null;

  const totalBalance = useMemo(
    () => accounts.reduce((sum, a) => sum + a.balance, 0),
    [accounts]
  );

  const formatAmount = (n: number) =>
    n.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " \u20AC";

  return (
    <View className="mb-4">
      <Text className="font-bold text-base mb-2" style={{ color: c.text }}>Finance</Text>

      <Card onPress={() => router.push("/(tabs)/finance" as any)}>
        <View className="flex-row justify-between">
          <View className="flex-1">
            <Text className="text-xs" style={{ color: c.textMuted }}>Depenses ce mois</Text>
            <Text className="font-bold text-base mt-1" style={{ color: c.text }}>
              {formatAmount(thisMonthExpenses)}
            </Text>
            {evolution !== null && (
              <Text
                className="text-xs mt-1"
                style={{ color: evolution > 0 ? c.danger : c.success }}
              >
                {evolution > 0 ? "+" : ""}{evolution}%
              </Text>
            )}
          </View>
          <View className="items-end">
            <Text className="text-xs" style={{ color: c.textMuted }}>Solde total</Text>
            <Text className="font-bold text-base mt-1" style={{ color: c.primary }}>
              {formatAmount(totalBalance)}
            </Text>
          </View>
        </View>
      </Card>
    </View>
  );
}
