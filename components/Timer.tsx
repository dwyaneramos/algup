import { Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useEffect } from 'react';

interface TimerProps {
  formatted: string;
  running: boolean;
  onStart: () => void;
  onStop: () => Promise<void>;
}

export function Timer({ formatted, running, onStart, onStop }: TimerProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  useEffect(() => {
    scale.value = withSpring(running ? 2 : 1);
  }, [running]);

  return (
    <Animated.View className="absolute inset-0 items-center justify-center">
      <Pressable onPress={running ? onStop : onStart}>
        <Animated.Text
          style={[{ fontVariant: ['tabular-nums'] }, animatedStyle]}
          className="text-7xl font-inter-bold text-center"
        >
          {formatted}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
}
