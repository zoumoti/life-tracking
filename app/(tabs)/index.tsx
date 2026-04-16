import { useEffect, useMemo, useState } from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeScreen } from "../../components/SafeScreen";
import { HomeHeader } from "../../components/home/HomeHeader";
import { HomeDayProgress } from "../../components/home/HomeDayProgress";
import { HomeHabitList } from "../../components/home/HomeHabitList";
import { HomeSportCard } from "../../components/home/HomeSportCard";
import { HomeObjectivesList } from "../../components/home/HomeObjectivesList";
import { HomeAnalytics } from "../../components/home/HomeAnalytics";
import { HomeFinanceCard } from "../../components/home/HomeFinanceCard";
import { HomeTasksCard } from "../../components/home/HomeTasksCard";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { useHabitStore } from "../../stores/habitStore";
import { useObjectiveStore } from "../../stores/objectiveStore";
import { useWorkoutStore } from "../../stores/workoutStore";
import { useRunningStore } from "../../stores/runningStore";
import { useFinanceStore } from "../../stores/financeStore";
import { useTaskStore } from "../../stores/taskStore";
import { toDateString, addDays } from "../../lib/dateUtils";
import { isHabitScheduledForDate, calculateStreak } from "../../lib/habitUtils";

export default function HomeScreen() {
  const router = useRouter();
  const today = toDateString();

  // --- Stores ---
  const { habits, completions, fetchHabits, fetchCompletions, toggleCompletion, getCompletedDatesForHabit } =
    useHabitStore();
  const { objectives, fetchObjectives } = useObjectiveStore();
  const { programs, currentSession, fetchPrograms, startSession, sessions, fetchSessions } = useWorkoutStore();
  const { runs, fetchRuns } = useRunningStore();
  const { transactions, accounts, fetchAccounts, fetchTransactionsRange, fetchCategories } = useFinanceStore();
  const { tasks, fetchTasks, toggleComplete } = useTaskStore();

  // --- Confirm start session ---
  const [pendingStart, setPendingStart] = useState<{
    type: "free" | "program";
    program?: { id: string; name: string; exercises: { id: string; name: string }[] };
  } | null>(null);

  // --- Initial fetch ---
  useEffect(() => {
    if (habits.length === 0) fetchHabits();
    fetchCompletions(addDays(today, -90), today);
    if (objectives.length === 0) fetchObjectives();
    if (programs.length === 0) fetchPrograms();
    fetchSessions();
    fetchRuns();
    fetchAccounts();
    fetchCategories();
    // Fetch current + previous month transactions for evolution calculation
    const now = new Date();
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const startDate = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, "0")}-01`;
    const endDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const endDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`;
    fetchTransactionsRange(startDate, endDate);
    fetchTasks();
  }, []);

  // --- Habits data ---
  const todayHabits = useMemo(
    () => habits.filter((h) => isHabitScheduledForDate(h, today)),
    [habits, today]
  );

  const habitItems = useMemo(
    () =>
      todayHabits.map((habit) => ({
        habit,
        completed: !!completions[`${habit.id}:${today}`],
        streak: calculateStreak(habit, getCompletedDatesForHabit(habit.id), today),
      })),
    [todayHabits, completions, today]
  );

  const completedCount = habitItems.filter((i) => i.completed).length;
  const allDone = todayHabits.length > 0 && completedCount === todayHabits.length;

  // --- Weekly sport stats ---
  const weekStart = addDays(today, -6);
  const weekWorkouts = useMemo(
    () => sessions.filter((s) => s.started_at && s.started_at.slice(0, 10) >= weekStart),
    [sessions, weekStart]
  );
  const weekVolume = useMemo(
    () => weekWorkouts.reduce((sum, s) => sum + s.sets.reduce((v, set) => v + set.weight_kg * set.reps, 0), 0),
    [weekWorkouts]
  );
  const weekRuns = useMemo(
    () => runs.filter((r) => r.date >= weekStart),
    [runs, weekStart]
  );
  const weekRunDistance = useMemo(
    () => weekRuns.reduce((sum, r) => sum + r.distance_km, 0),
    [weekRuns]
  );

  // --- Handlers ---
  const handleToggle = (habitId: string) => {
    toggleCompletion(habitId, today);
  };

  const handleStartFreeSession = () => {
    setPendingStart({ type: "free" });
  };

  const handleStartProgram = (program: { id: string; name: string; exercises: { exercise: { id: string; name: string }; sort_order: number }[] }) => {
    const exercises = program.exercises
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((pe) => ({ id: pe.exercise.id, name: pe.exercise.name }));
    setPendingStart({ type: "program", program: { id: program.id, name: program.name, exercises } });
  };

  const confirmStart = () => {
    if (!pendingStart) return;
    if (pendingStart.type === "free") {
      startSession();
    } else if (pendingStart.program) {
      startSession(pendingStart.program.id, pendingStart.program.name, pendingStart.program.exercises);
    }
    setPendingStart(null);
    router.push("/(tabs)/sport/active-workout" as any);
  };

  const handlePressObjective = () => {
    router.push("/(tabs)/objectives" as any);
  };

  return (
    <SafeScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HomeHeader habits={habits} completions={completions} />

        <HomeDayProgress completed={completedCount} total={todayHabits.length} allDone={allDone} />

        <HomeHabitList
          items={habitItems}
          allDone={allDone}
          onToggle={handleToggle}
        />

        <HomeAnalytics
          habits={habits}
          completions={completions}
          workoutCount={weekWorkouts.length}
          workoutVolume={weekVolume}
          runDistanceKm={weekRunDistance}
          runCount={weekRuns.length}
        />

        <HomeSportCard
          currentSession={currentSession}
          programs={programs}
          onStartFreeSession={handleStartFreeSession}
          onStartProgram={handleStartProgram}
        />

        <HomeObjectivesList
          objectives={objectives}
          onPressObjective={handlePressObjective}
        />

        <HomeFinanceCard transactions={transactions} accounts={accounts} />
        <HomeTasksCard tasks={tasks} onToggle={toggleComplete} />
      </ScrollView>

      <ConfirmModal
        visible={!!pendingStart}
        title="Demarrer une seance ?"
        message={
          pendingStart?.type === "free"
            ? "Tu vas commencer une seance libre."
            : `Tu vas commencer "${pendingStart?.program?.name ?? ""}".`
        }
        confirmLabel="Demarrer"
        destructive={false}
        onConfirm={confirmStart}
        onCancel={() => setPendingStart(null)}
      />
    </SafeScreen>
  );
}
