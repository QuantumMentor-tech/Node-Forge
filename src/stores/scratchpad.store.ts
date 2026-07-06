/**
 * scratchpad.store.ts
 *
 * Persisted store for the Scratchpad feature in the shape library sidebar.
 * Users can save canvas elements here for quick reuse across sessions.
 *
 * Follows the same manual localStorage pattern used by the rest of the project
 * (settings.store.ts, etc.) for consistency — does NOT use zustand/middleware.
 */

import { create } from 'zustand';
import type { CanvasElement } from '@/types/canvas.types';

const STORAGE_KEY = 'nodeforge-scratchpad-v1';
const LEGACY_KEY  = 'drawio-scratchpad-v1';

export interface ScratchpadItem {
  id: string;
  name: string;
  element: CanvasElement;
  addedAt: number;
}

interface ScratchpadState {
  items: ScratchpadItem[];
  addItem: (element: CanvasElement, name?: string) => void;
  removeItem: (id: string) => void;
  renameItem: (id: string, name: string) => void;
  clearAll: () => void;
}

/** Read saved items from localStorage (migrates from old key on first run). */
const loadItems = (): ScratchpadItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ScratchpadItem[];

    // Migrate from old draw.io key
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const items = JSON.parse(legacy) as ScratchpadItem[];
      localStorage.setItem(STORAGE_KEY, legacy);
      localStorage.removeItem(LEGACY_KEY);
      return items;
    }
  } catch {
    return [];
  }
  return [];
};

/** Write items to localStorage (silently ignores storage errors). */
const saveItems = (items: ScratchpadItem[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // quota exceeded or private browsing — no-op
  }
};

export const useScratchpadStore = create<ScratchpadState>((set) => ({
  items: loadItems(),

  addItem: (element, name) =>
    set((state) => {
      const newItem: ScratchpadItem = {
        id: `scratch-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
        name:
          name?.trim() ||
          element.label?.trim() ||
          element.type.replace(/_/g, ' '),
        element: JSON.parse(JSON.stringify(element)), // deep clone
        addedAt: Date.now(),
      };
      const updated = [...state.items, newItem];
      saveItems(updated);
      return { items: updated };
    }),

  removeItem: (id) =>
    set((state) => {
      const updated = state.items.filter((i) => i.id !== id);
      saveItems(updated);
      return { items: updated };
    }),

  renameItem: (id, name) =>
    set((state) => {
      const updated = state.items.map((i) =>
        i.id === id ? { ...i, name: name.trim() || i.name } : i
      );
      saveItems(updated);
      return { items: updated };
    }),

  clearAll: () => {
    saveItems([]);
    set({ items: [] });
  },
}));
