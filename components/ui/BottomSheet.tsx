import { forwardRef, useCallback, useMemo } from "react";
import { View, Text } from "react-native";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import type { BottomSheetBackdropProps } from "@gorhom/bottom-sheet";
import { useColors } from "../../lib/theme";

type Props = {
  title?: string;
  children: React.ReactNode;
  snapPoints?: string[];
  onClose?: () => void;
  /** Set to false when children contain their own scrollable (FlatList, SectionList, etc.) */
  scrollable?: boolean;
};

export const BottomSheet = forwardRef<BottomSheetModal, Props>(
  ({ title, children, snapPoints: customSnapPoints, onClose, scrollable = true }, ref) => {
    const c = useColors();
    const snapPoints = useMemo(() => customSnapPoints ?? ["50%", "80%"], [customSnapPoints]);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />
      ),
      []
    );

    const titleEl = title ? (
      <Text className="text-lg font-bold mb-4" style={{ color: c.text }}>{title}</Text>
    ) : null;

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        enableDynamicSizing={false}
        onDismiss={onClose}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: c.surface }}
        handleIndicatorStyle={{ backgroundColor: c.textMuted }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        android_keyboardInputMode="adjustResize"
      >
        {scrollable ? (
          <BottomSheetScrollView
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingBottom: 40,
            }}
          >
            {titleEl}
            {children}
          </BottomSheetScrollView>
        ) : (
          <View style={{ flex: 1, paddingHorizontal: 16 }}>
            {titleEl}
            {children}
          </View>
        )}
      </BottomSheetModal>
    );
  }
);

BottomSheet.displayName = "BottomSheet";
