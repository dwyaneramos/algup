import { View, Text, Button, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { generateScrambleFromAlg } from '@/src/utils/scramble';
import { useState } from "react";

export default function MainScreen() {
  const [scramble, setScramble] = useState("D2 L D B2 R2 D2 R F' D' F2 U R2 B2 R2 U' D' B2 R'");
  const [solution, setSolution] = useState("");
  const [alg, setAlg] = useState("R U R' U R U2 R'");

  async function handleShowSolution(): Promise<void> {
    const aalg = await generateScrambleFromAlg(alg);
    setSolution(aalg);
    alert(aalg)
  }



  return (
    <View className="gap-3 flex-1 pt-16 px-3 items-center justify-start">

      <Text className="font-inter-bold text-header">CMLL</Text>

      <View className="bg-white p-2 shadow-xl rounded-3xl min-h-32 max-h-32 w-full items-center justify-center">
        <Text className="text-center font-inter-medium">
          {scramble}
        </Text>
      </View>

      <Pressable
        className="bg-accent p-3 px-10 shadow-xl rounded-3xl min-w-32 items-center justify-center"
        onPress={() => handleShowSolution()}
      >
        <Text className="text-white">Show solution</Text>
      </Pressable>

      <Pressable
        className="bg-accent p-3 px-10 shadow-xl rounded-3xl min-w-32 items-center justify-center"
        onPress={() => handleShowSolution()}
      >
        <Text className="text-white">Test: Generate new scramble</Text>
      </Pressable>








      <Text className="text-7xl font-inter-medium">2.84</Text>
    </View>
  );
}

