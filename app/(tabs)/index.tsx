import { useEffect, useMemo } from "react";
import { ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SafeScreen } from "../../components/SafeScreen";
import { HomeHeader } from "../../components/home/HomeHeader";
import { HomeDayProgress } from "../../components/home/HomeDayProgress";
import { HomeHabitList } from "../../components/home/HomeHabitList";
import { HomeSportCard } from "../../components/home/HomeSportCard";
import { HomeObjectivesList } from "../../components/home/HomeObjectivesList";
import { useHabitStore } from "../../stores/habitStore";
import { useObjectiveStore } from "../../stores/objectiveStore";
import { useWorkoutStore } from "../../stores/workoutStore";
import { toDateString, addDays } from "../../lib/dateUtils";
import { isHabitScheduledForDate, calculateStreak } from "../../lib/habitUtils";

export default function HomeScreen() {
  const router = useRouter();
  const today = toDateString();

  // --- Stores ---
  const { habits, completions, fetchHabits, fetchCompletions, toggleCompletion, getCompletedDatesForHabit } =
    useHabitStore();
  const { objectives, fetchObjectives } = useObjectiveStore();
  const { programs, currentSession, fetchPrograms, startSession } = useWorkoutStore();

  // --- Initial fetch (if stores are empty) ---
  useEffect(() => {
    if (habits.length === 0) fetchHabits();
    fetchCompletions(addDays(today, -90), today);
    if (objectives.length === 0) fetchObjectives();
    if (programs.length === 0) fetchPrograms();
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

  // --- Handlers ---
  const handleToggle = (habitId: string) => {
    toggleCompletion(habitId, today);
  };

  const handleStartFreeSession = () => {
    startSession();
    router.push("/(tabs)/sport/active-workout" as any);
  };

  const handleStartProgram = (program: { id: string; name: string; exercises: { exercise: { id: string; name: string }; sort_order: number }[] }) => {
    const exercises = program.exercises
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((pe) => ({ id: pe.exercise.id, name: pe.exercise.name }));
    startSession(program.id, program.name, exercises);
    router.push("/(tabs)/sport/active-workout" as any);
  };

  const handlePressObjective = () => {
    router.push("/(tabs)/objectives" as any);
  };

  return (
    <SafeScreen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HomeHeader habits={habits} completions={completions} />

        <HomeDayProgress completed={completedCount} total={todayHabits.length} />

        <HomeHabitList
          items={habitItems}
          allDone={allDone}
          onToggle={handleToggle}
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
      </ScrollView>
    </SafeScreen>
  );
}
