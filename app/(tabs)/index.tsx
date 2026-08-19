import { View, Text, Pressable, Button, StyleSheet } from 'react-native';
import { useTimer } from '@/src/hooks/useTimer';
import { Timer } from '@/components/Timer';
import Animated, { FadeIn, FadeOut, useAnimatedStyle, interpolateColor, useSharedValue, withSequence, withSpring, withTiming, withRepeat, Easing } from 'react-native-reanimated';
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { IconReload, IconXboxX, IconMoodAnnoyed2, IconMoodHappy, IconMoodSadDizzy } from '@tabler/icons-react-native';
import { useAlgSetStore } from '@/src/store/algsetStore';
import { useSettingsStore } from '@/src/store/settingsStore';
import { getAlgSetFluencyPercentage } from '@/src/logic/fluency';
import { useTrainingSession } from '@/src/hooks/useTrainingSession';
import { DrawScramble } from '@/components/DrawScramble';
import { PulsatingLoadingText } from '@/components/PulsatingLoadingText';
import { COLOR_ACCENT } from '@/utils/constants/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const ICON_SIZE = 48;
const DEFAULT_TIME_STRING = '0.00';
const DEFAULT_SCRAMBLE_MESSAGE = "Loading scramble..."

export default function MainScreen() {
  const insets = useSafeAreaInsets();
  const [attemptDone, setAttemptDone] = useState(false);
  const selectedAlgSet = useAlgSetStore(s => s.selectedAlgSet);
  const miniScramble = useSettingsStore(s => s.miniScramble);
  const { running, start, stop, formatted, resetTime } = useTimer();
  const { scramble, submitGrade, solution, isLoading } = useTrainingSession(selectedAlgSet?.name ?? '');
  const [showScrambleOrSolution, setShowScrambleOrSolution] = useState<string>('scramble');

  const overallFluency = selectedAlgSet
    ? getAlgSetFluencyPercentage(selectedAlgSet.name)
    : 0;

  const isLoadingScramble = isLoading || !scramble;
  const panelOpacity = useSharedValue(1);
  const panelAnimatedStyle = useAnimatedStyle(() => ({ opacity: panelOpacity.value }));

  function handleStart() {
    panelOpacity.value = 0;
    start();
  }

  async function handleStopAttempt(): Promise<void> {
    setAttemptDone(true);
    stop();
  }

  function handleGrade(grade: number) {
    setShowScrambleOrSolution('scramble')
    submitGrade(grade);
    panelOpacity.value = withTiming(1, { duration: 300 });
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
    panelOpacity.value = 1;
  }, [selectedAlgSet])

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (running || attemptDone) {
          stop();
          setAttemptDone(false);
          resetTime();
          panelOpacity.value = 1;
        }
      };
    }, [running, attemptDone])
  );

  return (
    <View className="flex-1">
      <View
        className="flex-1 flex-col items-center justify-start"
        style={{ paddingBottom: insets.bottom + 75 }}
      >
        {!running && (
          <Animated.View
            className="gap-0 flex pt-16 px-3 flex-col items-center"
          >
            <Text className="font-inter-bold text-center text-header">{selectedAlgSet?.name}</Text>
            <Text className="mb-3 text-center">Fluency: {overallFluency.toFixed(2)}%</Text>

            <Animated.View style={[{ opacity: attemptDone ? 0 : 1 }, panelAnimatedStyle]} className="w-full items-center">
              <View className="bg-white p-2 px-5 rounded-3xl min-h-32 max-h-32 min-w-full max-w-full items-center justify-center">
                {isLoadingScramble ? (
                  <PulsatingLoadingText message={DEFAULT_SCRAMBLE_MESSAGE} />
                ) : (
                  <Animated.Text
                    key={showScrambleOrSolution}
                    entering={FadeIn.duration(200)}
                    className="text-center text-body font-inter-medium"
                  >
                    {showScrambleOrSolution === 'solution' ? solution : scramble}
                  </Animated.Text>
                )}
              </View>

              <Pressable
                className="bg-accent rounded-3xl w-48 p-3 mt-3 disabled:opacity-50"
                onPress={toggleDisplayMode}
                disabled={formatted() !== DEFAULT_TIME_STRING}
                style={{ opacity: isLoadingScramble ? 0.5 : 1 }}
              >
                <Text className="text-white text-center">Show {showScrambleOrSolution === 'solution' ? "Scramble" : "Solution"}</Text>
              </Pressable>
            </Animated.View>
          </Animated.View>
        )}
        <View className="mt-3 w-full relative">
          <Timer
            disabled={!running && (attemptDone || isLoadingScramble)}
            formatted={formatted()}
            running={running}
            onStart={handleStart}
            onStop={handleStopAttempt}
          />

          {!running && formatted() !== DEFAULT_TIME_STRING && (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              className="absolute bottom-2 left-0 right-0 flex-row justify-center items-center gap-10"
            >
              <GradeButton onPress={() => handleGrade(1)} icon={IconMoodSadDizzy} color="#d95f6b" />
              <GradeButton onPress={() => handleGrade(2)} icon={IconMoodAnnoyed2} color="#d9a45f" />
              <GradeButton onPress={() => handleGrade(3)} icon={IconMoodHappy} color="#5fd976" />
              <View className="w-1 h-8 bg-gray-300 -mx-6" />
              <GradeButton onPress={() => {
                panelOpacity.value = 1;
                setAttemptDone(false);
                resetTime();
              }} icon={IconReload} color={COLOR_ACCENT} />
            </Animated.View>
          )}
        </View>

        {!running && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            className="flex flex-col items-center relative justify-center"
          >
            <DrawScramble scale={miniScramble ? 1.7 : 2} scramble={scramble} event={selectedAlgSet?.event ?? '333'} />
          </Animated.View>
        )}
      </View>

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
