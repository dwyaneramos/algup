import type { AlgSet } from './algset';

export interface AlgSetStore {
  algSets: AlgSet[];
  selectedAlgSet: AlgSet | null;
  setSelectedAlgSet: (algSet: AlgSet) => void;
  loadAlgSets: () => void;
  addAlgSet: (algSet: AlgSet) => boolean;
  deleteAlgSet: (algSet: AlgSet) => boolean;
}

export interface SettingsStore {
  shiftNavbarUp: boolean;
  maxActive: number;
  maxLearning: number;
  loadSettings: () => void;
  setShiftNavbarUp: (value: boolean) => void;
  setMaxActive: (value: number) => void;
  setMaxLearning: (value: number) => void;
}
