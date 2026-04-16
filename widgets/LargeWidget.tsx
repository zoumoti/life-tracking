import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";
import { WidgetColors } from "./shared/widgetStyles";
import type { WidgetData } from "./shared/widgetData";

type Props = { data: WidgetData };

function HabitIcon({ habit }: { habit: { id: string; name: string; icon: string; completed: boolean } }) {
  return (
    <FlexWidget
      style={{
        alignItems: "center",
        marginRight: 10,
      }}
      clickAction="TOGGLE_HABIT"
      clickActionData={{ habitId: habit.id }}
    >
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
        }}
      >
        <TextWidget text={habit.icon} style={{ fontSize: 20 }} />
      </FlexWidget>
      <TextWidget
        text={habit.name.length > 6 ? habit.name.slice(0, 5) + "." : habit.name}
        style={{ fontSize: 9, color: WidgetColors.textSecondary, marginTop: 3 }}
        maxLines={1}
      />
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
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 4,
      }}
    >
      <FlexWidget
        style={{
          width: 18,
          height: 18,
          borderRadius: 5,
          backgroundColor: task.completed ? WidgetColors.success : "#00000000",
          borderWidth: task.completed ? 0 : 2,
          borderColor: WidgetColors.border,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TextWidget
          text={task.completed ? "✓" : ""}
          style={{ fontSize: 11, fontWeight: "bold", color: "#FFFFFF" }}
        />
      </FlexWidget>
      <TextWidget
        text={task.title}
        style={{
          fontSize: 13,
          color: task.completed ? WidgetColors.textMuted : WidgetColors.textPrimary,
          marginLeft: 10,
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
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: "center",
      }}
    >
      <TextWidget
        text={value}
        style={{
          fontSize: 16,
          fontWeight: "700",
          color: (color || WidgetColors.textPrimary) as `#${string}`,
        }}
      />
      <TextWidget
        text={label}
        style={{ fontSize: 9, color: WidgetColors.textSecondary, marginTop: 2 }}
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
  const balanceColor =
    data.stats.monthlyBalance >= 0 ? WidgetColors.success : WidgetColors.danger;

  const progressPercent = data.objective
    ? Math.min(100, Math.max(1, Math.round((data.objective.current / data.objective.target) * 100)))
    : 0;

  return (
    <FlexWidget
      style={{
        flexDirection: "column",
        backgroundColor: WidgetColors.surface,
        borderRadius: 14,
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
          marginBottom: 16,
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
          text={dateLabel}
          style={{ fontSize: 12, color: WidgetColors.textSecondary }}
        />
      </FlexWidget>

      {/* Habits section */}
      <FlexWidget style={{ marginBottom: 16 }}>
        <TextWidget
          text={`HABITUDES  ${completedCount}/${totalCount}`}
          style={{
            fontSize: 10,
            fontWeight: "600",
            color: WidgetColors.goldPrimary,
            marginBottom: 8,
          }}
        />
        <FlexWidget style={{ flexDirection: "row" }}>
          {data.habits.map((habit) => (
            <HabitIcon key={habit.id} habit={habit} />
          ))}
        </FlexWidget>
      </FlexWidget>

      {/* Tasks section */}
      <FlexWidget
        style={{ marginBottom: 16 }}
        clickAction="OPEN_APP"
        clickActionData={{ tab: "tasks" }}
      >
        <TextWidget
          text="TÂCHES DU JOUR"
          style={{
            fontSize: 10,
            fontWeight: "600",
            color: WidgetColors.goldDark,
            marginBottom: 8,
          }}
        />
        {displayedTasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
        {extraTasks > 0 ? (
          <TextWidget
            text={`+${extraTasks} de plus`}
            style={{ fontSize: 10, color: WidgetColors.textMuted, marginTop: 4 }}
          />
        ) : (
          <FlexWidget style={{ width: 0, height: 0 }} />
        )}
      </FlexWidget>

      {/* Stats row */}
      <FlexWidget style={{ flexDirection: "row", flexGap: 8, marginBottom: 16 }}>
        <StatCard value={`${data.stats.weeklyRunKm}km`} label="COURSE" />
        <StatCard value={`${data.stats.weeklyWorkoutCount}`} label="SÉANCES" />
        <StatCard value={balanceStr} label="BALANCE" color={balanceColor} />
      </FlexWidget>

      {/* Objective card */}
      {data.objective ? (
        <FlexWidget
          style={{
            backgroundColor: "rgba(212, 170, 64, 0.08)",
            borderRadius: 10,
            padding: 12,
            borderLeftWidth: 3,
            borderLeftColor: WidgetColors.goldPrimary,
          }}
          clickAction="OPEN_APP"
          clickActionData={{ tab: "objectives" }}
        >
          <TextWidget
            text={`Objectif : ${data.objective.name}`}
            style={{
              fontSize: 12,
              fontWeight: "600",
              color: WidgetColors.goldDark,
              marginBottom: 6,
            }}
          />
          <FlexWidget
            style={{
              flexDirection: "row",
              height: 6,
              borderRadius: 3,
              backgroundColor: "#EBE8E2",
              width: "match_parent",
              overflow: "hidden",
            }}
          >
            <FlexWidget
              style={{
                flex: Math.max(1, progressPercent),
                height: 6,
                backgroundColor: WidgetColors.goldPrimary,
                borderRadius: 3,
              }}
            />
            <FlexWidget
              style={{ flex: Math.max(1, 100 - progressPercent), height: 6 }}
            />
          </FlexWidget>
          <TextWidget
            text={`${data.objective.current} / ${data.objective.target} ${data.objective.unit} — ${progressPercent}%`}
            style={{ fontSize: 10, color: WidgetColors.textSecondary, marginTop: 4 }}
          />
        </FlexWidget>
      ) : (
        <FlexWidget style={{ width: 0, height: 0 }} />
      )}
    </FlexWidget>
  );
}
