/**
 * EditorAPI.ts
 *
 * A facade providing a clean, safe Sandbox API for plugins, external automation,
 * and future AI agents to interact with the editor without directly mutating Zustand stores.
 */

import { useCanvasStore } from '@/stores/canvas.store';
import { useSelectionStore } from '@/stores/selection.store';
import { useZoomStore } from '@/stores/zoom.store';
import { useFileStore } from '@/stores/file.store';
import { CommandManager } from '@/editor/CommandManager';
import { EditorActions } from '@/editor/EditorActions';
import { createElement } from '@/utils/element.factory';
import type { ElementType, CanvasElement, Bounds } from '@/types/canvas.types';

import { DeleteElementsCommand } from '@/editor/commands/DeleteElementsCommand';

export class EditorAPI {
  // ─── Shapes API ────────────────────────────────────────────────────────
  public readonly shapes = {
    /**
     * Retrieves all elements on the canvas.
     */
    getAll: (): CanvasElement[] => {
      return [...useCanvasStore.getState().elements];
    },

    /**
     * Retrieves only the currently selected elements.
     */
    getSelected: (): CanvasElement[] => {
      const selectedIds = useSelectionStore.getState().selectedIds;
      return useCanvasStore.getState().elements.filter(el => selectedIds.has(el.id));
    },

    /**
     * Safely creates a new shape and registers it into the undo history.
     */
    add: (type: ElementType, bounds: Partial<Bounds>, label?: string): CanvasElement => {
      // Default center if no bounds provided
      const finalBounds = {
        x: bounds.x ?? 0,
        y: bounds.y ?? 0,
        width: bounds.width ?? 100,
        height: bounds.height ?? 100,
      };

      const newElement = createElement(type, { x: finalBounds.x, y: finalBounds.y }, { width: finalBounds.width, height: finalBounds.height });
      if (label) newElement.label = label;
      
      EditorActions.commitElement(newElement);
      return newElement;
    },

    /**
     * Updates an existing shape properties safely via EditorActions (preserves undo).
     */
    update: (id: string, updates: Partial<CanvasElement>, commandLabel: string = 'API Update') => {
      EditorActions.updateElement(id, updates, commandLabel);
    },

    /**
     * Deletes a specific shape.
     */
    delete: (id: string) => {
      const { elements } = useCanvasStore.getState();
      const el = elements.find(e => e.id === id);
      if (el) {
        CommandManager.getInstance().execute(new DeleteElementsCommand([id]));
        useFileStore.getState().setDirty(true);
      }
    }
  };

  // ─── Selection API ──────────────────────────────────────────────────────
  public readonly selection = {
    set: (ids: string[]) => {
      const { clearSelection, select } = useSelectionStore.getState();
      clearSelection();
      ids.forEach(id => select(id));
    },
    clear: () => {
      useSelectionStore.getState().clearSelection();
    }
  };

  // ─── Viewport API ───────────────────────────────────────────────────────
  public readonly viewport = {
    panTo: (x: number, y: number) => {
      useCanvasStore.getState().setViewport({ panX: x, panY: y });
    },
    zoomTo: (level: number) => {
      useZoomStore.getState().setZoom(level);
    }
  };

  // ─── History API ────────────────────────────────────────────────────────
  public readonly history = {
    undo: () => CommandManager.getInstance().undo(),
    redo: () => CommandManager.getInstance().redo(),
  };
}

// Export a global singleton instance for immediate use
export const editorAPI = new EditorAPI();
