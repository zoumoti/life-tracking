import { Pressable, Text, ActivityIndicator } from "react-native";
import { useColors } from "../../lib/theme";

type ButtonVariant = "primary" | "secondary" | "destructive";

type Props = {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

export function Button({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  className = "",
}: Props) {
  const c = useColors();

  const styles = {
    primary: { bg: c.primary, text: c.primaryOnText },
    secondary: { bg: c.surface, text: c.primary },
    destructive: { bg: c.danger, text: "#ffffff" },
  }[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={`py-3 px-6 rounded-button items-center justify-center ${
        disabled ? "opacity-50" : "active:opacity-80"
      } ${className}`}
      style={{ backgroundColor: styles.bg }}
    >
      {loading ? (
        <ActivityIndicator color={styles.text} size="small" />
      ) : (
        <Text className="text-base font-semibold" style={{ color: styles.text }}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
