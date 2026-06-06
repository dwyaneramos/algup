import { Text, View, Button, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, interpolateColor } from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import { getAlgSets } from '@/src/db/queries';
import { type AlgSet } from '@/src/logic/algsets';
import { useAlgSetStore } from '@/src/store/algsetStore';

function AlgSetRow({ algset }: { algset: AlgSet }) {
  const { selectedAlgSet, setSelectedAlgSet } = useAlgSetStore();
  const isSelected = selectedAlgSet?.name === algset.name;
  const translateY = useSharedValue(0);
  const selected = useSharedValue(isSelected ? 1 : 0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    backgroundColor: interpolateColor(
      selected.value,
      [0, 1],
      ['#ffffff', '#e899f2']
    ),
  }));

  useEffect(() => {
    selected.value = withTiming(isSelected ? 1 : 0, { duration: 300 });
  }, [isSelected]);

  const handlePress = () => {
    setSelectedAlgSet(algset);
    translateY.value = withTiming(-10, { duration: 200 }, () => {
      translateY.value = withTiming(0, { duration: 350 });
    });
  };

  return (
    <Animated.View
      style={[animatedStyle]}
      className="w-full p-3  bg-white flex flex-row justify-between rounded-xl"
    >
      <Pressable onPress={handlePress} className="flex-1 flex-row justify-between">
        <View className="flex flex-col justify-center">
          <Text className="font-inter-semibold text-xl">{algset.name}</Text>
          <Text className="font-inter-medium">XX.X% Confidence</Text>
          <Text className="font-inter-medium">{algset.cases.length} Algorithms</Text>
        </View>
        <View className="h-16 w-16 bg-gray-300" />
      </Pressable>
    </Animated.View>
  );
}

export default function Algset() {
  const [algsets, setAlgsets] = useState<AlgSet[]>([])

  useEffect(() => {
    const retrievedAlgsets = getAlgSets();
    setAlgsets(retrievedAlgsets);
  }, [])


  return (
    <View className="items-center flex-1 justify-center">
      <Text className="text-header mb-10">Select Algorithm Set</Text>
      {algsets.length > 0 &&
        <View className="w-full gap-3 px-3">
          {
            algsets.map((algset: AlgSet) => {
              return (
                <View key={algset.name}>
                  <AlgSetRow algset={algset} />
                </View>
              )

            })}
        </View>


      }
    </View>
  );
}
