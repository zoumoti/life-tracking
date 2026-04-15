export type Account = {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  color: string;
  balance: number;
  createdAt: string;
};

export type AccountInput = {
  name: string;
  icon: string;
  color: string;
  balance: number;
};

export type TransactionType = "expense" | "income" | "transfer";

export type Transaction = {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  accountId: string;
  toAccountId: string | null;
  date: string;
  description: string;
  createdAt: string;
};

export type TransactionInput = {
  type: TransactionType;
  amount: number;
  category: string;
  accountId: string;
  toAccountId?: string | null;
  date: string;
  description: string;
};

export type FinanceCategory = {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  appliesTo: "expense" | "income" | "both";
  isDefault: boolean;
  createdAt: string;
};

export type FinanceCategoryInput = {
  name: string;
  icon: string;
  appliesTo: "expense" | "income" | "both";
};
