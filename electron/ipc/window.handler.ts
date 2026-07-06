import { ipcMain, BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '../../shared/types';

export function registerWindowHandlers(): void {
  ipcMain.on(IPC_CHANNELS.WINDOW_SET_TITLE, (event, title: string) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.setTitle(title);
    }
  });

  // Note: WINDOW_CONFIRM_CLOSE is handled directly in main.ts
  // because it needs to intercept the close event synchronously.
}
