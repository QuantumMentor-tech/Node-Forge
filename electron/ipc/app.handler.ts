import { ipcMain, app, BrowserWindow, nativeTheme } from 'electron';
import { IPC_CHANNELS } from '../../shared/types';

/**
 * App-level IPC handlers for version, window controls, and theme detection.
 */
export function registerAppHandlers(): void {
  // ─── App Version ──────────────────────────────────────────────────────
  ipcMain.handle(IPC_CHANNELS.APP_GET_VERSION, () => {
    return app.getVersion();
  });

  // ─── Quit ─────────────────────────────────────────────────────────────
  ipcMain.on(IPC_CHANNELS.APP_QUIT, () => {
    app.quit();
  });

  // ─── Window Controls ──────────────────────────────────────────────────
  ipcMain.on(IPC_CHANNELS.APP_MINIMIZE, () => {
    const window = BrowserWindow.getFocusedWindow();
    window?.minimize();
  });

  ipcMain.on(IPC_CHANNELS.APP_MAXIMIZE, () => {
    const window = BrowserWindow.getFocusedWindow();
    if (window) {
      if (window.isMaximized()) {
        window.unmaximize();
      } else {
        window.maximize();
      }
    }
  });

  ipcMain.handle(IPC_CHANNELS.APP_IS_MAXIMIZED, () => {
    const window = BrowserWindow.getFocusedWindow();
    return window?.isMaximized() ?? false;
  });

  // ─── Theme ────────────────────────────────────────────────────────────
  ipcMain.handle(IPC_CHANNELS.THEME_GET_SYSTEM, () => {
    return nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
  });

  // Notify renderer when system theme changes
  nativeTheme.on('updated', () => {
    const windows = BrowserWindow.getAllWindows();
    const theme = nativeTheme.shouldUseDarkColors ? 'dark' : 'light';
    windows.forEach((win) => {
      win.webContents.send(IPC_CHANNELS.THEME_ON_CHANGE, theme);
    });
  });
}
