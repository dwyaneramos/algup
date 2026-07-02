import { Text, View, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';
import Reanimated, {
  withSpring,
  ZoomIn,
  ZoomOut,
} from 'react-native-reanimated';
import { COLOR_ACCENT } from '@/utils/constants/colors';

import { IconPlus } from '@tabler/icons-react-native';
import { useEffect, useState, useCallback } from 'react';
import { getAlgSets } from '@/src/db/queries';
import { type AlgSet } from '@/src/logic/algsets';
import { useAlgSetStore } from '@/src/store/algsetStore';
import { getAlgSetFluencyPercentage } from '@/src/utils/fluency';
import { useFocusEffect } from 'expo-router';
import { getDisplayCaseScramble } from '@/src/utils/case';
import { DrawScramble } from '@/components/DrawScramble';

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

function Fab({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  return (
    <Reanimated.View
      style={{
        position: 'absolute',
        bottom: 32,
        right: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
      }}
    >
      <Reanimated.View style={pressStyle}>
        <Pressable
          onPress={onPress}
          onPressIn={() => { scale.value = withSpring(0.9); }}
          onPressOut={() => { scale.value = withSpring(1); }}
          className="w-16 h-16 rounded-full items-center justify-center"
          style={{ backgroundColor: COLOR_ACCENT }}
        >
          <IconPlus color="white" size={26} />
        </Pressable>
      </Reanimated.View>
    </Reanimated.View>
  );
}

export default function Algsets() {
  const [algsets, setAlgsets] = useState<AlgSet[]>([])

  useFocusEffect(
    useCallback(() => {
      const retrievedAlgsets = getAlgSets();
      setAlgsets(retrievedAlgsets);
    }, [])
  );

  return (
    <View className="items-center flex-1 justify-start flex-col pt-16">
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
      <Fab onPress={() => console.log("AH")} />
    </View>
  );
}
