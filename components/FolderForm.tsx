import { useState } from 'react';
import { Text, View, Pressable, TextInput, ScrollView } from 'react-native';
import { IconSquare, IconSquareCheck } from '@tabler/icons-react-native';
import { validateFolder } from '@/src/logic/folders';
import { useFolderStore } from '@/src/store/folderStore';
import { useAlgSetStore } from '@/src/store/algsetStore';
import { COLOR_ACCENT, COLOR_MUTED } from '@/utils/constants/colors';
import type { Folder } from '@/types';

type FolderFormProps = {
  submitLabel: string;
  initialFolder?: Folder;
  onSubmit: (folder: Folder, algsetNamesToAssign: string[]) => void;
};

export function FolderForm({ submitLabel, initialFolder, onSubmit }: FolderFormProps) {
  const folders = useFolderStore(s => s.folders);
  const algsets = useAlgSetStore(s => s.algSets);

  const [name, setName] = useState(initialFolder?.name ?? '');
  const [selectedNames, setSelectedNames] = useState<string[]>(
    initialFolder ? algsets.filter(a => a.folder === initialFolder.name).map(a => a.name) : []
  );

  const selectableAlgsets = algsets.filter(
    (a) => !a.folder || a.folder === initialFolder?.name
  );

  const toggleAlgSet = (algsetName: string) => {
    setSelectedNames((current) =>
      current.includes(algsetName)
        ? current.filter((n) => n !== algsetName)
        : [...current, algsetName]
    );
  };

  const handleSubmit = () => {
    const folderToStore: Folder = { name: name.trim() };
    const otherFolders = initialFolder
      ? folders.filter((f) => f.name !== initialFolder.name)
      : folders;

    const validationError = validateFolder(folderToStore, otherFolders);
    if (validationError.length !== 0) {
      alert(validationError);
      return;
    }
    onSubmit(folderToStore, selectedNames);
  };

  return (
    <View className="flex flex-col gap-3 items-center">
      <View className="flex flex-col gap-1">
        <Text className="text-form-header">Folder Name</Text>
        <TextInput
          className="border border-gray-400 rounded-lg p-2 w-[80vw]"
          onChangeText={setName}
          value={name}
          maxLength={16}
        />
      </View>

      <View className="flex flex-col gap-1">
        <Text className="text-form-header">
          Add Algorithm Sets ({selectedNames.length} selected)
        </Text>
        <ScrollView className="border border-gray-400 rounded-lg w-[80vw] max-h-48">
          {selectableAlgsets.map((algset) => {
            const checked = selectedNames.includes(algset.name);
            return (
              <Pressable
                key={algset.name}
                onPress={() => toggleAlgSet(algset.name)}
                className="flex flex-row items-center gap-2 p-2"
              >
                {checked ? (
                  <IconSquareCheck size={20} color={COLOR_ACCENT} />
                ) : (
                  <IconSquare size={20} color={COLOR_MUTED} />
                )}
                <Text className="text-body">{algset.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <Pressable className="rounded-full bg-accent p-3 cursor-pointer w-32" onPress={handleSubmit}>
        <Text className="text-white text-center">{submitLabel}</Text>
      </Pressable>
    </View>
  );
}
