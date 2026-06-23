import type { CaseWithProgress } from "@/src/logic/caseQueue";
import { useEffect, useState } from "react";
import { DrawScramble } from "./DrawScramble";
import Animated, { FadeIn, FadeOut, useAnimatedStyle, withRepeat, withTiming, useSharedValue, Easing } from "react-native-reanimated";
import { invertAlgorithm, sanitiseAlgorithm } from "@/src/utils/scramble";
import { Text, View, Pressable } from "react-native";
import { convertScoreToPercentage } from "@/src/utils/fluency";
import { ALG_CATEGORIES } from "@/utils/categories";
import { toggleCaseFocus } from "@/src/db/queries";
import { toast } from 'sonner-native';



export function CaseRow({ c }: { c: CaseWithProgress }) {
  const [isFocused, setIsFocused] = useState<boolean>(c.is_focused);

  useEffect(() => {
    setIsFocused(!!c.is_focused);
  }, [c.is_focused]);

  if (c.alg === undefined) return;

  const categoryAttributes = ALG_CATEGORIES.find((cat) => cat.key === c.state)

  if (categoryAttributes === undefined) return;


  function onPress() {
    toggleCaseFocus(c.id);
    setIsFocused(prev => !prev);

    // isFocused at this point would be its inverse as state isn't updated
    toast(`Case ${c.id} is${isFocused ? " no longer" : ""} prioritised`, {
      position: 'bottom-center',
      icon: <></>,
      animation: {
        exit: FadeOut.duration(400),
      },
    })
  }


  return (
    <Pressable onPress={onPress}>
      <Animated.View
        style={{ borderLeftColor: categoryAttributes.borderColor }} entering={FadeIn.duration(300)}
        className={`w-full border-l-4 bg-white py-3 rounded-xl justify-between items-center flex flex-row px-3 min-h-20`}
      >
        <View className="flex-1 mr-3">

          <Text className="font-inter-semibold">
            {c.alg}
          </Text>
          <Text className="text-muted">
            Fluency: {convertScoreToPercentage(c.fluency).toFixed(2)}%
          </Text>
        </View>

        <View className="flex-shrink-0">
          <DrawScramble scramble={invertAlgorithm(sanitiseAlgorithm(c.alg))} scale={0.5} />
        </View>
        {isFocused ?

          <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
            className="h-3 w-3 rounded-full bg-accent absolute top-2 right-2" />

          : null
        }

      </Animated.View>
    </Pressable>
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
