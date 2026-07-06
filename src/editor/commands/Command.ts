/**
 * Command.ts — Base interface and abstract class for all editor commands.
 *
 * Every user action that mutates editor state MUST be implemented as a Command.
 * This guarantees that all mutations are reversible, serializable, and replayable.
 *
 * Future extensions: collaboration ops, macro recording, scripting API.
 */

// ─── Serialized form for persistence / collaboration ─────────────────────────

export interface SerializedCommand {
  id: string;
  type: string;
  label: string;
  timestamp: number;
  payload: unknown;
}

// ─── Core Command interface ───────────────────────────────────────────────────

export interface ICommand {
  /** Unique identifier for this command instance */
  readonly id: string;

  /** Discriminator string — matches the class name for serialization */
  readonly type: string;

  /** Human-readable description shown in the history panel */
  readonly label: string;

  /** Unix timestamp of when the command was created */
  readonly timestamp: number;

  /**
   * Apply this command's mutation to the application state.
   * Must be idempotent relative to undo — i.e. execute() after undo()
   * should restore exactly the same state as the original execution.
   */
  execute(): void;

  /**
   * Reverse this command's mutation, restoring the prior state.
   */
  undo(): void;

  /**
   * Serialize this command to a plain object for persistence or IPC transport.
   * Implement in concrete subclasses. Optional for non-serializable commands.
   */
  serialize?(): SerializedCommand;
}

// ─── Abstract base class with shared boilerplate ─────────────────────────────

export abstract class BaseCommand implements ICommand {
  readonly id: string;
  readonly timestamp: number;

  constructor(
    public readonly type: string,
    public readonly label: string,
  ) {
    this.id = `cmd-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    this.timestamp = Date.now();
  }

  abstract execute(): void;
  abstract undo(): void;

  serialize(): SerializedCommand {
    return {
      id: this.id,
      type: this.type,
      label: this.label,
      timestamp: this.timestamp,
      payload: this.getPayload(),
    };
  }

  /**
   * Override in subclasses to provide the serializable payload.
   */
  protected getPayload(): unknown {
    return null;
  }
}
