import { Text, View, Button } from 'react-native';
import { useEffect, useState } from 'react';
import { getAlgSets } from '@/src/db/queries';
import { type AlgSet } from '@/src/logic/algsets';

function AlgSetRow({ name, algCount }: { name: string, algCount: number }) {
  return (
    <View
      className="w-full bg-white p-3 flex flex-row justify-between rounded-xl"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View className="flex flex-col justify-center">

        <Text className="font-inter-semibold text-xl">
          {name}
        </Text>
        <Text className="font-inter-medium ">
          XX.X% Confidence
        </Text>
        <Text className="font-inter-medium ">
          {algCount} Algorithms
        </Text>
      </View>

      <View className='h-16 w-16 bg-gray-300'>

      </View>
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
        <View className="w-full gap-3 px-3">
          {
            algsets.map((algset: AlgSet) => {
              return (
                <View key={algset.name}>
                  <AlgSetRow name={algset.name} algCount={algset.cases.length} />
                </View>
              )

            })}
        </View>


      }
    </View>
  );
}
