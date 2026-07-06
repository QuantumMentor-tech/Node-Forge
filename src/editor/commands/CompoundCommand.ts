/**
 * CompoundCommand.ts
 *
 * Groups multiple commands into a single undoable transaction.
 * Used by TransactionManager to batch user interactions.
 *
 * execute() → executes all child commands in order
 * undo()    → undoes all child commands in REVERSE order
 */

import { BaseCommand, type ICommand } from './Command';

export class CompoundCommand extends BaseCommand {
  constructor(
    label: string,
    private readonly commands: ICommand[],
  ) {
    super('CompoundCommand', label);
  }

  execute(): void {
    for (const cmd of this.commands) {
      cmd.execute();
    }
  }

  undo(): void {
    // Reverse order to unwind in the correct sequence
    for (let i = this.commands.length - 1; i >= 0; i--) {
      this.commands[i].undo();
    }
  }

  get isEmpty(): boolean {
    return this.commands.length === 0;
  }

  get commandCount(): number {
    return this.commands.length;
  }

  protected getPayload() {
    return {
      commands: this.commands.map((c) =>
        c.serialize ? c.serialize() : { id: c.id, type: c.type, label: c.label },
      ),
    };
  }
}
