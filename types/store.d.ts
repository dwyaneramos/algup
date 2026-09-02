import type { AlgSet, Folder } from './algset';

export interface AlgSetStore {
  algSets: AlgSet[];
  selectedAlgSet: AlgSet | null;
  setSelectedAlgSet: (algSet: AlgSet) => void;
  loadAlgSets: () => void;
  addAlgSet: (algSet: AlgSet) => boolean;
  deleteAlgSet: (algSet: AlgSet) => boolean;
}

export interface FolderStore {
  folders: Folder[];
  loadFolders: () => void;
  addFolder: (folder: Folder, algsetNamesToAssign: string[]) => boolean;
  updateFolder: (
    old: Folder,
    edited: Folder,
    oldMemberNames: string[],
    newMemberNames: string[]
  ) => boolean;
  deleteFolder: (folder: Folder) => boolean;
}

export interface SettingsStore {
  shiftNavbarUp: boolean;
  maxActive: number;
  maxLearning: number;
  miniScramble: boolean;
  scrambleWithAUF: boolean;
  loadSettings: () => void;
  setShiftNavbarUp: (value: boolean) => void;
  setMaxActive: (value: number) => void;
  setMaxLearning: (value: number) => void;
  setMiniScramble: (value: boolean) => void;
  setScrambleWithAUF: (value: boolean) => void;
}
