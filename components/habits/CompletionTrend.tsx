import { useMemo } from "react";
import { View, Text } from "react-native";
import Svg, { Rect, Text as SvgText, Line, G } from "react-native-svg";
import { toDateString, parseDate, isoDayOfWeek, addDays } from "../../lib/dateUtils";
import { isHabitScheduledForDate } from "../../lib/habitUtils";
import { useColors } from "../../lib/theme";
import type { Tables } from "../../types/database";

type Props = {
  habit: Tables<"habits">;
  completedDates: Set<string>;
};

const MONTH_SHORT = ["Jan", "Fev", "Mar", "Avr", "Mai", "Juin", "Juil", "Aout", "Sep", "Oct", "Nov", "Dec"];

type WeekData = {
  rate: number;
  label: string;
  scheduled: number;
};

function computeWeeklyData(habit: Tables<"habits">, completedDates: Set<string>): WeekData[] {
  const today = toDateString();
  const todayDate = parseDate(today);
  // Find start of current week (Monday)
  const todayDow = isoDayOfWeek(todayDate);
  const currentMonday = addDays(today, -todayDow);

  const weeks: WeekData[] = [];

  for (let w = 11; w >= 0; w--) {
    const mondayStr = addDays(currentMonday, -w * 7);
    let scheduled = 0;
    let completed = 0;

    for (let d = 0; d < 7; d++) {
      const dateStr = addDays(mondayStr, d);
      // Don't count future days
      if (dateStr > today) break;
      // Don't count days before habit creation
      if (dateStr < habit.created_at.slice(0, 10)) continue;
      if (!isHabitScheduledForDate(habit, dateStr)) continue;
      scheduled++;
      if (completedDates.has(dateStr)) completed++;
    }

    // Determine label: use month name if this week contains a month boundary or is first week
    const mondayDate = parseDate(mondayStr);
    const sundayStr = addDays(mondayStr, 6);
    const sundayDate = parseDate(sundayStr);
    let label: string;
    if (w === 11 || mondayDate.getMonth() !== parseDate(addDays(mondayStr, -1)).getMonth()) {
      // First week or week starts in a new month
      label = MONTH_SHORT[mondayDate.getMonth()];
    } else if (mondayDate.getMonth() !== sundayDate.getMonth()) {
      // Week crosses month boundary - label with new month
      label = MONTH_SHORT[sundayDate.getMonth()];
    } else {
      label = `S${12 - w}`;
    }

    weeks.push({
      rate: scheduled === 0 ? 0 : completed / scheduled,
      label,
      scheduled,
    });
  }

  return weeks;
}

export function CompletionTrend({ habit, completedDates }: Props) {
  const c = useColors();

  const weeks = useMemo(
    () => computeWeeklyData(habit, completedDates),
    [habit, completedDates]
  );

  // Trend: compare first 4 weeks avg vs last 4 weeks avg
  const first4 = weeks.slice(0, 4);
  const last4 = weeks.slice(-4);
  const avgFirst = first4.reduce((s, w) => s + w.rate, 0) / (first4.length || 1);
  const avgLast = last4.reduce((s, w) => s + w.rate, 0) / (last4.length || 1);
  const improving = avgLast > avgFirst;
  const declining = avgLast < avgFirst;

  // Chart dimensions
  const width = 300;
  const height = 160;
  const padding = { top: 20, right: 8, bottom: 28, left: 8 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const barGap = 4;
  const barWidth = (chartW - barGap * (weeks.length - 1)) / weeks.length;

  return (
    <View>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-bold text-base" style={{ color: c.text }}>
          Tendance (12 semaines)
        </Text>
        {(improving || declining) && (
          <Text className="text-xs" style={{ color: improving ? c.success : c.warning }}>
            {improving ? "\u{1F4C8} En progression" : "\u{1F4C9} En baisse"}
          </Text>
        )}
      </View>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Baseline */}
        <Line
          x1={padding.left}
          y1={padding.top + chartH}
          x2={padding.left + chartW}
          y2={padding.top + chartH}
          stroke={c.surfaceLight}
          strokeWidth={1}
        />
        {/* 50% guideline */}
        <Line
          x1={padding.left}
          y1={padding.top + chartH * 0.5}
          x2={padding.left + chartW}
          y2={padding.top + chartH * 0.5}
          stroke={c.surfaceLight}
          strokeWidth={0.5}
          strokeDasharray="4,4"
        />
        {/* Bars */}
        {weeks.map((week, i) => {
          const barH = week.rate * chartH;
          const x = padding.left + i * (barWidth + barGap);
          const y = padding.top + chartH - barH;
          const pct = Math.round(week.rate * 100);

          return (
            <G key={i}>
              {/* Bar */}
              {barH > 0 && (
                <Rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  rx={2}
                  fill={c.primary}
                  opacity={week.scheduled === 0 ? 0.3 : 0.85}
                />
              )}
              {/* Percentage label on top */}
              {week.scheduled > 0 && (
                <SvgText
                  x={x + barWidth / 2}
                  y={y - 4}
                  fontSize={8}
                  fill={c.textSecondary}
                  textAnchor="middle"
                >
                  {pct}%
                </SvgText>
              )}
              {/* X-axis label */}
              <SvgText
                x={x + barWidth / 2}
                y={padding.top + chartH + 14}
                fontSize={8}
                fill={c.textMuted}
                textAnchor="middle"
              >
                {week.label}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}
