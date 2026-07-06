/**
 * useMenuEvents.ts
 *
 * Listens to native Electron menu IPC events and triggers the appropriate actions.
 */

import { useEffect } from 'react';
import { FileActions } from '@/file/FileActions';
import { useFileStore } from '@/stores/file.store';
import { useZoomStore } from '@/stores/zoom.store';
import { useCommandStore } from '@/stores/command.store';
import { useCanvasStore } from '@/stores/canvas.store';
import { useExportStore } from '@/stores/export.store';
import { toast } from '@/stores/toast.store';
import { EditorActions } from '@/editor/EditorActions';

export function useMenuEvents() {
  useEffect(() => {
    if (typeof window.electronAPI === 'undefined') return;

    // File Operations
    const unsubNew = window.electronAPI.onMenuEvent('new-file', () => FileActions.newProject());
    const unsubOpen = window.electronAPI.onMenuEvent('open-file', () => FileActions.openProject());
    const unsubSave = window.electronAPI.onMenuEvent('save-file', () => FileActions.saveProject());
    const unsubSaveAs = window.electronAPI.onMenuEvent('save-file-as', () => FileActions.saveProjectAs());
    const unsubExport = window.electronAPI.onMenuEvent('export', () => useExportStore.getState().openDialog());

    // Edit Operations
    const unsubUndo = window.electronAPI.onMenuEvent('undo', () => {
      if (useCommandStore.getState().canUndo) {
        EditorActions.undo();
      }
    });
    const unsubRedo = window.electronAPI.onMenuEvent('redo', () => {
      if (useCommandStore.getState().canRedo) {
        EditorActions.redo();
      }
    });

    // View Operations
    const unsubZoomIn = window.electronAPI.onMenuEvent('zoom-in', () => useZoomStore.getState().zoomIn());
    const unsubZoomOut = window.electronAPI.onMenuEvent('zoom-out', () => useZoomStore.getState().zoomOut());
    const unsubZoomReset = window.electronAPI.onMenuEvent('zoom-reset', () => useZoomStore.getState().resetZoom());
    const unsubGrid = window.electronAPI.onMenuEvent('toggle-grid', () => useCanvasStore.getState().toggleGrid());

    // Help Operations
    const unsubAbout = window.electronAPI.onMenuEvent('about', () => {
      toast.info('NodeForge v1.0.0 — Professional Desktop Diagram Editor');
    });

    // Window Close Request
    const unsubClose = window.electronAPI.onRequestClose(() => {
      const isDirty = useFileStore.getState().isDirty;
      window.electronAPI.confirmClose(isDirty);
    });

    return () => {
      unsubNew();
      unsubOpen();
      unsubSave();
      unsubSaveAs();
      unsubExport();
      unsubUndo();
      unsubRedo();
      unsubZoomIn();
      unsubZoomOut();
      unsubZoomReset();
      unsubGrid();
      unsubAbout();
      unsubClose();
    };
  }, []);
}
