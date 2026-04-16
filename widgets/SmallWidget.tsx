// widgets/SmallWidget.tsx
import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";
import { WidgetColors, WidgetRadius, WidgetFontSize, WidgetSpacing } from "./shared/widgetStyles";
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
        borderRadius: WidgetRadius.card,
        paddingHorizontal: WidgetSpacing.lg,
        paddingVertical: WidgetSpacing.md,
        height: "match_parent",
        width: "match_parent",
      }}
      clickAction="OPEN_APP"
    >
      <FlexWidget style={{ flexDirection: "row", alignItems: "center" }}>
        <FlexWidget
          style={{
            width: 28, height: 28, borderRadius: WidgetRadius.icon,
            backgroundColor: WidgetColors.goldPrimary,
            justifyContent: "center", alignItems: "center",
          }}
        >
          <TextWidget text="🎯" style={{ fontSize: 14 }} />
        </FlexWidget>
        <TextWidget text="Life OS" style={{ fontSize: WidgetFontSize.md, color: WidgetColors.textPrimary, marginLeft: WidgetSpacing.sm }} />
      </FlexWidget>

      <FlexWidget style={{ flexDirection: "row", alignItems: "center" }}>
        <FlexWidget style={{ alignItems: "center" }}>
          <TextWidget text={`${completedCount}/${totalCount}`} style={{ fontSize: WidgetFontSize.lg, color: WidgetColors.goldPrimary }} />
          <TextWidget text="Habitudes" style={{ fontSize: WidgetFontSize.xs, color: WidgetColors.textSecondary }} />
        </FlexWidget>
        <FlexWidget style={{ width: 1, height: 24, backgroundColor: WidgetColors.border, marginHorizontal: WidgetSpacing.md }} />
        <FlexWidget style={{ alignItems: "center" }}>
          <TextWidget text={`${data.stats.todayTaskCount}`} style={{ fontSize: WidgetFontSize.lg, color: WidgetColors.textPrimary }} />
          <TextWidget text="Tâches" style={{ fontSize: WidgetFontSize.xs, color: WidgetColors.textSecondary }} />
        </FlexWidget>
        <FlexWidget style={{ width: 1, height: 24, backgroundColor: WidgetColors.border, marginHorizontal: WidgetSpacing.md }} />
        <FlexWidget style={{ alignItems: "center" }}>
          <TextWidget text={`${data.stats.weeklyRunKm}km`} style={{ fontSize: WidgetFontSize.lg, color: WidgetColors.textPrimary }} />
          <TextWidget text="Semaine" style={{ fontSize: WidgetFontSize.xs, color: WidgetColors.textSecondary }} />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
