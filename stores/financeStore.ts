import { createPersistedStore } from "./createPersistedStore";
import { getSupabase } from "../lib/supabase";
import type {
  Account,
  AccountInput,
  Transaction,
  TransactionInput,
  FinanceCategory,
  FinanceCategoryInput,
} from "../types/finance";

type FinanceState = {
  accounts: Account[];
  transactions: Transaction[];
  categories: FinanceCategory[];
  loading: boolean;

  // Accounts
  fetchAccounts: () => Promise<void>;
  createAccount: (input: AccountInput) => Promise<void>;
  updateAccount: (id: string, input: Partial<AccountInput>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;

  // Transactions
  fetchTransactions: (month: number, year: number) => Promise<void>;
  fetchTransactionsRange: (startDate: string, endDate: string) => Promise<void>;
  createTransaction: (input: TransactionInput) => Promise<void>;
  updateTransaction: (id: string, input: Partial<TransactionInput>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  // Categories
  fetchCategories: () => Promise<void>;
  createCategory: (input: FinanceCategoryInput) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
};

async function getUserId(): Promise<string | null> {
  const supabase = getSupabase();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}

export const useFinanceStore = createPersistedStore<FinanceState>(
  "finance-store",
  (set, get) => ({
    accounts: [],
    transactions: [],
    categories: [],
    loading: false,

    // ─── Accounts ───────────────────────────────────────────

    fetchAccounts: async () => {
      const userId = await getUserId();
      if (!userId) return;
      set({ loading: true });
      try {
        const { data, error } = await getSupabase()
          .from("accounts")
          .select("*")
          .eq("user_id", userId)
          .order("createdAt", { ascending: true });
        if (!error && data) {
          set({ accounts: data as unknown as Account[] });
        }
      } finally {
        set({ loading: false });
      }
    },

    createAccount: async (input) => {
      const userId = await getUserId();
      if (!userId) return;
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const newAccount: Account = {
        id,
        user_id: userId,
        ...input,
        createdAt: now,
      };

      // Optimistic
      const prev = get().accounts;
      set({ accounts: [...prev, newAccount] });

      try {
        const { error } = await getSupabase()
          .from("accounts")
          .insert({
            id,
            user_id: userId,
            name: input.name,
            icon: input.icon,
            color: input.color,
            balance: input.balance,
            createdAt: now,
          });
        if (error) throw error;
      } catch {
        set({ accounts: prev });
      }
    },

    updateAccount: async (id, input) => {
      const prev = get().accounts;
      set({
        accounts: prev.map((a) => (a.id === id ? { ...a, ...input } : a)),
      });

      try {
        const { error } = await getSupabase()
          .from("accounts")
          .update(input)
          .eq("id", id);
        if (error) throw error;
      } catch {
        set({ accounts: prev });
      }
    },

    deleteAccount: async (id) => {
      const prev = get().accounts;
      set({ accounts: prev.filter((a) => a.id !== id) });

      try {
        const { error } = await getSupabase()
          .from("accounts")
          .delete()
          .eq("id", id);
        if (error) throw error;
      } catch {
        set({ accounts: prev });
      }
    },

    // ─── Transactions ───────────────────────────────────────

    fetchTransactions: async (month, year) => {
      const userId = await getUserId();
      if (!userId) return;
      set({ loading: true });
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDay = new Date(year, month, 0).getDate();
      const endDate = `${year}-${String(month).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;

      try {
        const { data, error } = await getSupabase()
          .from("transactions")
          .select("*")
          .eq("user_id", userId)
          .gte("date", startDate)
          .lte("date", endDate)
          .order("date", { ascending: false });
        if (!error && data) {
          set({ transactions: data as unknown as Transaction[] });
        }
      } finally {
        set({ loading: false });
      }
    },

    fetchTransactionsRange: async (startDate, endDate) => {
      const userId = await getUserId();
      if (!userId) return;
      try {
        const { data, error } = await getSupabase()
          .from("transactions")
          .select("*")
          .eq("user_id", userId)
          .gte("date", startDate)
          .lte("date", endDate)
          .order("date", { ascending: false });
        if (!error && data) {
          set({ transactions: data as unknown as Transaction[] });
        }
      } catch {
        // ignore
      }
    },

    createTransaction: async (input) => {
      const userId = await getUserId();
      if (!userId) return;
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const newTx: Transaction = {
        id,
        user_id: userId,
        ...input,
        toAccountId: input.toAccountId ?? null,
        createdAt: now,
      };

      const prevTx = get().transactions;
      const prevAccounts = get().accounts;
      set({ transactions: [newTx, ...prevTx] });

      // Update account balances optimistically
      const updatedAccounts = prevAccounts.map((a) => {
        if (a.id === input.accountId) {
          const delta = input.type === "income" ? input.amount : -input.amount;
          return { ...a, balance: a.balance + delta };
        }
        if (input.type === "transfer" && input.toAccountId && a.id === input.toAccountId) {
          return { ...a, balance: a.balance + input.amount };
        }
        return a;
      });
      set({ accounts: updatedAccounts });

      try {
        const { error } = await getSupabase()
          .from("transactions")
          .insert({
            id,
            user_id: userId,
            type: input.type,
            amount: input.amount,
            category: input.category,
            accountId: input.accountId,
            toAccountId: input.toAccountId ?? null,
            date: input.date,
            description: input.description,
            createdAt: now,
          });
        if (error) throw error;
      } catch {
        set({ transactions: prevTx, accounts: prevAccounts });
      }
    },

    updateTransaction: async (id, input) => {
      const prevTx = get().transactions;
      set({
        transactions: prevTx.map((t) => (t.id === id ? { ...t, ...input } : t)),
      });

      try {
        const { error } = await getSupabase()
          .from("transactions")
          .update(input)
          .eq("id", id);
        if (error) throw error;
        // Refresh accounts to get correct balances
        get().fetchAccounts();
      } catch {
        set({ transactions: prevTx });
      }
    },

    deleteTransaction: async (id) => {
      const prevTx = get().transactions;
      const tx = prevTx.find((t) => t.id === id);
      set({ transactions: prevTx.filter((t) => t.id !== id) });

      // Reverse balance changes optimistically
      if (tx) {
        const prevAccounts = get().accounts;
        const updatedAccounts = prevAccounts.map((a) => {
          if (a.id === tx.accountId) {
            const delta = tx.type === "income" ? -tx.amount : tx.amount;
            return { ...a, balance: a.balance + delta };
          }
          if (tx.type === "transfer" && tx.toAccountId && a.id === tx.toAccountId) {
            return { ...a, balance: a.balance - tx.amount };
          }
          return a;
        });
        set({ accounts: updatedAccounts });
      }

      try {
        const { error } = await getSupabase()
          .from("transactions")
          .delete()
          .eq("id", id);
        if (error) throw error;
      } catch {
        set({ transactions: prevTx });
        if (tx) get().fetchAccounts();
      }
    },

    // ─── Categories ─────────────────────────────────────────

    fetchCategories: async () => {
      const userId = await getUserId();
      if (!userId) return;
      try {
        const { data, error } = await getSupabase()
          .from("financeCategories")
          .select("*")
          .eq("user_id", userId)
          .order("name", { ascending: true });
        if (!error && data) {
          set({ categories: data as unknown as FinanceCategory[] });
        }
      } catch {
        // ignore
      }
    },

    createCategory: async (input) => {
      const userId = await getUserId();
      if (!userId) return;
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const newCat: FinanceCategory = {
        id,
        user_id: userId,
        ...input,
        isDefault: false,
        createdAt: now,
      };

      const prev = get().categories;
      set({ categories: [...prev, newCat] });

      try {
        const { error } = await getSupabase()
          .from("financeCategories")
          .insert({
            id,
            user_id: userId,
            name: input.name,
            icon: input.icon,
            appliesTo: input.appliesTo,
            isDefault: false,
            createdAt: now,
          });
        if (error) throw error;
      } catch {
        set({ categories: prev });
      }
    },

    deleteCategory: async (id) => {
      const prev = get().categories;
      set({ categories: prev.filter((c) => c.id !== id) });

      try {
        const { error } = await getSupabase()
          .from("financeCategories")
          .delete()
          .eq("id", id);
        if (error) throw error;
      } catch {
        set({ categories: prev });
      }
    },
  })
);
