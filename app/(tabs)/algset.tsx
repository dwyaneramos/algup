import { View, Text, FlatList, Pressable } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { useAlgSetStore } from '@/src/store/algsetStore';
import { getAllCasesWithProgress } from '@/src/utils/case';
import { CaseRow, SkeletonCaseRow } from '@/components/CaseRow';
import type { CaseWithProgress } from '@/src/logic/caseQueue';
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
    <View className="pt-16 pb-24">
      <Text className="font-inter-bold text-center text-header mb-3">{selectedAlgSet.name}</Text>


      <View className="flex flex-row justify-center items-center gap-3 mb-1">
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
        renderItem={({ item }) => loading ? <SkeletonCaseRow /> : <CaseRow c={item} />}
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

