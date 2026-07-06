/**
 * RecoveryManager.ts
 *
 * Checks for autosave data on startup. If an autosaved session exists,
 * it notifies the UI (via a Zustand store) to display a recovery banner.
 */

import { create } from 'zustand';
import type { AutosaveRecord } from './schema/ProjectSchema';
import { ProjectSerializer } from './ProjectSerializer';

interface RecoveryState {
  hasRecoveryData: boolean;
  recoveryRecord: AutosaveRecord | null;
  
  setRecoveryData: (record: AutosaveRecord | null) => void;
  dismissRecovery: () => void;
}

export const useRecoveryStore = create<RecoveryState>((set) => ({
  hasRecoveryData: false,
  recoveryRecord: null,

  setRecoveryData: (record) => set({ hasRecoveryData: !!record, recoveryRecord: record }),
  dismissRecovery: () => set({ hasRecoveryData: false, recoveryRecord: null }),
}));

export class RecoveryManager {
  /**
   * Check if there's an autosaved session.
   * Call this once during app initialization.
   */
  static async checkForRecoveryData(): Promise<void> {
    if (!window.electronAPI || !(window.electronAPI as any).checkAutosave) {
      return;
    }

    try {
      const result = await (window.electronAPI as any).checkAutosave();
      if (result.hasAutosave && result.content) {
        const record = JSON.parse(result.content) as AutosaveRecord;
        // Verify the project can be parsed (avoid offering corrupt recoveries)
        if (record && record.project) {
           useRecoveryStore.getState().setRecoveryData(record);
        }
      }
    } catch (error) {
      console.error('[RecoveryManager] Failed to check for recovery data:', error);
    }
  }

  /**
   * Restore the recovered session and apply it to the editor.
   */
  static restoreSession(): void {
    const { recoveryRecord, dismissRecovery } = useRecoveryStore.getState();
    if (!recoveryRecord) return;

    try {
      // Deserialize and apply
      ProjectSerializer.deserializeAndApply(
        recoveryRecord.project,
        recoveryRecord.originalFilePath || '',
        recoveryRecord.originalFileName || 'Recovered File'
      );
      
      // Dismiss the banner
      dismissRecovery();
    } catch (error) {
      console.error('[RecoveryManager] Failed to restore session:', error);
      alert('Failed to restore the session. The data might be corrupted.');
    }
  }

  /**
   * Discard the recovered session (delete the autosave file).
   */
  static async discardSession(): Promise<void> {
    if (window.electronAPI && (window.electronAPI as any).clearAutosave) {
      await (window.electronAPI as any).clearAutosave();
    }
    useRecoveryStore.getState().dismissRecovery();
  }
}
