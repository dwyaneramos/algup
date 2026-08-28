import { Text, View, Pressable, FlatList } from 'react-native';
import { getAlgSet } from '@/src/db/queries';
import { useCallback, useRef } from 'react';
import { editAlgset } from '@/src/logic/algsets';
import { showToast } from '@/utils/toast';
import { useSettingsStore } from '@/src/store/settingsStore';

import { Fab } from '@/components/Fab';
import { useAlgSetStore } from '@/src/store/algsetStore';
import { CreateAlgSetSheet } from '@/components/CreateAlgSetSheet';
import { AlgSetRow } from '@/components/AlgSetRow';
import { EditAlgSetSheet } from '@/components/EditAlgSetSheet';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sheet } from '@/components/Sheet'
import type { AlgSet, CreateAlgSetSheetRef, EditAlgSetSheetRef, FabRef, SheetRef } from '@/types';


const TOAST_DURATION = 2500;

export default function Select() {
  const algsets = useAlgSetStore(s => s.algSets);
  const loadAlgSets = useAlgSetStore(s => s.loadAlgSets);
  const addAlgSet = useAlgSetStore(s => s.addAlgSet);
  const selectedAlgSet = useAlgSetStore(s => s.selectedAlgSet);

  const shiftNavbarUp = useSettingsStore((s) => s.shiftNavbarUp);

  const setSelectedAlgSet = useAlgSetStore(s => s.setSelectedAlgSet);
  const deleteAlgSet = useAlgSetStore(s => s.deleteAlgSet);

  const insets = useSafeAreaInsets();
  const createSheetRef = useRef<CreateAlgSetSheetRef>(null);
  const editSheetRef = useRef<EditAlgSetSheetRef>(null);
  const deleteConfirmSheetRef = useRef<SheetRef>(null);
  const fabRef = useRef<FabRef>(null);

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

  const displayConfirmDeleteSheet = useCallback(() => {
    if (selectedAlgSet === null) return;
    deleteConfirmSheetRef.current?.present();
  }, [selectedAlgSet]);

  return (
    <View
      className="items-center flex-1 justify-start flex-col pt-16"
      onTouchStart={() => fabRef.current?.close()}
    >
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
        ref={fabRef}
        onCreate={displayCreateAlgSetSheet}
        onEdit={displayEditAlgSetSheet}
        onDelete={() => {
          displayConfirmDeleteSheet()
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
        }}
      />


      <Sheet ref={deleteConfirmSheetRef} snapPoints={[!shiftNavbarUp ? "20%" : "25%"]}>
        <View className="flex flex-col gap-4 items-center ">
          <Text className="text-form-header">Are you sure you want to delete {selectedAlgSet?.name}?</Text>
          <Pressable className="rounded-full bg-red-500 p-4"
            onPress={() => {
              if (selectedAlgSet === null) return;
              const algToDelete = selectedAlgSet.name;
              if (deleteAlgSet(selectedAlgSet)) {
                showToast(`${algToDelete} deleted successfully!`, TOAST_DURATION);
              } else {
                showToast('Must have at least one algset');
              }
              deleteConfirmSheetRef.current?.dismiss();
            }
            }
          >
            <Text className="text-white ">Confirm</Text>

          </Pressable>
        </View>

      </Sheet>
    </View>
  );
}
