import { View, Text, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "../../lib/theme";

const HABIT_ICONS = [
  "sun", "moon", "book", "book-open", "edit-3", "pen-tool",
  "coffee", "droplet", "heart", "activity", "award", "star",
  "target", "trending-up", "zap", "smile", "music", "headphones",
  "camera", "image", "film", "tv", "monitor", "smartphone",
  "clock", "watch", "calendar", "bell", "flag", "map-pin",
  "compass", "navigation", "send", "mail", "message-circle", "phone",
  "users", "user", "home", "briefcase", "shopping-bag", "gift",
  "scissors", "tool", "settings", "shield", "lock", "key",
  "cloud", "umbrella", "wind", "thermometer", "eye", "eye-off",
] as const;

type Props = {
  selected: string;
  onSelect: (icon: string) => void;
};

export function IconPicker({ selected, onSelect }: Props) {
  const c = useColors();

  return (
    <View>
      <Text className="text-sm mb-2" style={{ color: c.textSecondary }}>Icone</Text>
      <View className="flex-row flex-wrap gap-2">
        {HABIT_ICONS.map((icon) => (
            <Pressable
              key={icon}
              onPress={() => onSelect(icon)}
              className="w-10 h-10 rounded-lg items-center justify-center"
              style={{ backgroundColor: selected === icon ? c.primary : c.surfaceLight }}
            >
              <Feather
                name={icon as any}
                size={20}
                color={selected === icon ? c.primaryOnText : c.textSecondary}
              />
            </Pressable>
          ))}
      </View>
    </View>
  );
}
