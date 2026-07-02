import { toast } from 'sonner-native';
import { FadeOut } from 'react-native-reanimated';

export function showToast(message: string, durationMs = 1000) {
  toast(message, {
    position: 'bottom-center',
    icon: null,
    duration: durationMs,
    animation: { exit: FadeOut.duration(400) },
  });
}
