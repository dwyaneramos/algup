import { create } from 'zustand';
import { SELECTED_ALGSET_KEY, insertNewAlgSet } from '@/src/logic/algsets';
import { deleteAlgset, setSetting, getSetting, getAlgSets } from '@/src/db/queries';
import { clearPendingItem } from '@/src/logic/pendingScramble';
import type { AlgSetStore } from '@/types';

export const useAlgSetStore = create<AlgSetStore>((set, get) => ({
  algSets: [],
  selectedAlgSet: null,

  setSelectedAlgSet: (algSet) => {
    set({ selectedAlgSet: algSet });
    setSetting(SELECTED_ALGSET_KEY, algSet.name);
  },

  loadAlgSets: () => {
    const algSets = getAlgSets();
    set({ algSets });

    const { selectedAlgSet } = get();
    if (algSets.length === 0) return;

    // Re-resolve the current selection against the freshly loaded list so it
    // never keeps pointing at a stale object (e.g. an outdated `folder`).
    if (selectedAlgSet) {
      const fresh = algSets.find((a) => a.name === selectedAlgSet.name);
      if (fresh) set({ selectedAlgSet: fresh });
      return;
    }

    const savedName = getSetting(SELECTED_ALGSET_KEY);
    const restored = algSets.find((a) => a.name === savedName);
    set({ selectedAlgSet: restored ?? algSets[0] });
  },

  addAlgSet: (algSet): boolean => {
    const success = insertNewAlgSet(algSet);
    if (success) {
      set({ algSets: [...get().algSets, algSet] });
    }
    return success;
  },

  deleteAlgSet: (algSet): boolean => {
    const { algSets, selectedAlgSet } = get();

    if (algSets.length <= 1) return false;

    // check if deleteAlgset is valid name + do error checking
    deleteAlgset(algSet.name);
    clearPendingItem(algSet.name);

    const remaining = algSets.filter((a) => a.name !== algSet.name);

    if (selectedAlgSet?.name === algSet.name) {
      const nextSelected = remaining[0];
      set({ algSets: remaining, selectedAlgSet: nextSelected });
      setSetting(SELECTED_ALGSET_KEY, nextSelected.name);
    } else {
      set({ algSets: remaining });
    }
    return true;
  },
}));
