import { useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconArrowLeft } from '@tabler/icons-react-native';
import { HeaderButton } from '@/components/HeaderButton';
import { AlgSetForm } from '@/components/AlgSetForm';
import { useAlgSetStore } from '@/src/store/algsetStore';
import { editAlgset } from '@/src/logic/algsets';
import { getAlgSet } from '@/src/db/queries';
import { showToast } from '@/utils/toast';
import type { AlgSet } from '@/types';

const TOAST_DURATION = 2500;

export default function EditAlgSet() {
  const router = useRouter();
  const { name } = useLocalSearchParams<{ name: string }>();
  const algsets = useAlgSetStore(s => s.algSets);
  const selectedAlgSet = useAlgSetStore(s => s.selectedAlgSet);
  const setSelectedAlgSet = useAlgSetStore(s => s.setSelectedAlgSet);
  const loadAlgSets = useAlgSetStore(s => s.loadAlgSets);

  const algset = algsets.find(a => a.name === name) ?? null;

  useEffect(() => {
    if (algset === null) router.back();
  }, [algset, router]);

  if (algset === null) return null;

  const handleEdit = (editedAlgset: AlgSet) => {
    const editSuccessful = editAlgset(algset, editedAlgset);
    if (editSuccessful) {
      loadAlgSets();
      const refreshed = getAlgSet(editedAlgset.name);
      if (refreshed && selectedAlgSet?.name === algset.name) {
        setSelectedAlgSet(refreshed);
      }
      showToast(`${algset.name} edited successfully!`, TOAST_DURATION);
    }
    router.back();
  };

  return (
    <View className="flex-1 pt-16">
      <View className="flex-row items-center px-4 mb-4">
        <HeaderButton onPress={() => router.back()}>
          <IconArrowLeft size={20} color="white" />
        </HeaderButton>
        <Text className="flex-1 text-subheader text-center">Edit Algorithm Set</Text>
        <View className="w-11" />
      </View>
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 36 }}>
        <AlgSetForm
          submitLabel="Save"
          initialAlgSet={algset}
          onSubmit={handleEdit}
        />
      </ScrollView>
    </View>
  );
}
