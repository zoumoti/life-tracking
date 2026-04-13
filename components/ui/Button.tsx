import { Pressable, Text, ActivityIndicator } from "react-native";

type ButtonVariant = "primary" | "secondary" | "destructive";

type Props = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

const variantStyles: Record<ButtonVariant, { container: string; text: string }> = {
  primary: {
    container: "bg-primary",
    text: "text-white",
  },
  secondary: {
    container: "bg-surface",
    text: "text-primary",
  },
  destructive: {
    container: "bg-danger",
    text: "text-white",
  },
};

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  className = "",
}: Props) {
  const styles = variantStyles[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`py-3 px-6 rounded-button items-center justify-center ${styles.container} ${
        disabled ? "opacity-50" : "active:opacity-80"
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <Text className={`text-base font-semibold ${styles.text}`}>{title}</Text>
      )}
    </Pressable>
  );
}
