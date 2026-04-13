import { View, Text } from "react-native";
import Svg, { Line, Polyline, Circle, Rect } from "react-native-svg";
import { colors } from "../../lib/theme";
import type { Tables } from "../../types/database";

type Props = {
  objective: Tables<"objectives">;
  updates: Tables<"objective_updates">[];
  width?: number;
  height?: number;
};

export function ProgressChart({
  objective,
  updates,
  width = 320,
  height = 180,
}: Props) {
  const padding = { top: 16, right: 16, bottom: 24, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const startDate = new Date(objective.created_at).getTime();
  const endDate = objective.deadline
    ? new Date(objective.deadline).getTime()
    : Date.now() + 30 * 24 * 60 * 60 * 1000;
  const totalDuration = endDate - startDate;

  const startValue = 0;
  const targetValue = objective.target_value ?? objective.current_value;
  const valueRange = targetValue - startValue || 1;

  // Build data points from updates (add start point)
  const dataPoints: { time: number; value: number }[] = [
    { time: startDate, value: startValue },
  ];
  let runningValue = startValue;
  for (const u of updates) {
    runningValue = u.new_value;
    dataPoints.push({ time: new Date(u.created_at).getTime(), value: runningValue });
  }
  // Add current state if no recent update
  if (dataPoints.length === 1 || dataPoints[dataPoints.length - 1].value !== objective.current_value) {
    dataPoints.push({ time: Date.now(), value: objective.current_value });
  }

  const toX = (time: number) =>
    padding.left + ((time - startDate) / totalDuration) * chartW;
  const toY = (value: number) =>
    padding.top + chartH - ((value - startValue) / valueRange) * chartH;

  // Real curve polyline points
  const realPoints = dataPoints
    .map((p) => `${toX(p.time)},${toY(p.value)}`)
    .join(" ");

  // Ideal line: start → target
  const idealStartX = padding.left;
  const idealStartY = toY(startValue);
  const idealEndX = padding.left + chartW;
  const idealEndY = toY(targetValue);

  // Y axis labels
  const yLabels = [startValue, Math.round(targetValue / 2), targetValue];

  return (
    <View>
      <Svg width={width} height={height}>
        {/* Background grid */}
        <Rect
          x={padding.left}
          y={padding.top}
          width={chartW}
          height={chartH}
          fill={colors.surface}
          rx={8}
        />

        {/* Y axis labels */}
        {yLabels.map((val) => (
          <Line
            key={val}
            x1={padding.left}
            y1={toY(val)}
            x2={padding.left + chartW}
            y2={toY(val)}
            stroke={colors.surfaceLight}
            strokeWidth={1}
            strokeDasharray="4,4"
          />
        ))}

        {/* Ideal line (dashed) */}
        <Line
          x1={idealStartX}
          y1={idealStartY}
          x2={idealEndX}
          y2={idealEndY}
          stroke={colors.textMuted}
          strokeWidth={1.5}
          strokeDasharray="6,4"
        />

        {/* Real curve */}
        <Polyline
          points={realPoints}
          fill="none"
          stroke={colors.primary}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Data points */}
        {dataPoints.map((p, i) => (
          <Circle
            key={i}
            cx={toX(p.time)}
            cy={toY(p.value)}
            r={3.5}
            fill={colors.primary}
          />
        ))}
      </Svg>

      {/* Legend */}
      <View className="flex-row items-center gap-4 mt-2 px-2">
        <View className="flex-row items-center gap-1">
          <View style={{ width: 12, height: 3, backgroundColor: colors.primary, borderRadius: 2 }} />
          <Text className="text-text-muted text-xs">Reel</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View style={{ width: 12, height: 1, backgroundColor: colors.textMuted, borderRadius: 1 }} />
          <Text className="text-text-muted text-xs">Ideal</Text>
        </View>
      </View>
    </View>
  );
}
