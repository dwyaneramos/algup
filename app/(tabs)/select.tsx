import { Text, View, Pressable, FlatList, StyleSheet } from 'react-native';
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
import { RowOptionsSheet } from '@/components/RowOptionsSheet';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Sheet } from '@/components/Sheet'
import type {
  AlgSet, Folder, CreateAlgSetSheetRef, EditAlgSetSheetRef, FabRef, SheetRef,
  CreateFolderSheetRef, EditFolderSheetRef,
} from '@/types';


const TOAST_DURATION = 2500;

type RowTarget = { type: 'algset'; algset: AlgSet } | { type: 'folder'; folder: Folder };

function targetKey(target: RowTarget): string {
  return target.type === 'algset' ? `algset:${target.algset.name}` : `folder:${target.folder.name}`;
}

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
  const optionsSheetRef = useRef<SheetRef>(null);
  const fabRef = useRef<FabRef>(null);

  const [rowTarget, setRowTarget] = useState<RowTarget | null>(null);
  const openTargetKeyRef = useRef<string | null>(null);
  const [fabOpen, setFabOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadAlgSets();
      loadFolders();
    }, [])
  );

  const displayCreateAlgSetSheet = useCallback(() => {
    createSheetRef.current?.present();
  }, []);

  const displayCreateFolderSheet = useCallback(() => {
    createFolderSheetRef.current?.present();
  }, []);

  const openRowOptions = useCallback((target: RowTarget) => {
    const key = targetKey(target);
    if (openTargetKeyRef.current === key) {
      optionsSheetRef.current?.dismiss();
      openTargetKeyRef.current = null;
      return;
    }
    setRowTarget(target);
    openTargetKeyRef.current = key;
    optionsSheetRef.current?.present();
  }, []);

  const handleOptionsDismiss = useCallback(() => {
    openTargetKeyRef.current = null;
  }, []);

  const handleAlgSetLongPress = useCallback((algset: AlgSet) => {
    openRowOptions({ type: 'algset', algset });
  }, [openRowOptions]);

  const handleFolderLongPress = useCallback((folder: Folder) => {
    openRowOptions({ type: 'folder', folder });
  }, [openRowOptions]);

  const ungroupedAlgsets = algsets.filter((a) => !a.folder);
  const algSetTarget = rowTarget?.type === 'algset' ? rowTarget.algset : null;
  const folderTarget = rowTarget?.type === 'folder' ? rowTarget.folder : null;
  const folderTargetMemberCount = folderTarget
    ? algsets.filter((a) => a.folder === folderTarget.name).length
    : 0;

  type Row = { type: 'folder'; folder: Folder } | { type: 'algset'; algset: AlgSet };
  const rows: Row[] = [
    ...folders.map((folder): Row => ({ type: 'folder', folder })),
    ...ungroupedAlgsets.map((algset): Row => ({ type: 'algset', algset })),
  ];

  return (
    <View className="items-center flex-1 justify-start flex-col pt-16">
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
                onLongPress={handleFolderLongPress}
                onLongPressAlgSet={handleAlgSetLongPress}
              />
            ) : (
              <AlgSetRow algset={item.algset} onLongPress={handleAlgSetLongPress} />
            )
          }
          keyExtractor={(item) => (item.type === 'folder' ? `folder-${item.folder.name}` : item.algset.name)}
          initialNumToRender={10}
          maxToRenderPerBatch={20}
          windowSize={20}
        />
      )}
      {fabOpen && (
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={() => fabRef.current?.close()}
        />
      )}
      <Fab
        ref={fabRef}
        onCreate={displayCreateAlgSetSheet}
        onCreateFolder={displayCreateFolderSheet}
        onOpenChange={setFabOpen}
      />

      <RowOptionsSheet
        ref={optionsSheetRef}
        title={algSetTarget?.name ?? folderTarget?.name ?? ''}
        onDismiss={handleOptionsDismiss}
        onEdit={() => {
          if (algSetTarget) editSheetRef.current?.present();
          else if (folderTarget) editFolderSheetRef.current?.present();
        }}
        onDelete={() => {
          if (algSetTarget) deleteConfirmSheetRef.current?.present();
          else if (folderTarget) deleteFolderConfirmSheetRef.current?.present();
        }}
      />

      <EditAlgSetSheet
        algset={algSetTarget!}
        ref={editSheetRef}
        onEdit={(algset: AlgSet, editedAlgset: AlgSet) => {
          const editSuccessful = editAlgset(algset, editedAlgset)
          if (editSuccessful) {
            loadAlgSets();
            const refreshed = getAlgSet(editedAlgset.name);
            if (refreshed && selectedAlgSet?.name === algset.name) {
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

      <EditFolderSheet
        folder={folderTarget!}
        ref={editFolderSheetRef}
        onEdit={(folder, editedFolder, algsetNamesToAssign) => {
          const oldMemberNames = algsets.filter((a) => a.folder === folder.name).map((a) => a.name);
          const editSuccessful = updateFolder(folder, editedFolder, oldMemberNames, algsetNamesToAssign);
          if (editSuccessful) {
            showToast(`${folder.name} edited successfully!`, TOAST_DURATION);
          }
        }}
        onDelete={(folder) => {
          setRowTarget({ type: 'folder', folder });
          openTargetKeyRef.current = targetKey({ type: 'folder', folder });
          deleteFolderConfirmSheetRef.current?.present();
        }}
      />


      <Sheet ref={deleteConfirmSheetRef} snapPoints={[!shiftNavbarUp ? "25%" : "30%"]}>
        <View className="w-full flex flex-col gap-4 items-center pb-6">
          <Text className="text-form-header text-center">Are you sure you want to delete {algSetTarget?.name}?</Text>
          <Pressable className="w-full rounded-full bg-red-500 py-4 items-center"
            onPress={() => {
              if (algSetTarget === null) return;
              const algToDelete = algSetTarget.name;
              if (deleteAlgSet(algSetTarget)) {
                showToast(`${algToDelete} deleted successfully!`, TOAST_DURATION);
              } else {
                showToast('Must have at least one algset');
              }
              deleteConfirmSheetRef.current?.dismiss();
            }
            }
          >
            <Text className="font-inter-semibold text-base text-white">Confirm</Text>

          </Pressable>
        </View>

      </Sheet>

      <Sheet ref={deleteFolderConfirmSheetRef} snapPoints={[!shiftNavbarUp ? "25%" : "30%"]}>
        <View className="w-full flex flex-col gap-4 items-center pb-6">
          <Text className="text-form-header text-center">
            Delete {folderTarget?.name} and its {folderTargetMemberCount} algset(s)?{'\n'}This can&apos;t be undone.
          </Text>
          <Pressable className="w-full rounded-full bg-red-500 py-4 items-center"
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
            <Text className="font-inter-semibold text-base text-white">Confirm</Text>
          </Pressable>
        </View>
      </Sheet>
    </View>
  );
}
