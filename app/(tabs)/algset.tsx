import { View, Text, FlatList } from 'react-native';
import { applyScramble } from '@/src/utils/scramble';
import { useEffect, useState } from 'react';
import { useAlgSetStore } from '@/src/store/algsetStore';
import type { CaseWithProgress } from '@/src/logic/caseQueue';
import { convertScoreToPercentage } from '@/src/utils/fluency';
import { getAllCasesWithProgress } from '@/src/utils/case';
import { DrawScramble } from '@/components/DrawScramble';

export default function Algset() {
  const selectedAlgSet = useAlgSetStore(s => s.selectedAlgSet);
  const [cases, setCases] = useState<CaseWithProgress[]>([]);

  useEffect(() => {
    if (selectedAlgSet === null) return;
    getAllCasesWithProgress(selectedAlgSet.name).then(setCases)
  }, [selectedAlgSet])


  if (selectedAlgSet === null) return;

  return (
    <View className="pt-16">
      <Text className="font-inter-bold text-center text-header">{selectedAlgSet.name}</Text>

      <FlatList
        data={cases}
        renderItem={({ item }) => <CaseRow c={item} />}
        keyExtractor={c => c.id!.toString()}
        contentContainerStyle={{ gap: 12, padding: 12 }}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
      >
        <Text>
          {selectedAlgSet.name}
        </Text>

        <View className="flex flex-col gap-3 overflow-y-scroll">
          {cases.map((c) => {
            return (
              <View key={c.id}>

                <CaseRow c={c} />
              </View>
            )
          })}

        </View>
      </FlatList>
    </View>
  )
}

function CaseRow({ c }: { c: CaseWithProgress }) {

  if (c.alg === undefined) return;
  return (
    <View className="w-full bg-white py-3 rounded-xl justify-between items-center flex flex-row px-3 min-h-20">
      <View className="flex-1 mr-3">

        <Text className="">
          {c.alg}
        </Text>
        <Text className="">
          Fluency: {convertScoreToPercentage(c.fluency).toFixed(2)}%
        </Text>
      </View>
      <View className="flex-shrink-0">
        <DrawScramble scramble={c.alg} scale={0.5} />
      </View>
    </View>
  )

}
