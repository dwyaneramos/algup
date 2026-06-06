import { View, Text, Button, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useTimer } from '@/src/hooks/useTimer';
import { Timer } from '@/components/Timer';
import { generateScrambleFromAlg } from '@/src/utils/scramble';
import Animated, { FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useState } from "react";
import { useAlgSetStore } from '@/src/store/algsetStore';
import { Sad, Mid, Happy } from '@/assets/icons';


const ICON_SIZE = 48;
const DEFAULT_TIME_STRING = '0.00'

export default function MainScreen() {
  const [scramble, setScramble] = useState("D2 L D B2 R2 D2 R F' D' F2 U R2 B2 R2 U' D' B2 R'");
  const [solution, setSolution] = useState("");
  const [alg, setAlg] = useState("R U R' U R U2 R'");
  const scale = useSharedValue(1);
  const [attemptDone, setAttemptDone] = useState(false);

  async function generateNewScramble(): Promise<void> {
    const newScramble = await generateScrambleFromAlg(alg);
    setScramble(newScramble);
  }


  const { running, start, stop, formatted, resetTime } = useTimer();

  async function handleStopAttempt(): Promise<void> {
    await generateNewScramble();
    setAttemptDone(true);
    stop();
  }

  const selectedAlgSet = useAlgSetStore(s => s.selectedAlgSet);

  function handleGrade() {
    setAttemptDone(false)
    resetTime();
  }


  function AttemptGrader() {
    return (
      <View className="flex flex-row justify-around w-full">
        <Pressable onPress={handleGrade}>
          <Sad size={ICON_SIZE} color={'#d95f6b'} />
        </Pressable>

        <Pressable onPress={handleGrade}>
          <Text>
            <Mid size={ICON_SIZE} color={'#d9a45f'} />
          </Text>
        </Pressable>

        <Pressable onPress={handleGrade}>
          <Text>
            <Happy size={ICON_SIZE} color={'#5fd976'} />
          </Text>
        </Pressable>

      </View>
    )
  }

  return (
    <View className="flex-1">
      {!running && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="gap-3 flex-1 pt-16 px-3 items-center justify-start"
        >
          <Text className="font-inter-bold text-header">{selectedAlgSet?.name}</Text>
          <View className="bg-white p-2 px-5 rounded-3xl min-h-32 max-h-32 w-full items-center justify-center">
            <Text className="text-center text-body font-inter-medium">{scramble}</Text>
          </View>
        </Animated.View>
      )}

      <Timer
        disabled={attemptDone}
        formatted={formatted()}
        running={running}
        onStart={start}
        onStop={handleStopAttempt}
      />



      {!running &&
        < Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="gap-3 flex-1 px-3 items-center justify-start"
        >
          {formatted() !== DEFAULT_TIME_STRING &&

            <AttemptGrader />

          }
          <View className="absolute bottom-5 items-center gap-5">

            <View className="bg-muted w-64 h-64"></View>
            <View className="flex flex-row gap-5">
              <StatPill info={"10/42 algs to master"} />
              <StatPill info={"confidence"} />
            </View>
          </View>



        </Animated.View>
      }
    </View >
  );
}


function StatPill({ info }: { info: string }) {
  return (
    <View className=" bg-white p-2 px-5 rounded-3xl min-h-12 max-h-12 items-center justify-center">
      <Text className="font-inter-medium  ">{info}</Text>
    </View>
  )
}
