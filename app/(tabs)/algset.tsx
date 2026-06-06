import { Text, View, Button } from 'react-native';
import { useEffect, useState } from 'react';
import { getAlgSets } from '@/src/db/queries';
import { type AlgSet } from '@/src/logic/algsets';

function AlgSetRow({ name }: { name: string }) {
  return (
    <View className="w-full bg-red-300">
      <Text >
        {name}
      </Text>
    </View>
  )

}

export default function Algset() {
  const [algsets, setAlgsets] = useState<AlgSet[]>([])

  useEffect(() => {
    const retrievedAlgsets = getAlgSets();
    setAlgsets(retrievedAlgsets);
  }, [])


  return (
    <View className="items-center flex-1 justify-center bg-white">
      <Text>Select Alg set</Text>
      {algsets.length > 0 &&
        <View className="w-full gap-3">
          {
            algsets.map((algset: AlgSet) => {
              return (
                <View key={algset.name}>
                  <AlgSetRow name={algset.name} />
                </View>
              )

            })}
        </View>


      }
    </View>
  );
}
