import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";
import { WidgetColors, WidgetRadius, WidgetFontSize, WidgetSpacing } from "./shared/widgetStyles";
import type { WidgetData } from "./shared/widgetData";

type Props = { data: WidgetData };

function HabitIcon({ habit }: { habit: { id: string; icon: string; completed: boolean } }) {
  return (
    <FlexWidget
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: habit.completed ? "rgba(34, 197, 94, 0.12)" : WidgetColors.background,
        borderWidth: 2,
        borderColor: habit.completed ? WidgetColors.success : WidgetColors.border,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
      }}
      clickAction="TOGGLE_HABIT"
      clickActionData={{ habitId: habit.id }}
    >
      <TextWidget text={habit.completed ? "✅" : habit.icon} style={{ fontSize: 16 }} />
    </FlexWidget>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <FlexWidget
      style={{
        flex: 1,
        backgroundColor: WidgetColors.background,
        borderRadius: 10,
        paddingVertical: 8,
        alignItems: "center",
      }}
    >
      <TextWidget
        text={value}
        style={{ fontSize: 15, fontWeight: "700", color: WidgetColors.textPrimary }}
      />
      <TextWidget
        text={label}
        style={{ fontSize: 9, color: WidgetColors.textSecondary, marginTop: 2 }}
      />
    </FlexWidget>
  );
}

export function MediumWidget({ data }: Props) {
  const completedCount = data.habits.filter((h) => h.completed).length;
  const totalCount = data.habits.length;

  return (
    <FlexWidget
      style={{
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: WidgetColors.surface,
        borderRadius: WidgetRadius.card,
        padding: 16,
        height: "match_parent",
        width: "match_parent",
      }}
    >
      {/* Header */}
      <FlexWidget
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
        clickAction="OPEN_APP"
      >
        <FlexWidget style={{ flexDirection: "row", alignItems: "center" }}>
          <FlexWidget
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: WidgetColors.goldPrimary,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TextWidget text="🎯" style={{ fontSize: 14 }} />
          </FlexWidget>
          <TextWidget
            text="Life OS"
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: WidgetColors.textPrimary,
              marginLeft: 10,
            }}
          />
        </FlexWidget>
        <TextWidget
          text={`${completedCount}/${totalCount}`}
          style={{ fontSize: 13, fontWeight: "600", color: WidgetColors.goldPrimary }}
        />
      </FlexWidget>

      {/* Habits row */}
      <FlexWidget style={{ flexDirection: "row", marginTop: 12 }}>
        {data.habits.map((habit) => (
          <HabitIcon key={habit.id} habit={habit} />
        ))}
      </FlexWidget>

      {/* Stats row */}
      <FlexWidget style={{ flexDirection: "row", flexGap: 8, marginTop: 12 }}>
        <StatCard value={`${data.stats.weeklyRunKm}km`} label="COURSE" />
        <StatCard value={`${data.stats.weeklyWorkoutCount}`} label="SÉANCES" />
        <StatCard value={`${data.stats.todayTaskCount}`} label="TÂCHES" />
      </FlexWidget>
    </FlexWidget>
  );
}
