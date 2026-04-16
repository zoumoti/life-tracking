import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";
import { WidgetColors } from "./shared/widgetStyles";
import type { WidgetData } from "./shared/widgetData";

type Props = { data: WidgetData };

function HabitIcon({ habit }: { habit: { id: string; name: string; icon: string; completed: boolean } }) {
  return (
    <FlexWidget
      style={{
        width: 44,
        height: 44,
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
      <TextWidget text={habit.icon} style={{ fontSize: 20 }} />
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
        style={{ fontSize: 14, fontWeight: "700", color: WidgetColors.textPrimary }}
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
        borderRadius: 14,
        padding: 14,
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
              width: 26,
              height: 26,
              borderRadius: 8,
              backgroundColor: WidgetColors.goldPrimary,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TextWidget text="🎯" style={{ fontSize: 13 }} />
          </FlexWidget>
          <TextWidget
            text="Life OS"
            style={{
              fontSize: 15,
              fontWeight: "600",
              color: WidgetColors.textPrimary,
              marginLeft: 8,
            }}
          />
        </FlexWidget>
        <TextWidget
          text={`${completedCount}/${totalCount}`}
          style={{ fontSize: 14, fontWeight: "700", color: WidgetColors.goldPrimary }}
        />
      </FlexWidget>

      {/* Habits row */}
      <FlexWidget style={{ flexDirection: "row", marginTop: 10 }}>
        {data.habits.map((habit) => (
          <HabitIcon key={habit.id} habit={habit} />
        ))}
      </FlexWidget>

      {/* Stats row */}
      <FlexWidget style={{ flexDirection: "row", flexGap: 6, marginTop: 10 }}>
        <StatCard value={`${data.stats.weeklyRunKm}km`} label="COURSE" />
        <StatCard value={`${data.stats.weeklyWorkoutCount}`} label="SÉANCES" />
        <StatCard value={`${data.stats.todayTaskCount}`} label="TÂCHES" />
      </FlexWidget>
    </FlexWidget>
  );
}
