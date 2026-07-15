import Animated, {
  useSharedValue, withRepeat, withTiming, withSequence, FadeIn, useAnimatedStyle, Easing
} from "react-native-reanimated";
import { useEffect } from "react";

export function PulsatingLoadingText({ message }: { message: string }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.35, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 700, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View entering={FadeIn.duration(200)}>
      <Animated.Text
        style={[
          animatedStyle,
          { textAlign: 'center', fontFamily: 'Inter-Medium', color: '#9ca3af', fontSize: 16 },
        ]}
      >
        {message}
      </Animated.Text>
    </Animated.View>
  );
}
