/**
 * Canvas store — manages canvas elements, viewport, and grid configuration.
 */

import { create } from 'zustand';
import type { CanvasElement, Connector, Viewport, CanvasConfig, GridConfig } from '@/types/canvas.types';

interface CanvasState {
  // Elements
  elements: CanvasElement[];
  connectors: Connector[];

  // Viewport
  viewport: Viewport;

  // Canvas config
  config: CanvasConfig;

  // Element actions
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  removeElements: (ids: string[]) => void;
  clearElements: () => void;
  /** Bulk-replace elements — used by undo/redo state restoration */
  setElements: (elements: CanvasElement[]) => void;

  // Connector actions
  addConnector: (connector: Connector) => void;
  updateConnector: (id: string, updates: Partial<Connector>) => void;
  removeConnector: (id: string) => void;
  /** Bulk-replace connectors — used by undo/redo state restoration */
  setConnectors: (connectors: Connector[]) => void;

  // Viewport actions
  setViewport: (viewport: Partial<Viewport>) => void;
  resetViewport: () => void;

  // Grid actions
  setGridConfig: (config: Partial<GridConfig>) => void;
  toggleGrid: () => void;
}

const DEFAULT_VIEWPORT: Viewport = {
  panX: 0,
  panY: 0,
  zoom: 1,
};

const DEFAULT_GRID: GridConfig = {
  enabled: true,
  size: 20,
  snapToGrid: true,
  color: 'var(--color-canvas-grid)',
};

const DEFAULT_CONFIG: CanvasConfig = {
  width: 4096,
  height: 4096,
  backgroundColor: 'var(--color-canvas-bg)',
  grid: DEFAULT_GRID,
};


export const useCanvasStore = create<CanvasState>((set) => ({
  elements: [],
  connectors: [],
  viewport: DEFAULT_VIEWPORT,
  config: DEFAULT_CONFIG,

  // ─── Element Actions ────────────────────────────────────────────────
  addElement: (element) =>
    set((state) => ({ elements: [...state.elements, element] })),

  updateElement: (id, updates) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
    })),

  removeElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      connectors: state.connectors.filter(
        (c) => c.sourceId !== id && c.targetId !== id
      ),
    })),

  removeElements: (ids) =>
    set((state) => {
      const idSet = new Set(ids);
      return {
        elements: state.elements.filter((el) => !idSet.has(el.id)),
        connectors: state.connectors.filter(
          (c) => !idSet.has(c.sourceId) && !idSet.has(c.targetId) && !idSet.has(c.id)
        ),
      };
    }),

  clearElements: () => set({ elements: [], connectors: [] }),

  setElements: (elements) => set({ elements }),

  // ─── Connector Actions ──────────────────────────────────────────────
  addConnector: (connector) =>
    set((state) => ({ connectors: [...state.connectors, connector] })),

  updateConnector: (id, updates) =>
    set((state) => ({
      connectors: state.connectors.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),

  removeConnector: (id) =>
    set((state) => ({
      connectors: state.connectors.filter((c) => c.id !== id),
    })),

  setConnectors: (connectors) => set({ connectors }),

  // ─── Viewport Actions ──────────────────────────────────────────────
  setViewport: (viewport) =>
    set((state) => ({ viewport: { ...state.viewport, ...viewport } })),

  resetViewport: () => set({ viewport: DEFAULT_VIEWPORT }),

  // ─── Grid Actions ──────────────────────────────────────────────────
  setGridConfig: (config) =>
    set((state) => ({
      config: {
        ...state.config,
        grid: { ...state.config.grid, ...config },
      },
    })),

  toggleGrid: () =>
    set((state) => ({
      config: {
        ...state.config,
        grid: { ...state.config.grid, enabled: !state.config.grid.enabled },
      },
    })),
}));
