import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { IconArrowLeft } from '@tabler/icons-react-native';
import { HeaderButton } from '@/components/HeaderButton';
import { FolderForm } from '@/components/FolderForm';
import { useFolderStore } from '@/src/store/folderStore';
import { showToast } from '@/utils/toast';
import type { Folder } from '@/types';

const TOAST_DURATION = 2500;

export default function CreateFolder() {
  const router = useRouter();
  const addFolder = useFolderStore(s => s.addFolder);

  const handleCreate = (folder: Folder, algsetNamesToAssign: string[]) => {
    const created = addFolder(folder, algsetNamesToAssign);
    if (!created) {
      showToast(`Failed to create ${folder.name}`, TOAST_DURATION);
      return;
    }
    showToast(`${folder.name} added!`, TOAST_DURATION);
    router.back();
  };

  return (
    <View className="flex-1 pt-16">
      <View className="flex-row items-center px-4 mb-4">
        <HeaderButton onPress={() => router.back()}>
          <IconArrowLeft size={20} color="white" />
        </HeaderButton>
        <Text className="flex-1 text-subheader text-center">New Folder</Text>
        <View className="w-11" />
      </View>
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 36 }}>
        <FolderForm submitLabel="Create" onSubmit={handleCreate} />
      </ScrollView>
    </View>
  );
}
