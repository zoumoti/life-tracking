import { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import * as Haptics from "expo-haptics";
import { ProgressCircle } from "../ui/ProgressCircle";
import { useColors } from "../../lib/theme";

type Props = {
  completed: number;
  total: number;
  allDone: boolean;
};

function getMotivationalLabel(pct: number): string {
  if (pct === 0) return "C'est parti ! 💪";
  if (pct <= 25) return "Bon début !";
  if (pct <= 50) return "Continue comme ça 🔥";
  if (pct <= 75) return "Plus que quelques-unes !";
  if (pct < 100) return "Presque parfait ! 🎯";
  return "Journée parfaite ! 🏆";
}

export function HomeDayProgress({ completed, total, allDone }: Props) {
  const c = useColors();
  const progress = total === 0 ? 0 : completed / total;
  const pct = Math.round(progress * 100);

  const prevCompletedRef = useRef(completed);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const justCompleted =
      allDone && prevCompletedRef.current < total && completed === total;

    if (justCompleted) {
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Scale + glow animation
      Animated.parallel([
        Animated.sequence([
          Animated.spring(scaleAnim, {
            toValue: 1.12,
            useNativeDriver: true,
            speed: 14,
            bounciness: 12,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1.05,
            useNativeDriver: true,
            speed: 14,
            bounciness: 8,
          }),
        ]),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: false,
        }),
      ]).start();
    } else if (!allDone) {
      // Reset when no longer all done
      scaleAnim.setValue(1);
      glowAnim.setValue(0);
    }

    prevCompletedRef.current = completed;
  }, [completed, total, allDone]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.35],
  });

  return (
    <View className="items-center mb-6">
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {allDone && (
          <Animated.View
            style={{
              position: "absolute",
              top: -4,
              left: -4,
              right: -4,
              bottom: -4,
              borderRadius: 9999,
              borderWidth: 2,
              borderColor: c.primary,
              opacity: glowOpacity,
            }}
          />
        )}
        <ProgressCircle
          progress={progress}
          size={120}
          label={`${pct}%`}
          sublabel={`${completed}/${total} habitudes`}
        />
      </Animated.View>

      <Text
        className="text-sm mt-3 font-semibold"
        style={{ color: pct === 100 ? c.primary : c.textSecondary }}
      >
        {getMotivationalLabel(pct)}
      </Text>
    </View>
  );
}
