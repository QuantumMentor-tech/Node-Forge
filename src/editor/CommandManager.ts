/**
 * CommandManager.ts
 *
 * Central authority for command execution, undo/redo, and stack management.
 *
 * Design principles:
 *  - Singleton class; one instance for the entire application lifetime
 *  - All mutations to editor state flow through here
 *  - Emits reactive signals via a subscriber pattern so Zustand stores can reflect state
 *  - Supports: single commands, compound commands, batched execution
 *  - Stack limits prevent unbounded memory growth
 *  - Prepared for: collaboration op transforms, macro recording, action replay
 */

import type { ICommand } from './commands/Command';
import { CompoundCommand } from './commands/CompoundCommand';

export interface CommandManagerSnapshot {
  canUndo: boolean;
  canRedo: boolean;
  undoLabel: string | null;
  redoLabel: string | null;
  undoCount: number;
  redoCount: number;
  history: Array<{ id: string; label: string; type: string; timestamp: number }>;
}

type ChangeListener = (snapshot: CommandManagerSnapshot) => void;

export class CommandManager {
  private static instance: CommandManager;

  private undoStack: ICommand[] = [];
  private redoStack: ICommand[] = [];
  private readonly maxStackSize: number = 200;
  private listeners: Set<ChangeListener> = new Set();

  // ─── Singleton ────────────────────────────────────────────────────────────

  static getInstance(): CommandManager {
    if (!CommandManager.instance) {
      CommandManager.instance = new CommandManager();
    }
    return CommandManager.instance;
  }

  private constructor() {}

  // ─── Subscriptions ────────────────────────────────────────────────────────

  subscribe(listener: ChangeListener): () => void {
    this.listeners.add(listener);
    // Immediately emit current state
    listener(this.getSnapshot());
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      listener(snapshot);
    }
  }

  getSnapshot(): CommandManagerSnapshot {
    return {
      canUndo: this.undoStack.length > 0,
      canRedo: this.redoStack.length > 0,
      undoLabel: this.undoStack.at(-1)?.label ?? null,
      redoLabel: this.redoStack.at(-1)?.label ?? null,
      undoCount: this.undoStack.length,
      redoCount: this.redoStack.length,
      history: this.undoStack.map((c) => ({
        id: c.id,
        label: c.label,
        type: c.type,
        timestamp: c.timestamp,
      })),
    };
  }

  // ─── Core Operations ──────────────────────────────────────────────────────

  /**
   * Execute a single command and push it onto the undo stack.
   * Clears the redo stack (linear history model).
   */
  execute(command: ICommand): void {
    command.execute();
    this.pushToUndoStack(command);
    this.redoStack = [];
    this.notify();
  }

  /**
   * Push a pre-executed command directly to the undo stack,
   * clear the redo stack, and notify listeners.
   */
  pushUndo(command: ICommand): void {
    this.pushToUndoStack(command);
    this.redoStack = [];
    this.notify();
  }

  /**
   * Execute multiple commands as a single atomic undo unit.
   */
  batchExecute(commands: ICommand[], label: string): void {
    if (commands.length === 0) return;
    if (commands.length === 1) {
      this.execute(commands[0]);
      return;
    }
    const compound = new CompoundCommand(label, commands);
    this.execute(compound);
  }

  /**
   * Undo the last command. Returns the undone command or null.
   */
  undo(): ICommand | null {
    const command = this.undoStack.pop();
    if (!command) return null;

    command.undo();
    this.redoStack.push(command);
    this.notify();
    return command;
  }

  /**
   * Redo the last undone command. Returns the redone command or null.
   */
  redo(): ICommand | null {
    const command = this.redoStack.pop();
    if (!command) return null;

    command.execute();
    this.undoStack.push(command);
    this.notify();
    return command;
  }

  // ─── Stack Management ─────────────────────────────────────────────────────

  private pushToUndoStack(command: ICommand): void {
    this.undoStack.push(command);
    // Trim stack if over limit — drop oldest entries
    if (this.undoStack.length > this.maxStackSize) {
      this.undoStack.splice(0, this.undoStack.length - this.maxStackSize);
    }
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.notify();
  }

  getHistory(): { undoStack: ICommand[]; redoStack: ICommand[] } {
    return {
      undoStack: [...this.undoStack],
      redoStack: [...this.redoStack],
    };
  }

  setHistory(undoStack: ICommand[], redoStack: ICommand[]): void {
    this.undoStack = [...undoStack];
    this.redoStack = [...redoStack];
    this.notify();
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }
}
