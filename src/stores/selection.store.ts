/**
 * Selection store — manages element selection state.
 */

import { create } from 'zustand';

interface SelectionState {
  selectedIds: Set<string>;
  hoveredId: string | null;
  lastSelectedId: string | null;

  // Actions
  select: (id: string) => void;
  multiSelect: (id: string) => void;
  selectAll: (ids: string[]) => void;
  deselect: (id: string) => void;
  clearSelection: () => void;
  setHovered: (id: string | null) => void;
  isSelected: (id: string) => boolean;
}

export const useSelectionStore = create<SelectionState>((set, get) => ({
  selectedIds: new Set<string>(),
  hoveredId: null,
  lastSelectedId: null,

  select: (id) =>
    set({ selectedIds: new Set([id]), lastSelectedId: id }),

  multiSelect: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { selectedIds: next, lastSelectedId: id };
    }),

  selectAll: (ids) =>
    set({ selectedIds: new Set(ids), lastSelectedId: ids[ids.length - 1] ?? null }),

  deselect: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      next.delete(id);
      return { selectedIds: next };
    }),

  clearSelection: () =>
    set({ selectedIds: new Set(), lastSelectedId: null }),

  setHovered: (id) => set({ hoveredId: id }),

  isSelected: (id) => get().selectedIds.has(id),
}));
