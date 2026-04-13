import { View, Pressable } from "react-native";

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
};

export function Card({ children, onPress, className = "" }: Props) {
  const content = (
    <View className={`bg-surface rounded-card p-4 ${className}`}>{children}</View>
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
