/**
 * CommandRegistry.ts
 *
 * Centralized registry for all diagram editor actions and keyboard commands.
 */

import { EditorActions } from './EditorActions';
import { useCanvasStore } from '@/stores/canvas.store';
import { useLayerStore } from '@/stores/layer.store';
import { useThemeStore } from '@/stores/theme.store';
import { useWorkspaceStore } from '@/stores/workspace.store';
import { useZoomStore } from '@/stores/zoom.store';
import { useExportStore } from '@/stores/export.store';
import { FileActions } from '@/file/FileActions';

export interface CommandDefinition {
  id: string;
  label: string;
  category: string;
  shortcut?: string;
  execute: () => void;
  keywords?: string[];
}

export class CommandRegistry {
  private static commands: Map<string, CommandDefinition> = new Map();

  static register(def: CommandDefinition) {
    this.commands.set(def.id, def);
  }

  static get(id: string): CommandDefinition | undefined {
    return this.commands.get(id);
  }

  static getAll(): CommandDefinition[] {
    return Array.from(this.commands.values());
  }

  static initialize() {
    if (this.commands.size > 0) return; // Already initialized

    // File
    this.register({
      id: 'file.new',
      label: 'New Diagram Tab',
      category: 'File',
      shortcut: 'Ctrl+T',
      execute: () => FileActions.newProject(),
      keywords: ['new', 'create', 'blank', 'tab'],
    });
    this.register({
      id: 'file.open',
      label: 'Open Diagram...',
      category: 'File',
      shortcut: 'Ctrl+O',
      execute: () => FileActions.openProject(),
      keywords: ['open', 'load', 'import'],
    });
    this.register({
      id: 'file.save',
      label: 'Save Diagram',
      category: 'File',
      shortcut: 'Ctrl+S',
      execute: () => FileActions.saveProject(),
      keywords: ['save', 'persist'],
    });
    this.register({
      id: 'file.save-as',
      label: 'Save Diagram As...',
      category: 'File',
      shortcut: 'Ctrl+Shift+S',
      execute: () => FileActions.saveProjectAs(),
      keywords: ['save as', 'duplicate file'],
    });

    // Export
    this.register({
      id: 'export.dialog',
      label: 'Export Diagram...',
      category: 'Export',
      shortcut: 'Ctrl+E',
      execute: () => useExportStore.getState().openDialog(),
      keywords: ['export', 'png', 'svg', 'download', 'save image'],
    });

    // Edit
    this.register({
      id: 'edit.undo',
      label: 'Undo Action',
      category: 'Edit',
      shortcut: 'Ctrl+Z',
      execute: () => EditorActions.undo(),
      keywords: ['undo', 'back', 'history'],
    });
    this.register({
      id: 'edit.redo',
      label: 'Redo Action',
      category: 'Edit',
      shortcut: 'Ctrl+Y',
      execute: () => EditorActions.redo(),
      keywords: ['redo', 'forward', 'history'],
    });
    this.register({
      id: 'edit.copy',
      label: 'Copy Selection',
      category: 'Edit',
      shortcut: 'Ctrl+C',
      execute: () => EditorActions.copySelected(),
      keywords: ['copy', 'clipboard'],
    });
    this.register({
      id: 'edit.cut',
      label: 'Cut Selection',
      category: 'Edit',
      shortcut: 'Ctrl+X',
      execute: () => EditorActions.cutSelected(),
      keywords: ['cut', 'clipboard'],
    });
    this.register({
      id: 'edit.paste',
      label: 'Paste Clipboard',
      category: 'Edit',
      shortcut: 'Ctrl+V',
      execute: () => EditorActions.paste(),
      keywords: ['paste', 'clipboard'],
    });
    this.register({
      id: 'edit.delete',
      label: 'Delete Selection',
      category: 'Edit',
      shortcut: 'Delete',
      execute: () => EditorActions.deleteSelected(),
      keywords: ['delete', 'remove', 'trash', 'clear'],
    });
    this.register({
      id: 'edit.duplicate',
      label: 'Duplicate Selection',
      category: 'Edit',
      shortcut: 'Ctrl+D',
      execute: () => EditorActions.duplicateSelected(),
      keywords: ['duplicate', 'clone', 'copy'],
    });
    this.register({
      id: 'edit.select-all',
      label: 'Select All',
      category: 'Edit',
      shortcut: 'Ctrl+A',
      execute: () => EditorActions.selectAll(),
      keywords: ['select all', 'highlight all'],
    });

    // Zoom
    this.register({
      id: 'zoom.in',
      label: 'Zoom In',
      category: 'View',
      shortcut: 'Ctrl++',
      execute: () => useZoomStore.getState().zoomIn(),
      keywords: ['zoom in', 'enlarge', 'magnify'],
    });
    this.register({
      id: 'zoom.out',
      label: 'Zoom Out',
      category: 'View',
      shortcut: 'Ctrl+-',
      execute: () => useZoomStore.getState().zoomOut(),
      keywords: ['zoom out', 'shrink', 'smaller'],
    });
    this.register({
      id: 'zoom.reset',
      label: 'Reset Zoom (100%)',
      category: 'View',
      shortcut: 'Ctrl+0',
      execute: () => useZoomStore.getState().resetZoom(),
      keywords: ['zoom 100%', 'reset zoom', 'actual size'],
    });
    this.register({
      id: 'zoom.fit',
      label: 'Fit to Screen',
      category: 'View',
      execute: () => useZoomStore.getState().fitToScreen(),
      keywords: ['fit to screen', 'zoom fit', 'show all'],
    });

    // Alignment
    this.register({
      id: 'align.left',
      label: 'Align Left',
      category: 'Alignment',
      execute: () => EditorActions.align('left'),
      keywords: ['align left', 'format'],
    });
    this.register({
      id: 'align.center',
      label: 'Align Center',
      category: 'Alignment',
      execute: () => EditorActions.align('center'),
      keywords: ['align center', 'format'],
    });
    this.register({
      id: 'align.right',
      label: 'Align Right',
      category: 'Alignment',
      execute: () => EditorActions.align('right'),
      keywords: ['align right', 'format'],
    });
    this.register({
      id: 'align.top',
      label: 'Align Top',
      category: 'Alignment',
      execute: () => EditorActions.align('top'),
      keywords: ['align top', 'format'],
    });
    this.register({
      id: 'align.middle',
      label: 'Align Middle',
      category: 'Alignment',
      execute: () => EditorActions.align('middle'),
      keywords: ['align middle', 'format'],
    });
    this.register({
      id: 'align.bottom',
      label: 'Align Bottom',
      category: 'Alignment',
      execute: () => EditorActions.align('bottom'),
      keywords: ['align bottom', 'format'],
    });
    this.register({
      id: 'distribute.h',
      label: 'Distribute Horizontally',
      category: 'Alignment',
      execute: () => EditorActions.distribute('horizontal'),
      keywords: ['distribute horizontally', 'spacing'],
    });
    this.register({
      id: 'distribute.v',
      label: 'Distribute Vertically',
      category: 'Alignment',
      execute: () => EditorActions.distribute('vertical'),
      keywords: ['distribute vertically', 'spacing'],
    });

    // Grouping
    this.register({
      id: 'group.group',
      label: 'Group Selected',
      category: 'Grouping',
      shortcut: 'Ctrl+G',
      execute: () => EditorActions.groupSelected(),
      keywords: ['group', 'bind', 'combine'],
    });
    this.register({
      id: 'group.ungroup',
      label: 'Ungroup Selected',
      category: 'Grouping',
      shortcut: 'Ctrl+Shift+G',
      execute: () => EditorActions.ungroupSelected(),
      keywords: ['ungroup', 'break group', 'separate'],
    });

    // Layers
    this.register({
      id: 'layers.add',
      label: 'Add Layer',
      category: 'Layers',
      execute: () => {
        const name = prompt('Enter layer name:', `Layer ${useLayerStore.getState().layers.length + 1}`);
        if (name) useLayerStore.getState().addLayer(name);
      },
      keywords: ['add layer', 'new layer', 'sheets'],
    });
    this.register({
      id: 'layers.delete',
      label: 'Delete Active Layer',
      category: 'Layers',
      execute: () => {
        const { activeLayerId, layers, removeLayer } = useLayerStore.getState();
        if (layers.length <= 1) {
          alert('Cannot delete the last remaining layer.');
          return;
        }
        if (confirm('Are you sure you want to delete the active layer? This will delete all elements on it.')) {
          removeLayer(activeLayerId);
        }
      },
      keywords: ['delete layer', 'remove layer'],
    });
    this.register({
      id: 'layers.toggle-visibility',
      label: 'Toggle Active Layer Visibility',
      category: 'Layers',
      execute: () => {
        const { activeLayerId, layers, updateLayer } = useLayerStore.getState();
        const active = layers.find(l => l.id === activeLayerId);
        if (active) {
          updateLayer(activeLayerId, { visible: !active.visible });
        }
      },
      keywords: ['hide layer', 'show layer', 'toggle visibility'],
    });
    this.register({
      id: 'layers.toggle-lock',
      label: 'Toggle Active Layer Lock',
      category: 'Layers',
      execute: () => {
        const { activeLayerId, layers, updateLayer } = useLayerStore.getState();
        const active = layers.find(l => l.id === activeLayerId);
        if (active) {
          updateLayer(activeLayerId, { locked: !active.locked });
        }
      },
      keywords: ['lock layer', 'unlock layer'],
    });

    // Snapping / Grid
    this.register({
      id: 'grid.toggle-snap',
      label: 'Toggle Snap to Grid',
      category: 'Grid',
      execute: () => {
        const current = useCanvasStore.getState().config.grid.snapToGrid;
        useCanvasStore.getState().setGridConfig({ snapToGrid: !current });
      },
      keywords: ['snap to grid', 'magnetism', 'alignment guides'],
    });
    this.register({
      id: 'grid.toggle-visible',
      label: 'Toggle Grid Enabled',
      category: 'Grid',
      execute: () => {
        const current = useCanvasStore.getState().config.grid.enabled;
        useCanvasStore.getState().setGridConfig({ enabled: !current });
      },
      keywords: ['disable grid', 'enable grid', 'toggle grid', 'hide background lines'],
    });

    // Theme
    this.register({
      id: 'theme.toggle',
      label: 'Toggle Light/Dark Theme',
      category: 'Theme',
      execute: () => useThemeStore.getState().toggleMode(),
      keywords: ['dark theme', 'light theme', 'toggle mode'],
    });

    // Workspace Controls (Tabs)
    this.register({
      id: 'workspace.close-tab',
      label: 'Close Active Tab',
      category: 'Workspace',
      shortcut: 'Ctrl+W',
      execute: () => {
        const { activeTabId, closeTab } = useWorkspaceStore.getState();
        if (activeTabId) closeTab(activeTabId);
      },
      keywords: ['close tab', 'exit tab', 'remove tab'],
    });
    this.register({
      id: 'workspace.close-others',
      label: 'Close Other Tabs',
      category: 'Workspace',
      execute: () => {
        const { activeTabId, closeOthers } = useWorkspaceStore.getState();
        if (activeTabId) closeOthers(activeTabId);
      },
      keywords: ['close other tabs', 'clean tabs'],
    });
    this.register({
      id: 'workspace.close-all',
      label: 'Close All Tabs',
      category: 'Workspace',
      execute: () => {
        useWorkspaceStore.getState().closeAll();
      },
      keywords: ['close all tabs', 'clear workspace'],
    });
    this.register({
      id: 'workspace.reopen-tab',
      label: 'Reopen Last Closed Tab',
      category: 'Workspace',
      shortcut: 'Ctrl+Shift+T',
      execute: () => {
        useWorkspaceStore.getState().reopenClosedTab();
      },
      keywords: ['reopen tab', 'restore tab', 'closed tab buffer'],
    });
    this.register({
      id: 'workspace.next-tab',
      label: 'Switch to Next Tab',
      category: 'Workspace',
      shortcut: 'Ctrl+Tab',
      execute: () => {
        const { tabs, activeTabId, selectTab } = useWorkspaceStore.getState();
        if (tabs.length <= 1) return;
        const idx = tabs.findIndex(t => t.id === activeTabId);
        selectTab(tabs[(idx + 1) % tabs.length].id);
      },
      keywords: ['next tab', 'switch tab'],
    });
    this.register({
      id: 'workspace.prev-tab',
      label: 'Switch to Previous Tab',
      category: 'Workspace',
      shortcut: 'Ctrl+Shift+Tab',
      execute: () => {
        const { tabs, activeTabId, selectTab } = useWorkspaceStore.getState();
        if (tabs.length <= 1) return;
        const idx = tabs.findIndex(t => t.id === activeTabId);
        selectTab(tabs[(idx - 1 + tabs.length) % tabs.length].id);
      },
      keywords: ['previous tab', 'switch tab'],
    });
    this.register({
      id: 'workspace.duplicate-tab',
      label: 'Duplicate Workspace Tab',
      category: 'Workspace',
      execute: () => {
        const { activeTabId, duplicateTab } = useWorkspaceStore.getState();
        if (activeTabId) duplicateTab(activeTabId);
      },
      keywords: ['duplicate tab', 'clone tab', 'copy workspace'],
    });
  }
}
