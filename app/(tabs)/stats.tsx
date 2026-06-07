import { Text, View, Button } from 'react-native';
import { Link } from 'expo-router';
import { getAlgSetProgress } from '@/src/db/queries';
import { useAlgSetStore } from '@/src/store/algsetStore';
import { type AlgSetProgress } from '@/src/db/queries';


export default function Stats() {
  const selectedAlgSet = useAlgSetStore(s => s.selectedAlgSet);
  const algSetProgress = getAlgSetProgress(selectedAlgSet!.name);
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

function AlgProgressBar({ algSetProgress }: {
  algSetProgress: AlgSetProgress,
}) {
  const total = algSetProgress.total;
  const learning = algSetProgress.learning;
  const mastered = algSetProgress.mastered;
  const reviewing = algSetProgress.reviewing;

  const remaining = total - learning - mastered - reviewing;

  const learningPct = (learning / total) * 100;
  const masteredPct = (mastered / total) * 100;
  const reviewingPct = (reviewing / total) * 100;
  const remainingPct = (remaining / total) * 100;

  return (
    <View className="w-full">
      <View className="flex-row h-2 rounded-full overflow-hidden bg-gray-100">
        <View style={{ width: `${masteredPct}%` }} className="bg-accent" />
        <View style={{ width: `${learningPct}%` }} className="bg-yellow-400" />
        <View style={{ width: `${reviewingPct}%` }} className="bg-blue-400" />
        <View style={{ width: `${remainingPct}%` }} className="bg-gray-200" />
      </View>
      <View className="flex-col justify-between mt-1">

        <View className='flex flex-row justify-between'>

          <ProgressBarLegendTitle color="bg-accent" numCases={mastered} category="mastered" />
          <ProgressBarLegendTitle color="bg-yellow-400" numCases={reviewing} category="reviewing" />
          <ProgressBarLegendTitle color="bg-blue-400" numCases={learning} category="learning" />
          <ProgressBarLegendTitle color="bg-gray-200" numCases={remaining} category="remaining" />
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
