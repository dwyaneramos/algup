import type { CaseWithProgress, CubeEvent, SheetRef } from "@/types";
import { showToast } from "@/utils/toast";
import { useCallback, useEffect, useRef, useState } from "react";
import { DrawScramble } from "./DrawScramble";
import { Sheet } from "./Sheet";
import Animated, { FadeIn, FadeOut, useAnimatedStyle, withRepeat, withSpring, withTiming, useSharedValue, Easing } from "react-native-reanimated";
import { invertAlgorithm } from "@/src/logic/scramble";
import { sanitiseAlgorithm } from "@/src/logic/alg";
import { Text, View, Pressable } from "react-native";
import { convertScoreToPercentage } from "@/src/logic/fluency";
import { ALG_CATEGORIES } from "@/utils/categories";
import { toggleCaseFocus, markCaseMastered, unmarkCaseMastered } from "@/src/db/queries";
import { useSettingsStore } from "@/src/store/settingsStore";

const FOCUSED_COLOR = ALG_CATEGORIES.find((c) => c.key === "focused")?.borderColor ?? "#000000";
const PRESS_SCALE = 0.97;

export function CaseRow({ c, event, onMasteredChange }: { c: CaseWithProgress, event: CubeEvent, onMasteredChange?: () => void }) {
  const [isFocused, setIsFocused] = useState<boolean>(c.is_focused);
  const [state, setState] = useState(c.state);
  const [fluency, setFluency] = useState(c.fluency);
  const sheetRef = useRef<SheetRef>(null);
  const shiftNavbarUp = useSettingsStore((s) => s.shiftNavbarUp);
  const scale = useSharedValue(1);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(PRESS_SCALE);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1);
  }, [scale]);

  useEffect(() => {
    setIsFocused(!!c.is_focused);
  }, [c.is_focused]);

  useEffect(() => {
    setState(c.state);
  }, [c.state]);

  useEffect(() => {
    setFluency(c.fluency);
  }, [c.fluency]);

  if (c.alg === undefined) return;

  const categoryAttributes = ALG_CATEGORIES.find((cat) => cat.key === state)

  if (categoryAttributes === undefined) return;

  const isMastered = state === 'mastered';

  function onPrioritise() {
    toggleCaseFocus(c.id);
    setIsFocused(prev => !prev);
    // isFocused at this point would be its inverse as state isn't updated
    showToast(`Case ${c.id} is${isFocused ? " no longer" : ""} prioritised`)
    sheetRef.current?.dismiss();
  }

  function onToggleMastered() {
    if (isMastered) {
      const restoredState = unmarkCaseMastered(c.id);
      setState(restoredState);
      setFluency(1);
      showToast(`Case ${c.id} progress reset`);
    } else {
      markCaseMastered(c.id);
      setState('mastered');
      setFluency(5);
      showToast(`Case ${c.id} marked as mastered!`);
    }
    onMasteredChange?.();
    sheetRef.current?.dismiss();
  }

  return (
    <>
      <Animated.View
        style={[
          pressStyle,
          { borderLeftColor: isFocused ? FOCUSED_COLOR : categoryAttributes.borderColor },
        ]}
        className="w-full border border-black/5 border-l-4 bg-white py-3 rounded-2xl justify-between items-center flex flex-row px-3 min-h-20"
      >
        <Pressable
          onLongPress={() => sheetRef.current?.present()}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className="flex-1 flex-row justify-between items-center"
        >
          <View className="flex-1 mr-3">

            <Text className="font-inter-semibold">
              {c.alg}
            </Text>
            <Text className="text-muted">
              Fluency: {convertScoreToPercentage(fluency).toFixed(2)}%
            </Text>
            {c.last_practiced ? (
              <Text className="text-gray-400 text-xs">
                {(() => {
                  const days = Math.floor((Date.now() - new Date(c.last_practiced + 'T00:00:00').getTime()) / 86400000);
                  return days === 0 ? 'Practiced today' : days === 1 ? 'Practiced 1d ago' : `Practiced ${days}d ago`;
                })()}
              </Text>
            ) : null}
          </View>

          <View className="flex-shrink-0">
            <DrawScramble scramble={invertAlgorithm(sanitiseAlgorithm(c.alg))} scale={0.5} event={event} />
          </View>
        </Pressable>
      </Animated.View>

      <Sheet ref={sheetRef} snapPoints={[!shiftNavbarUp ? '40%' : '45%']}>
        <View className="w-full">
          <Text className="text-form-header text-center">{c.alg}</Text>
          <Text className="text-muted text-center text-xs mt-1 mb-5">
            {categoryAttributes.header} · {convertScoreToPercentage(fluency).toFixed(0)}% fluency
          </Text>

          <View className="w-full flex flex-col gap-3">
            <Pressable
              className="w-full rounded-full py-4 items-center"
              style={{ backgroundColor: FOCUSED_COLOR }}
              onPress={onPrioritise}
            >
              <Text className="font-inter-semibold text-base text-white">
                {isFocused ? "Remove priority" : "Prioritise this case"}
              </Text>
            </Pressable>

            <Pressable
              className="w-full rounded-full bg-accent py-4 items-center"
              onPress={onToggleMastered}
            >
              <Text className="font-inter-semibold text-base text-white">
                {isMastered ? "Reset progress" : "I'm fluent in this case"}
              </Text>
            </Pressable>
          </View>

          <Pressable
            className="w-full rounded-full bg-gray-100 items-center py-4 mt-3"
            onPress={() => sheetRef.current?.dismiss()}
          >
            <Text className="font-inter-semibold text-base text-muted">Cancel</Text>
          </Pressable>
        </View>
      </Sheet>
    </>
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
      className="w-full bg-white py-3 rounded-2xl border border-black/5 justify-between items-center flex flex-row px-3 min-h-20"
    >
      <View className="flex-1 mr-3 gap-2">
        <View className="h-4 bg-gray-200 rounded-full w-3/4" />
        <View className="h-3 bg-gray-200 rounded-full w-1/3" />
      </View>
      <View className="h-16 w-16 bg-gray-200 rounded-xl" />
    </Animated.View>
  );
}
