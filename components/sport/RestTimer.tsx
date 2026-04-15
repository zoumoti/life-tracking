import { View, Text, Pressable } from "react-native";
import { useEffect, useState, useRef } from "react";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { formatDuration } from "../../lib/formatters";
import { useColors } from "../../lib/theme";

type Props = {
  startTime: number;
  onSkip: () => void;
};

const VIBRATION_THRESHOLDS = [60, 90, 120];

export function RestTimer({ startTime, onSkip }: Props) {
  const c = useColors();
  const [elapsed, setElapsed] = useState(0);
  const vibratedAt = useRef<Set<number>>(new Set());

  useEffect(() => {
    vibratedAt.current = new Set();
    const interval = setInterval(() => {
      const ms = Date.now() - startTime;
      setElapsed(ms);

      const seconds = Math.floor(ms / 1000);
      for (const threshold of VIBRATION_THRESHOLDS) {
        if (seconds >= threshold && !vibratedAt.current.has(threshold)) {
          vibratedAt.current.add(threshold);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <View className="flex-row items-center justify-between px-4 py-3 rounded-card my-2" style={{ backgroundColor: c.primary + "33" }}>
      <View className="flex-row items-center">
        <Feather name="clock" size={16} color={c.primary} />
        <Text className="font-bold text-base ml-2" style={{ color: c.primary }}>
          Repos : {formatDuration(elapsed)}
        </Text>
      </View>
      <Pressable onPress={onSkip} className="px-4 py-2 rounded-button active:opacity-80" style={{ backgroundColor: c.surface }}>
        <Text className="text-sm font-semibold" style={{ color: c.text }}>Skip</Text>
      </Pressable>
    </View>
  );
}
