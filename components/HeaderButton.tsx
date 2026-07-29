import { Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export function HeaderButton({ onPress, children }: { onPress: () => void; children: React.ReactNode }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.9); }}
      onPressOut={() => { scale.value = withSpring(1); }}
    >
      <Animated.View
        style={animatedStyle}
        className="w-11 h-11 items-center justify-center bg-accent rounded-full"
      >
        {children}
      </Animated.View>
    </Pressable>
  );
}
