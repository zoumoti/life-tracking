import { View, Text } from "react-native";
import { SafeScreen } from "../../components/SafeScreen";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ProgressCircle } from "../../components/ui/ProgressCircle";

export default function HomeScreen() {
  return (
    <SafeScreen>
      <Text className="text-text text-2xl font-bold mt-4 mb-6">Aujourd'hui</Text>

      <View className="items-center mb-6">
        <ProgressCircle progress={0.67} label="67%" sublabel="6 sur 9 habitudes" />
      </View>

      <Card className="mb-3">
        <Text className="text-text font-semibold">Meditation</Text>
        <Text className="text-text-secondary text-sm">Streak: 14 jours</Text>
      </Card>

      <Card className="mb-3">
        <Text className="text-text font-semibold">Lecture 30 min</Text>
        <Text className="text-text-secondary text-sm">Streak: 7 jours</Text>
      </Card>

      <Button title="Demarrer la seance" onPress={() => {}} className="mt-4" />
    </SafeScreen>
  );
}
