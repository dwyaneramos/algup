import { create } from 'zustand';
import { getFolders, deleteFolder as deleteFolderQuery } from '@/src/db/queries';
import { insertNewFolder, editFolder } from '@/src/logic/folders';
import { clearPendingItem } from '@/src/logic/pendingScramble';
import { useAlgSetStore } from '@/src/store/algsetStore';
import type { FolderStore } from '@/types';

export const useFolderStore = create<FolderStore>((set, get) => ({
  folders: [],

  loadFolders: () => {
    set({ folders: getFolders() });
  },

  addFolder: (folder, algsetNamesToAssign): boolean => {
    const success = insertNewFolder(folder, algsetNamesToAssign);
    if (success) {
      set({ folders: [...get().folders, folder] });
      useAlgSetStore.getState().loadAlgSets();
    }
    return success;
  },

  updateFolder: (old, edited, oldMemberNames, newMemberNames): boolean => {
    const success = editFolder(old, edited, oldMemberNames, newMemberNames);
    if (success) {
      set({
        folders: get().folders.map((f) => (f.name === old.name ? edited : f)),
      });
      useAlgSetStore.getState().loadAlgSets();
    }
    return success;
  },

  deleteFolder: (folder): boolean => {
    const { algSets, setSelectedAlgSet } = useAlgSetStore.getState();
    const members = algSets.filter((a) => a.folder === folder.name);

    if (members.length === algSets.length) return false;

    deleteFolderQuery(folder.name);
    for (const member of members) {
      clearPendingItem(member.name);
    }
    set({ folders: get().folders.filter((f) => f.name !== folder.name) });
    useAlgSetStore.getState().loadAlgSets();

    const { selectedAlgSet, algSets: refreshedAlgSets } = useAlgSetStore.getState();
    const wasSelectedDeleted =
      selectedAlgSet !== null && members.some((m) => m.name === selectedAlgSet.name);
    if (wasSelectedDeleted && refreshedAlgSets[0]) {
      setSelectedAlgSet(refreshedAlgSets[0]);
    }
    return true;
  },
}));
