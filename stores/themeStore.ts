import { createPersistedStore } from "./createPersistedStore";

type ThemeMode = "dark" | "light";

type ThemeState = {
  mode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
};

export const useThemeStore = createPersistedStore<ThemeState>(
  "theme-store",
  (set) => ({
    mode: "dark",
    toggleTheme: () =>
      set((state) => ({ mode: state.mode === "dark" ? "light" : "dark" })),
    setTheme: (mode) => set({ mode }),
  })
);
