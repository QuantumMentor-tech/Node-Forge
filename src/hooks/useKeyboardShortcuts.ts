/**
 * useKeyboardShortcuts.ts
 *
 * Registers all application keyboard shortcuts via ShortcutRegistry.
 * Called once at the application root (CanvasEngine).
 *
 * To add a new shortcut, register it in the SHORTCUT_DEFINITIONS array below.
 * The registry handles conflict detection and is inspectable for a shortcut dialog.
 */

import { useEffect } from 'react';
import { ShortcutRegistry } from '@/shortcuts/ShortcutRegistry';
import { EditorActions } from '@/editor/EditorActions';
import { FileActions } from '@/file/FileActions';
import { useEditorStore } from '@/stores/editor.store';
import { useZoomStore } from '@/stores/zoom.store';
import { useExportStore } from '@/stores/export.store';
import { usePaletteStore } from '@/stores/palette.store';

export function useKeyboardShortcuts() {
  useEffect(() => {
    // ─── Register all shortcuts ─────────────────────────────────────────────

    // ─── File Operations ──────────────────────────────────────────────────
    ShortcutRegistry.register({
      id: 'file-new',
      label: 'New Project',
      key: 'n',
      ctrl: true,
      action: (e) => { (e as KeyboardEvent | undefined)?.preventDefault(); FileActions.newProject(); },
    });

    ShortcutRegistry.register({
      id: 'file-open',
      label: 'Open Project',
      key: 'o',
      ctrl: true,
      action: (e) => { (e as KeyboardEvent | undefined)?.preventDefault(); FileActions.openProject(); },
    });

    ShortcutRegistry.register({
      id: 'file-save',
      label: 'Save Project',
      key: 's',
      ctrl: true,
      action: (e) => { (e as KeyboardEvent | undefined)?.preventDefault(); FileActions.saveProject(); },
    });

    ShortcutRegistry.register({
      id: 'file-save-as',
      label: 'Save Project As',
      key: 's',
      ctrl: true,
      shift: true,
      action: (e) => { (e as KeyboardEvent | undefined)?.preventDefault(); FileActions.saveProjectAs(); },
    });

    ShortcutRegistry.register({
      id: 'file-export',
      label: 'Export Diagram',
      key: 'e',
      ctrl: true,
      action: (e) => { (e as KeyboardEvent | undefined)?.preventDefault(); useExportStore.getState().openDialog(); },
    });

    ShortcutRegistry.registerAll([
      // History
      {
        id: 'undo',
        label: 'Undo',
        key: 'z',
        ctrl: true,
        action: () => EditorActions.undo(),
      },
      {
        id: 'redo-y',
        label: 'Redo',
        key: 'y',
        ctrl: true,
        action: () => EditorActions.redo(),
      },
      {
        id: 'redo-shift-z',
        label: 'Redo (Alt)',
        key: 'z',
        ctrl: true,
        shift: true,
        action: () => EditorActions.redo(),
      },

      // Deletion
      {
        id: 'delete',
        label: 'Delete Selected',
        key: 'delete',
        action: () => EditorActions.deleteSelected(),
      },
      {
        id: 'backspace',
        label: 'Delete Selected',
        key: 'backspace',
        action: () => EditorActions.deleteSelected(),
      },

      // Escape / Reset
      {
        id: 'escape',
        label: 'Cancel / Deselect',
        key: 'escape',
        action: () => {
          EditorActions.clearSelection();
          useEditorStore.getState().setMode('select');
        },
      },

      // Tool switching
      {
        id: 'tool-select',
        label: 'Select Tool',
        key: 'v',
        action: () => EditorActions.setActiveTool('select'),
      },
      {
        id: 'tool-pan',
        label: 'Pan Tool',
        key: 'h',
        action: () => EditorActions.setActiveTool('pan'),
      },
      {
        id: 'tool-rectangle',
        label: 'Rectangle Tool',
        key: 'r',
        action: () => EditorActions.setActiveTool('rectangle'),
      },
      {
        id: 'tool-ellipse',
        label: 'Ellipse Tool',
        key: 'e',
        action: () => EditorActions.setActiveTool('ellipse'),
      },
      {
        id: 'tool-diamond',
        label: 'Diamond Tool',
        key: 'd',
        action: () => EditorActions.setActiveTool('diamond'),
      },
      {
        id: 'tool-arrow',
        label: 'Arrow Tool',
        key: 'a',
        action: () => EditorActions.setActiveTool('arrow'),
      },
      {
        id: 'tool-line',
        label: 'Line Tool',
        key: 'l',
        action: () => EditorActions.setActiveTool('line'),
      },
      {
        id: 'tool-text',
        label: 'Text Tool',
        key: 't',
        action: () => EditorActions.setActiveTool('text'),
      },

      // Selection
      {
        id: 'select-all',
        label: 'Select All',
        key: 'a',
        ctrl: true,
        action: () => EditorActions.selectAll(),
      },

      // Clipboard / Duplicate
      {
        id: 'copy',
        label: 'Copy Selection',
        key: 'c',
        ctrl: true,
        action: (e?: Event) => {
          (e as KeyboardEvent | undefined)?.preventDefault();
          EditorActions.copySelected();
        },
      },
      {
        id: 'cut',
        label: 'Cut Selection',
        key: 'x',
        ctrl: true,
        action: (e?: Event) => {
          (e as KeyboardEvent | undefined)?.preventDefault();
          EditorActions.cutSelected();
        },
      },
      {
        id: 'paste',
        label: 'Paste',
        key: 'v',
        ctrl: true,
        action: (e?: Event) => {
          (e as KeyboardEvent | undefined)?.preventDefault();
          EditorActions.paste();
        },
      },
      {
        id: 'duplicate',
        label: 'Duplicate Selection',
        key: 'd',
        ctrl: true,
        action: (e?: Event) => {
          (e as KeyboardEvent | undefined)?.preventDefault();
          EditorActions.duplicateSelected();
        },
      },

      // Zoom
      {
        id: 'zoom-in',
        label: 'Zoom In',
        key: '=',
        ctrl: true,
        action: (e?: Event) => {
          (e as KeyboardEvent | undefined)?.preventDefault();
          useZoomStore.getState().zoomIn();
        },
      },
      {
        id: 'zoom-out',
        label: 'Zoom Out',
        key: '-',
        ctrl: true,
        action: (e?: Event) => {
          (e as KeyboardEvent | undefined)?.preventDefault();
          useZoomStore.getState().zoomOut();
        },
      },
      {
        id: 'zoom-reset',
        label: 'Reset Zoom',
        key: '0',
        ctrl: true,
        action: (e?: Event) => {
          (e as KeyboardEvent | undefined)?.preventDefault();
          useZoomStore.getState().resetZoom();
        },
      },
      {
        id: 'zoom-fit',
        label: 'Fit to Screen',
        key: '9',
        ctrl: true,
        action: (e?: Event) => {
          (e as KeyboardEvent | undefined)?.preventDefault();
          useZoomStore.getState().fitToScreen();
        },
      },

      // Command Palette
      {
        id: 'command-palette',
        label: 'Command Palette',
        key: 'k',
        ctrl: true,
        action: () => {
          usePaletteStore.getState().togglePalette();
        },
      },

      // Keyboard Nudging
      {
        id: 'nudge-up',
        label: 'Nudge Up',
        key: 'arrowup',
        action: () => EditorActions.nudge(0, -1),
      },
      {
        id: 'nudge-up-10',
        label: 'Nudge Up (Fast)',
        key: 'arrowup',
        shift: true,
        action: () => EditorActions.nudge(0, -10),
      },
      {
        id: 'nudge-down',
        label: 'Nudge Down',
        key: 'arrowdown',
        action: () => EditorActions.nudge(0, 1),
      },
      {
        id: 'nudge-down-10',
        label: 'Nudge Down (Fast)',
        key: 'arrowdown',
        shift: true,
        action: () => EditorActions.nudge(0, 10),
      },
      {
        id: 'nudge-left',
        label: 'Nudge Left',
        key: 'arrowleft',
        action: () => EditorActions.nudge(-1, 0),
      },
      {
        id: 'nudge-left-10',
        label: 'Nudge Left (Fast)',
        key: 'arrowleft',
        shift: true,
        action: () => EditorActions.nudge(-10, 0),
      },
      {
        id: 'nudge-right',
        label: 'Nudge Right',
        key: 'arrowright',
        action: () => EditorActions.nudge(1, 0),
      },
      {
        id: 'nudge-right-10',
        label: 'Nudge Right (Fast)',
        key: 'arrowright',
        shift: true,
        action: () => EditorActions.nudge(10, 0),
      },
    ]);

    // ─── Global keydown handler ─────────────────────────────────────────────
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't fire shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const shortcut = ShortcutRegistry.match(e);
      if (!shortcut) return;

      // Check optional guard condition
      if (shortcut.when && !shortcut.when()) return;

      // Prevent browser defaults for registered shortcuts
      e.preventDefault();

      shortcut.action(e);
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}

