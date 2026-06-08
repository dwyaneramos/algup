import { Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useEffect, useRef } from 'react';

interface TimerProps {
  formatted: string;
  running: boolean;
  onStart: () => void;
  onStop: () => Promise<void>;
  disabled: boolean;
}

export function Timer({ formatted, running, onStart, onStop, disabled }: TimerProps) {
  const scale = useSharedValue(1);
  const baseScale = useRef(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    baseScale.current = running ? 2 : 1;
    scale.value = withSpring(baseScale.current);
  }, [running]);

  return (
    <Animated.View className="relative  items-center justify-center pb-2">
      <Pressable
        disabled={disabled}
        onPress={running ? onStop : onStart}
        onPressIn={() => { scale.value = withSpring(baseScale.current + 0.2); }}
        onPressOut={() => { scale.value = withSpring(baseScale.current); }}
        className={running ? ' h-full items-center justify-center' : 'w-full py-14'}
      >
        <Animated.Text
          style={[{ fontVariant: ['tabular-nums'] }, animatedStyle]}
          className={`text-7xl py-10 font-inter-bold text-center ${disabled ? "text-muted" : ""}`}
        >
          {formatted}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
}
