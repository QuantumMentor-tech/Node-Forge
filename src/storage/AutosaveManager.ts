/**
 * AutosaveManager.ts
 *
 * Automatically saves the project in the background after changes.
 * Saves to a temporary location (`userData/autosave/`) without interrupting the user.
 */

import { useFileStore } from '@/stores/file.store';
import { ProjectSerializer } from './ProjectSerializer';
import { IPC_CHANNELS } from '@shared/types';

export class AutosaveManager {
  private static instance: AutosaveManager;
  private timer: NodeJS.Timeout | null = null;
  private readonly AUTOSAVE_DELAY_MS = 10000; // 10 seconds after dirty

  private constructor() {
    this.init();
  }

  static getInstance(): AutosaveManager {
    if (!AutosaveManager.instance) {
      AutosaveManager.instance = new AutosaveManager();
    }
    return AutosaveManager.instance;
  }

  private init() {
    // Subscribe to dirty state changes
    useFileStore.subscribe((state, prevState) => {
      if (state.isDirty && !prevState.isDirty) {
        this.scheduleAutosave();
      } else if (!state.isDirty && prevState.isDirty) {
        // Was saved manually, clear autosave
        this.cancelAutosave();
        this.clearAutosaveFile();
      }
    });
  }

  private scheduleAutosave() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.performAutosave();
    }, this.AUTOSAVE_DELAY_MS);
  }

  private cancelAutosave() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private async performAutosave() {
    const state = useFileStore.getState();
    if (!state.isDirty) return;

    try {
      const projectData = ProjectSerializer.serialize();
      const content = JSON.stringify(projectData);
      
      const autosaveData = {
        originalFilePath: state.currentFilePath,
        originalFileName: state.currentFileName,
        savedAt: Date.now(),
        project: projectData
      };

      if (window.electronAPI && (window.electronAPI as any).autosave) {
        await (window.electronAPI as any).autosave(JSON.stringify(autosaveData));
        console.log('[AutosaveManager] Autosave completed.');
      }
    } catch (error) {
      console.error('[AutosaveManager] Autosave failed:', error);
    }
  }

  private async clearAutosaveFile() {
    if (window.electronAPI && (window.electronAPI as any).clearAutosave) {
      try {
        await (window.electronAPI as any).clearAutosave();
        console.log('[AutosaveManager] Autosave cleared after manual save.');
      } catch (error) {
        console.error('[AutosaveManager] Failed to clear autosave:', error);
      }
    }
  }
}
