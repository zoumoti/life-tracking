import { forwardRef, useState, useEffect } from "react";
import { View, Text, TextInput, Pressable, ScrollView } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheet } from "../ui/BottomSheet";
import { Button } from "../ui/Button";
import { useColors } from "../../lib/theme";
import type { Account, AccountInput } from "../../types/finance";

type Props = {
  editingAccount?: Account | null;
  onSave: (input: AccountInput) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
};

const EMOJI_GRID = [
  "\uD83C\uDFE6", "\uD83D\uDCB3", "\uD83D\uDCB0", "\uD83D\uDCB5", "\uD83D\uDCB4", "\uD83E\uDE99",
  "\uD83C\uDFE0", "\uD83D\uDE97", "\uD83C\uDF34", "\u2708\uFE0F", "\uD83C\uDF93", "\uD83D\uDCBC",
  "\uD83D\uDED2", "\uD83C\uDF81", "\u2764\uFE0F", "\uD83C\uDFAF", "\uD83D\uDCCA", "\uD83D\uDD12",
  "\uD83D\uDC8E", "\uD83D\uDCF1", "\u26BD", "\uD83C\uDFAE", "\uD83C\uDF55", "\uD83C\uDF1F",
];

const COLOR_OPTIONS = [
  "#D4AA40", "#ef4444", "#f59e0b", "#22c55e", "#3b82f6", "#8b5cf6",
  "#ec4899", "#06b6d4", "#14b8a6", "#f97316", "#6366f1", "#a855f7",
];

export const FinanceAccountForm = forwardRef<BottomSheetModal, Props>(
  ({ editingAccount, onSave, onDelete, onClose }, ref) => {
    const c = useColors();

    const [name, setName] = useState("");
    const [icon, setIcon] = useState("\uD83C\uDFE6");
    const [color, setColor] = useState("#D4AA40");
    const [balance, setBalance] = useState("");

    useEffect(() => {
      if (editingAccount) {
        setName(editingAccount.name);
        setIcon(editingAccount.icon);
        setColor(editingAccount.color);
        setBalance(String(editingAccount.balance));
      } else {
        setName("");
        setIcon("\uD83C\uDFE6");
        setColor("#D4AA40");
        setBalance("");
      }
    }, [editingAccount]);

    const canSave = name.trim().length > 0;

    const handleSave = () => {
      onSave({
        name: name.trim(),
        icon,
        color,
        balance: Number(balance) || 0,
      });
    };

    return (
      <BottomSheet
        ref={ref}
        title={editingAccount ? "Modifier le compte" : "Nouveau compte"}
        snapPoints={["80%"]}
        onClose={onClose}
      >
        {/* Name */}
        <Text className="text-xs font-semibold mb-1.5" style={{ color: c.textSecondary }}>Nom</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Mon compte..."
          placeholderTextColor={c.textMuted}
          className="rounded-xl px-4 py-3 text-base mb-4"
          style={{ backgroundColor: c.surfaceLight, color: c.text }}
        />

        {/* Icon picker */}
        <Text className="text-xs font-semibold mb-1.5" style={{ color: c.textSecondary }}>Icone</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {EMOJI_GRID.map((emoji) => (
            <Pressable
              key={emoji}
              onPress={() => setIcon(emoji)}
              className="w-11 h-11 rounded-xl items-center justify-center"
              style={{
                backgroundColor: icon === emoji ? c.primary + "22" : c.surfaceLight,
                borderWidth: icon === emoji ? 1.5 : 0,
                borderColor: c.primary,
              }}
            >
              <Text className="text-xl">{emoji}</Text>
            </Pressable>
          ))}
        </View>

        {/* Color picker */}
        <Text className="text-xs font-semibold mb-1.5" style={{ color: c.textSecondary }}>Couleur</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }} className="mb-4">
          {COLOR_OPTIONS.map((col) => (
            <Pressable
              key={col}
              onPress={() => setColor(col)}
              className="w-9 h-9 rounded-full items-center justify-center"
              style={{
                backgroundColor: col,
                borderWidth: color === col ? 3 : 0,
                borderColor: "#ffffff",
              }}
            />
          ))}
        </ScrollView>

        {/* Balance */}
        <Text className="text-xs font-semibold mb-1.5" style={{ color: c.textSecondary }}>Solde initial</Text>
        <TextInput
          value={balance}
          onChangeText={setBalance}
          placeholder="0.00"
          placeholderTextColor={c.textMuted}
          keyboardType="decimal-pad"
          className="rounded-xl px-4 py-3 text-base mb-6"
          style={{ backgroundColor: c.surfaceLight, color: c.text }}
        />

        {/* Actions */}
        <View className="flex-row gap-3">
          {editingAccount && onDelete && (
            <Button
              title="Supprimer"
              variant="destructive"
              onPress={() => onDelete(editingAccount.id)}
              className="flex-1"
            />
          )}
          <Button
            title="Annuler"
            variant="secondary"
            onPress={onClose}
            className="flex-1"
          />
          <Button
            title="Enregistrer"
            onPress={handleSave}
            disabled={!canSave}
            className="flex-1"
          />
        </View>
      </BottomSheet>
    );
  }
);

FinanceAccountForm.displayName = "FinanceAccountForm";
