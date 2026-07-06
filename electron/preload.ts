import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS, type ElectronAPI } from '../shared/types';

/**
 * Preload script — exposes a safe, typed API to the renderer process
 * via contextBridge. No Node.js APIs leak into the renderer.
 */
const electronAPI: ElectronAPI = {
  // ─── File Operations ────────────────────────────────────────────────
  openFile: () => ipcRenderer.invoke(IPC_CHANNELS.FILE_OPEN),

  saveFile: (filePath: string, content: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_SAVE, filePath, content),

  saveFileAs: (content: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_SAVE_AS, content),

  readFile: (filePath: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_READ, filePath),

  newFile: () => ipcRenderer.send(IPC_CHANNELS.FILE_NEW),

  exportFile: (defaultFileName: string, data: Uint8Array, filters: { name: string, extensions: string[] }[]) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_EXPORT, defaultFileName, data, filters),

  autosave: (content: string) =>
    ipcRenderer.invoke(IPC_CHANNELS.FILE_AUTOSAVE, content),

  clearAutosave: () => ipcRenderer.invoke(IPC_CHANNELS.FILE_DELETE),

  checkAutosave: () => ipcRenderer.invoke(IPC_CHANNELS.FILE_CHECK_AUTOSAVE),

  // ─── Window Operations ──────────────────────────────────────────────
  setWindowTitle: (title: string) => ipcRenderer.send(IPC_CHANNELS.WINDOW_SET_TITLE, title),
  
  confirmClose: (isDirty: boolean) => ipcRenderer.send(IPC_CHANNELS.WINDOW_CONFIRM_CLOSE, isDirty),

  onRequestClose: (callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on('window:request-close', handler);
    return () => ipcRenderer.removeListener('window:request-close', handler);
  },

  // ─── Menu Events ────────────────────────────────────────────────────
  onMenuEvent: (event: string, callback: () => void) => {
    const handler = () => callback();
    ipcRenderer.on(`menu:${event}`, handler);
    return () => ipcRenderer.removeListener(`menu:${event}`, handler);
  },

  // ─── App Operations ─────────────────────────────────────────────────
  getVersion: () => ipcRenderer.invoke(IPC_CHANNELS.APP_GET_VERSION),

  quit: () => ipcRenderer.send(IPC_CHANNELS.APP_QUIT),

  minimize: () => ipcRenderer.send(IPC_CHANNELS.APP_MINIMIZE),

  maximize: () => ipcRenderer.send(IPC_CHANNELS.APP_MAXIMIZE),

  isMaximized: () => ipcRenderer.invoke(IPC_CHANNELS.APP_IS_MAXIMIZED),

  // ─── Theme ──────────────────────────────────────────────────────────
  getSystemTheme: () => ipcRenderer.invoke(IPC_CHANNELS.THEME_GET_SYSTEM),

  onThemeChange: (callback: (theme: 'light' | 'dark') => void) => {
    const handler = (_event: Electron.IpcRendererEvent, theme: 'light' | 'dark') => {
      callback(theme);
    };
    ipcRenderer.on(IPC_CHANNELS.THEME_ON_CHANGE, handler);

    // Return cleanup function
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.THEME_ON_CHANGE, handler);
    };
  },

  // ─── Platform ───────────────────────────────────────────────────────
  platform: process.platform,
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
