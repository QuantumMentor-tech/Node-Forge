/**
 * File store — manages current file state, dirty tracking, and recent files.
 */

import { create } from 'zustand';
import type { RecentFile } from '@/types/editor.types';

interface FileState {
  // Current file
  currentFilePath: string | null;
  currentFileName: string;
  isDirty: boolean;
  lastSaved: number | null;

  // Recent files
  recentFiles: RecentFile[];
  maxRecentFiles: number;

  // Actions
  setCurrentFile: (filePath: string, fileName: string) => void;
  setDirty: (dirty: boolean) => void;
  markSaved: () => void;
  clearCurrentFile: () => void;
  addRecentFile: (filePath: string, fileName: string) => void;
  clearRecentFiles: () => void;
  getWindowTitle: () => string;
}

export const useFileStore = create<FileState>((set, get) => ({
  currentFilePath: null,
  currentFileName: 'Untitled',
  isDirty: false,
  lastSaved: null,
  recentFiles: [],
  maxRecentFiles: 10,

  setCurrentFile: (filePath, fileName) =>
    set({ currentFilePath: filePath, currentFileName: fileName, isDirty: false }),

  setDirty: (dirty) => set({ isDirty: dirty }),

  markSaved: () =>
    set({ isDirty: false, lastSaved: Date.now() }),

  clearCurrentFile: () =>
    set({
      currentFilePath: null,
      currentFileName: 'Untitled',
      isDirty: false,
      lastSaved: null,
    }),

  addRecentFile: (filePath, fileName) =>
    set((state) => {
      const filtered = state.recentFiles.filter((f) => f.filePath !== filePath);
      const entry: RecentFile = { filePath, fileName, lastOpened: Date.now() };
      const recentFiles = [entry, ...filtered].slice(0, state.maxRecentFiles);
      return { recentFiles };
    }),

  clearRecentFiles: () => set({ recentFiles: [] }),

  getWindowTitle: () => {
    const { currentFileName, isDirty } = get();
    const prefix = isDirty ? '● ' : '';
    return `${prefix}${currentFileName} — NodeForge`;
  },
}));
