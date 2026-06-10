import { View, Text, FlatList, Pressable } from 'react-native';
import { applyScramble } from '@/src/utils/scramble';
import { useEffect, useState, useCallback } from 'react';
import { useAlgSetStore } from '@/src/store/algsetStore';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import type { CaseWithProgress } from '@/src/logic/caseQueue';
import { convertScoreToPercentage } from '@/src/utils/fluency';
import { getAllCasesWithProgress } from '@/src/utils/case';
import { DrawScramble } from '@/components/DrawScramble';
import { Link, useFocusEffect } from 'expo-router';

export default function Algset() {
  const selectedAlgSet = useAlgSetStore(s => s.selectedAlgSet);
  const [cases, setCases] = useState<CaseWithProgress[]>([]);
  const [sortAsc, setSortAsc] = useState(false);
  const [loading, setLoading] = useState(true);


  useFocusEffect(
    useCallback(() => {
      if (selectedAlgSet === null) return;
      setLoading(true);
      setCases([]);
      getAllCasesWithProgress(selectedAlgSet.name).then(setCases);
      setLoading(false);
    }, [selectedAlgSet])
  );


  const sortedCases = [...cases].sort((a, b) =>
    sortAsc ? a.fluency - b.fluency : b.fluency - a.fluency
  );


  if (selectedAlgSet === null) return;

  return (
    <View className="pt-16">
      <Text className="font-inter-bold text-center text-header">{selectedAlgSet.name}</Text>

      <View className="flex flex-row justify-center items-center gap-3">

        <Link href="/stats" className="w-48 bg-accent text-white rounded-xl p-2 text-center">Back to Overview</Link>

        <Pressable className="w-48 bg-accent text-white rounded-xl p-2 "
          onPress={() => setSortAsc((prev) => !prev)}>
          <Text className="text-white text-center">
            Fluency {sortAsc ? "↓" : "↑"}
          </Text>
        </Pressable>
      </View>


      <FlatList
        data={loading ? Array(7).fill(null) : sortedCases}
        renderItem={({ item }) => loading ? <SkeletonRow /> : <CaseRow c={item} />}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ gap: 12, padding: 12 }}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
      >
      </FlatList>
    </View>
  )
}

function CaseRow({ c }: { c: CaseWithProgress }) {

  if (c.alg === undefined) return;
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
        <DrawScramble scramble={c.alg} scale={0.5} />
      </View>
    </Animated.View>
  )

}

function SkeletonRow() {
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
