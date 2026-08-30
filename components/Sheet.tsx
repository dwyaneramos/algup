import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { BackHandler, Platform, StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import type { SheetRef } from '@/types';

type SheetProps = {
  children: React.ReactNode;
  snapPoints?: (string | number)[];
  onDismiss?: () => void;
};

export const Sheet = forwardRef<SheetRef, SheetProps>(
  function Sheet({ children, snapPoints: snapPointsProp, onDismiss }, ref) {
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);
    const snapPoints = useMemo(() => snapPointsProp ?? ['90%'], [snapPointsProp]);
    const isOpenRef = useRef(false);

    useImperativeHandle(ref, () => ({
      present: () => bottomSheetModalRef.current?.present(),
      dismiss: () => bottomSheetModalRef.current?.dismiss(),
    }));

    const handleSheetChanges = (index: number) => {
      isOpenRef.current = index !== -1;
      if (index === -1) {
        onDismiss?.();
      }
    };

    // Bottom sheets aren't part of the router's history, so the Android
    // system back gesture/button would otherwise skip past them and act on
    // whatever's underneath (e.g. navigating back or exiting the app).
    useEffect(() => {
      if (Platform.OS !== 'android') return;

      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (!isOpenRef.current) return false;
        bottomSheetModalRef.current?.dismiss();
        return true;
      });

      return () => subscription.remove();
    }, []);

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
