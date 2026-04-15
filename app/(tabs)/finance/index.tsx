import { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { Feather } from "@expo/vector-icons";
import { SafeScreen } from "../../../components/SafeScreen";
import { useColors } from "../../../lib/theme";
import { useFinanceStore } from "../../../stores/financeStore";
import { ConfirmModal } from "../../../components/ui/ConfirmModal";
import { FinanceMonthSelector } from "../../../components/finance/FinanceMonthSelector";
import { FinanceAccountCards } from "../../../components/finance/FinanceAccountCards";
import { FinanceTransactionList } from "../../../components/finance/FinanceTransactionList";
import { FinanceCategorySummary } from "../../../components/finance/FinanceCategorySummary";
import { FinanceTransactionForm } from "../../../components/finance/FinanceTransactionForm";
import { FinanceAccountForm } from "../../../components/finance/FinanceAccountForm";
import { FinanceStatsView } from "../../../components/finance/FinanceStatsView";
import type { Transaction, TransactionInput, Account, AccountInput } from "../../../types/finance";

type ViewMode = "monthly" | "stats";

export default function FinanceScreen() {
  const c = useColors();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");

  // Store
  const {
    accounts, transactions, categories, loading,
    fetchAccounts, fetchTransactions, fetchTransactionsRange, fetchCategories,
    createAccount, updateAccount, deleteAccount,
    createTransaction, updateTransaction, deleteTransaction,
  } = useFinanceStore();

  // Refs
  const txFormRef = useRef<BottomSheetModal>(null);
  const accountFormRef = useRef<BottomSheetModal>(null);

  // Edit state
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Confirm modal
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);
  const [confirmMessage, setConfirmMessage] = useState("");

  // Stats transactions (6 months range)
  const [statsTx, setStatsTx] = useState<Transaction[]>([]);

  // Fetch data
  useEffect(() => {
    fetchAccounts();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchTransactions(month, year);
  }, [month, year]);

  // Fetch 6-month range when switching to stats
  useEffect(() => {
    if (viewMode === "stats") {
      let startM = month - 5;
      let startY = year;
      while (startM <= 0) { startM += 12; startY -= 1; }
      const startDate = `${startY}-${String(startM).padStart(2, "0")}-01`;
      const endDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;
      fetchTransactionsRange(startDate, endDate).then(() => {
        setStatsTx(useFinanceStore.getState().transactions);
      });
    }
  }, [viewMode, month, year]);

  // Handlers
  const handleMonthChange = (m: number, y: number) => {
    setMonth(m);
    setYear(y);
  };

  const openNewTx = () => {
    setEditingTx(null);
    txFormRef.current?.present();
  };

  const openEditTx = (tx: Transaction) => {
    setEditingTx(tx);
    txFormRef.current?.present();
  };

  const handleSaveTx = async (input: TransactionInput) => {
    if (editingTx) {
      await updateTransaction(editingTx.id, input);
    } else {
      await createTransaction(input);
    }
    txFormRef.current?.dismiss();
    fetchTransactions(month, year);
    fetchAccounts();
  };

  const handleDeleteTx = (id: string) => {
    setConfirmMessage("Supprimer cette transaction ? Cette action est irreversible.");
    setConfirmAction(() => async () => {
      await deleteTransaction(id);
      txFormRef.current?.dismiss();
      setConfirmVisible(false);
      fetchTransactions(month, year);
      fetchAccounts();
    });
    setConfirmVisible(true);
  };

  const openAccountSettings = () => {
    setEditingAccount(null);
    accountFormRef.current?.present();
  };

  const openEditAccount = (account: Account) => {
    setEditingAccount(account);
    accountFormRef.current?.present();
  };

  const handleSaveAccount = async (input: AccountInput) => {
    if (editingAccount) {
      await updateAccount(editingAccount.id, input);
    } else {
      await createAccount(input);
    }
    accountFormRef.current?.dismiss();
    fetchAccounts();
  };

  const handleDeleteAccount = (id: string) => {
    setConfirmMessage("Supprimer ce compte ? Toutes les transactions associees seront perdues.");
    setConfirmAction(() => async () => {
      await deleteAccount(id);
      accountFormRef.current?.dismiss();
      setConfirmVisible(false);
      fetchAccounts();
    });
    setConfirmVisible(true);
  };

  const closeTxForm = useCallback(() => {
    txFormRef.current?.dismiss();
    setEditingTx(null);
  }, []);

  const closeAccountForm = useCallback(() => {
    accountFormRef.current?.dismiss();
    setEditingAccount(null);
  }, []);

  return (
    <SafeScreen>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-2xl font-bold" style={{ color: c.text }}>Finance</Text>

        {/* Toggle stats/monthly */}
        <View className="flex-row rounded-xl overflow-hidden" style={{ backgroundColor: c.surfaceLight }}>
          <Pressable
            onPress={() => setViewMode("monthly")}
            className="px-3 py-1.5"
            style={{ backgroundColor: viewMode === "monthly" ? c.primary : "transparent" }}
          >
            <Feather
              name="list"
              size={16}
              color={viewMode === "monthly" ? c.primaryOnText : c.textSecondary}
            />
          </Pressable>
          <Pressable
            onPress={() => setViewMode("stats")}
            className="px-3 py-1.5"
            style={{ backgroundColor: viewMode === "stats" ? c.primary : "transparent" }}
          >
            <Feather
              name="bar-chart-2"
              size={16}
              color={viewMode === "stats" ? c.primaryOnText : c.textSecondary}
            />
          </Pressable>
        </View>
      </View>

      {/* Month selector */}
      <FinanceMonthSelector month={month} year={year} onChange={handleMonthChange} />

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={c.primary} size="large" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          {viewMode === "monthly" ? (
            <>
              {/* Account cards */}
              <View className="mb-4">
                <FinanceAccountCards
                  accounts={accounts}
                  onSettingsPress={openAccountSettings}
                  onAccountPress={openEditAccount}
                />
              </View>

              {/* Transaction list */}
              <View className="mb-4">
                <FinanceTransactionList
                  transactions={transactions}
                  categories={categories}
                  onTransactionPress={openEditTx}
                />
              </View>

              {/* Category summary */}
              <FinanceCategorySummary transactions={transactions} categories={categories} />
            </>
          ) : (
            <FinanceStatsView
              transactions={statsTx}
              accounts={accounts}
              categories={categories}
              currentMonth={month}
              currentYear={year}
            />
          )}
        </ScrollView>
      )}

      {/* FAB */}
      <Pressable
        onPress={openNewTx}
        className="absolute bottom-6 right-0 w-14 h-14 rounded-full items-center justify-center active:opacity-80"
        style={{
          backgroundColor: c.primary,
          elevation: 6,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        }}
      >
        <Feather name="plus" size={26} color={c.primaryOnText} />
      </Pressable>

      {/* Transaction form bottom sheet */}
      <FinanceTransactionForm
        ref={txFormRef}
        accounts={accounts}
        categories={categories}
        editingTransaction={editingTx}
        onSave={handleSaveTx}
        onDelete={handleDeleteTx}
        onClose={closeTxForm}
      />

      {/* Account form bottom sheet */}
      <FinanceAccountForm
        ref={accountFormRef}
        editingAccount={editingAccount}
        onSave={handleSaveAccount}
        onDelete={handleDeleteAccount}
        onClose={closeAccountForm}
      />

      {/* Confirm modal for deletions */}
      <ConfirmModal
        visible={confirmVisible}
        title="Confirmation"
        message={confirmMessage}
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        destructive
        onConfirm={() => confirmAction?.()}
        onCancel={() => setConfirmVisible(false)}
      />
    </SafeScreen>
  );
}
