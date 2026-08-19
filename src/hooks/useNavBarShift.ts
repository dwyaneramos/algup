import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettingsStore } from '@/src/store/settingsStore';

/**
 * Extra bottom offset to keep the floating tab bar clear of Android's
 * permanent (3-button) navigation bar, which isn't reflected in `bottom-6`.
 * Only applies on Android, and only when the user has opted in, since
 * gesture-nav Android devices don't need it.
 */
export function useNavBarShift(): number {
  const insets = useSafeAreaInsets();
  const shiftNavbarUp = useSettingsStore((s) => s.shiftNavbarUp);

  if (Platform.OS !== 'android' || !shiftNavbarUp) return 0;
  return insets.bottom * 0.75;
}
