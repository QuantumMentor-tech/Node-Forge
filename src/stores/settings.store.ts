/**
 * settings.store.ts
 *
 * Universal settings engine for user preferences.
 *
 * localStorage key: nodeforge_settings (migrated from drawio_settings if needed)
 */

import { create } from 'zustand';

export interface EditorSettings {
  autoSave: boolean;
  autoSaveInterval: number;
  theme: 'dark' | 'light' | 'system';
  showGrid: boolean;
  snapToGrid: boolean;
  highQualityRendering: boolean;
  snapToObjects: boolean;
  showGuides: boolean;
  snapStrength: number;
}

const DEFAULT_SETTINGS: EditorSettings = {
  autoSave: true,
  autoSaveInterval: 60000,
  theme: 'dark',
  showGrid: true,
  snapToGrid: true,
  highQualityRendering: true,
  snapToObjects: true,
  showGuides: true,
  snapStrength: 8,
};

const NEW_KEY = 'nodeforge_settings';
const LEGACY_KEY = 'drawio_settings';

/**
 * Load settings with automatic migration from the old draw.io key.
 * This ensures users who had the old app don't lose their preferences.
 */
const loadSettings = (): EditorSettings => {
  try {
    // Try new key first
    const raw = localStorage.getItem(NEW_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };

    // Migrate from legacy key if present
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const migrated = { ...DEFAULT_SETTINGS, ...JSON.parse(legacy) };
      localStorage.setItem(NEW_KEY, JSON.stringify(migrated));
      localStorage.removeItem(LEGACY_KEY);
      console.info('[Settings] Migrated preferences from legacy key.');
      return migrated;
    }
  } catch {
    // corrupted data — fall through to defaults
  }
  return DEFAULT_SETTINGS;
};

export interface SettingsState {
  settings: EditorSettings;
  isSettingsOpen: boolean;
  updateSettings: (updates: Partial<EditorSettings>) => void;
  openSettings: () => void;
  closeSettings: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: loadSettings(),
  isSettingsOpen: false,

  updateSettings: (updates) =>
    set((state) => {
      const newSettings = { ...state.settings, ...updates };
      localStorage.setItem(NEW_KEY, JSON.stringify(newSettings));
      return { settings: newSettings };
    }),

  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),
}));
