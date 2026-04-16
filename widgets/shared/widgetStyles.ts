// widgets/shared/widgetStyles.ts

/** Light-mode design tokens matching app DA */
export const WidgetColors = {
  surface: "#FFFFFF",
  background: "#F5F3EF",
  border: "#E0DDD7",
  textPrimary: "#1a1608",
  textSecondary: "#6b6560",
  textMuted: "#9a9590",
  goldPrimary: "#D4AA40",
  goldDark: "#B8922E",
  success: "#22c55e",
  successLight: "rgba(34,197,94,0.1)",
  danger: "#ef4444",
} as const;

export const WidgetRadius = {
  card: 14,
  element: 10,
  icon: 8,
} as const;

export const WidgetFontSize = {
  xs: 9,
  sm: 11,
  md: 13,
  lg: 15,
  xl: 18,
} as const;

export const WidgetSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
} as const;
