import AsyncStorage from "@react-native-async-storage/async-storage";

const WIDGET_KEY = "@lifeos_widget_data";

export type WidgetHabit = {
  id: string;
  name: string;
  icon: string;
  completed: boolean;
};

export type WidgetTask = {
  id: string;
  title: string;
  completed: boolean;
};

export type WidgetStats = {
  weeklyRunKm: number;
  weeklyWorkoutCount: number;
  todayTaskCount: number;
  monthlyBalance: number;
};

export type WidgetObjective = {
  name: string;
  current: number;
  target: number;
  unit: string;
  deadline: string | null;
};

export type WidgetData = {
  habits: WidgetHabit[];
  tasks: WidgetTask[];
  stats: WidgetStats;
  objective: WidgetObjective | null;
  lastUpdated: string;
};

const DEFAULT_DATA: WidgetData = {
  habits: [],
  tasks: [],
  stats: {
    weeklyRunKm: 0,
    weeklyWorkoutCount: 0,
    todayTaskCount: 0,
    monthlyBalance: 0,
  },
  objective: null,
  lastUpdated: new Date().toISOString(),
};

export async function readWidgetData(): Promise<WidgetData> {
  try {
    const raw = await AsyncStorage.getItem(WIDGET_KEY);
    if (!raw) return DEFAULT_DATA;
    return JSON.parse(raw) as WidgetData;
  } catch {
    return DEFAULT_DATA;
  }
}

export async function writeWidgetData(data: WidgetData): Promise<void> {
  try {
    await AsyncStorage.setItem(WIDGET_KEY, JSON.stringify(data));
  } catch {
    // Silent fail — widget will show stale data
  }
}
