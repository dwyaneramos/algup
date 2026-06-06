import { View, Text, Button, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useTimer } from '@/src/hooks/useTimer';
import { Timer } from '@/components/Timer';
import { generateScrambleFromAlg } from '@/src/utils/scramble';
import Animated, { FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useState } from "react";



export default function MainScreen() {
  const [scramble, setScramble] = useState("D2 L D B2 R2 D2 R F' D' F2 U R2 B2 R2 U' D' B2 R'");
  const [solution, setSolution] = useState("");
  const [alg, setAlg] = useState("R U R' U R U2 R'");

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  async function generateNewScramble(): Promise<void> {
    const newScramble = await generateScrambleFromAlg(alg);
    setScramble(newScramble);
  }


  const { running, start, stop, formatted } = useTimer();

  async function handleStopAttempt(): Promise<void> {
    await generateNewScramble();
    stop();
  }

  return (
    <View className="flex-1">
      {!running && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="gap-3 flex-1 pt-16 px-3 items-center justify-start"
        >
          <Text className="font-inter-bold text-header">CMLL</Text>
          <View className="bg-white p-2 px-5 shadow-xl rounded-3xl min-h-32 max-h-32 w-full items-center justify-center">
            <Text className="text-center text-body font-inter-medium">{scramble}</Text>
          </View>
        </Animated.View>
      )}
      <Timer
        formatted={formatted()}
        running={running}
        onStart={start}
        onStop={handleStopAttempt}
      />
    </View>
  );
}
