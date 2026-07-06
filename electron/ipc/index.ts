import { registerFileHandlers } from './file.handler';
import { registerAppHandlers } from './app.handler';
import { registerWindowHandlers } from './window.handler';

/**
 * Central IPC handler registration.
 * Called once during app startup in main.ts.
 */
export function registerIpcHandlers(): void {
  registerFileHandlers();
  registerAppHandlers();
  registerWindowHandlers();
}
