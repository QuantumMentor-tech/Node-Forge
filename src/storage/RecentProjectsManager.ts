/**
 * RecentProjectsManager.ts
 *
 * Manages the list of recently opened projects using localStorage.
 */

import type { RecentProjectEntry } from './schema/ProjectSchema';
import { useFileStore } from '@/stores/file.store';

const RECENT_PROJECTS_KEY = 'nodeforge_recent_projects';

export class RecentProjectsManager {
  /**
   * Load the list from localStorage and update the file store.
   */
  static load(): void {
    try {
      const raw = localStorage.getItem(RECENT_PROJECTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as RecentProjectEntry[];
        // Don't inject directly into store if we have methods to do so,
        // but for now we might need to set it up.
        // The store currently has `addRecentFile` and `clearRecentFiles`.
        // Let's manually set the state to restore the list.
        useFileStore.setState({ recentFiles: parsed });
      }
    } catch (error) {
      console.error('[RecentProjectsManager] Failed to load recent projects:', error);
    }
  }

  /**
   * Save the current list from the store into localStorage.
   */
  static save(): void {
    try {
      const { recentFiles } = useFileStore.getState();
      localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(recentFiles));
    } catch (error) {
      console.error('[RecentProjectsManager] Failed to save recent projects:', error);
    }
  }

  /**
   * Add a project to the recent list and save.
   */
  static add(filePath: string, fileName: string): void {
    useFileStore.getState().addRecentFile(filePath, fileName);
    RecentProjectsManager.save();
  }

  /**
   * Clear all recent projects and save.
   */
  static clear(): void {
    useFileStore.getState().clearRecentFiles();
    RecentProjectsManager.save();
  }
}
