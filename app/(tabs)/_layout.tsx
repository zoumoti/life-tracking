import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "../../lib/theme";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const c = useColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textMuted,
        tabBarStyle: {
          backgroundColor: c.background,
          borderTopWidth: 0,
          elevation: 0,
          height: 60 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Aujourd'hui",
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="habits"
        options={{
          title: "Habitudes",
          tabBarIcon: ({ color, size }) => (
            <Feather name="check-circle" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="objectives"
        options={{
          title: "Objectifs",
          tabBarIcon: ({ color, size }) => (
            <Feather name="target" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sport"
        options={{
          title: "Sport",
          tabBarIcon: ({ color, size }) => (
            <Feather name="activity" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: "Finance",
          tabBarIcon: ({ color, size }) => (
            <Feather name="dollar-sign" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Taches",
          tabBarIcon: ({ color, size }) => (
            <Feather name="check-square" size={size} color={color} />
          ),
        }}
      />
      {/* Hide sub-routes from tab bar */}
      <Tabs.Screen name="sport/index" options={{ href: null }} />
      <Tabs.Screen name="sport/exercises" options={{ href: null }} />
      <Tabs.Screen name="sport/programs" options={{ href: null }} />
      <Tabs.Screen name="sport/program-detail" options={{ href: null }} />
      <Tabs.Screen name="sport/active-workout" options={{ href: null }} />
      <Tabs.Screen name="sport/workout-history" options={{ href: null }} />
      <Tabs.Screen name="sport/workout-detail" options={{ href: null }} />
      <Tabs.Screen name="sport/running" options={{ href: null }} />
      <Tabs.Screen name="sport/add-run" options={{ href: null }} />
      <Tabs.Screen name="sport/_layout" options={{ href: null }} />
      <Tabs.Screen name="finance/index" options={{ href: null }} />
      <Tabs.Screen name="finance/_layout" options={{ href: null }} />
      <Tabs.Screen name="tasks/index" options={{ href: null }} />
      <Tabs.Screen name="tasks/_layout" options={{ href: null }} />
    </Tabs>
  );
}
