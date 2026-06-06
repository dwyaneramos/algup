import { create } from 'zustand';
import { AlgSet, SELECTED_ALGSET_KEY } from '@/src/logic/algsets';
import { setSetting } from "@/src/db/queries"

interface AlgSetStore {
  selectedAlgSet: AlgSet | null;
  setSelectedAlgSet: (algSet: AlgSet) => void;
}

export const useAlgSetStore = create<AlgSetStore>((set) => ({
  selectedAlgSet: null,
  setSelectedAlgSet: (algSet) => {
    set({ selectedAlgSet: algSet });
    setSetting(SELECTED_ALGSET_KEY, algSet.name);

  },
}));
