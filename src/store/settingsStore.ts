import { create } from 'zustand';
import { getSetting, setSetting } from '@/src/db/queries';

export const SHIFT_NAVBAR_UP_KEY = 'shiftNavbarUp';

interface SettingsStore {
  shiftNavbarUp: boolean;
  loadSettings: () => void;
  setShiftNavbarUp: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  shiftNavbarUp: false,

  loadSettings: () => {
    set({ shiftNavbarUp: getSetting(SHIFT_NAVBAR_UP_KEY) === 'true' });
  },

  setShiftNavbarUp: (value) => {
    setSetting(SHIFT_NAVBAR_UP_KEY, value ? 'true' : 'false');
    set({ shiftNavbarUp: value });
  },
}));
