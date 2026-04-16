import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";
import { WidgetColors, WidgetRadius, WidgetFontSize, WidgetSpacing } from "./shared/widgetStyles";
import type { WidgetData } from "./shared/widgetData";

type Props = { data: WidgetData };

function HabitIcon({ habit }: { habit: { id: string; icon: string; completed: boolean } }) {
  return (
    <FlexWidget
      style={{
        width: 38,
        height: 38,
        borderRadius: WidgetRadius.element,
        backgroundColor: habit.completed ? "rgba(34, 197, 94, 0.1)" : WidgetColors.background,
        borderWidth: 2,
        borderColor: habit.completed ? WidgetColors.success : WidgetColors.border,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 7,
        marginBottom: WidgetSpacing.xs,
      }}
      clickAction="TOGGLE_HABIT"
      clickActionData={{ habitId: habit.id }}
    >
      <TextWidget text={habit.completed ? "✅" : habit.icon} style={{ fontSize: 15 }} />
    </FlexWidget>
  );
}

function TaskRow({ task }: { task: { title: string; completed: boolean } }) {
  return (
    <FlexWidget
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: WidgetColors.background,
        borderRadius: WidgetRadius.icon,
        paddingHorizontal: WidgetSpacing.md,
        paddingVertical: 6,
        marginBottom: WidgetSpacing.xs,
      }}
    >
      <FlexWidget
        style={{
          width: 16,
          height: 16,
          borderRadius: 4,
          backgroundColor: task.completed ? WidgetColors.success : "#00000000",
          borderWidth: task.completed ? 0 : 2,
          borderColor: WidgetColors.border,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TextWidget
          text={task.completed ? "✓" : ""}
          style={{ fontSize: 10, color: "#FFFFFF" }}
        />
      </FlexWidget>
      <TextWidget
        text={task.title}
        style={{
          fontSize: 12,
          color: task.completed ? WidgetColors.textMuted : WidgetColors.textPrimary,
          marginLeft: WidgetSpacing.sm,
        }}
        truncate="END"
        maxLines={1}
      />
    </FlexWidget>
  );
}

function StatCard({ value, label, color }: { value: string; label: string; color?: string }) {
  return (
    <FlexWidget
      style={{
        flex: 1,
        backgroundColor: WidgetColors.background,
        borderRadius: WidgetRadius.element,
        paddingVertical: WidgetSpacing.sm,
        alignItems: "center",
      }}
    >
      <TextWidget
        text={value}
        style={{ fontSize: 16, color: (color || WidgetColors.textPrimary) as `#${string}` }}
      />
      <TextWidget
        text={label}
        style={{ fontSize: WidgetFontSize.xs, color: WidgetColors.textSecondary }}
      />
    </FlexWidget>
  );
}

export function LargeWidget({ data }: Props) {
  const completedCount = data.habits.filter((h) => h.completed).length;
  const totalCount = data.habits.length;
  const today = new Date();
  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const monthNames = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre",
  ];
  const dateLabel = `${dayNames[today.getDay()]} ${today.getDate()} ${monthNames[today.getMonth()]}`;

  const displayedTasks = data.tasks.slice(0, 3);
  const extraTasks = Math.max(0, data.tasks.length - 3);

  const balanceStr = `${Math.round(data.stats.monthlyBalance)}€`;
  const balanceColor = data.stats.monthlyBalance >= 0 ? WidgetColors.success : WidgetColors.danger;

  // Progress bar: use flex ratio instead of percentage width
  const progressPercent = data.objective
    ? Math.min(100, Math.max(1, Math.round((data.objective.current / data.objective.target) * 100)))
    : 0;
  const progressFlex = Math.max(1, progressPercent);
  const remainingFlex = Math.max(1, 100 - progressPercent);

  return (
    <FlexWidget
      style={{
        flexDirection: "column",
        backgroundColor: WidgetColors.surface,
        borderRadius: WidgetRadius.card,
        padding: WidgetSpacing.lg,
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
          marginBottom: WidgetSpacing.md,
        }}
        clickAction="OPEN_APP"
      >
        <FlexWidget style={{ flexDirection: "row", alignItems: "center" }}>
          <FlexWidget
            style={{
              width: 24,
              height: 24,
              borderRadius: 7,
              backgroundColor: WidgetColors.goldPrimary,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TextWidget text="🎯" style={{ fontSize: 12 }} />
          </FlexWidget>
          <TextWidget
            text="Life OS"
            style={{
              fontSize: WidgetFontSize.lg,
              color: WidgetColors.textPrimary,
              marginLeft: WidgetSpacing.sm,
            }}
          />
        </FlexWidget>
        <TextWidget
          text={dateLabel}
          style={{ fontSize: WidgetFontSize.sm, color: WidgetColors.textSecondary }}
        />
      </FlexWidget>

      {/* Habits section */}
      <FlexWidget style={{ marginBottom: WidgetSpacing.md }}>
        <TextWidget
          text={`HABITUDES — ${completedCount}/${totalCount}`}
          style={{ fontSize: 10, color: WidgetColors.goldPrimary, marginBottom: 6 }}
        />
        <FlexWidget style={{ flexDirection: "row" }}>
          {data.habits.map((habit) => (
            <HabitIcon key={habit.id} habit={habit} />
          ))}
        </FlexWidget>
      </FlexWidget>

      {/* Tasks section */}
      <FlexWidget
        style={{ marginBottom: WidgetSpacing.md }}
        clickAction="OPEN_APP"
        clickActionData={{ tab: "tasks" }}
      >
        <TextWidget
          text="TÂCHES DU JOUR"
          style={{ fontSize: 10, color: WidgetColors.goldDark, marginBottom: 6 }}
        />
        {displayedTasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
        {extraTasks > 0 && (
          <TextWidget
            text={`+${extraTasks} de plus`}
            style={{
              fontSize: WidgetFontSize.xs,
              color: WidgetColors.textMuted,
              marginTop: WidgetSpacing.xs,
            }}
          />
        )}
      </FlexWidget>

      {/* Stats row */}
      <FlexWidget
        style={{
          flexDirection: "row",
          flexGap: WidgetSpacing.sm,
          marginBottom: WidgetSpacing.md,
        }}
      >
        <StatCard value={`${data.stats.weeklyRunKm}km`} label="COURSE" />
        <StatCard value={`${data.stats.weeklyWorkoutCount}`} label="SÉANCES" />
        <StatCard value={balanceStr} label="BALANCE" color={balanceColor} />
      </FlexWidget>

      {/* Objective card */}
      {data.objective ? (
        <FlexWidget
          style={{
            backgroundColor: "rgba(212, 170, 64, 0.08)",
            borderRadius: WidgetRadius.element,
            padding: WidgetSpacing.md,
            borderLeftWidth: 3,
            borderLeftColor: WidgetColors.goldPrimary,
          }}
          clickAction="OPEN_APP"
          clickActionData={{ tab: "objectives" }}
        >
          <TextWidget
            text={`Objectif : ${data.objective.name}`}
            style={{
              fontSize: WidgetFontSize.sm,
              color: WidgetColors.goldDark,
              marginBottom: 5,
            }}
          />
          {/* Progress bar using flex ratio */}
          <FlexWidget
            style={{
              flexDirection: "row",
              height: 6,
              borderRadius: 4,
              backgroundColor: "#EBE8E2",
              width: "match_parent",
              overflow: "hidden",
            }}
          >
            <FlexWidget
              style={{
                flex: progressFlex,
                height: 6,
                backgroundColor: WidgetColors.goldPrimary,
                borderRadius: 4,
              }}
            />
            <FlexWidget style={{ flex: remainingFlex, height: 6 }} />
          </FlexWidget>
          <TextWidget
            text={`${data.objective.current} / ${data.objective.target} ${data.objective.unit} — ${progressPercent}%`}
            style={{
              fontSize: WidgetFontSize.xs,
              color: WidgetColors.textSecondary,
              marginTop: WidgetSpacing.xs,
            }}
          />
        </FlexWidget>
      ) : (
        <FlexWidget style={{ height: 0, width: 0 }} />
      )}
    </FlexWidget>
  );
}
