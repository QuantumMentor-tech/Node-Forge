import { create } from 'zustand';
import type { CanvasElement, Connector, Viewport } from '@/types/canvas.types';
import type { Layer } from '@/types/canvas.types';
import { useCanvasStore } from './canvas.store';
import { useFileStore } from './file.store';
import { useSelectionStore } from './selection.store';
import { useLayerStore } from './layer.store';
import { useZoomStore } from './zoom.store';
import { useTemplateStore } from './template.store';
import { useConfirmStore } from './confirm.store';
import { CommandManager } from '@/editor/CommandManager';
import { toast } from './toast.store';

export interface TabHistory {
  undoStack: any[];
  redoStack: any[];
}

export interface WorkspaceTab {
  id: string;
  fileName: string;
  filePath: string | null;
  isDirty: boolean;
  elements: CanvasElement[];
  connectors: Connector[];
  viewport: Viewport;
  selectedIds: string[];
  layers: Layer[];
  activeLayerId: string;
  history: TabHistory;
  lastOpened: number;
}

interface WorkspaceState {
  tabs: WorkspaceTab[];
  activeTabId: string | null;
  closedTabs: WorkspaceTab[];

  // Actions
  openTab: (
    filePath?: string | null,
    fileName?: string,
    elements?: CanvasElement[],
    connectors?: Connector[]
  ) => string;
  closeTab: (tabId: string) => Promise<boolean>;
  closeOthers: (tabId: string) => Promise<void>;
  closeAll: () => Promise<void>;
  selectTab: (tabId: string) => void;
  reorderTabs: (fromIndex: number, toIndex: number) => void;
  duplicateTab: (tabId: string) => void;
  reopenClosedTab: () => void;
  captureActiveState: () => void;
  applyTabState: (tab: WorkspaceTab) => void;
  loadSession: () => void;
  saveSession: () => void;
}

const SESSION_STORAGE_KEY = 'nodeforge_workspace_session';
const MAX_CLOSED_BUFFER = 10;

const DEFAULT_VIEWPORT: Viewport = { panX: 0, panY: 0, zoom: 1 };
const DEFAULT_LAYER: Layer = {
  id: 'layer-1',
  name: 'Layer 1',
  visible: true,
  locked: false,
  order: 0,
};

export const useWorkspaceStore = create<WorkspaceState>((set, get) => {
  // Sync file store changes (dirty state, file path) back to active tab
  useFileStore.subscribe((fileState) => {
    const { activeTabId, tabs } = get();
    if (!activeTabId) return;
    
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (!activeTab) return;

    // Only update if something changed to prevent infinite loops
    if (
      activeTab.isDirty !== fileState.isDirty ||
      activeTab.filePath !== fileState.currentFilePath ||
      activeTab.fileName !== fileState.currentFileName
    ) {
      set((state) => ({
        tabs: state.tabs.map((t) =>
          t.id === activeTabId
            ? {
                ...t,
                isDirty: fileState.isDirty,
                filePath: fileState.currentFilePath,
                fileName: fileState.currentFileName,
              }
            : t
        ),
      }));
      // Auto save session when metadata changes
      get().saveSession();
    }
  });

  return {
    tabs: [],
    activeTabId: null,
    closedTabs: [],

    captureActiveState: () => {
      const { activeTabId, tabs } = get();
      if (!activeTabId) return;

      const canvas = useCanvasStore.getState();
      const selection = useSelectionStore.getState();
      const layer = useLayerStore.getState();
      const file = useFileStore.getState();
      const history = CommandManager.getInstance().getHistory();

      set({
        tabs: tabs.map((t) =>
          t.id === activeTabId
            ? {
                ...t,
                fileName: file.currentFileName,
                filePath: file.currentFilePath,
                isDirty: file.isDirty,
                elements: JSON.parse(JSON.stringify(canvas.elements)),
                connectors: JSON.parse(JSON.stringify(canvas.connectors)),
                viewport: { ...canvas.viewport },
                selectedIds: Array.from(selection.selectedIds),
                layers: JSON.parse(JSON.stringify(layer.layers)),
                activeLayerId: layer.activeLayerId,
                history,
                lastOpened: Date.now(),
              }
            : t
        ),
      });
    },

    applyTabState: (tab: WorkspaceTab) => {
      // Apply to canvas store
      useCanvasStore.setState({
        elements: JSON.parse(JSON.stringify(tab.elements)),
        connectors: JSON.parse(JSON.stringify(tab.connectors)),
        viewport: { ...tab.viewport },
      });

      // Apply to zoom store
      useZoomStore.setState({ level: tab.viewport.zoom });

      // Apply to selection store
      useSelectionStore.setState({
        selectedIds: new Set(tab.selectedIds),
        hoveredId: null,
        lastSelectedId: tab.selectedIds[tab.selectedIds.length - 1] || null,
      });

      // Apply to layer store
      useLayerStore.setState({
        layers: JSON.parse(JSON.stringify(tab.layers)),
        activeLayerId: tab.activeLayerId,
      });

      // Apply to file store (bypass subscription notifications temporarily)
      useFileStore.setState({
        currentFilePath: tab.filePath,
        currentFileName: tab.fileName,
        isDirty: tab.isDirty,
        lastSaved: tab.isDirty ? null : Date.now(),
      });

      // Apply to CommandManager
      CommandManager.getInstance().setHistory(
        tab.history.undoStack || [],
        tab.history.redoStack || []
      );

      // Sync window title
      if (window.electronAPI && (window.electronAPI as any).setWindowTitle) {
        const prefix = tab.isDirty ? '● ' : '';
        (window.electronAPI as any).setWindowTitle(`${prefix}${tab.fileName} — NodeForge`);
      }
    },

    openTab: (filePath = null, fileName = 'Untitled', elements = [], connectors = []) => {
      // 1. Prevent duplicate tabs for the same file path
      if (filePath) {
        const existing = get().tabs.find((t) => t.filePath === filePath);
        if (existing) {
          get().selectTab(existing.id);
          return existing.id;
        }
      }

      // Capture active tab state first before switching
      get().captureActiveState();

      const newId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newTab: WorkspaceTab = {
        id: newId,
        fileName,
        filePath,
        isDirty: false,
        elements: JSON.parse(JSON.stringify(elements)),
        connectors: JSON.parse(JSON.stringify(connectors)),
        viewport: { ...DEFAULT_VIEWPORT },
        selectedIds: [],
        layers: [{ ...DEFAULT_LAYER }],
        activeLayerId: DEFAULT_LAYER.id,
        history: { undoStack: [], redoStack: [] },
        lastOpened: Date.now(),
      };

      set((state) => ({
        tabs: [...state.tabs, newTab],
        activeTabId: newId,
      }));

      // Apply newly created tab state to stores
      get().applyTabState(newTab);

      // Save session
      get().saveSession();

      // Ensure welcome screen is hidden
      useTemplateStore.getState().setWelcomeScreenOpen(false);

      return newId;
    },

    selectTab: (tabId) => {
      const { activeTabId, tabs } = get();
      if (activeTabId === tabId) return;

      // Capture state of current tab
      get().captureActiveState();

      // Switch active id
      set({ activeTabId: tabId });

      // Apply state of target tab
      const target = tabs.find((t) => t.id === tabId);
      if (target) {
        get().applyTabState(target);
      }

      get().saveSession();
    },

    closeTab: async (tabId) => {
      const { tabs, activeTabId, closedTabs } = get();
      const tabToClose = tabs.find((t) => t.id === tabId);
      if (!tabToClose) return false;

      // Dirty check confirm dialog
      if (tabToClose.isDirty) {
        const confirmed = await useConfirmStore.getState().askConfirm({
          title: 'Discard Unsaved Changes?',
          message: `"${tabToClose.fileName}" has unsaved changes. Are you sure you want to close it and discard your work?`,
          confirmLabel: 'Discard & Close',
          cancelLabel: 'Keep Editing',
        });
        if (!confirmed) {
          return false;
        }
      }

      // Capture active tab if we are closing the current tab
      if (activeTabId === tabId) {
        get().captureActiveState();
      }

      // Add to closed tabs history (without full elements to keep buffer small, or keep full for reopening)
      const tabBackup = { ...tabToClose, isDirty: false }; // Make clean for reopening
      const nextClosed = [tabBackup, ...closedTabs].slice(0, MAX_CLOSED_BUFFER);

      const remainingTabs = tabs.filter((t) => t.id !== tabId);

      let nextActiveId = activeTabId;
      if (activeTabId === tabId) {
        if (remainingTabs.length > 0) {
          // Select previous tab or first tab
          const closedIndex = tabs.findIndex((t) => t.id === tabId);
          const nextIndex = Math.max(0, closedIndex - 1);
          nextActiveId = remainingTabs[nextIndex].id;
        } else {
          nextActiveId = null;
        }
      }

      set({
        tabs: remainingTabs,
        activeTabId: nextActiveId,
        closedTabs: nextClosed,
      });

      if (nextActiveId) {
        const nextActiveTab = remainingTabs.find((t) => t.id === nextActiveId);
        if (nextActiveTab) {
          get().applyTabState(nextActiveTab);
        }
      } else {
        // No tabs left! Open welcome screen
        useTemplateStore.getState().setWelcomeScreenOpen(true);
        // Clear runtime state
        useCanvasStore.getState().clearElements();
        useFileStore.getState().clearCurrentFile();
        CommandManager.getInstance().clear();
      }

      get().saveSession();
      return true;
    },

    closeOthers: async (tabId) => {
      const { tabs } = get();
      const otherTabs = tabs.filter((t) => t.id !== tabId);
      const dirtyOthers = otherTabs.some((t) => t.isDirty);

      if (dirtyOthers) {
        const confirmed = await useConfirmStore.getState().askConfirm({
          title: 'Close Other Tabs?',
          message: 'Some of the other tabs have unsaved changes. Are you sure you want to close them all and discard changes?',
          confirmLabel: 'Discard & Close All',
          cancelLabel: 'Cancel',
        });
        if (!confirmed) return;
      }

      // Keep only this tab
      const thisTab = tabs.find((t) => t.id === tabId);
      if (!thisTab) return;

      set({
        tabs: [thisTab],
        activeTabId: tabId,
      });

      get().selectTab(tabId);
      get().saveSession();
    },

    closeAll: async () => {
      const { tabs } = get();
      const dirtyTabs = tabs.some((t) => t.isDirty);

      if (dirtyTabs) {
        const confirmed = await useConfirmStore.getState().askConfirm({
          title: 'Close All Tabs?',
          message: 'Some open tabs have unsaved changes. Are you sure you want to close them all and discard changes?',
          confirmLabel: 'Discard & Close All',
          cancelLabel: 'Cancel',
        });
        if (!confirmed) return;
      }

      set({
        tabs: [],
        activeTabId: null,
      });

      // Clear editor and go to welcome screen
      useTemplateStore.getState().setWelcomeScreenOpen(true);
      useCanvasStore.getState().clearElements();
      useFileStore.getState().clearCurrentFile();
      CommandManager.getInstance().clear();

      get().saveSession();
    },

    duplicateTab: (tabId) => {
      const { tabs } = get();
      const target = tabs.find((t) => t.id === tabId);
      if (!target) return;

      // Capture active tab if duplicating active
      if (get().activeTabId === tabId) {
        get().captureActiveState();
      }

      const dupId = `tab_dup_${Date.now()}`;
      const duplicated: WorkspaceTab = {
        ...JSON.parse(JSON.stringify(target)),
        id: dupId,
        fileName: `${target.fileName} (Copy)`,
        filePath: null, // Duplicated starts as unsaved new file
        isDirty: true,
        lastOpened: Date.now(),
        // Clone undo stacks
        history: {
          undoStack: [...(target.history?.undoStack || [])],
          redoStack: [...(target.history?.redoStack || [])],
        },
      };

      // Insert right after the target tab
      const targetIdx = tabs.findIndex((t) => t.id === tabId);
      const updatedTabs = [...tabs];
      updatedTabs.splice(targetIdx + 1, 0, duplicated);

      set({
        tabs: updatedTabs,
        activeTabId: dupId,
      });

      get().applyTabState(duplicated);
      get().saveSession();
      toast.success(`Duplicated tab: ${duplicated.fileName}`);
    },

    reorderTabs: (fromIndex, toIndex) => {
      set((state) => {
        const nextTabs = [...state.tabs];
        const [moved] = nextTabs.splice(fromIndex, 1);
        nextTabs.splice(toIndex, 0, moved);
        return { tabs: nextTabs };
      });
      get().saveSession();
    },

    reopenClosedTab: () => {
      const { closedTabs, tabs } = get();
      if (closedTabs.length === 0) {
        toast.info('No recently closed tabs to reopen.');
        return;
      }

      const [restored, ...remainingClosed] = closedTabs;
      
      // Ensure it doesn't collide with existing tab IDs
      restored.id = `tab_reopen_${Date.now()}`;

      set({
        tabs: [...tabs, restored],
        activeTabId: restored.id,
        closedTabs: remainingClosed,
      });

      get().applyTabState(restored);
      get().saveSession();
      toast.success(`Reopened tab: ${restored.fileName}`);
    },

    loadSession: () => {
      try {
        const raw = localStorage.getItem(SESSION_STORAGE_KEY);
        if (!raw) return;

        const parsed = JSON.parse(raw);
        if (parsed.tabs && parsed.tabs.length > 0) {
          const restoredTabs = parsed.tabs.map((t: any) => ({
            ...t,
            history: { undoStack: [], redoStack: [] }, // history is transient
          }));

          const restoredActiveId = parsed.activeTabId || restoredTabs[0].id;

          set({
            tabs: restoredTabs,
            activeTabId: restoredActiveId,
          });

          const activeTab = restoredTabs.find((t: any) => t.id === restoredActiveId);
          if (activeTab) {
            get().applyTabState(activeTab);
            useTemplateStore.getState().setWelcomeScreenOpen(false);
          }
        }
      } catch (e) {
        console.error('[WorkspaceStore] Failed to load session', e);
      }
    },

    saveSession: () => {
      try {
        const { tabs, activeTabId } = get();
        const serializedTabs = tabs.map((t) => ({
          id: t.id,
          fileName: t.fileName,
          filePath: t.filePath,
          isDirty: t.isDirty,
          elements: t.elements,
          connectors: t.connectors,
          viewport: t.viewport,
          selectedIds: t.selectedIds,
          layers: t.layers,
          activeLayerId: t.activeLayerId,
          lastOpened: t.lastOpened,
        }));

        localStorage.setItem(
          SESSION_STORAGE_KEY,
          JSON.stringify({ tabs: serializedTabs, activeTabId })
        );
      } catch (e) {
        console.error('[WorkspaceStore] Failed to save session', e);
      }
    },
  };
});
