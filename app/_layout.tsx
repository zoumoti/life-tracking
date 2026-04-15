import "../global.css";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { Stack, Redirect, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useAuthStore } from "../stores/authStore";
import { useColors } from "../lib/theme";
import { useThemeStore } from "../stores/themeStore";

export default function RootLayout() {
  const { initialize, loading, session } = useAuthStore();
  const c = useColors();
  const mode = useThemeStore((s) => s.mode);
  const segments = useSegments();

  useEffect(() => {
    initialize();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  // Auth guard: redirect based on session state
  const inAuthGroup = segments[0] === "(auth)";

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <StatusBar style={mode === "dark" ? "light" : "dark"} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: c.background },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen
            name="habit/[id]"
            options={{ headerShown: true }}
          />
        </Stack>
        {/* Redirect after Stack is rendered */}
        {!session && !inAuthGroup && <Redirect href="/(auth)/login" />}
        {session && inAuthGroup && <Redirect href="/(tabs)" />}
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
