import { useThemeStore } from "../stores/themeStore";

export type ThemeColors = typeof darkColors;

const shared = {
  primary: "#D4AA40",
  primaryLight: "#E8C860",
  primaryDark: "#B8922E",
  primaryOnText: "#1a1608",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
} as const;

export const darkColors = {
  ...shared,
  background: "#121210",
  surface: "#1c1a16",
  surfaceLight: "#2e2b24",
  text: "#ffffff",
  textSecondary: "#9a9590",
  textMuted: "#5e5a54",
  tabBarBorder: "#1c1a16",
  cardBorder: "transparent",
} as const;

export const lightColors = {
  ...shared,
  background: "#F5F3EF",
  surface: "#FFFFFF",
  surfaceLight: "#EBE8E2",
  text: "#1a1608",
  textSecondary: "#6b6560",
  textMuted: "#9a9590",
  tabBarBorder: "#E0DDD7",
  cardBorder: "#E0DDD7",
} as const;

// Backward-compatible: default to dark for any code using `colors` directly
export const colors = darkColors;

// Hook for reactive theme colors
export function useColors(): ThemeColors {
  const mode = useThemeStore((s) => s.mode);
  return mode === "dark" ? darkColors : lightColors;
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  full: 9999,
} as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
} as const;
