import { Text, View, Pressable, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, FadeIn, FadeOut,
} from 'react-native-reanimated';
import { IconChevronDown, IconDotsVertical } from '@tabler/icons-react-native';
import { useAlgSetStore } from '@/src/store/algsetStore';
import { AlgSetRow } from '@/components/AlgSetRow';
import { DrawScramble } from '@/components/DrawScramble';
import { getFirstAlgSetInFolder, getFirstCase } from '@/src/db/queries';
import { invertAlgorithm } from '@/src/logic/scramble';
import { COLOR_MUTED } from '@/utils/constants/colors';
import type { AlgSet, Folder } from '@/types';

const CHEVRON_ROTATION_DURATION = 200;

type FolderRowProps = {
  folder: Folder;
  algsets: AlgSet[];
  onEdit: (folder: Folder) => void;
  onDelete: (folder: Folder) => void;
};

export function FolderRow({ folder, algsets, onEdit, onDelete }: FolderRowProps) {
  const selectedAlgSetName = useAlgSetStore(s => s.selectedAlgSet?.name);
  const [expanded, setExpanded] = useState(false);
  const [scramble, setScramble] = useState<string | null>(null);
  const rotation = useSharedValue(0);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

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
    const next = !expanded;
    rotation.value = withTiming(next ? 180 : 0, { duration: CHEVRON_ROTATION_DURATION });
    setExpanded(next);
  };

  const selectedChild = algsets.find(a => a.name === selectedAlgSetName);
  const previewEvent = algsets[0]?.event ?? '333';

  const openActions = () => {
    Alert.alert(folder.name, undefined, [
      { text: 'Edit', onPress: () => onEdit(folder) },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(folder) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View className="w-full flex flex-col gap-2">
      <View className="w-full bg-white py-3 px-3 rounded-2xl border border-black/5 flex flex-row justify-between min-h-20">
        <Pressable onPress={toggleExpanded} className="flex-1 flex-row justify-between">
          <View className="flex flex-col justify-center">
            <Text className="font-inter-semibold text-xl">{folder.name}</Text>
            <Text className="font-inter-medium text-muted">
              {selectedChild ? `${selectedChild.name} selected` : 'No algset selected'}
            </Text>
            <Text className="font-inter-medium text-muted">
              {algsets.length} algset{algsets.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <View className="flex flex-row items-center gap-2">
            {scramble !== null ? (
              <DrawScramble
                scramble={scramble ? invertAlgorithm(scramble) : ''}
                scale={0.6}
                event={previewEvent}
              />
            ) : (
              <View className="h-16 w-16 bg-gray-200 rounded-xl" />
            )}
            <Animated.View style={chevronStyle}>
              <IconChevronDown size={20} color={COLOR_MUTED} />
            </Animated.View>
          </View>
        </Pressable>
        <Pressable
          hitSlop={12}
          onPress={openActions}
          className="absolute top-2 right-2"
          style={{ zIndex: 10, elevation: 10 }}
        >
          <IconDotsVertical size={18} color={COLOR_MUTED} />
        </Pressable>
      </View>

      {expanded && (
        <View className="flex flex-col gap-2 pl-4">
          {algsets.map((algset) => (
            <Animated.View
              key={algset.name}
              entering={FadeIn.duration(220)}
              exiting={FadeOut.duration(180)}
            >
              <AlgSetRow algset={algset} />
            </Animated.View>
          ))}
        </View>
      )}
    </View>
  );
}
