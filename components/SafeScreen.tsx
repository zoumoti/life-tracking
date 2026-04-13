import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function SafeScreen({ children, className = "" }: Props) {
  return (
    <SafeAreaView className={`flex-1 bg-background ${className}`}>
      <View className="flex-1 px-4">{children}</View>
    </SafeAreaView>
  );
}
