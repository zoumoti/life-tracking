import { Stack } from "expo-router";
import { useColors } from "../../../lib/theme";

export default function TasksLayout() {
  const c = useColors();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: c.background },
        animation: "slide_from_right",
      }}
    />
  );
}
