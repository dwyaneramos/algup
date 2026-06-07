import { Text, View, Button } from 'react-native';
import { useFocusEffect, Link } from 'expo-router';
import { useCallback, useState } from 'react';
import { getAlgSetProgress } from '@/src/db/queries';
import { useAlgSetStore } from '@/src/store/algsetStore';
import { type AlgSetProgress } from '@/src/db/queries';


export default function Stats() {
  const selectedAlgSet = useAlgSetStore(s => s.selectedAlgSet);
  const [algSetProgress, setAlgSetProgress] = useState<AlgSetProgress | null>(null);
  useFocusEffect(
    useCallback(() => {
      if (!selectedAlgSet) return;
      const progress = getAlgSetProgress(selectedAlgSet.name);
      setAlgSetProgress(progress);
    }, [selectedAlgSet])
  );

  if (!algSetProgress) return null;
  return (
    <View className=" px-3 items-center flex-1 justify-center bg-white">
      <Text>stats page</Text>
      <Link href="/">go to main page</Link>
      <Link href="/algset">go to algset page</Link>


      <AlgProgressBar
        algSetProgress={algSetProgress}

      />
    </View>
  );
}

interface AlgCategoryAttributes {
  numCases: number,
  color: string,
  header: string
}

function AlgProgressBar({ algSetProgress }: {
  algSetProgress: AlgSetProgress,
}) {
  const total = algSetProgress.total;
  const learning = { numCases: algSetProgress.learning, color: "bg-blue-400", header: "learning" }
  const mastered = { numCases: algSetProgress.mastered, color: "bg-accent", header: "mastered" }
  const reviewing = { numCases: algSetProgress.reviewing, color: "bg-green-400", header: "reviewing" }
  const remaining = { numCases: total - learning.numCases - mastered.numCases - reviewing.numCases, color: "bg-gray-400", header: "remaining" }
  const algCategories: AlgCategoryAttributes[] = [mastered, reviewing, learning, remaining];



  return (
    <View className="w-full">
      <View className="flex-row h-2 rounded-full overflow-hidden bg-gray-100">
        {algCategories.map((c) => {
          return (
            <View key={c.header} style={{ width: `${(c.numCases / total) * 100}%` }} className={c.color} />
          )
        })}
      </View>
      <View className="flex-col justify-between mt-1">

        <View className='flex flex-row justify-between'>
          {algCategories.filter((c) => c.numCases > 0).map((c) => {
            return (
              <View key={c.header}>
                <ProgressBarLegendTitle color={c.color} numCases={c.numCases} category={c.header} />
              </View>
            )
          })}

        </View>
      </View>
    </View>
  );
}

function ProgressBarLegendTitle({ color, numCases, category }: { color: string, numCases: number, category: string }) {
  return (
    <View className="flex flex-row gap-3 items-center">
      <View className={` ${color} h-2 w-2 rounded-full `} />
      <Text className="text-xs text-gray-400">{numCases} {category}</Text>
    </View>

  )

}
