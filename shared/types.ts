/**
 * Shared type definitions used by both Electron main process and React renderer.
 */

// ─── IPC Channel Definitions ────────────────────────────────────────────────

export const IPC_CHANNELS = {
  // File operations
  FILE_OPEN: 'file:open',
  FILE_SAVE: 'file:save',
  FILE_SAVE_AS: 'file:save-as',
  FILE_READ: 'file:read',
  FILE_NEW: 'file:new',
  FILE_EXPORT: 'file:export',
  FILE_AUTOSAVE: 'file:autosave',
  FILE_GET_APP_DATA_PATH: 'file:get-app-data-path',
  FILE_DELETE: 'file:delete',
  FILE_CHECK_AUTOSAVE: 'file:check-autosave',

  // Window operations
  WINDOW_SET_TITLE: 'window:set-title',
  WINDOW_CONFIRM_CLOSE: 'window:confirm-close',

  // App operations
  APP_GET_VERSION: 'app:get-version',
  APP_QUIT: 'app:quit',
  APP_MINIMIZE: 'app:minimize',
  APP_MAXIMIZE: 'app:maximize',
  APP_IS_MAXIMIZED: 'app:is-maximized',

  // Theme
  THEME_GET_SYSTEM: 'theme:get-system',
  THEME_ON_CHANGE: 'theme:on-change',

  // Dialog
  DIALOG_SHOW_MESSAGE: 'dialog:show-message',
  DIALOG_SHOW_ERROR: 'dialog:show-error',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];

// ─── File Types ─────────────────────────────────────────────────────────────

export interface FileData {
  filePath: string;
  content: string;
  fileName: string;
}

export interface FileDialogResult {
  canceled: boolean;
  filePath?: string;
  content?: string;
}

export interface FileSaveResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

// ─── Electron API exposed via preload ───────────────────────────────────────

export interface ElectronAPI {
  // File operations
  openFile: () => Promise<FileDialogResult>;
  saveFile: (filePath: string, content: string) => Promise<FileSaveResult>;
  saveFileAs: (content: string) => Promise<FileSaveResult>;
  readFile: (filePath: string) => Promise<FileData>;
  newFile: () => void;
  exportFile: (defaultFileName: string, data: Uint8Array, filters: { name: string, extensions: string[] }[]) => Promise<FileSaveResult>;
  autosave: (content: string) => Promise<FileSaveResult>;
  clearAutosave: () => Promise<boolean>;
  checkAutosave: () => Promise<{ hasAutosave: boolean; content?: string }>;
  
  // Window Operations
  setWindowTitle: (title: string) => void;
  confirmClose: (isDirty: boolean) => void;
  onRequestClose: (callback: () => void) => () => void;
  
  // Menu Operations
  onMenuEvent: (event: string, callback: () => void) => () => void;

  // App operations
  getVersion: () => Promise<string>;
  quit: () => void;
  minimize: () => void;
  maximize: () => void;
  isMaximized: () => Promise<boolean>;

  // Theme
  getSystemTheme: () => Promise<'light' | 'dark'>;
  onThemeChange: (callback: (theme: 'light' | 'dark') => void) => () => void;

  // Platform info
  platform: NodeJS.Platform;
}

// ─── Global Window Type Augmentation ────────────────────────────────────────

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
