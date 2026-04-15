import { View, Pressable } from "react-native";
import { useColors } from "../../lib/theme";

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
};

export function Card({ children, onPress, className = "" }: Props) {
  const c = useColors();
  const content = (
    <View
      className={`rounded-card p-4 ${className}`}
      style={{ backgroundColor: c.surface }}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} className="active:opacity-80">
        {content}
      </Pressable>
    );
  }

  return content;
}
