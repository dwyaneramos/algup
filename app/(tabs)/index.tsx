import { View, Text, Pressable } from 'react-native';
import { useTimer } from '@/src/hooks/useTimer';
import { Timer } from '@/components/Timer';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, interpolateColor, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useState, useEffect } from "react";
import { useAlgSetStore } from '@/src/store/algsetStore';
import { getAlgSetProgress } from '@/src/db/queries';
import { getAlgSetConfidencePercentage } from '@/src/utils/confidence';
import { useTrainingSession } from '@/src/hooks/useTrainingSession';
import { Sad, Mid, Happy } from '@/assets/icons';
import { getNumberOfAlgsPracticing } from '@/src/logic/caseQueue';

const ICON_SIZE = 48;
const DEFAULT_TIME_STRING = '0.00';

export default function MainScreen() {
  const [attemptDone, setAttemptDone] = useState(false);
  const [lastBoundary, setLastBoundary] = useState(0);


  const selectedAlgSet = useAlgSetStore(s => s.selectedAlgSet);
  const { running, start, stop, formatted, resetTime } = useTimer();
  const { scramble, submitGrade } = useTrainingSession(selectedAlgSet?.name ?? '');

  const averageConfidence = selectedAlgSet
    ? getAlgSetConfidencePercentage(selectedAlgSet.name)
    : 0;

  async function handleStopAttempt(): Promise<void> {
    setAttemptDone(true);
    stop();
  }

  function handleGrade(grade: number) {
    submitGrade(grade);
    setAttemptDone(false);
    resetTime();
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
          <Text>Confidence: {averageConfidence.toFixed(2)}%</Text>

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

      {!running && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="gap-3 flex-1 px-10 items-center justify-start"
        >
          {formatted() !== DEFAULT_TIME_STRING && (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              className="flex flex-row justify-around w-full"
            >
              <Pressable onPress={() => handleGrade(1)}>
                <Sad size={ICON_SIZE} color={'#d95f6b'} />
              </Pressable>
              <Pressable onPress={() => handleGrade(2)}>
                <Mid size={ICON_SIZE} color={'#d9a45f'} />
              </Pressable>
              <Pressable onPress={() => handleGrade(3)}>
                <Happy size={ICON_SIZE} color={'#5fd976'} />
              </Pressable>
            </Animated.View>
          )}

        </Animated.View>
      )}
    </View>
  );
}


