import { Text, View, Pressable, FlatList } from 'react-native';
import { getAlgSet } from '@/src/db/queries';
import { useState, useCallback, useRef } from 'react';
import { editAlgset } from '@/src/logic/algsets';
import { showToast } from '@/utils/toast';
import { useSettingsStore } from '@/src/store/settingsStore';

import { Fab } from '@/components/Fab';
import { useAlgSetStore } from '@/src/store/algsetStore';
import { useFolderStore } from '@/src/store/folderStore';
import { AlgSetRow } from '@/components/AlgSetRow';
import { FolderRow } from '@/components/FolderRow';
import { CreateAlgSetSheet } from '@/components/CreateAlgSetSheet';
import { EditAlgSetSheet } from '@/components/EditAlgSetSheet';
import { CreateFolderSheet } from '@/components/CreateFolderSheet';
import { EditFolderSheet } from '@/components/EditFolderSheet';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sheet } from '@/components/Sheet'
import type {
  AlgSet, Folder, CreateAlgSetSheetRef, EditAlgSetSheetRef, FabRef, SheetRef,
  CreateFolderSheetRef, EditFolderSheetRef,
} from '@/types';


const TOAST_DURATION = 2500;

export default function Select() {
  const algsets = useAlgSetStore(s => s.algSets);
  const loadAlgSets = useAlgSetStore(s => s.loadAlgSets);
  const addAlgSet = useAlgSetStore(s => s.addAlgSet);
  const selectedAlgSet = useAlgSetStore(s => s.selectedAlgSet);
  const setSelectedAlgSet = useAlgSetStore(s => s.setSelectedAlgSet);
  const deleteAlgSet = useAlgSetStore(s => s.deleteAlgSet);

  const folders = useFolderStore(s => s.folders);
  const loadFolders = useFolderStore(s => s.loadFolders);
  const addFolder = useFolderStore(s => s.addFolder);
  const updateFolder = useFolderStore(s => s.updateFolder);
  const deleteFolderAction = useFolderStore(s => s.deleteFolder);

  const shiftNavbarUp = useSettingsStore((s) => s.shiftNavbarUp);

  const insets = useSafeAreaInsets();
  const createSheetRef = useRef<CreateAlgSetSheetRef>(null);
  const editSheetRef = useRef<EditAlgSetSheetRef>(null);
  const deleteConfirmSheetRef = useRef<SheetRef>(null);
  const createFolderSheetRef = useRef<CreateFolderSheetRef>(null);
  const editFolderSheetRef = useRef<EditFolderSheetRef>(null);
  const deleteFolderConfirmSheetRef = useRef<SheetRef>(null);
  const fabRef = useRef<FabRef>(null);

  const [folderTarget, setFolderTarget] = useState<Folder | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadAlgSets();
      loadFolders();
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

  const displayCreateFolderSheet = useCallback(() => {
    createFolderSheetRef.current?.present();
  }, []);

  const displayEditFolderSheet = useCallback((folder: Folder) => {
    setFolderTarget(folder);
    editFolderSheetRef.current?.present();
  }, []);

  const displayConfirmDeleteFolderSheet = useCallback((folder: Folder) => {
    setFolderTarget(folder);
    deleteFolderConfirmSheetRef.current?.present();
  }, []);

  const ungroupedAlgsets = algsets.filter((a) => !a.folder);
  const folderTargetMemberCount = folderTarget
    ? algsets.filter((a) => a.folder === folderTarget.name).length
    : 0;

  type Row = { type: 'folder'; folder: Folder } | { type: 'algset'; algset: AlgSet };
  const rows: Row[] = [
    ...folders.map((folder): Row => ({ type: 'folder', folder })),
    ...ungroupedAlgsets.map((algset): Row => ({ type: 'algset', algset })),
  ];

  return (
    <View
      className="items-center flex-1 justify-start flex-col pt-16"
      onTouchStart={() => fabRef.current?.close()}
    >
      <Text className="text-header mb-2">Select Algorithm Set</Text>
      {rows.length > 0 && (
        <FlatList
          className="w-full flex-1"
          data={rows}
          contentContainerStyle={{ gap: 12, padding: 12, paddingBottom: insets.bottom + 75 }}
          renderItem={({ item }) =>
            item.type === 'folder' ? (
              <FolderRow
                folder={item.folder}
                algsets={algsets.filter((a) => a.folder === item.folder.name)}
                onEdit={displayEditFolderSheet}
                onDelete={displayConfirmDeleteFolderSheet}
              />
            ) : (
              <AlgSetRow algset={item.algset} />
            )
          }
          keyExtractor={(item) => (item.type === 'folder' ? `folder-${item.folder.name}` : item.algset.name)}
          initialNumToRender={10}
          maxToRenderPerBatch={20}
          windowSize={20}
        />
      )}
      <Fab
        ref={fabRef}
        onCreate={displayCreateAlgSetSheet}
        onCreateFolder={displayCreateFolderSheet}
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

      <CreateFolderSheet
        ref={createFolderSheetRef}
        onCreate={(folder, algsetNamesToAssign) => {
          const created = addFolder(folder, algsetNamesToAssign);
          if (!created) {
            showToast(`Failed to create ${folder.name}`, TOAST_DURATION);
            return;
          }
          showToast(`${folder.name} added!`, TOAST_DURATION);
        }}
      />

      {folderTarget && (
        <EditFolderSheet
          folder={folderTarget}
          ref={editFolderSheetRef}
          onEdit={(folder, editedFolder, algsetNamesToAssign) => {
            const oldMemberNames = algsets.filter((a) => a.folder === folder.name).map((a) => a.name);
            const editSuccessful = updateFolder(folder, editedFolder, oldMemberNames, algsetNamesToAssign);
            if (editSuccessful) {
              showToast(`${folder.name} edited successfully!`, TOAST_DURATION);
            }
          }}
          onDelete={(folder) => {
            setFolderTarget(folder);
            deleteFolderConfirmSheetRef.current?.present();
          }}
        />
      )}

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

      <Sheet ref={deleteFolderConfirmSheetRef} snapPoints={[!shiftNavbarUp ? "20%" : "25%"]}>
        <View className="flex flex-col gap-4 items-center ">
          <Text className="text-form-header">
            Delete {folderTarget?.name} and its {folderTargetMemberCount} algset(s)? This can&apos;t be undone.
          </Text>
          <Pressable className="rounded-full bg-red-500 p-4"
            onPress={() => {
              if (folderTarget === null) return;
              const folderToDelete = folderTarget.name;
              if (deleteFolderAction(folderTarget)) {
                showToast(`${folderToDelete} deleted successfully!`, TOAST_DURATION);
              } else {
                showToast('Must have at least one algset');
              }
              deleteFolderConfirmSheetRef.current?.dismiss();
            }}
          >
            <Text className="text-white ">Confirm</Text>
          </Pressable>
        </View>
      </Sheet>
    </View>
  );
}
