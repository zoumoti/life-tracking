import { View, Text, ScrollView, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "../../lib/theme";
import type { Account } from "../../types/finance";

type Props = {
  accounts: Account[];
  onSettingsPress: () => void;
  onAccountPress: (account: Account) => void;
};

function formatAmount(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " \u20AC";
}

export function FinanceAccountCards({ accounts, onSettingsPress, onAccountPress }: Props) {
  const c = useColors();
  const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

  return (
    <View>
      {/* Total + settings */}
      <View className="flex-row items-center justify-between mb-3">
        <View>
          <Text className="text-xs" style={{ color: c.textSecondary }}>Solde total</Text>
          <Text className="text-xl font-bold" style={{ color: c.text }}>
            {formatAmount(totalBalance)}
          </Text>
        </View>
        <Pressable onPress={onSettingsPress} className="p-2 active:opacity-60">
          <Feather name="settings" size={20} color={c.textSecondary} />
        </Pressable>
      </View>

      {/* Horizontal scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12 }}
      >
        {accounts.map((account) => (
          <Pressable
            key={account.id}
            onPress={() => onAccountPress(account)}
            className="rounded-xl p-4 active:opacity-80"
            style={{
              backgroundColor: account.color + "22",
              borderColor: account.color,
              borderWidth: 1,
              minWidth: 150,
            }}
          >
            <Text className="text-2xl mb-1">{account.icon}</Text>
            <Text className="text-sm font-medium" style={{ color: c.text }}>
              {account.name}
            </Text>
            <Text className="text-base font-bold mt-1" style={{ color: account.color }}>
              {formatAmount(Number(account.balance))}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
