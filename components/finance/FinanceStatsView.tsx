import { View, Text } from "react-native";
import { useColors } from "../../lib/theme";
import { Card } from "../ui/Card";
import type { Transaction, Account, FinanceCategory } from "../../types/finance";

type MonthData = {
  label: string;
  expenses: number;
  income: number;
};

type Props = {
  /** All transactions for the last 6 months */
  transactions: Transaction[];
  accounts: Account[];
  categories: FinanceCategory[];
  currentMonth: number;
  currentYear: number;
};

const SHORT_MONTHS = ["Jan", "Fev", "Mar", "Avr", "Mai", "Jun", "Jul", "Aou", "Sep", "Oct", "Nov", "Dec"];

function formatAmount(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " \u20AC";
}

export function FinanceStatsView({ transactions, accounts, categories, currentMonth, currentYear }: Props) {
  const c = useColors();

  // Build last 6 months data
  const months: MonthData[] = [];
  for (let i = 5; i >= 0; i--) {
    let m = currentMonth - i;
    let y = currentYear;
    while (m <= 0) { m += 12; y -= 1; }
    const prefix = `${y}-${String(m).padStart(2, "0")}`;
    const monthTx = transactions.filter((t) => t.date.startsWith(prefix));
    months.push({
      label: SHORT_MONTHS[m - 1],
      expenses: monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0),
      income: monthTx.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0),
    });
  }

  const maxVal = Math.max(1, ...months.map((m) => Math.max(m.expenses, m.income)));
  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

  // Top 3 expense categories (all 6 months)
  const expenseTx = transactions.filter((t) => t.type === "expense");
  const byCat: Record<string, number> = {};
  expenseTx.forEach((t) => {
    const key = t.category || "Autre";
    byCat[key] = (byCat[key] || 0) + Number(t.amount);
  });
  const top3 = Object.entries(byCat)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, amount]) => ({
      name,
      amount,
      icon: categories.find((cat) => cat.name === name)?.icon ?? "\u2022",
    }));

  return (
    <View>
      {/* Total balance card */}
      <Card className="mb-4 items-center">
        <Text className="text-xs" style={{ color: c.textSecondary }}>Solde total</Text>
        <Text className="text-2xl font-bold mt-1" style={{ color: c.primary }}>
          {formatAmount(totalBalance)}
        </Text>
      </Card>

      {/* Bar chart */}
      <Card className="mb-4">
        <Text className="text-base font-bold mb-4" style={{ color: c.text }}>6 derniers mois</Text>
        <View className="flex-row items-end justify-between" style={{ height: 140 }}>
          {months.map((m, i) => {
            const expH = maxVal > 0 ? (m.expenses / maxVal) * 110 : 0;
            const incH = maxVal > 0 ? (m.income / maxVal) * 110 : 0;
            return (
              <View key={i} className="items-center flex-1">
                <View className="flex-row items-end gap-0.5" style={{ height: 110 }}>
                  <View
                    className="rounded-t"
                    style={{ width: 12, height: Math.max(2, expH), backgroundColor: "#ef4444" }}
                  />
                  <View
                    className="rounded-t"
                    style={{ width: 12, height: Math.max(2, incH), backgroundColor: "#22c55e" }}
                  />
                </View>
                <Text className="text-[10px] mt-1" style={{ color: c.textMuted }}>{m.label}</Text>
              </View>
            );
          })}
        </View>
        <View className="flex-row justify-center gap-4 mt-3">
          <View className="flex-row items-center gap-1">
            <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#ef4444" }} />
            <Text className="text-xs" style={{ color: c.textSecondary }}>Depenses</Text>
          </View>
          <View className="flex-row items-center gap-1">
            <View className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#22c55e" }} />
            <Text className="text-xs" style={{ color: c.textSecondary }}>Revenus</Text>
          </View>
        </View>
      </Card>

      {/* Top 3 categories */}
      {top3.length > 0 && (
        <Card>
          <Text className="text-base font-bold mb-3" style={{ color: c.text }}>Top depenses</Text>
          {top3.map((item, i) => (
            <View key={item.name} className="flex-row items-center py-2">
              <Text className="text-lg mr-3">{item.icon}</Text>
              <Text className="text-sm font-medium flex-1" style={{ color: c.text }}>
                {item.name}
              </Text>
              <Text className="text-sm font-bold" style={{ color: "#ef4444" }}>
                {formatAmount(item.amount)}
              </Text>
            </View>
          ))}
        </Card>
      )}
    </View>
  );
}
