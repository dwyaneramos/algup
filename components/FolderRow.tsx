import { Text, View, Pressable } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import Animated, {
  FadeIn, FadeOut, useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import { useAlgSetStore } from '@/src/store/algsetStore';
import { AlgSetRow } from '@/components/AlgSetRow';
import { DrawScramble } from '@/components/DrawScramble';
import { getFirstAlgSetInFolder, getFirstCase } from '@/src/db/queries';
import { invertAlgorithm } from '@/src/logic/scramble';
import type { AlgSet, Folder } from '@/types';

const PRESS_SCALE = 0.97;

type FolderRowProps = {
  folder: Folder;
  algsets: AlgSet[];
  onLongPress: (folder: Folder) => void;
  onLongPressAlgSet: (algset: AlgSet) => void;
};

export function FolderRow({ folder, algsets, onLongPress, onLongPressAlgSet }: FolderRowProps) {
  const selectedAlgSetName = useAlgSetStore(s => s.selectedAlgSet?.name);
  const [expanded, setExpanded] = useState(false);
  const [scramble, setScramble] = useState<string | null>(null);
  const scale = useSharedValue(1);

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(PRESS_SCALE);
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1);
  }, [scale]);

  useEffect(() => {
    const firstAlgSet = getFirstAlgSetInFolder(folder.name);
    if (!firstAlgSet) {
      setScramble('');
      return;
    }
    const firstCase = getFirstCase(firstAlgSet.name);
    setScramble(firstCase?.alg ?? '');
  }, [folder.name, algsets.length]);

  const toggleExpanded = () => {
    setExpanded((current) => !current);
  };

  const selectedChild = algsets.find(a => a.name === selectedAlgSetName);
  const previewEvent = algsets[0]?.event ?? '333';

  return (
    <View className="w-full flex flex-col gap-2">
      <Animated.View style={pressStyle} className={`w-full py-3 px-3 rounded-2xl  flex flex-row justify-between min-h-20 ${selectedChild ? 'bg-accent-light' : ''}`}>
        <Pressable
          onPress={toggleExpanded}
          onLongPress={() => onLongPress(folder)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className="flex-1 flex-row justify-between"
        >
          <View className="flex flex-col justify-center">
            <Text className="font-inter-semibold text-xl">{folder.name}</Text>
            <Text className={`font-inter-medium ${selectedChild ? "text-black" : "text-muted"}`}>
              {selectedChild ? `${selectedChild.name} selected` : 'No algset selected'}
            </Text>
            <Text className={`font-inter-medium ${selectedChild ? "text-black" : "text-muted"}`}>
              {algsets.length} algset{algsets.length !== 1 ? 's' : ''}
            </Text>
          </View>
          {scramble !== null ? (
            <DrawScramble
              scramble={scramble ? invertAlgorithm(scramble) : ''}
              scale={0.6}
              event={previewEvent}
            />
          ) : (
            <View className="h-16 w-16 bg-gray-200 rounded-xl" />
          )}
        </Pressable>
      </Animated.View>

      {
        expanded && (
          <View className="flex flex-col gap-2 pl-4">
            {algsets.map((algset) => (
              <Animated.View
                key={algset.name}
                entering={FadeIn.duration(220)}
                exiting={FadeOut.duration(180)}
              >
                <AlgSetRow algset={algset} onLongPress={onLongPressAlgSet} />
              </Animated.View>
            ))}
          </View>
        )
      }
    </View >
  );
}
