import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "../lib/theme";

type Props = {
  children: React.ReactNode;
  className?: string;
};

export function SafeScreen({ children, className = "" }: Props) {
  const c = useColors();
  return (
    <SafeAreaView
      edges={["top"]}
      className={`flex-1 ${className}`}
      style={{ backgroundColor: c.background }}
    >
      <View className="flex-1 px-4">{children}</View>
    </SafeAreaView>
  );
}
