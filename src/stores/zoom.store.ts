/**
 * Zoom store — manages zoom level with min/max bounds.
 */

import { create } from 'zustand';
import { useCanvasStore } from './canvas.store';
import { getZoomedOffset } from '@/utils/coordinates';


interface ZoomState {
  level: number;
  minLevel: number;
  maxLevel: number;
  step: number;

  // Actions
  zoomIn: (center?: { x: number; y: number }) => void;
  zoomOut: (center?: { x: number; y: number }) => void;
  setZoom: (level: number) => void;
  setZoomAt: (level: number, center: { x: number; y: number }) => void;
  resetZoom: () => void;
  fitToScreen: () => void;
  getZoomPercentage: () => number;
}

export const useZoomStore = create<ZoomState>((set, get) => ({
  level: 1,
  minLevel: 0.1,
  maxLevel: 5,
  step: 0.1,

  zoomIn: (center) => {
    const { level, maxLevel, step, setZoomAt } = get();
    const newLevel = Math.min(level + step, maxLevel);
    if (center) {
      setZoomAt(newLevel, center);
    } else {
      set({ level: newLevel });
      useCanvasStore.getState().setViewport({ zoom: newLevel });
    }
  },

  zoomOut: (center) => {
    const { level, minLevel, step, setZoomAt } = get();
    const newLevel = Math.max(level - step, minLevel);
    if (center) {
      setZoomAt(newLevel, center);
    } else {
      set({ level: newLevel });
      useCanvasStore.getState().setViewport({ zoom: newLevel });
    }
  },

  setZoom: (level) => {
    set((state) => {
      const newLevel = Math.max(state.minLevel, Math.min(level, state.maxLevel));
      useCanvasStore.getState().setViewport({ zoom: newLevel });
      return { level: newLevel };
    });
  },

  setZoomAt: (newZoom, center) => {
    const { level: oldZoom } = get();
    const { viewport, setViewport } = useCanvasStore.getState();
    
    const newPan = getZoomedOffset(
      center,
      { x: viewport.panX, y: viewport.panY },
      oldZoom,
      newZoom
    );

    set({ level: newZoom });
    setViewport({ panX: newPan.x, panY: newPan.y, zoom: newZoom });
  },

  resetZoom: () => {
    set({ level: 1 });
    useCanvasStore.getState().resetViewport();
  },

  fitToScreen: () => {
    const { elements } = useCanvasStore.getState();
    if (elements.length === 0) {
      set({ level: 1 });
      useCanvasStore.getState().resetViewport();
      return;
    }

    const container = document.getElementById('canvas-area');
    if (!container) return;
    const { width: viewW, height: viewH } = container.getBoundingClientRect();

    // Determine total bounds of all elements
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    elements.forEach(el => {
      if (el.bounds.x < minX) minX = el.bounds.x;
      if (el.bounds.y < minY) minY = el.bounds.y;
      if (el.bounds.x + el.bounds.width > maxX) maxX = el.bounds.x + el.bounds.width;
      if (el.bounds.y + el.bounds.height > maxY) maxY = el.bounds.y + el.bounds.height;
    });

    // Add some padding/margin around the elements (e.g. 40px)
    const padding = 40;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const contentW = maxX - minX;
    const contentH = maxY - minY;

    // Calculate best scale to fit the bounds in viewport
    let fitScale = Math.min(viewW / contentW, viewH / contentH);

    // Constrain scale to zoom limits (minLevel to maxLevel)
    const { minLevel, maxLevel } = get();
    fitScale = Math.max(minLevel, Math.min(fitScale, maxLevel));

    // Center the content in the viewport
    const contentCenterX = minX + contentW / 2;
    const contentCenterY = minY + contentH / 2;

    const newPanX = viewW / 2 - contentCenterX * fitScale;
    const newPanY = viewH / 2 - contentCenterY * fitScale;

    // Update zoom and canvas store viewport
    set({ level: fitScale });
    useCanvasStore.getState().setViewport({
      zoom: fitScale,
      panX: newPanX,
      panY: newPanY
    });
  },

  getZoomPercentage: () => Math.round(get().level * 100),
}));
