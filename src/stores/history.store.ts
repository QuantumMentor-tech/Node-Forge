/**
 * history.store.ts
 *
 * Thin reactive bridge — delegates to CommandManager via command.store.
 * Kept for backwards compatibility with components that imported useHistoryStore.
 *
 * Components should prefer useCommandStore for richer data (labels, counts, history list).
 * This store re-exports the key reactive flags for convenience.
 */

export { useCommandStore as useHistoryStore } from './command.store';
