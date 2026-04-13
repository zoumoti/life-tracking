import { forwardRef, useCallback, useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import GorhomBottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { colors } from "../../lib/theme";

type Props = {
  title?: string;
  children: React.ReactNode;
  snapPoints?: string[];
  onClose?: () => void;
};

export const BottomSheet = forwardRef<GorhomBottomSheet, Props>(
  ({ title, children, snapPoints: customSnapPoints, onClose }, ref) => {
    const snapPoints = useMemo(() => customSnapPoints ?? ["50%", "80%"], [customSnapPoints]);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />
      ),
      []
    );

    return (
      <GorhomBottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onClose}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.surface }}
        handleIndicatorStyle={{ backgroundColor: colors.textMuted }}
      >
        <BottomSheetView className="flex-1 px-4 pb-4">
          {title && <Text className="text-text text-lg font-bold mb-4">{title}</Text>}
          {children}
        </BottomSheetView>
      </GorhomBottomSheet>
    );
  }
);

BottomSheet.displayName = "BottomSheet";
