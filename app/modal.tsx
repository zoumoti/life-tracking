import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { View, Text } from 'react-native';
import { useColors } from '../lib/theme';

export default function ModalScreen() {
  const c = useColors();
  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: c.background }}>
      <Text className="text-xl font-bold" style={{ color: c.text }}>Modal</Text>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}
