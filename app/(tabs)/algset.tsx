import { View, Text, FlatList } from 'react-native';
import { applyScramble } from '@/src/utils/scramble';
import { useEffect, useState } from 'react';
import { useAlgSetStore } from '@/src/store/algsetStore';
import { type Case } from '@/src/logic/algsets';
import { getAllCases } from '@/src/utils/case';
import { DrawScramble } from '@/components/DrawScramble';

export default function Algset() {
  const selectedAlgSet = useAlgSetStore(s => s.selectedAlgSet);
  const [cases, setCases] = useState<Case[]>([]);

  useEffect(() => {
    if (selectedAlgSet === null) return;
    getAllCases(selectedAlgSet.name).then(setCases)
  }, [selectedAlgSet])


  if (selectedAlgSet === null) return;

  return (
    <View className="pt-10">

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

function CaseRow({ c }: { c: Case }) {
  console.log(c.alg)
  const scramble = applyScramble(c.alg);

  if (c.alg === undefined) return;
  return (
    <View className="w-full bg-white rounded-xl h-20">
      <Text>
        {c.alg}
      </Text>
      <DrawScramble scramble={c.alg} />
    </View>
  )

}
