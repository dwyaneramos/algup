import { View, Text, Pressable, Button, StyleSheet } from 'react-native';
import { useTimer } from '@/src/hooks/useTimer';
import { Timer } from '@/components/Timer';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, interpolateColor, useSharedValue, withSequence, withSpring, withTiming, withRepeat, Easing } from 'react-native-reanimated';
import { useState, useEffect } from "react";
import { IconReload, IconXboxX, IconMoodAnnoyed2, IconMoodHappy, IconMoodSadDizzy } from '@tabler/icons-react-native';
import { useAlgSetStore } from '@/src/store/algsetStore';
import { getAlgSetFluencyPercentage } from '@/src/logic/fluency';
import { useTrainingSession } from '@/src/hooks/useTrainingSession';
import { DrawScramble } from '@/components/DrawScramble';
import { PulsatingLoadingText } from '@/components/PulsatingLoadingText';
import { COLOR_ACCENT } from '@/utils/constants/colors';


const ICON_SIZE = 48;
const DEFAULT_TIME_STRING = '0.00';
const DEFAULT_SCRAMBLE_MESSAGE = "Loading scramble..."

export default function MainScreen() {
  const [attemptDone, setAttemptDone] = useState(false);
  const selectedAlgSet = useAlgSetStore(s => s.selectedAlgSet);
  const { running, start, stop, formatted, resetTime } = useTimer();
  const { scramble, submitGrade, solution, isLoading } = useTrainingSession(selectedAlgSet?.name ?? '');
  const [showScrambleOrSolution, setShowScrambleOrSolution] = useState<string>('scramble');

  const overallFluency = selectedAlgSet
    ? getAlgSetFluencyPercentage(selectedAlgSet.name)
    : 0;

  const isLoadingScramble = isLoading || !scramble;

  async function handleStopAttempt(): Promise<void> {
    setAttemptDone(true);
    stop();
  }

  function handleGrade(grade: number) {
    setShowScrambleOrSolution('scramble')
    submitGrade(grade);
    setTimeout(() => {
      setAttemptDone(false);
      resetTime();
    }, 200);
  }

  function toggleDisplayMode() {
    if (isLoadingScramble) return;
    setShowScrambleOrSolution((prev) => prev === 'scramble' ? 'solution' : 'scramble');
  }

  useEffect(() => {
    setAttemptDone(false)
    setShowScrambleOrSolution('scramble')
    resetTime();
  }, [selectedAlgSet])

  return (
    <View className="flex-1 flex-col items-center justify-start">
      {!running && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="gap-0 flex pt-16 px-3 flex-col items-center"
        >
          <Text className="font-inter-bold text-center text-header">{selectedAlgSet?.name}</Text>
          <Text className="mb-3 text-center">Fluency: {overallFluency.toFixed(2)}%</Text>

          <View className="bg-white p-2 px-5 rounded-3xl min-h-32 max-h-32 min-w-full max-w-full  items-center justify-center">
            {isLoadingScramble ? (
              <PulsatingLoadingText message={DEFAULT_SCRAMBLE_MESSAGE} />
            ) : (
              <Animated.Text
                key={showScrambleOrSolution}
                entering={FadeIn.duration(200)}
                className={`text-center text-body font-inter-medium ${formatted() !== DEFAULT_TIME_STRING ? "text-muted " : ""} `}
              >
                {showScrambleOrSolution === 'solution' ? solution : scramble}
              </Animated.Text>
            )}
          </View>

          <Pressable
            className="bg-accent rounded-3xl w-48 p-3 mt-3 disabled:opacity-50"
            onPress={toggleDisplayMode}
            disabled={isLoadingScramble}
            style={{ opacity: isLoadingScramble ? 0.5 : 1 }}
          >
            <Text className="text-white text-center">Show {showScrambleOrSolution === 'solution' ? "Scramble" : "Solution"}</Text>
          </Pressable>


        </Animated.View>
      )}
      <View className="mt-3">
        <Timer
          disabled={!running && (attemptDone || isLoadingScramble)}
          formatted={formatted()}
          running={running}
          onStart={start}
          onStop={handleStopAttempt}
        />
      </View>

      {!running && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className="flex flex-col items-center relative justify-center"
        >
          {formatted() !== DEFAULT_TIME_STRING && (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              className="absolute left-0 right-0 top-0 flex-row justify-center items-center gap-10"
              style={{ transform: [{ translateY: -80 }] }}
            >
              <GradeButton onPress={() => handleGrade(1)} icon={IconMoodSadDizzy} color="#d95f6b" />
              <GradeButton onPress={() => handleGrade(2)} icon={IconMoodAnnoyed2} color="#d9a45f" />
              <GradeButton onPress={() => handleGrade(3)} icon={IconMoodHappy} color="#5fd976" />
              <View className="w-1 h-8 bg-gray-300 -mx-6" />
              <GradeButton onPress={() => {

                setAttemptDone(false);
                resetTime();
              }} icon={IconReload} color={COLOR_ACCENT} />
            </Animated.View>
          )}

          <DrawScramble scale={2} scramble={scramble} />




        </Animated.View>
      )}

      {running && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPressIn={handleStopAttempt}
          accessibilityLabel="Stop timer"
        />
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
