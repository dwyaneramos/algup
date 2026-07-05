import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';

export type SheetRef = {
  present: () => void;
  dismiss: () => void;
};

type SheetProps = {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  onDismiss?: () => void;
};

export const Sheet = forwardRef<SheetRef, SheetProps>(
  function Sheet({ children, snapPoints: snapPointsProp, onDismiss }, ref) {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => snapPointsProp ?? ['90%'], [snapPointsProp]);

    useImperativeHandle(ref, () => ({
      present: () => bottomSheetModalRef.current?.present(),
      dismiss: () => bottomSheetModalRef.current?.dismiss(),
    }));

    const handleSheetChanges = (index: number) => {
      if (index === -1) {
        onDismiss?.();
      }
    };

    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        keyboardBehavior="fillParent"
        onChange={handleSheetChanges}
      >
        <BottomSheetView style={styles.contentContainer}>
          {children}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  contentContainer: {
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
});
