import { Text, View, Pressable } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { useAlgSetStore } from '@/src/store/algsetStore';
import { getAlgSetFluencyPercentage } from '@/src/logic/fluency';
import { getDisplayCaseScramble } from '@/src/logic/case';
import { DrawScramble } from '@/components/DrawScramble';
import { invertAlgorithm } from '@/src/logic/scramble';
import { sanitiseAlgorithm } from '@/src/logic/alg';
import type { AlgSet } from '@/types';

const COLOR_TRANSITION_DURATION = 150;
const PRESS_SCALE = 0.97;

type AlgSetRowProps = {
  algset: AlgSet;
  onLongPress: (algset: AlgSet) => void;
};

export function AlgSetRow({ algset, onLongPress }: AlgSetRowProps) {
  const isSelected = useAlgSetStore((s) => s.selectedAlgSet?.name === algset.name);
  const setSelectedAlgSet = useAlgSetStore((s) => s.setSelectedAlgSet);
  const [scramble, setScramble] = useState<string | null>(null);

  const selected = useSharedValue(isSelected ? 1 : 0);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(selected.value, [0, 1], ['#ffffff', '#e899f2']),
  }));

  useEffect(() => {
    getDisplayCaseScramble(algset.name).then(setScramble);
  }, [algset]);

  useEffect(() => {
    if (isSelected) {
      selected.value = withTiming(1, { duration: COLOR_TRANSITION_DURATION });
    } else {
      selected.value = withTiming(0, { duration: COLOR_TRANSITION_DURATION });
    }
  }, [isSelected]);
  const handlePress = () => {
    if (isSelected) return;
    setSelectedAlgSet(algset);
  };

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(PRESS_SCALE);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1);
  }, [scale]);

  //TODO: scramble displayed is just the inverse of the fetched algorithm
  return (
    <Animated.View
      style={animatedStyle}
      className="flex min-h-20 w-full flex-row justify-between rounded-2xl border border-black/5 bg-white px-3 py-3">
      <Pressable
        onPress={handlePress}
        onLongPress={() => onLongPress(algset)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className="flex-1 flex-row justify-between">
        <View className="flex flex-col justify-center">
          <Text className="font-inter-semibold text-xl">{algset.name}</Text>
          <Text className={`font-inter-medium ${isSelected ? 'text-black' : 'text-muted'}`}>
            {getAlgSetFluencyPercentage(algset.name).toFixed(2)}% Fluency
          </Text>
          <Text className={`font-inter-medium ${isSelected ? 'text-black' : 'text-muted'}`}>
            {algset.cases.length} Algorithms
          </Text>
        </View>
        {scramble ? (
          <DrawScramble
            scramble={invertAlgorithm(sanitiseAlgorithm(scramble))}
            scale={0.6}
            event={algset.event}
          />
        ) : (
          <View className="h-16 w-16 rounded-xl bg-gray-200" />
        )}
      </Pressable>
    </Animated.View>
  );
}
