-- ============================================
-- Life Tracker - Initial Database Schema
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE frequency_type AS ENUM ('daily', 'specific_days', 'x_per_week');
CREATE TYPE time_of_day AS ENUM ('morning', 'afternoon', 'evening', 'anytime');
CREATE TYPE running_type AS ENUM ('easy', 'tempo', 'intervals', 'race');

-- ============================================
-- TABLES
-- ============================================

-- Users (extends auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create user profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Visions
CREATE TABLE public.visions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  target_date DATE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Objectives
CREATE TABLE public.objectives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  vision_id UUID NOT NULL REFERENCES public.visions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  target_value NUMERIC,
  current_value NUMERIC NOT NULL DEFAULT 0,
  unit TEXT,
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'active',
  sort_order INTEGER NOT NULL DEFAULT 0,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Objective Updates
CREATE TABLE public.objective_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  objective_id UUID NOT NULL REFERENCES public.objectives(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  previous_value NUMERIC NOT NULL,
  new_value NUMERIC NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habits
CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '✅',
  color TEXT NOT NULL DEFAULT '#6366f1',
  frequency_type frequency_type NOT NULL DEFAULT 'daily',
  frequency_value INTEGER NOT NULL DEFAULT 1,
  frequency_days INTEGER[],
  time_of_day time_of_day NOT NULL DEFAULT 'anytime',
  reminder_time TIME,
  linked_objective_id UUID REFERENCES public.objectives(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habit Completions
CREATE TABLE public.habit_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  completed_date DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(habit_id, completed_date)
);

-- Exercises
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  muscle_group TEXT NOT NULL,
  secondary_muscle_group TEXT,
  description TEXT,
  is_compound BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workout Programs
CREATE TABLE public.workout_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workout Program Exercises
CREATE TABLE public.workout_program_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES public.workout_programs(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL,
  sets_target INTEGER NOT NULL DEFAULT 3,
  reps_target TEXT NOT NULL DEFAULT '8-12',
  rest_seconds INTEGER NOT NULL DEFAULT 90,
  sort_order INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workout Sessions
CREATE TABLE public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  program_id UUID REFERENCES public.workout_programs(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Workout Sets
CREATE TABLE public.workout_sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight_kg NUMERIC NOT NULL,
  is_warmup BOOLEAN NOT NULL DEFAULT false,
  rpe NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Running Logs
CREATE TABLE public.running_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  distance_km NUMERIC NOT NULL,
  duration_minutes NUMERIC NOT NULL,
  pace_per_km NUMERIC,
  type running_type NOT NULL DEFAULT 'easy',
  perceived_effort INTEGER NOT NULL CHECK (perceived_effort BETWEEN 1 AND 5),
  heart_rate_avg INTEGER,
  notes TEXT,
  linked_objective_id UUID REFERENCES public.objectives(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.habits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.visions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.objectives
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.workout_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objective_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_program_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.running_logs ENABLE ROW LEVEL SECURITY;

-- Users: own data only
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Habits: own data only
CREATE POLICY "habits_all_own" ON public.habits
  FOR ALL USING (auth.uid() = user_id);

-- Habit Completions: own data only
CREATE POLICY "habit_completions_all_own" ON public.habit_completions
  FOR ALL USING (auth.uid() = user_id);

-- Visions: own data only
CREATE POLICY "visions_all_own" ON public.visions
  FOR ALL USING (auth.uid() = user_id);

-- Objectives: own data only
CREATE POLICY "objectives_all_own" ON public.objectives
  FOR ALL USING (auth.uid() = user_id);

-- Objective Updates: own data only
CREATE POLICY "objective_updates_all_own" ON public.objective_updates
  FOR ALL USING (auth.uid() = user_id);

-- Exercises: default exercises (user_id IS NULL) visible to all + own custom exercises
CREATE POLICY "exercises_select_default_or_own" ON public.exercises
  FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "exercises_insert_own" ON public.exercises
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "exercises_update_own" ON public.exercises
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "exercises_delete_own" ON public.exercises
  FOR DELETE USING (auth.uid() = user_id);

-- Workout Programs: own data only
CREATE POLICY "workout_programs_all_own" ON public.workout_programs
  FOR ALL USING (auth.uid() = user_id);

-- Workout Program Exercises: via program ownership
CREATE POLICY "workout_program_exercises_all_own" ON public.workout_program_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workout_programs
      WHERE id = program_id AND user_id = auth.uid()
    )
  );

-- Workout Sessions: own data only
CREATE POLICY "workout_sessions_all_own" ON public.workout_sessions
  FOR ALL USING (auth.uid() = user_id);

-- Workout Sets: via session ownership
CREATE POLICY "workout_sets_all_own" ON public.workout_sets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workout_sessions
      WHERE id = session_id AND user_id = auth.uid()
    )
  );

-- Running Logs: own data only
CREATE POLICY "running_logs_all_own" ON public.running_logs
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_habits_user_id ON public.habits(user_id);
CREATE INDEX idx_habit_completions_habit_id ON public.habit_completions(habit_id);
CREATE INDEX idx_habit_completions_user_date ON public.habit_completions(user_id, completed_date);
CREATE INDEX idx_visions_user_id ON public.visions(user_id);
CREATE INDEX idx_objectives_vision_id ON public.objectives(vision_id);
CREATE INDEX idx_objectives_user_id ON public.objectives(user_id);
CREATE INDEX idx_objective_updates_objective_id ON public.objective_updates(objective_id);
CREATE INDEX idx_exercises_muscle_group ON public.exercises(muscle_group);
CREATE INDEX idx_workout_program_exercises_program_id ON public.workout_program_exercises(program_id);
CREATE INDEX idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX idx_workout_sets_session_id ON public.workout_sets(session_id);
CREATE INDEX idx_running_logs_user_id ON public.running_logs(user_id);
CREATE INDEX idx_running_logs_date ON public.running_logs(user_id, date);

-- ============================================
-- SEED DATA: Default Exercises
-- ============================================

INSERT INTO public.exercises (name, muscle_group, secondary_muscle_group, description, is_compound) VALUES
-- Pectoraux (7)
('Développé couché', 'pectoraux', 'bras', 'Exercice de base pour les pectoraux avec barre', true),
('Développé incliné', 'pectoraux', 'epaules', 'Cible la partie haute des pectoraux', true),
('Développé décliné', 'pectoraux', 'bras', 'Cible la partie basse des pectoraux', true),
('Écartés couchés', 'pectoraux', NULL, 'Isolation des pectoraux avec haltères', false),
('Écartés à la poulie', 'pectoraux', NULL, 'Isolation des pectoraux à la poulie', false),
('Pompes', 'pectoraux', 'bras', 'Exercice au poids du corps', true),
('Dips (pectoraux)', 'pectoraux', 'bras', 'Dips penchés en avant pour cibler les pectoraux', true),

-- Dos (7)
('Tractions', 'dos', 'bras', 'Exercice de base pour le dos au poids du corps', true),
('Rowing barre', 'dos', 'bras', 'Rowing avec barre pour l''épaisseur du dos', true),
('Rowing haltère', 'dos', 'bras', 'Rowing unilatéral avec haltère', true),
('Tirage vertical', 'dos', 'bras', 'Tirage à la poulie haute', true),
('Tirage horizontal', 'dos', 'bras', 'Tirage à la poulie basse', true),
('Soulevé de terre', 'dos', 'jambes', 'Exercice polyarticulaire complet', true),
('Pull-over', 'dos', 'pectoraux', 'Étirement et contraction du grand dorsal', false),

-- Épaules (7)
('Développé militaire', 'epaules', 'bras', 'Développé au-dessus de la tête avec barre', true),
('Développé haltères', 'epaules', 'bras', 'Développé au-dessus de la tête avec haltères', true),
('Élévations latérales', 'epaules', NULL, 'Isolation du deltoïde moyen', false),
('Élévations frontales', 'epaules', NULL, 'Isolation du deltoïde antérieur', false),
('Oiseau', 'epaules', 'dos', 'Isolation du deltoïde postérieur', false),
('Face pull', 'epaules', 'dos', 'Rotation externe et deltoïde postérieur', false),
('Shrugs', 'epaules', NULL, 'Isolation des trapèzes', false),

-- Bras (7)
('Curl barre', 'bras', NULL, 'Flexion des biceps avec barre', false),
('Curl haltères', 'bras', NULL, 'Flexion des biceps avec haltères', false),
('Curl marteau', 'bras', NULL, 'Flexion avec prise neutre', false),
('Extension triceps poulie', 'bras', NULL, 'Extension des triceps à la poulie haute', false),
('Barre au front', 'bras', NULL, 'Extension des triceps allongé', false),
('Dips (triceps)', 'bras', 'pectoraux', 'Dips buste droit pour cibler les triceps', true),
('Curl concentré', 'bras', NULL, 'Isolation maximale du biceps', false),

-- Jambes (7)
('Squat', 'jambes', 'abdos', 'Exercice de base pour les quadriceps', true),
('Presse à cuisses', 'jambes', NULL, 'Alternative au squat sur machine', true),
('Fentes', 'jambes', 'abdos', 'Exercice unilatéral pour les jambes', true),
('Leg extension', 'jambes', NULL, 'Isolation des quadriceps', false),
('Leg curl', 'jambes', NULL, 'Isolation des ischio-jambiers', false),
('Soulevé de terre roumain', 'jambes', 'dos', 'Cible les ischio-jambiers et fessiers', true),
('Mollets debout', 'jambes', NULL, 'Isolation des mollets', false),

-- Abdos (6)
('Crunchs', 'abdos', NULL, 'Flexion du buste pour les abdominaux', false),
('Relevé de jambes', 'abdos', NULL, 'Cible le bas des abdominaux', false),
('Planche', 'abdos', NULL, 'Gainage isométrique', false),
('Russian twist', 'abdos', NULL, 'Rotation pour les obliques', false),
('Ab wheel', 'abdos', NULL, 'Exercice avancé pour les abdominaux', false),
('Crunchs à la poulie', 'abdos', NULL, 'Crunchs avec résistance à la poulie', false);
