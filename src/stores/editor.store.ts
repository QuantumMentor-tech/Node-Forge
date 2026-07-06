/**
 * Editor store — manages editor mode, active tool, and preferences.
 */

import { create } from 'zustand';
import type { EditorMode, DrawTool, EditorPreferences } from '@/types/editor.types';

interface EditorState {
  // Mode & tools
  mode: EditorMode;
  activeTool: DrawTool | null;
  isEditing: boolean;

  // Preferences
  preferences: EditorPreferences;

  // UI state
  propertiesPanelCollapsed: boolean;

  // Actions
  setMode: (mode: EditorMode) => void;
  setActiveTool: (tool: DrawTool | null) => void;
  setIsEditing: (editing: boolean) => void;
  setPreferences: (prefs: Partial<EditorPreferences>) => void;
  togglePropertiesPanel: () => void;
}

const DEFAULT_PREFERENCES: EditorPreferences = {
  autoSave: true,
  autoSaveInterval: 30000,
  showMinimap: false,
  showRulers: false,
  snapToGrid: true,
  snapToElements: true,
  defaultFontFamily: 'Inter',
  defaultFontSize: 14,
};

export const useEditorStore = create<EditorState>((set) => ({
  mode: 'select',
  activeTool: null,
  isEditing: false,
  preferences: DEFAULT_PREFERENCES,
  propertiesPanelCollapsed: false,

  setMode: (mode) => set({ mode, activeTool: null }),
  setActiveTool: (tool) => set({ activeTool: tool, mode: 'draw' }),
  setIsEditing: (editing) => set({ isEditing: editing }),

  setPreferences: (prefs) =>
    set((state) => ({
      preferences: { ...state.preferences, ...prefs },
    })),

  togglePropertiesPanel: () =>
    set((state) => ({
      propertiesPanelCollapsed: !state.propertiesPanelCollapsed,
    })),
}));
