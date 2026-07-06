/**
 * plugin.store.ts
 *
 * Tracks loaded plugins, their metadata, and active state.
 */

import { create } from 'zustand';

export interface PluginMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
}

export interface PluginState {
  plugins: PluginMetadata[];
  activePluginIds: Set<string>;
  
  registerPlugin: (metadata: PluginMetadata) => void;
  enablePlugin: (id: string) => void;
  disablePlugin: (id: string) => void;
}

export const usePluginStore = create<PluginState>((set) => ({
  plugins: [],
  activePluginIds: new Set(),

  registerPlugin: (metadata) => set((state) => {
    // Avoid duplicates
    if (state.plugins.some(p => p.id === metadata.id)) return state;
    return { plugins: [...state.plugins, metadata] };
  }),

  enablePlugin: (id) => set((state) => {
    const next = new Set(state.activePluginIds);
    next.add(id);
    return { activePluginIds: next };
  }),

  disablePlugin: (id) => set((state) => {
    const next = new Set(state.activePluginIds);
    next.delete(id);
    return { activePluginIds: next };
  }),
}));
