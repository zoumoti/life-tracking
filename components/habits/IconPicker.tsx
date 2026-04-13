import { View, Text, Pressable, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../lib/theme";

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
  return (
    <View>
      <Text className="text-text-secondary text-sm mb-2">Icone</Text>
      <ScrollView
        horizontal={false}
        className="max-h-40"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row flex-wrap gap-2">
          {HABIT_ICONS.map((icon) => (
            <Pressable
              key={icon}
              onPress={() => onSelect(icon)}
              className={`w-10 h-10 rounded-lg items-center justify-center ${
                selected === icon ? "bg-primary" : "bg-surface-light"
              }`}
            >
              <Feather
                name={icon as any}
                size={20}
                color={selected === icon ? "#fff" : colors.textSecondary}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
