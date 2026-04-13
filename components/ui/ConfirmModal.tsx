import { Modal, View, Text, Pressable } from "react-native";

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
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        className="flex-1 bg-black/60 items-center justify-center px-8"
        onPress={onCancel}
      >
        <Pressable className="bg-surface w-full rounded-card p-6" onPress={() => {}}>
          <Text className="text-text text-lg font-bold mb-2">{title}</Text>
          <Text className="text-text-secondary text-sm mb-6">{message}</Text>

          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 bg-surface-light py-3 rounded-button items-center active:opacity-80"
              onPress={onCancel}
            >
              <Text className="text-text font-semibold">{cancelLabel}</Text>
            </Pressable>

            <Pressable
              className={`flex-1 py-3 rounded-button items-center active:opacity-80 ${
                destructive ? "bg-danger" : "bg-primary"
              }`}
              onPress={onConfirm}
            >
              <Text className="text-white font-semibold">{confirmLabel}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
