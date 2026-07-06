/**
 * command.store.ts
 *
 * Reactive Zustand bridge that subscribes to CommandManager and exposes
 * canUndo, canRedo, history labels, and counts as reactive state.
 *
 * Components use this store — they never access CommandManager directly.
 * This cleanly separates the imperative command engine from React's reactive world.
 */

import { create } from 'zustand';
import { CommandManager, type CommandManagerSnapshot } from '@/editor/CommandManager';

interface CommandStoreState extends CommandManagerSnapshot {
  // Trigger actions (delegate to CommandManager via EditorActions)
  _sync: (snapshot: CommandManagerSnapshot) => void;
}

export const useCommandStore = create<CommandStoreState>((set) => {
  // Subscribe to CommandManager and mirror its state into Zustand
  CommandManager.getInstance().subscribe((snapshot) => {
    set(snapshot);
  });

  return {
    // Initial state (will be immediately overwritten by the subscribe callback above)
    canUndo: false,
    canRedo: false,
    undoLabel: null,
    redoLabel: null,
    undoCount: 0,
    redoCount: 0,
    history: [],
    _sync: (snapshot) => set(snapshot),
  };
});
