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
        marginRight: 12,
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
        paddingVertical: 6,
        marginBottom: 3,
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

  const totalBalanceStr = `${Math.round(data.stats.totalBalance)}€`;
  const revenueStr = `+${Math.round(data.stats.monthlyRevenue)}€`;
  const expensesStr = `-${Math.round(data.stats.monthlyExpenses)}€`;

  return (
    <FlexWidget
      style={{
        flexDirection: "column",
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
          marginBottom: 10,
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
          style={{ fontSize: 11, color: WidgetColors.textSecondary }}
        />
      </FlexWidget>

      {/* Habits section */}
      <FlexWidget style={{ marginBottom: 14 }}>
        <TextWidget
          text={`HABITUDES  ${completedCount}/${totalCount}`}
          style={{
            fontSize: 10,
            fontWeight: "600",
            color: WidgetColors.goldPrimary,
            marginBottom: 6,
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
        style={{ marginBottom: 14 }}
        clickAction="OPEN_APP"
        clickActionData={{ tab: "tasks" }}
      >
        <TextWidget
          text="TÂCHES DU JOUR"
          style={{
            fontSize: 10,
            fontWeight: "600",
            color: WidgetColors.goldDark,
            marginBottom: 6,
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

      {/* Sport row — full width cards */}
      <FlexWidget
        style={{
          flexDirection: "row",
          marginBottom: 6,
          width: "match_parent",
        }}
      >
        <FlexWidget
          style={{
            flex: 1,
            backgroundColor: WidgetColors.background,
            borderRadius: 10,
            paddingVertical: 10,
            paddingHorizontal: 12,
            marginRight: 4,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TextWidget text="🏃" style={{ fontSize: 16, marginRight: 8 }} />
          <FlexWidget>
            <TextWidget
              text={`${data.stats.weeklyRunKm} km`}
              style={{ fontSize: 16, fontWeight: "700", color: WidgetColors.textPrimary }}
            />
            <TextWidget
              text="cette semaine"
              style={{ fontSize: 9, color: WidgetColors.textSecondary, marginTop: 1 }}
            />
          </FlexWidget>
        </FlexWidget>

        <FlexWidget
          style={{
            flex: 1,
            backgroundColor: WidgetColors.background,
            borderRadius: 10,
            paddingVertical: 10,
            paddingHorizontal: 12,
            marginLeft: 4,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TextWidget text="💪" style={{ fontSize: 16, marginRight: 8 }} />
          <FlexWidget>
            <TextWidget
              text={`${data.stats.weeklyWorkoutCount} séance${data.stats.weeklyWorkoutCount !== 1 ? "s" : ""}`}
              style={{ fontSize: 16, fontWeight: "700", color: WidgetColors.textPrimary }}
            />
            <TextWidget
              text="cette semaine"
              style={{ fontSize: 9, color: WidgetColors.textSecondary, marginTop: 1 }}
            />
          </FlexWidget>
        </FlexWidget>
      </FlexWidget>

      {/* Finance row — balance prominent + revenue/expenses */}
      <FlexWidget
        style={{
          flexDirection: "row",
          width: "match_parent",
        }}
      >
        {/* Solde total */}
        <FlexWidget
          style={{
            flex: 1,
            backgroundColor: WidgetColors.background,
            borderRadius: 10,
            paddingVertical: 10,
            paddingHorizontal: 10,
            marginRight: 4,
            alignItems: "center",
          }}
        >
          <TextWidget
            text={totalBalanceStr}
            style={{ fontSize: 18, fontWeight: "700", color: WidgetColors.goldDark }}
          />
          <TextWidget
            text="SOLDE"
            style={{ fontSize: 9, color: WidgetColors.textSecondary, marginTop: 2 }}
          />
        </FlexWidget>

        {/* Revenus */}
        <FlexWidget
          style={{
            flex: 1,
            backgroundColor: WidgetColors.background,
            borderRadius: 10,
            paddingVertical: 10,
            paddingHorizontal: 10,
            marginHorizontal: 4,
            alignItems: "center",
          }}
        >
          <TextWidget
            text={revenueStr}
            style={{ fontSize: 16, fontWeight: "700", color: WidgetColors.success }}
          />
          <TextWidget
            text="REVENUS"
            style={{ fontSize: 9, color: WidgetColors.textSecondary, marginTop: 2 }}
          />
        </FlexWidget>

        {/* Dépenses */}
        <FlexWidget
          style={{
            flex: 1,
            backgroundColor: WidgetColors.background,
            borderRadius: 10,
            paddingVertical: 10,
            paddingHorizontal: 10,
            marginLeft: 4,
            alignItems: "center",
          }}
        >
          <TextWidget
            text={expensesStr}
            style={{ fontSize: 16, fontWeight: "700", color: WidgetColors.danger }}
          />
          <TextWidget
            text="DÉPENSES"
            style={{ fontSize: 9, color: WidgetColors.textSecondary, marginTop: 2 }}
          />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
