import type { CaseWithProgress } from "@/src/logic/caseQueue";
import { DrawScramble } from "./DrawScramble";
import Animated, { FadeIn, useAnimatedStyle, withRepeat, withTiming, useSharedValue, Easing } from "react-native-reanimated";
import { invertAlgorithm, sanitiseAlgorithm } from "@/src/utils/scramble";
import { Text, View } from "react-native";
import { useEffect } from "react";
import { convertScoreToPercentage } from "@/src/utils/fluency";



export function CaseRow({ c }: { c: CaseWithProgress }) {

  if (c.alg === undefined) return;
  console.log("HEHE", c.alg)

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      className="w-full bg-white py-3 rounded-xl justify-between items-center flex flex-row px-3 min-h-20"
    >
      <View className="flex-1 mr-3">

        <Text className="font-inter-semibold">
          {c.alg}
        </Text>
        <Text className="">
          Fluency: {convertScoreToPercentage(c.fluency).toFixed(2)}%
        </Text>
      </View>
      <View className="flex-shrink-0">
        <DrawScramble scramble={invertAlgorithm(sanitiseAlgorithm(c.alg))} scale={0.5} />
      </View>
    </Animated.View>
  )

}

export function SkeletonCaseRow() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={animatedStyle}
      className="w-full bg-white py-3 rounded-xl justify-between items-center flex flex-row px-3 min-h-20"
    >
      <View className="flex-1 mr-3 gap-2">
        <View className="h-4 bg-gray-200 rounded-full w-3/4" />
        <View className="h-3 bg-gray-200 rounded-full w-1/3" />
      </View>
      <View className="h-16 w-16 bg-gray-200 rounded-xl" />
    </Animated.View>
  );
}
