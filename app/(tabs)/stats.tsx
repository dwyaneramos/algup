import { Text, View, Button, FlatList } from 'react-native';
import { useFocusEffect, Link } from 'expo-router';
import { ALG_CATEGORIES } from "@/utils/categories";
import { useCallback, useState } from 'react';
import { getAlgSetProgress } from '@/src/db/queries';
import { useAlgSetStore } from '@/src/store/algsetStore';
import { type AlgSetProgress } from '@/src/db/queries';
import { SkeletonCaseRow, CaseRow } from '@/components/CaseRow';
import type { CaseWithProgress } from '@/src/logic/caseQueue';
import { getNWorstCases } from '@/src/utils/case';

export default function Stats() {
  const NUM_WORST_CASES = 5;

  const selectedAlgSet = useAlgSetStore(s => s.selectedAlgSet);
  const [algSetProgress, setAlgSetProgress] = useState<AlgSetProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [worstCases, setWorstCases] = useState<CaseWithProgress[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!selectedAlgSet) return;
      setLoading(true);
      setWorstCases([])
      const progress = getAlgSetProgress(selectedAlgSet.name);
      setAlgSetProgress(progress);
      getNWorstCases(selectedAlgSet.name, NUM_WORST_CASES).then(setWorstCases);
      setLoading(false);
    }, [selectedAlgSet])
  );

  if (!algSetProgress || selectedAlgSet === null) return null;
  return (
    <View className=" px-3 items-center flex-1  pt-16 ">

      <Text className="font-inter-bold text-center text-header mb-3">{selectedAlgSet.name}</Text>

      <View className="flex flex-row justify-center items-center gap-3 mb-5">
        <Link href="/algset" className="w-48 bg-accent text-white rounded-xl p-2 text-center">See Case Stats</Link>
        <Link href="/algset" className="w-48 bg-accent text-white rounded-xl p-2 text-center">See Case Stats</Link>
      </View>

      <AlgProgressBar
        algSetProgress={algSetProgress}

      />

      <Text className="font-inter-semibold text-center text-subheader mb-3 mt-12">Cases to Practice</Text>

      <FlatList
        data={loading ? Array(NUM_WORST_CASES).fill(null) : worstCases}
        renderItem={({ item }) => loading ? <SkeletonCaseRow /> : <CaseRow c={item} />}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={{ gap: 12, padding: 12 }}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
      >
      </FlatList>

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
        {ALG_CATEGORIES.map(({ key, color }) => (
          <View
            key={key}
            style={{ width: `${(counts[key] / total) * 100}%` }}
            className={color}
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
