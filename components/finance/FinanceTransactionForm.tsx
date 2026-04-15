import { forwardRef, useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheet } from "../ui/BottomSheet";
import { Button } from "../ui/Button";
import { useColors } from "../../lib/theme";
import type { Transaction, TransactionInput, TransactionType, Account, FinanceCategory } from "../../types/finance";

type Props = {
  accounts: Account[];
  categories: FinanceCategory[];
  editingTransaction?: Transaction | null;
  onSave: (input: TransactionInput) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
};

const TYPE_OPTIONS: { value: TransactionType; label: string; color: string }[] = [
  { value: "expense", label: "Depense", color: "#ef4444" },
  { value: "income", label: "Revenu", color: "#22c55e" },
  { value: "transfer", label: "Transfert", color: "#3b82f6" },
];

export const FinanceTransactionForm = forwardRef<BottomSheetModal, Props>(
  ({ accounts, categories, editingTransaction, onSave, onDelete, onClose }, ref) => {
    const c = useColors();

    const [type, setType] = useState<TransactionType>("expense");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [accountId, setAccountId] = useState("");
    const [toAccountId, setToAccountId] = useState("");
    const [date, setDate] = useState(() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    });

    useEffect(() => {
      if (editingTransaction) {
        setType(editingTransaction.type);
        setAmount(String(editingTransaction.amount));
        setDescription(editingTransaction.description);
        setCategory(editingTransaction.category);
        setAccountId(editingTransaction.accountId);
        setToAccountId(editingTransaction.toAccountId ?? "");
        setDate(editingTransaction.date);
      } else {
        setType("expense");
        setAmount("");
        setDescription("");
        setCategory("");
        setAccountId(accounts[0]?.id ?? "");
        setToAccountId("");
        const d = new Date();
        setDate(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`);
      }
    }, [editingTransaction, accounts]);

    const filteredCategories = categories.filter(
      (cat) => cat.appliesTo === "both" || cat.appliesTo === type
    );

    const canSave = Number(amount) > 0 && accountId && (type !== "transfer" || toAccountId);

    const handleSave = () => {
      onSave({
        type,
        amount: Number(amount),
        description,
        category: type === "transfer" ? "" : category,
        accountId,
        toAccountId: type === "transfer" ? toAccountId : null,
        date,
      });
    };

    return (
      <BottomSheet
        ref={ref}
        title={editingTransaction ? "Modifier la transaction" : "Nouvelle transaction"}
        snapPoints={["85%"]}
        onClose={onClose}
      >
        {/* Type selector */}
        <View className="flex-row gap-2 mb-4">
          {TYPE_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => setType(opt.value)}
              className="flex-1 py-2.5 rounded-xl items-center"
              style={{
                backgroundColor: type === opt.value ? opt.color + "22" : c.surfaceLight,
                borderWidth: type === opt.value ? 1.5 : 0,
                borderColor: opt.color,
              }}
            >
              <Text
                className="text-sm font-semibold"
                style={{ color: type === opt.value ? opt.color : c.textSecondary }}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Amount */}
        <Text className="text-xs font-semibold mb-1.5" style={{ color: c.textSecondary }}>Montant</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="0.00"
          placeholderTextColor={c.textMuted}
          keyboardType="decimal-pad"
          className="rounded-xl px-4 py-3 text-base mb-4"
          style={{ backgroundColor: c.surfaceLight, color: c.text }}
        />

        {/* Description */}
        <Text className="text-xs font-semibold mb-1.5" style={{ color: c.textSecondary }}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Description..."
          placeholderTextColor={c.textMuted}
          className="rounded-xl px-4 py-3 text-base mb-4"
          style={{ backgroundColor: c.surfaceLight, color: c.text }}
        />

        {/* Category chips (hidden for transfers) */}
        {type !== "transfer" && (
          <View className="mb-4">
            <Text className="text-xs font-semibold mb-1.5" style={{ color: c.textSecondary }}>Categorie</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {filteredCategories.map((cat) => (
                <Pressable
                  key={cat.id}
                  onPress={() => setCategory(cat.name)}
                  className="flex-row items-center px-3 py-2 rounded-full"
                  style={{
                    backgroundColor: category === cat.name ? c.primary + "22" : c.surfaceLight,
                    borderWidth: category === cat.name ? 1 : 0,
                    borderColor: c.primary,
                  }}
                >
                  <Text className="mr-1">{cat.icon}</Text>
                  <Text
                    className="text-sm"
                    style={{ color: category === cat.name ? c.primary : c.text }}
                  >
                    {cat.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Account selector */}
        <Text className="text-xs font-semibold mb-1.5" style={{ color: c.textSecondary }}>
          {type === "transfer" ? "Depuis" : "Compte"}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} className="mb-4">
          {accounts.map((acc) => (
            <Pressable
              key={acc.id}
              onPress={() => setAccountId(acc.id)}
              className="flex-row items-center px-3 py-2 rounded-full"
              style={{
                backgroundColor: accountId === acc.id ? acc.color + "22" : c.surfaceLight,
                borderWidth: accountId === acc.id ? 1 : 0,
                borderColor: acc.color,
              }}
            >
              <Text className="mr-1">{acc.icon}</Text>
              <Text
                className="text-sm"
                style={{ color: accountId === acc.id ? acc.color : c.text }}
              >
                {acc.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* To account (transfers only) */}
        {type === "transfer" && (
          <View className="mb-4">
            <Text className="text-xs font-semibold mb-1.5" style={{ color: c.textSecondary }}>Vers</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {accounts
                .filter((a) => a.id !== accountId)
                .map((acc) => (
                  <Pressable
                    key={acc.id}
                    onPress={() => setToAccountId(acc.id)}
                    className="flex-row items-center px-3 py-2 rounded-full"
                    style={{
                      backgroundColor: toAccountId === acc.id ? acc.color + "22" : c.surfaceLight,
                      borderWidth: toAccountId === acc.id ? 1 : 0,
                      borderColor: acc.color,
                    }}
                  >
                    <Text className="mr-1">{acc.icon}</Text>
                    <Text
                      className="text-sm"
                      style={{ color: toAccountId === acc.id ? acc.color : c.text }}
                    >
                      {acc.name}
                    </Text>
                  </Pressable>
                ))}
            </ScrollView>
          </View>
        )}

        {/* Date */}
        <Text className="text-xs font-semibold mb-1.5" style={{ color: c.textSecondary }}>Date</Text>
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="2026-01-15"
          placeholderTextColor={c.textMuted}
          className="rounded-xl px-4 py-3 text-base mb-6"
          style={{ backgroundColor: c.surfaceLight, color: c.text }}
        />

        {/* Actions */}
        <View className="flex-row gap-3">
          {editingTransaction && onDelete && (
            <Button
              title="Supprimer"
              variant="destructive"
              onPress={() => onDelete(editingTransaction.id)}
              className="flex-1"
            />
          )}
          <Button
            title="Annuler"
            variant="secondary"
            onPress={onClose}
            className="flex-1"
          />
          <Button
            title="Enregistrer"
            onPress={handleSave}
            disabled={!canSave}
            className="flex-1"
          />
        </View>
      </BottomSheet>
    );
  }
);

FinanceTransactionForm.displayName = "FinanceTransactionForm";
