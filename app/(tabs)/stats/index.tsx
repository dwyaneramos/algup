import { Text, View, FlatList, Pressable } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { ALG_CATEGORIES } from "@/utils/categories";
import { useCallback, useState } from 'react';
import { getAlgSetProgress, getDailyStreak, getLearningFluency } from '@/src/db/queries';
import { useAlgSetStore } from '@/src/store/algsetStore';
import { type AlgSetProgress } from '@/src/db/queries';
import { SkeletonCaseRow, CaseRow } from '@/components/CaseRow';
import type { CaseWithProgress } from '@/src/logic/caseQueue';
import { getNWorstCases } from '@/src/logic/case';
import { convertScoreToPercentage } from '@/src/logic/fluency';
import Animated, { FadeIn, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavBarShift } from '@/src/hooks/useNavBarShift';
function CaseStatsButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.97); }}
      onPressOut={() => { scale.value = withSpring(1); }}
    >
      <Animated.View
        style={animatedStyle}
        className="items-center bg-accent rounded-full pl-7 pr-6 py-3"
      >
        <Text className="font-inter-semibold text-white text-sm">See Case Stats</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function Stats() {
  const NUM_WORST_CASES = 5;

  const router = useRouter();
  const selectedAlgSet = useAlgSetStore(s => s.selectedAlgSet);
  const [algSetProgress, setAlgSetProgress] = useState<AlgSetProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [worstCases, setWorstCases] = useState<CaseWithProgress[]>([]);
  const [dailyStreak, setDailyStreak] = useState(0);
  const [learningFluency, setLearningFluency] = useState<number | null>(null);
  const insets = useSafeAreaInsets();
  const navBarShift = useNavBarShift();

  useFocusEffect(
    useCallback(() => {
      if (!selectedAlgSet) return;
      setLoading(true);
      setWorstCases([]);

      const id = setTimeout(() => {
        const progress = getAlgSetProgress(selectedAlgSet.name);
        setAlgSetProgress(progress);
        setDailyStreak(getDailyStreak());
        setLearningFluency(getLearningFluency(selectedAlgSet.name));
        getNWorstCases(selectedAlgSet.name, NUM_WORST_CASES).then(cases => {
          setWorstCases(cases);
          setLoading(false);
        });
      }, 0);

      return () => clearTimeout(id);
    }, [selectedAlgSet])
  );

  if (!algSetProgress || selectedAlgSet === null) return null;
  return (
    <View className="items-center flex-1  pt-16 ">

      <Text className="font-inter-bold text-center text-header mb-3">{selectedAlgSet.name}</Text>

      <View className="px-4 mb-6 w-full">
        <StatsRow
          items={[
            { value: `${dailyStreak}`, label: 'Day Streak' },
            { value: `${algSetProgress.total}`, label: 'Algorithms' },
            {
              value: learningFluency === null ? '--' : `${convertScoreToPercentage(learningFluency).toFixed(0)}%`,
              label: 'Learning Fluency',
            },
          ]}
        />
      </View>

      <View className="mb-6">
        <CaseStatsButton onPress={() => router.push('/stats/algset')} />
      </View>

      <View className="px-3">

        <AlgProgressBar
          algSetProgress={algSetProgress}
        />
      </View>


      <Text className="font-inter-semibold text-center text-subheader mb-3 mt-12">Cases to Practice</Text>

      {!loading && (
        <Animated.View entering={FadeIn.duration(300)} className="flex-1 w-full">
          <FlatList
            data={worstCases}
            renderItem={({ item }) => <CaseRow c={item} />}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{ gap: 12, padding: 12, paddingBottom: insets.bottom + 75 + navBarShift }}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={5}
            ListEmptyComponent={
              <View className="items-center py-8">
                <Text className="text-muted">No cases are currently being practiced</Text>
              </View>
            }
          />
        </Animated.View>
      )}
    </View>
  );
}

function AlgProgressBar({ algSetProgress }: {
  algSetProgress: AlgSetProgress,
}) {

  const { total, mastered, reviewing, learning } = algSetProgress;

  const counts: Record<string, number> = {
    mastered,
    reviewing,
    learning,
    remaining: total - mastered - reviewing - learning,
  };



  return (
    <View className="w-full">
      <View className="flex-row h-2 rounded-full overflow-hidden bg-gray-100">
        {ALG_CATEGORIES.map(({ key, bgColor }) => (
          <View
            key={key}
            style={{ width: `${(counts[key] / total) * 100}%`, backgroundColor: bgColor }}
          />
        ))}
      </View>
      <View className="flex-row justify-between mt-1">
        {ALG_CATEGORIES.filter(({ key }) => counts[key] > 0).map(({ key, color, header }) => (
          <ProgressBarLegendTitle
            key={key}
            color={color}
            numCases={counts[key]}
            category={header}
          />
        ))}
      </View>
    </View>);
}

function ProgressBarLegendTitle({ color, numCases, category }: { color: string, numCases: number, category: string }) {
  return (
    <View className="flex flex-row gap-3 items-center">
      <View className={` ${color} h-2 w-2 rounded-full `} />
      <Text className="text-xs text-gray-400">{numCases} {category}</Text>
    </View>

  )
}

function StatsRow({ items }: { items: { value: string; label: string }[] }) {
  return (
    <View className="flex-row w-full bg-white rounded-2xl border border-black/5 py-4">
      {items.map((item, i) => (
        <View
          key={item.label}
          className={`flex-1 items-center ${i > 0 ? 'border-l border-black/5' : ''}`}
        >
          <Text className="font-inter-bold text-xl text-header">{item.value}</Text>
          <Text className="text-[11px] text-gray-500 mt-1">{item.label}</Text>
        </View>
      ))}
    </View>
  );
}
