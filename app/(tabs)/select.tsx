import { Text, View, Pressable, FlatList } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';

import Fab from '@/components/Fab';
import { useEffect, useState, useCallback } from 'react';
import { type AlgSet } from '@/src/logic/algsets';
import { useAlgSetStore } from '@/src/store/algsetStore';
import { getAlgSetFluencyPercentage } from '@/src/logic/fluency';
import { useFocusEffect } from 'expo-router';
import { getDisplayCaseScramble } from '@/src/logic/case';
import { DrawScramble } from '@/components/DrawScramble';

const newAlgset: AlgSet =
{
  name: 'teehee',
  cases: [
    { alg: "R U R' U R U2 R'" },
    { alg: "R U2 R' U' R U' R'" },
  ]
}

//TODO: scramble displayed is just the inverse of the fetched algorithm

function AlgSetRow({ algset }: { algset: AlgSet }) {
  const isSelected = useAlgSetStore(s => s.selectedAlgSet?.name === algset.name);
  const setSelectedAlgSet = useAlgSetStore(s => s.setSelectedAlgSet);
  const [scramble, setScramble] = useState<string | null>(null);
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
    getDisplayCaseScramble(algset.name).then(setScramble);
  }, [algset.name]);

  useEffect(() => {
    selected.value = withTiming(isSelected ? 1 : 0, { duration: 150 });
  }, [isSelected]);

  const handlePress = () => {
    if (isSelected) return;
    selected.value = withTiming(1, { duration: 150 });
    translateY.value = withTiming(-10, { duration: 200 }, () => {
      translateY.value = withTiming(0, { duration: 350 });
    });
    setSelectedAlgSet(algset);
  };

  if (scramble === null) return null;

  return (
    <Animated.View
      style={animatedStyle}
      className="w-full p-3 flex flex-row justify-between rounded-xl"
    >
      <Pressable onPress={handlePress} className="flex-1 flex-row justify-between">
        <View className="flex flex-col justify-center">
          <Text className="font-inter-semibold text-xl">{algset.name}</Text>
          <Text className={`font-inter-medium ${isSelected ? 'text-black' : 'text-muted'}`}>
            {getAlgSetFluencyPercentage(algset.name).toFixed(2)}% Fluency
          </Text>
          <Text className={`font-inter-medium ${isSelected ? 'text-black' : 'text-muted'}`}>
            {algset.cases.length} Algorithms
          </Text>
        </View>
        <DrawScramble scramble={scramble} scale={0.6} />
      </Pressable>
    </Animated.View>
  );
}


//<FlatList
//  data={sortedCases}
//  renderItem={({ item }) => <CaseRow c={item} />}
//  keyExtractor={(_, index) => index.toString()}
//  contentContainerStyle={{ gap: 12, padding: 12, paddingBottom: insets.bottom + 210 }}
//  initialNumToRender={20}
//  maxToRenderPerBatch={10}
//  windowSize={10}
///>
export default function Select() {
  const algsets = useAlgSetStore(s => s.algSets);
  const loadAlgSets = useAlgSetStore(s => s.loadAlgSets);
  const addAlgSet = useAlgSetStore(s => s.addAlgSet);

  useFocusEffect(
    useCallback(() => {
      loadAlgSets();
    }, [])
  );

  return (
    <View className="items-center flex-1 justify-start flex-col pt-16">
      <Text className="text-header mb-10">Select Algorithm Set</Text>
      {algsets.length > 0 && (
        <FlatList
          className="w-full flex-1"
          data={algsets}
          renderItem={({ item }) => <AlgSetRow algset={item} />}
          keyExtractor={(item) => item.name}
          contentContainerStyle={{ gap: 12, padding: 12 }}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={false}
        />
      )}
      <Fab onPress={() => addAlgSet(newAlgset)} />
    </View>
  );
}
