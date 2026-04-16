// widgets/MediumWidget.tsx
import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";
import { WidgetColors, WidgetRadius, WidgetFontSize, WidgetSpacing } from "./shared/widgetStyles";
import type { WidgetData } from "./shared/widgetData";

type Props = { data: WidgetData };

function HabitIcon({ habit }: { habit: { id: string; icon: string; completed: boolean } }) {
  return (
    <FlexWidget
      style={{
        width: 38, height: 38, borderRadius: WidgetRadius.element,
        backgroundColor: habit.completed ? WidgetColors.successLight : WidgetColors.background,
        borderWidth: 2,
        borderColor: habit.completed ? WidgetColors.success : WidgetColors.border,
        justifyContent: "center", alignItems: "center",
      }}
      clickAction="TOGGLE_HABIT"
      clickActionData={{ habitId: habit.id }}
    >
      <TextWidget text={habit.completed ? "✅" : habit.icon} style={{ fontSize: 15 }} />
    </FlexWidget>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <FlexWidget
      style={{
        flex: 1, backgroundColor: WidgetColors.background,
        borderRadius: WidgetRadius.element, paddingVertical: WidgetSpacing.sm, alignItems: "center",
      }}
    >
      <TextWidget text={value} style={{ fontSize: WidgetFontSize.lg, color: WidgetColors.textPrimary }} />
      <TextWidget text={label} style={{ fontSize: WidgetFontSize.xs, color: WidgetColors.textSecondary }} />
    </FlexWidget>
  );
}

export function MediumWidget({ data }: Props) {
  const completedCount = data.habits.filter((h) => h.completed).length;
  const totalCount = data.habits.length;

  return (
    <FlexWidget
      style={{
        flexDirection: "column", backgroundColor: WidgetColors.surface,
        borderRadius: WidgetRadius.card, padding: WidgetSpacing.lg,
        height: "match_parent", width: "match_parent",
      }}
    >
      <FlexWidget
        style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: WidgetSpacing.md }}
        clickAction="OPEN_APP"
      >
        <FlexWidget style={{ flexDirection: "row", alignItems: "center" }}>
          <FlexWidget style={{ width: 24, height: 24, borderRadius: 7, backgroundColor: WidgetColors.goldPrimary, justifyContent: "center", alignItems: "center" }}>
            <TextWidget text="🎯" style={{ fontSize: 12 }} />
          </FlexWidget>
          <TextWidget text="Life OS" style={{ fontSize: WidgetFontSize.lg, color: WidgetColors.textPrimary, marginLeft: WidgetSpacing.sm }} />
        </FlexWidget>
        <TextWidget text={`${completedCount}/${totalCount}`} style={{ fontSize: WidgetFontSize.sm, color: WidgetColors.goldPrimary }} />
      </FlexWidget>

      <FlexWidget style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: WidgetSpacing.md }}>
        {data.habits.map((habit) => (
          <FlexWidget key={habit.id} style={{ marginRight: WidgetSpacing.sm, marginBottom: WidgetSpacing.xs }}>
            <HabitIcon habit={habit} />
          </FlexWidget>
        ))}
      </FlexWidget>

      <FlexWidget style={{ flexDirection: "row", gap: WidgetSpacing.sm }}>
        <StatCard value={`${data.stats.weeklyRunKm}km`} label="COURSE" />
        <StatCard value={`${data.stats.weeklyWorkoutCount}`} label="SÉANCES" />
        <StatCard value={`${data.stats.todayTaskCount}`} label="TÂCHES" />
      </FlexWidget>
    </FlexWidget>
  );
}
