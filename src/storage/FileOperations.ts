/**
 * FileOperations.ts
 *
 * Singleton service wrapping all Electron IPC calls for file operations.
 * Provides a typed interface and keeps window.electronAPI out of UI components.
 */

import type { FileDialogResult, FileSaveResult, FileData } from '@shared/types';

export class FileOperations {
  /**
   * Show native Open File dialog and read the selected file.
   */
  static async openFile(): Promise<FileDialogResult> {
    if (typeof window.electronAPI === 'undefined') {
      console.warn('[FileOperations] electronAPI not found. Running in browser?');
      return { canceled: true };
    }
    return await window.electronAPI.openFile();
  }

  /**
   * Save content to a known file path.
   */
  static async saveFile(filePath: string, content: string): Promise<FileSaveResult> {
    if (typeof window.electronAPI === 'undefined') {
      console.warn('[FileOperations] electronAPI not found. Running in browser?');
      return { success: false, error: 'No electron API' };
    }
    return await window.electronAPI.saveFile(filePath, content);
  }

  /**
   * Show native Save As dialog and write content.
   */
  static async saveFileAs(content: string): Promise<FileSaveResult> {
    if (typeof window.electronAPI === 'undefined') {
      console.warn('[FileOperations] electronAPI not found. Running in browser?');
      return { success: false, error: 'No electron API' };
    }
    return await window.electronAPI.saveFileAs(content);
  }

  /**
   * Read file content from a known path without a dialog (e.g. for Recent Files).
   */
  static async readFile(filePath: string): Promise<FileData> {
    if (typeof window.electronAPI === 'undefined') {
      throw new Error('[FileOperations] electronAPI not found. Running in browser?');
    }
    return await window.electronAPI.readFile(filePath);
  }

  /**
   * Trigger the New File command via IPC.
   */
  static newFile(): void {
    if (typeof window.electronAPI !== 'undefined') {
      window.electronAPI.newFile();
    }
  }
}
