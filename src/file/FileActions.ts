/**
 * FileActions.ts
 *
 * Public API for all project-level file operations.
 * UI components call this instead of directly importing FileOperations or Serializer.
 */

import { FileOperations } from '@/storage/FileOperations';
import { ProjectSerializer } from '@/storage/ProjectSerializer';
import { useFileStore } from '@/stores/file.store';
import { useCanvasStore } from '@/stores/canvas.store';
import { useLayerStore } from '@/stores/layer.store';
import { useWorkspaceStore } from '@/stores/workspace.store';
import { CommandManager } from '@/editor/CommandManager';
import { RecentProjectsManager } from '@/storage/RecentProjectsManager';
import { useTemplateStore } from '@/stores/template.store';
import { toast } from '@/stores/toast.store';

export const FileActions = {
  /**
   * Request a new blank project by opening a new tab.
   */
  async newProject(): Promise<void> {
    FileActions.forceNewProject();
  },

  /**
   * Force create a new project (bypassing dirty checks by opening a new tab).
   */
  forceNewProject(): void {
    useWorkspaceStore.getState().openTab(null, 'Untitled');
    toast.success('Created new workspace tab');
  },

  /**
   * Show open dialog and load the selected project into a new tab.
   */
  async openProject(): Promise<void> {
    const result = await FileOperations.openFile();
    if (result.canceled || !result.filePath || !result.content) return;

    try {
      const projectData = ProjectSerializer.parse(result.content);
      const fileName = result.filePath.split(/[/\\]/).pop() || 'Unknown';
      const filePath = result.filePath;

      const workspace = useWorkspaceStore.getState();
      
      // 1. If the file is already open, select that tab and return
      const existing = workspace.tabs.find((t) => t.filePath === filePath);
      if (existing) {
        workspace.selectTab(existing.id);
        toast.info(`Switched to open tab: ${fileName}`);
        return;
      }

      // 2. Capture the current active tab's runtime state first
      workspace.captureActiveState();

      // 3. Deserialize and apply file contents to active stores
      ProjectSerializer.deserializeAndApply(projectData, filePath, fileName);

      // 4. Read applied states to construct a new workspace tab
      const canvas = useCanvasStore.getState();
      const layer = useLayerStore.getState();

      const newId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newTab = {
        id: newId,
        fileName,
        filePath,
        isDirty: false,
        elements: JSON.parse(JSON.stringify(canvas.elements)),
        connectors: JSON.parse(JSON.stringify(canvas.connectors)),
        viewport: { ...canvas.viewport },
        selectedIds: [],
        layers: JSON.parse(JSON.stringify(layer.layers)),
        activeLayerId: layer.activeLayerId,
        history: { undoStack: [], redoStack: [] },
        lastOpened: Date.now(),
      };

      // Add the new tab and activate it
      useWorkspaceStore.setState((state) => ({
        tabs: [...state.tabs, newTab],
        activeTabId: newId,
      }));

      workspace.saveSession();
      RecentProjectsManager.add(filePath, fileName);
      useTemplateStore.getState().setWelcomeScreenOpen(false);
      toast.success(`Project loaded: ${fileName}`);
    } catch (error) {
      console.error('[FileActions] Open project failed:', error);
      toast.error(`Failed to open project: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Load a project from a specific file path (e.g., from Recent Files) into a new tab.
   */
  async loadProject(filePath: string): Promise<void> {
    try {
      const result = await FileOperations.readFile(filePath);
      const projectData = ProjectSerializer.parse(result.content);
      const workspace = useWorkspaceStore.getState();

      // 1. If tab is already open, switch to it
      const existing = workspace.tabs.find((t) => t.filePath === filePath);
      if (existing) {
        workspace.selectTab(existing.id);
        toast.info(`Switched to open tab: ${result.fileName}`);
        return;
      }

      // 2. Capture active state
      workspace.captureActiveState();

      // 3. Apply project elements to active stores
      ProjectSerializer.deserializeAndApply(projectData, result.filePath, result.fileName);

      // 4. Create new tab
      const canvas = useCanvasStore.getState();
      const layer = useLayerStore.getState();

      const newId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newTab = {
        id: newId,
        fileName: result.fileName,
        filePath: result.filePath,
        isDirty: false,
        elements: JSON.parse(JSON.stringify(canvas.elements)),
        connectors: JSON.parse(JSON.stringify(canvas.connectors)),
        viewport: { ...canvas.viewport },
        selectedIds: [],
        layers: JSON.parse(JSON.stringify(layer.layers)),
        activeLayerId: layer.activeLayerId,
        history: { undoStack: [], redoStack: [] },
        lastOpened: Date.now(),
      };

      useWorkspaceStore.setState((state) => ({
        tabs: [...state.tabs, newTab],
        activeTabId: newId,
      }));

      workspace.saveSession();
      RecentProjectsManager.add(result.filePath, result.fileName);
      useTemplateStore.getState().setWelcomeScreenOpen(false);
      toast.success(`Project loaded: ${result.fileName}`);
    } catch (error) {
      console.error('[FileActions] Load project failed:', error);
      toast.error(`Failed to load project from ${filePath}. It might have been moved or deleted.`);
    }
  },

  /**
   * Save the current project. If it has no path, triggers Save As.
   */
  async saveProject(): Promise<void> {
    const { currentFilePath, currentFileName } = useFileStore.getState();

    if (!currentFilePath) {
      await FileActions.saveProjectAs();
      return;
    }

    try {
      const projectData = ProjectSerializer.serialize();
      const content = JSON.stringify(projectData, null, 2);
      
      const result = await FileOperations.saveFile(currentFilePath, content);
      
      if (result.success) {
        useFileStore.getState().markSaved();
        RecentProjectsManager.add(currentFilePath, currentFileName);

        if (window.electronAPI && (window.electronAPI as any).setWindowTitle) {
          (window.electronAPI as any).setWindowTitle(`${currentFileName} — NodeForge`);
        }
        toast.success('Project saved securely.');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('[FileActions] Save failed:', error);
      toast.error('Failed to save project.');
    }
  },

  /**
   * Prompt user for location and save project.
   */
  async saveProjectAs(): Promise<void> {
    try {
      const projectData = ProjectSerializer.serialize();
      const content = JSON.stringify(projectData, null, 2);
      
      const result = await FileOperations.saveFileAs(content);
      
      if (result.success && result.filePath) {
        const fileName = result.filePath.split(/[/\\]/).pop() || 'Unknown';
        useFileStore.getState().setCurrentFile(result.filePath, fileName);
        useFileStore.getState().markSaved();
        RecentProjectsManager.add(result.filePath, fileName);

        if (window.electronAPI && (window.electronAPI as any).setWindowTitle) {
          (window.electronAPI as any).setWindowTitle(`${fileName} — NodeForge`);
        }
        toast.success(`Project saved as ${fileName}`);
      }
    } catch (error) {
      console.error('[FileActions] Save As failed:', error);
      toast.error('Failed to save project as new file.');
    }
  }
};
