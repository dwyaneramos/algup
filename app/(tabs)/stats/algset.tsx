import { View, Text, FlatList } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useState, useCallback } from 'react';
import { useAlgSetStore } from '@/src/store/algsetStore';
import { getAllCasesWithProgress } from '@/src/logic/case';
import { CaseRow, SkeletonCaseRow } from '@/components/CaseRow';
import { HeaderButton } from '@/components/HeaderButton';
import type { CaseWithProgress } from '@/types';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconArrowLeft, IconSortAscending, IconSortDescending } from '@tabler/icons-react-native';

export default function Algset() {
  const router = useRouter();
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
      <View className="flex-row items-center justify-between px-4 mb-4">
        <HeaderButton onPress={() => router.replace('/stats')}>
          <IconArrowLeft size={20} color="white" />
        </HeaderButton>

        <View className="items-center">
          <Text className="font-inter-bold text-header">{selectedAlgSet.name}</Text>
        </View>

        <HeaderButton onPress={() => setSortAsc(prev => !prev)}>
          {sortAsc ? (
            <IconSortAscending size={20} color="white" />
          ) : (
            <IconSortDescending size={20} color="white" />
          )}
        </HeaderButton>
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
            renderItem={({ item }) => <CaseRow c={item} event={selectedAlgSet.event} />}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{ gap: 12, padding: 12, paddingBottom: insets.bottom + 210 }}
            initialNumToRender={20}
            maxToRenderPerBatch={10}
            windowSize={10}
          />
        </Animated.View>
      )}
    </View>
  );
}
