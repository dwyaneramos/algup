import { View, Text, FlatList, Pressable } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useEffect, useState, useCallback } from 'react';
import { useAlgSetStore } from '@/src/store/algsetStore';
import { getAllCasesWithProgress } from '@/src/utils/case';
import { CaseRow, SkeletonCaseRow } from '@/components/CaseRow';
import type { CaseWithProgress } from '@/src/logic/caseQueue';
import { Link, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Algset() {
  const selectedAlgSet = useAlgSetStore(s => s.selectedAlgSet);
  const [cases, setCases] = useState<CaseWithProgress[]>([]);
  const [sortAsc, setSortAsc] = useState(false);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      if (selectedAlgSet === null) return;
      setLoading(true);
      setCases([]);

      // Defer fetch until after the transition frame
      const id = setTimeout(async () => {
        const result = await getAllCasesWithProgress(selectedAlgSet.name);
        setCases(result);
        setLoading(false);
      }, 0);

      return () => clearTimeout(id);
    }, [selectedAlgSet])
  );
  const sortedCases = [...cases].sort((a, b) =>
    sortAsc ? a.fluency - b.fluency : b.fluency - a.fluency
  );

  if (selectedAlgSet === null) return null;

  return (
    <View className="pt-16">
      <Text className="font-inter-bold text-center text-header mb-3">{selectedAlgSet.name}</Text>
      <View className="flex flex-row justify-center items-center gap-3 mb-1">
        <Link href="/stats" className="w-48 bg-accent text-white rounded-xl p-2 text-center">Back to Overview</Link>
        <Pressable className="w-48 bg-accent text-white rounded-xl p-2"
          onPress={() => setSortAsc(prev => !prev)}>
          <Text className="text-white text-center">Fluency {sortAsc ? "↓" : "↑"}</Text>
        </Pressable>
      </View>
      {loading ? (
        <FlatList
          data={Array(7).fill(null)}
          renderItem={() => <SkeletonCaseRow />}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={{ gap: 12, padding: 12 }}
        />
      ) : (
        <Animated.View entering={FadeIn.duration(300)}>
          <FlatList
            data={sortedCases}
            renderItem={({ item }) => <CaseRow c={item} />}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{ gap: 12, padding: 12, paddingBottom: insets.bottom + 200 }}
            initialNumToRender={20}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        </Animated.View>
      )}
    </View>
  );
}
