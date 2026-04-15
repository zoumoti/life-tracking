import { Modal, View, Text, Pressable } from "react-native";
import { useColors } from "../../lib/theme";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  visible,
  title,
  message,
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
  destructive = true,
  onConfirm,
  onCancel,
}: Props) {
  const c = useColors();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        className="flex-1 bg-black/60 items-center justify-center px-8"
        onPress={onCancel}
      >
        <Pressable className="w-full rounded-card p-6" style={{ backgroundColor: c.surface }} onPress={() => {}}>
          <Text className="text-lg font-bold mb-2" style={{ color: c.text }}>{title}</Text>
          <Text className="text-sm mb-6" style={{ color: c.textSecondary }}>{message}</Text>

          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 py-3 rounded-button items-center active:opacity-80"
              style={{ backgroundColor: c.surfaceLight }}
              onPress={onCancel}
            >
              <Text className="font-semibold" style={{ color: c.text }}>{cancelLabel}</Text>
            </Pressable>

            <Pressable
              className="flex-1 py-3 rounded-button items-center active:opacity-80"
              style={{ backgroundColor: destructive ? c.danger : c.primary }}
              onPress={onConfirm}
            >
              <Text className="font-semibold" style={{ color: destructive ? "#ffffff" : c.primaryOnText }}>
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
