-- ============================================
-- Add habit_type to habits table
-- Supports "positive" (do something) and "avoid" (don't do something)
-- ============================================

CREATE TYPE habit_type AS ENUM ('positive', 'avoid');

ALTER TABLE public.habits
  ADD COLUMN habit_type habit_type NOT NULL DEFAULT 'positive';
