import { Text, View, Pressable, FlatList } from 'react-native';
import { getAlgSet } from '@/src/db/queries';
import { useEffect, useState, useCallback, useRef } from 'react';
import { editAlgset } from '@/src/logic/algsets';
import { showToast } from '@/utils/toast';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, interpolateColor,
} from 'react-native-reanimated';

import { Fab } from '@/components/Fab';
import { type AlgSet } from '@/src/logic/algsets';
import { useAlgSetStore } from '@/src/store/algsetStore';
import { CreateAlgSetSheet, CreateAlgSetSheetRef } from '@/components/CreateAlgSheet';
import { getAlgSetFluencyPercentage } from '@/src/logic/fluency';
import { EditAlgSetSheet, EditAlgSetSheetRef } from '@/components/EditAlgSetSheet';
import { useFocusEffect } from 'expo-router';
import { getDisplayCaseScramble } from '@/src/logic/case';
import { DrawScramble } from '@/components/DrawScramble';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

//TODO: scramble displayed is just the inverse of the fetched algorithm


const TOAST_DURATION = 2500;

const COLOR_TRANSITION_DURATION = 150;

function AlgSetRow({ algset }: { algset: AlgSet }) {
  const isSelected = useAlgSetStore(s => s.selectedAlgSet?.name === algset.name);
  const setSelectedAlgSet = useAlgSetStore(s => s.setSelectedAlgSet);
  const [scramble, setScramble] = useState<string | null>(null);

  const translateY = useSharedValue(0);
  const selected = useSharedValue(isSelected ? 1 : 0);
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
    backgroundColor: interpolateColor(selected.value, [0, 1], ['#ffffff', '#e899f2']),
  }));

  useFocusEffect(
    useCallback(() => {
      opacity.value = 0;
      opacity.value = withTiming(1, { duration: 300 });
    }, [])
  );

  useEffect(() => {
    getDisplayCaseScramble(algset.name).then(setScramble);
  }, [algset]);

  useEffect(() => {
    if (isSelected) {
      selected.value = withTiming(1, { duration: COLOR_TRANSITION_DURATION })
    } else {
      selected.value = withTiming(0, { duration: COLOR_TRANSITION_DURATION });
    }

  }, [isSelected]);
  const handlePress = () => {
    if (isSelected) return;
    translateY.value = withTiming(-10, { duration: 200 }, () => {
      translateY.value = withTiming(0, { duration: 350 });
    });
    setSelectedAlgSet(algset);
  };

  return (
    <Animated.View style={animatedStyle} className="w-full p-3 flex flex-row justify-between rounded-xl">
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
        {scramble ? (
          <DrawScramble scramble={scramble} scale={0.6} />
        ) : (
          <View className="h-16 w-16 bg-gray-200 rounded-xl" />
        )}
      </Pressable>
    </Animated.View>
  );
}


export default function Select() {
  const algsets = useAlgSetStore(s => s.algSets);
  const loadAlgSets = useAlgSetStore(s => s.loadAlgSets);
  const addAlgSet = useAlgSetStore(s => s.addAlgSet);
  const selectedAlgSet = useAlgSetStore(s => s.selectedAlgSet);

  const setSelectedAlgSet = useAlgSetStore(s => s.setSelectedAlgSet);
  const deleteAlgSet = useAlgSetStore(s => s.deleteAlgSet);

  const insets = useSafeAreaInsets();
  const createSheetRef = useRef<CreateAlgSetSheetRef>(null);
  const editSheetRef = useRef<EditAlgSetSheetRef>(null);

  useFocusEffect(
    useCallback(() => {
      loadAlgSets();
    }, [])
  );

  const displayCreateAlgSetSheet = useCallback(() => {
    createSheetRef.current?.present();
  }, []);

  const displayEditAlgSetSheet = useCallback(() => {
    if (selectedAlgSet === null) return;
    editSheetRef.current?.present();
  }, [selectedAlgSet]);

  return (
    <View className="items-center flex-1 justify-start flex-col pt-16">
      <Text className="text-header mb-2">Select Algorithm Set</Text>
      {algsets.length > 0 && (
        <FlatList
          className="w-full flex-1"
          data={algsets}
          contentContainerStyle={{ gap: 12, padding: 12, paddingBottom: insets.bottom + 75 }}
          renderItem={({ item }) => <AlgSetRow algset={item} />}
          keyExtractor={(item) => item.name}
          initialNumToRender={10}
          maxToRenderPerBatch={20}
          windowSize={20}
        />
      )}
      <Fab
        onCreate={displayCreateAlgSetSheet}
        onEdit={displayEditAlgSetSheet}

        onDelete={() => {
          if (selectedAlgSet === null) return;
          const algToDelete = selectedAlgSet.name;
          if (deleteAlgSet(selectedAlgSet)) {
            showToast(`${algToDelete} deleted successfully!`, TOAST_DURATION);
          } else {
            showToast('Must have at least one algset');
          }
        }}
      />
      <EditAlgSetSheet
        algset={selectedAlgSet!}
        ref={editSheetRef}
        onEdit={(algset: AlgSet, editedAlgset: AlgSet) => {
          const editSuccessful = editAlgset(algset, editedAlgset)
          if (editSuccessful) {
            loadAlgSets();
            const refreshed = getAlgSet(editedAlgset.name);
            if (refreshed) {
              setSelectedAlgSet(refreshed);
            }
            showToast(`${algset.name} edited successfully!`, TOAST_DURATION);
          }
        }
        }
      />

      <CreateAlgSetSheet
        ref={createSheetRef}
        onCreate={(algset) => {
          addAlgSet(algset);
          showToast(`${algset.name} added!`, TOAST_DURATION);
          setSelectedAlgSet(algset);
        }}
      />
    </View>
  );
}
