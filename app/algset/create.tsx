import { View, Text, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { IconArrowLeft } from '@tabler/icons-react-native';
import { HeaderButton } from '@/components/HeaderButton';
import { AlgSetForm } from '@/components/AlgSetForm';
import { useAlgSetStore } from '@/src/store/algsetStore';
import { getAlgSet } from '@/src/db/queries';
import { showToast } from '@/utils/toast';
import type { AlgSet } from '@/types';

const TOAST_DURATION = 2500;

export default function CreateAlgSet() {
  const router = useRouter();
  const addAlgSet = useAlgSetStore(s => s.addAlgSet);
  const setSelectedAlgSet = useAlgSetStore(s => s.setSelectedAlgSet);

  const handleCreate = (algset: AlgSet) => {
    const created = addAlgSet(algset);
    if (!created) {
      showToast(`Failed to create ${algset.name}`, TOAST_DURATION);
      return;
    }
    const refreshed = getAlgSet(algset.name);
    if (refreshed) {
      setSelectedAlgSet(refreshed);
    }
    showToast(`${algset.name} added!`, TOAST_DURATION);
    router.back();
  };

  return (
    <View className="flex-1 pt-16">
      <View className="flex-row items-center px-4 mb-4">
        <HeaderButton onPress={() => router.back()}>
          <IconArrowLeft size={20} color="white" />
        </HeaderButton>
        <Text className="flex-1 text-subheader text-center">Create new Algorithm Set</Text>
        <View className="w-11" />
      </View>
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 36 }}>
        <AlgSetForm submitLabel="Create" onSubmit={handleCreate} />
      </ScrollView>
    </View>
  );
}
