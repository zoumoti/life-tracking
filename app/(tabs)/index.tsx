import { View, Text } from "react-native";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#111118" }}>
      <Text style={{ color: "#fff", fontSize: 18 }}>Aujourd'hui</Text>
    </View>
  );
}
