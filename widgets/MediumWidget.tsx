import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";
import { WidgetColors } from "./shared/widgetStyles";
import type { WidgetData } from "./shared/widgetData";

type Props = { data: WidgetData };

function HabitIcon({ habit }: { habit: { id: string; icon: string; completed: boolean } }) {
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
      {/* Header — OPEN_APP on tap, spacing between title and counter */}
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
        {/* Counter pushed to far right by space-between */}
        <TextWidget
          text={`${completedCount} / ${totalCount}`}
          style={{ fontSize: 14, fontWeight: "700", color: WidgetColors.goldPrimary }}
        />
      </FlexWidget>

      {/* Habits row */}
      <FlexWidget style={{ flexDirection: "row", marginTop: 10 }}>
        {data.habits.map((habit) => (
          <HabitIcon key={habit.id} habit={habit} />
        ))}
      </FlexWidget>

      {/* Stats row — deep links */}
      <FlexWidget style={{ flexDirection: "row", marginTop: 10, width: "match_parent" }}>
        <FlexWidget
          style={{
            flex: 1,
            backgroundColor: WidgetColors.background,
            borderRadius: 10,
            paddingVertical: 10,
            marginRight: 4,
            alignItems: "center",
          }}
          clickAction="OPEN_URI"
          clickActionData={{ uri: "lifeos:///(tabs)/sport/running" }}
        >
          <TextWidget
            text={`${data.stats.weeklyRunKm}km`}
            style={{ fontSize: 15, fontWeight: "700", color: WidgetColors.textPrimary }}
          />
          <TextWidget
            text="COURSE"
            style={{ fontSize: 9, color: WidgetColors.textSecondary, marginTop: 2 }}
          />
        </FlexWidget>

        <FlexWidget
          style={{
            flex: 1,
            backgroundColor: WidgetColors.background,
            borderRadius: 10,
            paddingVertical: 10,
            marginHorizontal: 4,
            alignItems: "center",
          }}
          clickAction="OPEN_URI"
          clickActionData={{ uri: "lifeos:///(tabs)/sport" }}
        >
          <TextWidget
            text={`${data.stats.weeklyWorkoutCount}`}
            style={{ fontSize: 15, fontWeight: "700", color: WidgetColors.textPrimary }}
          />
          <TextWidget
            text="SÉANCES"
            style={{ fontSize: 9, color: WidgetColors.textSecondary, marginTop: 2 }}
          />
        </FlexWidget>

        <FlexWidget
          style={{
            flex: 1,
            backgroundColor: WidgetColors.background,
            borderRadius: 10,
            paddingVertical: 10,
            marginLeft: 4,
            alignItems: "center",
          }}
          clickAction="OPEN_URI"
          clickActionData={{ uri: "lifeos:///(tabs)/tasks" }}
        >
          <TextWidget
            text={`${data.stats.todayTaskCount}`}
            style={{ fontSize: 15, fontWeight: "700", color: WidgetColors.textPrimary }}
          />
          <TextWidget
            text="TÂCHES"
            style={{ fontSize: 9, color: WidgetColors.textSecondary, marginTop: 2 }}
          />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
