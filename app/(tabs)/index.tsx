import { View, Text } from "react-native";

export default function HomeScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-text text-lg">Aujourd'hui</Text>
      <Text className="text-primary text-sm mt-2">NativeWind works!</Text>
    </View>
  );
}
