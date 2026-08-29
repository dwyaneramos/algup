import { useRef, useState, useEffect } from 'react';
import { Text, View, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { IconChevronDown } from '@tabler/icons-react-native';
import { validateAlgSet } from '@/src/logic/algsets';
import { useAlgSetStore } from '@/src/store/algsetStore';
import { useFolderStore } from '@/src/store/folderStore';
import { COLOR_MUTED } from '@/utils/constants/colors';
import type { AlgSet, CubeEvent } from '@/types';

const MIN_ALGS_TEXTAREA_HEIGHT = 40;

const EVENT_OPTIONS: { value: CubeEvent; label: string }[] = [
  { value: '333', label: '3x3' },
  { value: '222', label: '2x2' },
];

type AlgSetFormProps = {
  title: string;
  submitLabel: string;
  initialAlgSet?: AlgSet;
  onSubmit: (algset: AlgSet) => void;
};

export function AlgSetForm({ title, submitLabel, initialAlgSet, onSubmit }: AlgSetFormProps) {
  const { height: screenHeight } = useWindowDimensions();
  const algsets = useAlgSetStore(s => s.algSets);

  const [name, setName] = useState(initialAlgSet?.name ?? '');
  const [event, setEvent] = useState<CubeEvent>(initialAlgSet?.event ?? '333');
  const folders = useFolderStore(s => s.folders);
  const [folderName, setFolderName] = useState<string | null>(initialAlgSet?.folder ?? null);
  const [folderPickerOpen, setFolderPickerOpen] = useState(false);
  const isEditing = !!initialAlgSet;
  const [algsText, setAlgsText] = useState(
    initialAlgSet?.cases.map(c => c.alg).join('\n') ?? ''
  );
  const numAlgsEntered = useRef(initialAlgSet?.cases.length ?? 0);

  const handleAlgsChange = (text: string) => {
    setAlgsText(text.replace(/[’‘]/g, "'"));
    numAlgsEntered.current = text.split('\n').filter(line => line.trim().length > 0).length;
  };

  const handleSubmit = () => {
    const cases = algsText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(alg => ({ alg }));

    const algsetToStore: AlgSet = { name: name.trim(), event, cases, folder: folderName };

    const otherAlgsets = initialAlgSet
      ? algsets.filter(a => a.name !== initialAlgSet.name)
      : algsets;

    const validationError = validateAlgSet(algsetToStore, otherAlgsets);
    if (validationError.length !== 0) {
      alert(validationError);
      return;
    }
    onSubmit(algsetToStore);
  };

  return (
    <View className="flex flex-col gap-3 items-center">
      <Text className="text-subheader w-[80vw]">{title}</Text>

      <View className="flex flex-col gap-1">
        <Text className="text-form-header">Algorithm Set Name</Text>
        <BottomSheetTextInput
          className="border border-gray-400 rounded-lg p-2 w-[80vw]"
          onChangeText={setName}
          value={name}
          maxLength={16}
        />
      </View>

      <View className="flex flex-col gap-1">
        <Text className="text-form-header">Event</Text>
        <View
          className={`flex flex-row w-[80vw] rounded-lg border border-gray-400 overflow-hidden ${isEditing ? 'opacity-50' : ''}`}
        >
          {EVENT_OPTIONS.map(({ value, label }) => (
            <Pressable
              key={value}
              disabled={isEditing}
              onPress={() => setEvent(value)}
              className={`flex-1 p-2 items-center ${event === value ? 'bg-accent' : ''}`}
            >
              <Text className={`text-body ${event === value ? 'text-white' : ''}`}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View className="flex flex-col gap-1">
        <Text className="text-form-header">Parent Folder</Text>
        <Pressable
          onPress={() => setFolderPickerOpen((open) => !open)}
          className="flex flex-row justify-between items-center border border-gray-400 rounded-lg p-2 w-[80vw]"
        >
          <Text className="text-body">{folderName ?? 'None'}</Text>
          <IconChevronDown size={18} color={COLOR_MUTED} />
        </Pressable>
        {folderPickerOpen && (
          <View className="border border-gray-400 rounded-lg w-[80vw]">
            <Pressable
              onPress={() => { setFolderName(null); setFolderPickerOpen(false); }}
              className="p-2"
            >
              <Text className="text-body">None</Text>
            </Pressable>
            {folders.map((folder) => (
              <Pressable
                key={folder.name}
                onPress={() => { setFolderName(folder.name); setFolderPickerOpen(false); }}
                className="p-2"
              >
                <Text className="text-body">{folder.name}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View className="flex flex-col gap-1">
        <View className="flex flex-row justify-between w-[80vw] items-end gap-2">
          <Text className="text-form-header">Algorithms</Text>
          <Text className="text-muted">
            {numAlgsEntered.current} alg{numAlgsEntered.current !== 1 ? 's' : ''}
          </Text>
        </View>
        <BottomSheetTextInput
          className="border border-gray-400 rounded-lg p-2 w-[80vw]"
          style={[styles.algsInput, { minHeight: MIN_ALGS_TEXTAREA_HEIGHT, maxHeight: screenHeight * 0.5 }]}
          multiline
          keyboardType="ascii-capable"
          autoCorrect={false}
          autoCapitalize="none"
          placeholder="One alg per line"
          onChangeText={handleAlgsChange}
          value={algsText}
        />
      </View>

      <Pressable className="rounded-full bg-accent p-3 cursor-pointer w-32" onPress={handleSubmit}>
        <Text className="text-white text-center">{submitLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  algsInput: {
    textAlignVertical: 'top',
  },
});
