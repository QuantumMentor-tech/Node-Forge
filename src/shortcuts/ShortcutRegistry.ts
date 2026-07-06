/**
 * ShortcutRegistry.ts
 *
 * A declarative registry of keyboard shortcuts.
 * Each shortcut definition specifies key combos, an action callback, a label,
 * and an optional guard condition (e.g. "only fire when not typing in input").
 *
 * Benefits over switch/case:
 *  - Extensible: plugins/future features add shortcuts via registerShortcut()
 *  - Testable: shortcuts are plain objects
 *  - Inspectable: UI can render a "Keyboard Shortcuts" dialog from the registry
 *  - Conflict detection: duplicate key combos are warned at registration
 */

export interface ShortcutDefinition {
  /** Unique identifier for this shortcut */
  id: string;

  /** Human-readable label shown in shortcut dialogs */
  label: string;

  /** The key to match (e.g. 'z', 'Delete', 'Escape') — case-insensitive */
  key: string;

  /** Requires Ctrl/Cmd to be held */
  ctrl?: boolean;

  /** Requires Shift to be held */
  shift?: boolean;

  /** Requires Alt to be held */
  alt?: boolean;

  /** The action to execute */
  action: (e?: Event) => void;

  /**
   * Optional guard. If provided and returns false, the shortcut is suppressed.
   * Always applied in addition to the global "not in input" guard.
   */
  when?: () => boolean;
}

export class ShortcutRegistry {
  private static shortcuts: Map<string, ShortcutDefinition> = new Map();

  /** Register a shortcut. Returns true on success, false if key combo conflict exists. */
  static register(def: ShortcutDefinition): boolean {
    const key = ShortcutRegistry.buildKey(def);
    if (ShortcutRegistry.shortcuts.has(key)) {
      console.warn(
        `[ShortcutRegistry] Conflict: ${key} already registered as "${ShortcutRegistry.shortcuts.get(key)?.label}". Overwriting with "${def.label}".`,
      );
    }
    ShortcutRegistry.shortcuts.set(key, def);
    return true;
  }

  /** Register multiple shortcuts at once. */
  static registerAll(defs: ShortcutDefinition[]): void {
    for (const def of defs) {
      ShortcutRegistry.register(def);
    }
  }

  /** Unregister a shortcut by its ID. */
  static unregister(id: string): void {
    for (const [key, def] of ShortcutRegistry.shortcuts) {
      if (def.id === id) {
        ShortcutRegistry.shortcuts.delete(key);
        return;
      }
    }
  }

  /** Get all registered shortcuts (for a keyboard shortcut dialog). */
  static getAll(): ShortcutDefinition[] {
    return Array.from(ShortcutRegistry.shortcuts.values());
  }

  /**
   * Match a KeyboardEvent against the registry.
   * Returns the matching definition or undefined.
   */
  static match(e: KeyboardEvent): ShortcutDefinition | undefined {
    // Normalize key to lowercase for matching (pass e to action)
    const key = ShortcutRegistry.buildKeyFromEvent(e);
    return ShortcutRegistry.shortcuts.get(key);
  }

  private static buildKey(def: ShortcutDefinition): string {
    const parts: string[] = [];
    if (def.ctrl) parts.push('ctrl');
    if (def.shift) parts.push('shift');
    if (def.alt) parts.push('alt');
    parts.push(def.key.toLowerCase());
    return parts.join('+');
  }

  private static buildKeyFromEvent(e: KeyboardEvent): string {
    const parts: string[] = [];
    if (e.ctrlKey || e.metaKey) parts.push('ctrl');
    if (e.shiftKey) parts.push('shift');
    if (e.altKey) parts.push('alt');
    parts.push(e.key.toLowerCase());
    return parts.join('+');
  }
}
