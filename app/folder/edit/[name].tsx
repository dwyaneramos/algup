import { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconArrowLeft } from '@tabler/icons-react-native';
import { HeaderButton } from '@/components/HeaderButton';
import { FolderForm } from '@/components/FolderForm';
import { useFolderStore } from '@/src/store/folderStore';
import { useAlgSetStore } from '@/src/store/algsetStore';
import { showToast } from '@/utils/toast';
import type { Folder } from '@/types';

const TOAST_DURATION = 2500;

export default function EditFolder() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
  const folders = useFolderStore(s => s.folders);
  const updateFolder = useFolderStore(s => s.updateFolder);
  const algsets = useAlgSetStore(s => s.algSets);

  const folder = folders.find(f => f.name === name) ?? null;

  useEffect(() => {
    if (folder === null) router.back();
  }, [folder, router]);

  if (folder === null) return null;

  const handleEdit = (edited: Folder, algsetNamesToAssign: string[]) => {
    const oldMemberNames = algsets.filter((a) => a.folder === folder.name).map((a) => a.name);
    const editSuccessful = updateFolder(folder, edited, oldMemberNames, algsetNamesToAssign);
    if (editSuccessful) {
      showToast(`${folder.name} edited successfully!`, TOAST_DURATION);
    }
    router.back();
  };

  return (
    <View className="flex-1 pt-16">
      <View className="flex-row items-center px-4 mb-4">
        <HeaderButton onPress={() => router.back()}>
          <IconArrowLeft size={20} color="white" />
        </HeaderButton>
        <Text className="flex-1 text-subheader text-center">Edit Folder</Text>
        <View className="w-11" />
      </View>
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 36 }}>
        <FolderForm
          submitLabel="Save"
          initialFolder={folder}
          onSubmit={handleEdit}
        />
      </ScrollView>
    </View>
  );
}
