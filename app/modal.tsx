import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { View, Text } from 'react-native';

export default function ModalScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-text text-xl font-bold">Modal</Text>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}
