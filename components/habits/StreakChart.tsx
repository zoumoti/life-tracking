import { View, Text } from "react-native";
import Svg, { Polyline, Circle, Line } from "react-native-svg";
import { addDays, toDateString } from "../../lib/dateUtils";
import { isHabitScheduledForDate } from "../../lib/habitUtils";
import { colors } from "../../lib/theme";
import type { Tables } from "../../types/database";

type Props = {
  habit: Tables<"habits">;
  completedDates: Set<string>;
  days?: number;
};

export function StreakChart({ habit, completedDates, days = 30 }: Props) {
  const today = toDateString();
  const width = 300;
  const height = 120;
  const padding = { top: 20, right: 10, bottom: 24, left: 10 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Build streak data points
  const points: { x: number; y: number }[] = [];
  let streak = 0;
  let consecutiveMisses = 0;
  let maxStreak = 1;

  for (let i = days - 1; i >= 0; i--) {
    const dateStr = addDays(today, -i);
    if (!isHabitScheduledForDate(habit, dateStr)) {
      points.push({
        x: padding.left + ((days - 1 - i) / (days - 1)) * chartW,
        y: 0, // placeholder, will recalc
      });
      continue;
    }

    if (completedDates.has(dateStr)) {
      streak++;
      consecutiveMisses = 0;
    } else {
      consecutiveMisses++;
      if (consecutiveMisses >= 2) {
        streak = 0;
        consecutiveMisses = 0;
      }
    }

    maxStreak = Math.max(maxStreak, streak);
    points.push({
      x: padding.left + ((days - 1 - i) / (days - 1)) * chartW,
      y: streak,
    });
  }

  // Normalize y values
  const normalizedPoints = points.map((p) => ({
    x: p.x,
    y: padding.top + chartH - (p.y / maxStreak) * chartH,
  }));

  const polylinePoints = normalizedPoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <View>
      <Text className="text-text-secondary text-sm mb-2">Streak (30 jours)</Text>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Baseline */}
        <Line
          x1={padding.left}
          y1={padding.top + chartH}
          x2={padding.left + chartW}
          y2={padding.top + chartH}
          stroke={colors.surface}
          strokeWidth={1}
        />
        {/* Streak line */}
        {normalizedPoints.length > 1 && (
          <Polyline
            points={polylinePoints}
            fill="none"
            stroke={colors.primary}
            strokeWidth={2}
            strokeLinejoin="round"
          />
        )}
        {/* Current point */}
        {normalizedPoints.length > 0 && (
          <Circle
            cx={normalizedPoints[normalizedPoints.length - 1].x}
            cy={normalizedPoints[normalizedPoints.length - 1].y}
            r={4}
            fill={colors.primary}
          />
        )}
      </Svg>
    </View>
  );
}
