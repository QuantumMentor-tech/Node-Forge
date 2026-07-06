/**
 * layer.store.ts
 *
 * Zustand store for managing diagram layers.
 */

import { create } from 'zustand';
import type { Layer } from '@/types/canvas.types';

interface LayerState {
  layers: Layer[];
  activeLayerId: string;
  
  addLayer: (name: string) => void;
  removeLayer: (id: string) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  reorderLayer: (id: string, newOrder: number) => void;
  setActiveLayer: (id: string) => void;
  
  // Bulk replace (for undo/redo / file loading)
  setLayers: (layers: Layer[], activeId?: string) => void;
}

const DEFAULT_LAYER: Layer = {
  id: 'layer-1',
  name: 'Layer 1',
  visible: true,
  locked: false,
  order: 0,
};

export const useLayerStore = create<LayerState>((set) => ({
  layers: [DEFAULT_LAYER],
  activeLayerId: DEFAULT_LAYER.id,
  
  addLayer: (name) => set((state) => {
    const newLayer: Layer = {
      id: `layer-${Date.now()}`,
      name,
      visible: true,
      locked: false,
      order: Math.max(...state.layers.map(l => l.order), 0) + 1,
    };
    return {
      layers: [...state.layers, newLayer],
      activeLayerId: newLayer.id,
    };
  }),

  removeLayer: (id) => set((state) => {
    if (state.layers.length <= 1) return state; // Prevent removing last layer
    const newLayers = state.layers.filter(l => l.id !== id);
    return {
      layers: newLayers,
      activeLayerId: state.activeLayerId === id ? newLayers[0].id : state.activeLayerId
    };
  }),

  updateLayer: (id, updates) => set((state) => ({
    layers: state.layers.map(l => l.id === id ? { ...l, ...updates } : l)
  })),

  reorderLayer: (id, newOrder) => set((state) => {
    // Basic reorder
    const layers = [...state.layers];
    const index = layers.findIndex(l => l.id === id);
    if (index === -1) return state;
    
    const layer = layers.splice(index, 1)[0];
    layers.splice(newOrder, 0, layer);
    
    // Fix orders
    const sorted = layers.map((l, i) => ({ ...l, order: i }));
    return { layers: sorted };
  }),

  setActiveLayer: (id) => set({ activeLayerId: id }),
  
  setLayers: (layers, activeId) => set({ layers, activeLayerId: activeId || layers[0]?.id || 'layer-1' }),
}));
