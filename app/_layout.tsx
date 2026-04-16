import "../global.css";
import { useEffect } from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import { Stack, Redirect, useSegments, useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useAuthStore } from "../stores/authStore";
import { useColors } from "../lib/theme";
import { useThemeStore } from "../stores/themeStore";
import { useHabitStore } from "../stores/habitStore";
import { useTaskStore } from "../stores/taskStore";

/** Simple debounce — returns a debounced version of fn */
function debounce(fn: () => void, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(fn, ms);
  };
}

export default function RootLayout() {
  const { initialize, loading, session } = useAuthStore();
  const c = useColors();
  const mode = useThemeStore((s) => s.mode);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, []);

  // Widget sync: debounced, only on Android
  useEffect(() => {
    if (Platform.OS !== "android" || !session) return;

    const loadSync = async () => {
      const { syncWidgetData } = await import("../widgets/shared/widgetSync");

      syncWidgetData();

      // Debounce: wait 2s after last store change before syncing
      const debouncedSync = debounce(syncWidgetData, 2000);
      const unsubHabits = useHabitStore.subscribe(debouncedSync);
      const unsubTasks = useTaskStore.subscribe(debouncedSync);

      return () => {
        unsubHabits();
        unsubTasks();
      };
    };

    let cleanup: (() => void) | undefined;
    loadSync().then((fn) => { cleanup = fn; });

    return () => { cleanup?.(); };
  }, [session]);

  // Habit reminder notifications: debounced re-schedule
  useEffect(() => {
    if (!session) return;

    const loadNotif = async () => {
      const { scheduleHabitNotifications } = await import("../lib/habitNotifications");

      scheduleHabitNotifications();

      // Debounce: wait 3s after last habit change before re-scheduling
      const debouncedSchedule = debounce(scheduleHabitNotifications, 3000);
      const unsub = useHabitStore.subscribe(debouncedSchedule);
      return () => unsub();
    };

    let cleanup: (() => void) | undefined;
    loadNotif().then((fn) => { cleanup = fn; });

    return () => { cleanup?.(); };
  }, [session]);

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const url = response.notification.request.content.data?.url;
      if (url) {
        router.push(url as any);
      }
    });
    return () => subscription.remove();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: c.background, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

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
          <Stack.Screen
            name="habit/edit"
            options={{ headerShown: true }}
          />
        </Stack>
        {!session && !inAuthGroup && <Redirect href="/(auth)/login" />}
        {session && inAuthGroup && <Redirect href="/(tabs)" />}
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
