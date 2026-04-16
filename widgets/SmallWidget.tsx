import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";
import { WidgetColors } from "./shared/widgetStyles";
import type { WidgetData } from "./shared/widgetData";

type Props = { data: WidgetData };

export function SmallWidget({ data }: Props) {
  const completedCount = data.habits.filter((h) => h.completed).length;
  const totalCount = data.habits.length;

  return (
    <FlexWidget
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: WidgetColors.surface,
        borderRadius: 14,
        paddingHorizontal: 20,
        paddingVertical: 14,
        height: "match_parent",
        width: "match_parent",
      }}
      clickAction="OPEN_APP"
    >
      {/* Logo + Title */}
      <FlexWidget style={{ flexDirection: "row", alignItems: "center" }}>
        <FlexWidget
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: WidgetColors.goldPrimary,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TextWidget text="🎯" style={{ fontSize: 16 }} />
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

      {/* Stats — with proper spacing */}
      <FlexWidget style={{ flexDirection: "row", alignItems: "center" }}>
        <FlexWidget style={{ alignItems: "center", paddingHorizontal: 14 }}>
          <TextWidget
            text={`${completedCount}/${totalCount}`}
            style={{ fontSize: 17, fontWeight: "700", color: WidgetColors.goldPrimary }}
          />
          <TextWidget
            text="Habitudes"
            style={{ fontSize: 9, color: WidgetColors.textSecondary, marginTop: 2 }}
          />
        </FlexWidget>

        <FlexWidget style={{ width: 1, height: 28, backgroundColor: WidgetColors.border }} />

        <FlexWidget style={{ alignItems: "center", paddingHorizontal: 14 }}>
          <TextWidget
            text={`${data.stats.todayTaskCount}`}
            style={{ fontSize: 17, fontWeight: "700", color: WidgetColors.textPrimary }}
          />
          <TextWidget
            text="Tâches"
            style={{ fontSize: 9, color: WidgetColors.textSecondary, marginTop: 2 }}
          />
        </FlexWidget>

        <FlexWidget style={{ width: 1, height: 28, backgroundColor: WidgetColors.border }} />

        <FlexWidget style={{ alignItems: "center", paddingHorizontal: 14 }}>
          <TextWidget
            text={`${data.stats.weeklyRunKm}km`}
            style={{ fontSize: 17, fontWeight: "700", color: WidgetColors.textPrimary }}
          />
          <TextWidget
            text="Semaine"
            style={{ fontSize: 9, color: WidgetColors.textSecondary, marginTop: 2 }}
          />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
