/**
 * palette.store.ts
 *
 * Manages the visibility of the global command palette.
 */

import { create } from 'zustand';

export interface PaletteState {
  isOpen: boolean;
  openPalette: () => void;
  closePalette: () => void;
  togglePalette: () => void;
}

export const usePaletteStore = create<PaletteState>((set) => ({
  isOpen: false,
  openPalette: () => set({ isOpen: true }),
  closePalette: () => set({ isOpen: false }),
  togglePalette: () => set((state) => ({ isOpen: !state.isOpen })),
}));
