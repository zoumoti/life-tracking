import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAuthStore } from "../stores/authStore";
import { colors } from "../lib/theme";

export default function RootLayout() {
  const { initialize, loading, session } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {session ? (
          <Stack.Screen name="(tabs)" />
        ) : (
          <Stack.Screen name="(auth)" />
        )}
        <Stack.Screen
          name="habit/[id]"
          options={{ headerShown: true }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
