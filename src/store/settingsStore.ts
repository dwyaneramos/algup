import { create } from 'zustand';
import { getSetting, setSetting } from '@/src/db/queries';
import { DEFAULT_MAX_ACTIVE, DEFAULT_MAX_LEARNING } from '@/src/logic/caseQueue';
import type { SettingsStore } from '@/types';

export const SHIFT_NAVBAR_UP_KEY = 'shiftNavbarUp';
export const MAX_ACTIVE_KEY = 'maxActive';
export const MAX_LEARNING_KEY = 'maxLearning';

export const MIN_MAX_ACTIVE = 1;
export const MAX_MAX_ACTIVE = 20;
export const MIN_MAX_LEARNING = 1;
export const MAX_MAX_LEARNING = 10;

export const useSettingsStore = create<SettingsStore>((set) => ({
  shiftNavbarUp: false,
  maxActive: DEFAULT_MAX_ACTIVE,
  maxLearning: DEFAULT_MAX_LEARNING,

  loadSettings: () => {
    const storedMaxActive = getSetting(MAX_ACTIVE_KEY);
    const storedMaxLearning = getSetting(MAX_LEARNING_KEY);
    set({
      shiftNavbarUp: getSetting(SHIFT_NAVBAR_UP_KEY) === 'true',
      maxActive: storedMaxActive ? Number(storedMaxActive) : DEFAULT_MAX_ACTIVE,
      maxLearning: storedMaxLearning ? Number(storedMaxLearning) : DEFAULT_MAX_LEARNING,
    });
  },

  setShiftNavbarUp: (value) => {
    setSetting(SHIFT_NAVBAR_UP_KEY, value ? 'true' : 'false');
    set({ shiftNavbarUp: value });
  },

  setMaxActive: (value) => {
    const clamped = Math.max(MIN_MAX_ACTIVE, Math.min(MAX_MAX_ACTIVE, value));
    setSetting(MAX_ACTIVE_KEY, String(clamped));
    set({ maxActive: clamped });
  },

  setMaxLearning: (value) => {
    const clamped = Math.max(MIN_MAX_LEARNING, Math.min(MAX_MAX_LEARNING, value));
    setSetting(MAX_LEARNING_KEY, String(clamped));
    set({ maxLearning: clamped });
  },
}));
