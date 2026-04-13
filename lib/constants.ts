export const APP_NAME = "Life Tracker";

export const TABS = {
  home: { label: "Aujourd'hui", icon: "home" },
  habits: { label: "Habitudes", icon: "check-circle" },
  objectives: { label: "Objectifs", icon: "target" },
  sport: { label: "Sport", icon: "activity" },
} as const;

export const HABIT_MOMENTS = ["morning", "afternoon", "evening", "anytime"] as const;
export type HabitMoment = (typeof HABIT_MOMENTS)[number];

export const HABIT_MOMENT_LABELS: Record<HabitMoment, string> = {
  morning: "Matin",
  afternoon: "Apres-midi",
  evening: "Soir",
  anytime: "Peu importe",
};

export const MUSCLE_GROUPS = [
  "pectoraux",
  "dos",
  "epaules",
  "bras",
  "jambes",
  "abdos",
] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const RUNNING_TYPES = ["easy", "tempo", "intervals", "race"] as const;
export type RunningType = (typeof RUNNING_TYPES)[number];

export const RUNNING_TYPE_LABELS: Record<RunningType, string> = {
  easy: "Endurance facile",
  tempo: "Tempo",
  intervals: "Fractionne",
  race: "Competition",
};
