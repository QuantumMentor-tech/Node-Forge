/**
 * Theme store — manages theme mode (dark/light) and accent color.
 */

import { create } from 'zustand';
import { applyTheme, type ThemeMode } from '@/themes';

interface ThemeState {
  mode: ThemeMode;
  accentColor: string;

  // Actions
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setAccentColor: (color: string) => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'dark',
  accentColor: '#6366f1',

  setMode: (mode) => {
    applyTheme(mode);
    set({ mode });
  },

  toggleMode: () => {
    const next = get().mode === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    set({ mode: next });
  },

  setAccentColor: (color) => set({ accentColor: color }),

  initTheme: () => {
    const { mode } = get();
    applyTheme(mode);
  },
}));
