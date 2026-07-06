/**
 * export.store.ts
 *
 * Tracks the state of the export pipeline to show loading indicators
 * and manage the Export Dialog visibility.
 */

import { create } from 'zustand';

interface ExportState {
  isExportDialogOpen: boolean;
  isExporting: boolean;
  progress: number; // 0 to 100
  
  openDialog: () => void;
  closeDialog: () => void;
  setExporting: (isExporting: boolean) => void;
  setProgress: (progress: number) => void;
}

export const useExportStore = create<ExportState>((set) => ({
  isExportDialogOpen: false,
  isExporting: false,
  progress: 0,

  openDialog: () => set({ isExportDialogOpen: true, progress: 0, isExporting: false }),
  closeDialog: () => set({ isExportDialogOpen: false }),
  setExporting: (isExporting) => set({ isExporting }),
  setProgress: (progress) => set({ progress }),
}));
