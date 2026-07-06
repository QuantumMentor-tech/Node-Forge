import { ipcMain, dialog, BrowserWindow, app } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import { IPC_CHANNELS } from '../../shared/types';
import type { FileDialogResult, FileSaveResult, FileData } from '../../shared/types';

/**
 * File system IPC handlers for open, save, save-as, and read operations.
 */
export function registerFileHandlers(): void {
  // ─── Open File ────────────────────────────────────────────────────────
  ipcMain.handle(IPC_CHANNELS.FILE_OPEN, async (): Promise<FileDialogResult> => {
    const window = BrowserWindow.getFocusedWindow();
    if (!window) return { canceled: true };

    try {
      const result = await dialog.showOpenDialog(window, {
        title: 'Open Diagram',
        filters: [
          { name: 'Diagram Files', extensions: ['nodeforge', 'drawio', 'xml', 'json'] },
          { name: 'All Files', extensions: ['*'] },
        ],
        properties: ['openFile'],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { canceled: true };
      }

      const filePath = result.filePaths[0];
      const content = await fs.readFile(filePath, 'utf-8');

      return {
        canceled: false,
        filePath,
        content,
      };
    } catch (error) {
      console.error('[IPC] FILE_OPEN failed:', error);
      return { canceled: true };
    }
  });

  // ─── Save File ────────────────────────────────────────────────────────
  ipcMain.handle(
    IPC_CHANNELS.FILE_SAVE,
    async (_event, filePath: string, content: string): Promise<FileSaveResult> => {
      try {
        await fs.writeFile(filePath, content, 'utf-8');
        return { success: true, filePath };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );

  // ─── Save File As ────────────────────────────────────────────────────
  ipcMain.handle(
    IPC_CHANNELS.FILE_SAVE_AS,
    async (_event, content: string): Promise<FileSaveResult> => {
      const window = BrowserWindow.getFocusedWindow();
      if (!window) return { success: false, error: 'No focused window' };

      const result = await dialog.showSaveDialog(window, {
        title: 'Save Diagram As',
        defaultPath: 'untitled.nodeforge',
        filters: [
          { name: 'NodeForge Diagram', extensions: ['nodeforge', 'drawio'] },
          { name: 'XML', extensions: ['xml'] },
          { name: 'JSON', extensions: ['json'] },
        ],
      });

      if (result.canceled || !result.filePath) {
        return { success: false, error: 'Save cancelled' };
      }

      try {
        await fs.writeFile(result.filePath, content, 'utf-8');
        return { success: true, filePath: result.filePath };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );

  // ─── Export File (Binary/Text) ───────────────────────────────────────
  ipcMain.handle(
    IPC_CHANNELS.FILE_EXPORT,
    async (_event, defaultFileName: string, data: Uint8Array, filters: { name: string, extensions: string[] }[]): Promise<FileSaveResult> => {
      const window = BrowserWindow.getFocusedWindow();
      if (!window) return { success: false, error: 'No focused window' };

      const result = await dialog.showSaveDialog(window, {
        title: 'Export Diagram',
        defaultPath: defaultFileName,
        filters,
      });

      if (result.canceled || !result.filePath) {
        return { success: false, error: 'Export cancelled' };
      }

      try {
        await fs.writeFile(result.filePath, data);
        return { success: true, filePath: result.filePath };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );

  // ─── Read File ────────────────────────────────────────────────────────
  ipcMain.handle(
    IPC_CHANNELS.FILE_READ,
    async (_event, filePath: string): Promise<FileData> => {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        const fileName = path.basename(filePath);
        return { filePath, content, fileName };
      } catch (error) {
        console.error('[IPC] FILE_READ failed:', error);
        throw error; // Let caller handle
      }
    }
  );

  // ─── Autosave ─────────────────────────────────────────────────────────
  const getAutosavePath = () => path.join(app.getPath('userData'), 'session.autosave.nodeforge');

  ipcMain.handle(
    IPC_CHANNELS.FILE_AUTOSAVE,
    async (_event, content: string): Promise<FileSaveResult> => {
      try {
        const filePath = getAutosavePath();
        await fs.writeFile(filePath, content, 'utf-8');
        return { success: true, filePath };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );

  ipcMain.handle(IPC_CHANNELS.FILE_DELETE, async (): Promise<boolean> => {
    try {
      const filePath = getAutosavePath();
      await fs.unlink(filePath);
      return true;
    } catch {
      // Ignore errors (file probably doesn't exist)
      return false;
    }
  });

  ipcMain.handle(IPC_CHANNELS.FILE_CHECK_AUTOSAVE, async (): Promise<{ hasAutosave: boolean; content?: string }> => {
    try {
      const filePath = getAutosavePath();
      const content = await fs.readFile(filePath, 'utf-8');
      return { hasAutosave: true, content };
    } catch {
      return { hasAutosave: false };
    }
  });
}
