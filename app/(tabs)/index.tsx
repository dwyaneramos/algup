import { View, Text, Button, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useTimer } from '@/src/hooks/useTimer';
import { generateScrambleFromAlg } from '@/src/utils/scramble';
import { useState } from "react";

export default function MainScreen() {
  const [scramble, setScramble] = useState("D2 L D B2 R2 D2 R F' D' F2 U R2 B2 R2 U' D' B2 R'");
  const [solution, setSolution] = useState("");
  const [alg, setAlg] = useState("R U R' U R U2 R'");
  const { running, start, stop, formatted } = useTimer();

  async function generateNewScramble(): Promise<void> {
    const newScramble = await generateScrambleFromAlg(alg);
    setScramble(newScramble);
  }

  async function handleStopAttempt(): Promise<void> {
    await generateNewScramble();
    stop();
  }

  if (running) {
    return (
      <Pressable className="flex-1 items-center justify-center" onPress={handleStopAttempt}>
        <Text style={{ fontVariant: ['tabular-nums'] }} className="text-7xl font-inter-bold text-center">
          {formatted()}
        </Text>
      </Pressable>
    );
  }

  return (
    <View className="gap-3 flex-1 pt-16 px-3 items-center justify-start">
      <Text className="font-inter-bold text-header">CMLL</Text>
      <View className="bg-white p-2 px-5 shadow-xl rounded-3xl min-h-32 max-h-32 w-full items-center justify-center">
        <Text className="text-center text-body font-inter-medium">
          {scramble}
        </Text>
      </View>
      <Pressable
        className="bg-accent p-3 px-10 shadow-xl rounded-3xl min-w-32 items-center justify-center"
        onPress={generateNewScramble}
      >
        <Text className="text-white">Generate scramble</Text>
      </Pressable>
      <Pressable onPress={start} className="w-64 items-center">
        <Text style={{ fontVariant: ['tabular-nums'] }} className="text-7xl font-inter-bold text-center">
          {formatted()}
        </Text>
      </Pressable>
    </View>
  );
}
