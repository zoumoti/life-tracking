-- migrate-finance.sql
-- Finance tables migration for Life Tracker (from FocusTracker)
-- Run this in Supabase SQL Editor

-- ============================================================
-- 1. financeCategories
-- ============================================================
CREATE TABLE IF NOT EXISTS "financeCategories" (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text NOT NULL DEFAULT '📦',
  "appliesTo" text NOT NULL DEFAULT 'expense'
    CHECK ("appliesTo" IN ('expense', 'income', 'both')),
  "isDefault" boolean NOT NULL DEFAULT false,
  "createdAt" text NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);

ALTER TABLE "financeCategories" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own financeCategories"
  ON "financeCategories" FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 2. accounts
-- ============================================================
CREATE TABLE IF NOT EXISTS accounts (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text NOT NULL DEFAULT '💳',
  color text NOT NULL DEFAULT '#3B82F6',
  balance numeric NOT NULL DEFAULT 0,
  "createdAt" text NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own accounts"
  ON accounts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 3. transactions
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('expense', 'income', 'transfer')),
  amount numeric NOT NULL,
  category text NOT NULL DEFAULT 'Other',
  "accountId" text NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  "toAccountId" text REFERENCES accounts(id) ON DELETE SET NULL,
  date text NOT NULL,
  description text NOT NULL DEFAULT '',
  "createdAt" text NOT NULL DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own transactions"
  ON transactions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 4. telegram_state
-- ============================================================
CREATE TABLE IF NOT EXISTS telegram_state (
  chat_id bigint PRIMARY KEY,
  step text,
  type text,
  amount numeric,
  description text,
  category text,
  date text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id text,
  to_account_id text,
  updated_at text DEFAULT to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
);

ALTER TABLE telegram_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own telegram_state"
  ON telegram_state FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role full access on telegram_state"
  ON telegram_state FOR ALL
  USING (true)
  WITH CHECK (true);
