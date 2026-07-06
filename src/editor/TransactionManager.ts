/**
 * TransactionManager.ts
 *
 * Provides begin/commit/rollback semantics for grouping multiple commands
 * that form a single logical user operation.
 *
 * Usage example:
 *   TransactionManager.begin('Paste Elements');
 *   EditorActions.createElement(...)  // internally calls TransactionManager.add(cmd)
 *   EditorActions.createElement(...)
 *   TransactionManager.commit();       // → one CompoundCommand pushed to CommandManager
 *
 * Supports nested transactions (inner commits defer to the outermost transaction).
 */

import type { ICommand } from './commands/Command';
import { CompoundCommand } from './commands/CompoundCommand';
import { CommandManager } from './CommandManager';

interface Transaction {
  label: string;
  commands: ICommand[];
}

export class TransactionManager {
  private static instance: TransactionManager;

  private stack: Transaction[] = [];

  static getInstance(): TransactionManager {
    if (!TransactionManager.instance) {
      TransactionManager.instance = new TransactionManager();
    }
    return TransactionManager.instance;
  }

  private constructor() {}

  get isActive(): boolean {
    return this.stack.length > 0;
  }

  /** Begin a new transaction (supports nesting). */
  begin(label: string): void {
    this.stack.push({ label, commands: [] });
  }

  /**
   * Add a command to the currently active transaction.
   * If no transaction is active, executes the command immediately.
   */
  add(command: ICommand): void {
    if (this.stack.length === 0) {
      // No active transaction — execute directly
      CommandManager.getInstance().execute(command);
      return;
    }
    // Optimistic execution during transaction (so state is visible immediately)
    command.execute();
    this.stack[this.stack.length - 1].commands.push(command);
  }

  /**
   * Commit the innermost transaction.
   * If this is the outermost transaction, wraps all commands in a CompoundCommand
   * and pushes it to the CommandManager (without re-executing — already done optimistically).
   */
  commit(): void {
    const tx = this.stack.pop();
    if (!tx) return;

    if (this.stack.length === 0) {
      // Outermost transaction — push as compound (already executed, so we wrap without re-running)
      if (tx.commands.length > 0) {
        const compound = new CompoundCommand(tx.label, tx.commands);
        // Push to stack without re-executing (the optimistic executions already ran)
        CommandManager.getInstance().pushUndo(compound);
      }
    } else {
      // Nested transaction — merge into parent
      this.stack[this.stack.length - 1].commands.push(...tx.commands);
    }
  }

  /**
   * Rollback the innermost transaction — undoes all optimistically executed commands.
   */
  rollback(): void {
    const tx = this.stack.pop();
    if (!tx) return;

    // Undo in reverse order
    for (let i = tx.commands.length - 1; i >= 0; i--) {
      tx.commands[i].undo();
    }
  }
}
