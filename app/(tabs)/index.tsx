import { View, Text } from "react-native";
import { SafeScreen } from "../../components/SafeScreen";
import { ProgressCircle } from "../../components/ui/ProgressCircle";

export default function HomeScreen() {
  return (
    <SafeScreen>
      <Text className="text-text-secondary text-sm mt-2">Lundi 14 Avril</Text>
      <Text className="text-text text-2xl font-bold mb-6">Aujourd'hui</Text>

      <View className="items-center mb-6">
        <ProgressCircle progress={0} label="0%" sublabel="Aucune habitude configuree" />
      </View>

      <View className="flex-1 items-center justify-center">
        <Text className="text-text-secondary text-center">
          Configure tes habitudes et objectifs{"\n"}pour commencer a tracker ta vie
        </Text>
      </View>
    </SafeScreen>
  );
}
