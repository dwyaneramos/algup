import { create } from 'zustand';
import { AlgSet, SELECTED_ALGSET_KEY, insertNewAlgSet } from '@/src/logic/algsets';
import { setSetting, getSetting, getAlgSets } from '@/src/db/queries';

interface AlgSetStore {
  algSets: AlgSet[];
  selectedAlgSet: AlgSet | null;
  setSelectedAlgSet: (algSet: AlgSet) => void;
  loadAlgSets: () => void;
  addAlgSet: (algSet: AlgSet) => void;
}

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
    if (selectedAlgSet || algSets.length === 0) return;

    const savedName = getSetting(SELECTED_ALGSET_KEY);
    const restored = algSets.find((a) => a.name === savedName);
    set({ selectedAlgSet: restored ?? algSets[0] });
  },

  addAlgSet: (algSet) => {
    insertNewAlgSet(algSet);
    set({ algSets: [...get().algSets, algSet] });
  },
}));
