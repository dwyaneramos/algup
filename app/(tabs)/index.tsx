import { View, Text, Pressable, Button } from 'react-native';
import { useTimer } from '@/src/hooks/useTimer';
import { Timer } from '@/components/Timer';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, interpolateColor, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useState, useEffect } from "react";
import { useAlgSetStore } from '@/src/store/algsetStore';
import { getAlgSetConfidencePercentage } from '@/src/utils/confidence';
import { useTrainingSession } from '@/src/hooks/useTrainingSession';
import { DrawScramble } from '@/components/DrawScramble';
import { Sad, Mid, Happy } from '@/assets/icons';


const ICON_SIZE = 48;
const DEFAULT_TIME_STRING = '0.00';

export default function MainScreen() {
  const [attemptDone, setAttemptDone] = useState(false);

  const selectedAlgSet = useAlgSetStore(s => s.selectedAlgSet);
  const { running, start, stop, formatted, resetTime } = useTimer();
  const { scramble, submitGrade } = useTrainingSession(selectedAlgSet?.name ?? '');

  const overallConfidence = selectedAlgSet
    ? getAlgSetConfidencePercentage(selectedAlgSet.name)
    : 0;

  async function handleStopAttempt(): Promise<void> {
    setAttemptDone(true);
    stop();
  }

  function handleGrade(grade: number) {
    submitGrade(grade);
    setTimeout(() => {
      setAttemptDone(false);
      resetTime();
    }, 200);
  }

  useEffect(() => {
    setAttemptDone(false)
    resetTime();
  }, [selectedAlgSet])

  return (
    <View className="flex-1">
      {!running && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="gap-0 flex-1 pt-16 px-3 items-center justify-start"
        >
          <Text className="font-inter-bold text-header">{selectedAlgSet?.name}</Text>
          <Text className="mb-3">Confidence: {overallConfidence.toFixed(2)}%</Text>

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
              <GradeButton onPress={() => handleGrade(1)} icon={Sad} color='#d95f6b' />
              <GradeButton onPress={() => handleGrade(2)} icon={Mid} color='#d9a45f' />
              <GradeButton onPress={() => handleGrade(3)} icon={Happy} color='#5fd976' />
            </Animated.View>
          )}

          <View className="bg-white p-2 rounded-3xl absolute bottom-5">
            <DrawScramble scramble={scramble} />
          </View>




        </Animated.View>
      )}

    </View>
  );
}

function GradeButton({ onPress, icon: Icon, color }: {
  onPress: () => void,
  icon: any,
  color: string
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <Pressable onPress={onPress}
      onPressIn={() => { scale.value = withSpring(1.2); }}
      onPressOut={() => { scale.value = withSpring(1); }}
    >
      <Animated.View style={animatedStyle}>
        <Icon size={ICON_SIZE} color={color} />
      </Animated.View>
    </Pressable>
  );
}
