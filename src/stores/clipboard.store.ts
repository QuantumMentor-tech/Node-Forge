/**
 * clipboard.store.ts
 *
 * Internal application clipboard for elements and connectors.
 * In a more complex app, this would serialize to navigator.clipboard.
 */

import { create } from 'zustand';
import type { CanvasElement, Connector } from '@/types/canvas.types';

interface ClipboardState {
  elements: CanvasElement[];
  connectors: Connector[];
  
  copy: (elements: CanvasElement[], connectors: Connector[]) => void;
  clear: () => void;
}

export const useClipboardStore = create<ClipboardState>((set) => ({
  elements: [],
  connectors: [],
  
  copy: (elements, connectors) => set({ elements, connectors }),
  clear: () => set({ elements: [], connectors: [] }),
}));
