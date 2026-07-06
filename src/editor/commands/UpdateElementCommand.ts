/**
 * UpdateElementCommand.ts
 *
 * Records a property/style change on a single element.
 * Supports any partial update to CanvasElement — bounds, style, label, rotation, etc.
 *
 * execute() → applies the new values
 * undo()    → restores the previous values
 */

import { BaseCommand } from './Command';
import { useCanvasStore } from '@/stores/canvas.store';
import type { CanvasElement } from '@/types/canvas.types';

export class UpdateElementCommand extends BaseCommand {
  private readonly before: Partial<CanvasElement>;
  private readonly after: Partial<CanvasElement>;

  constructor(
    private readonly elementId: string,
    updates: Partial<CanvasElement>,
    labelOverride?: string,
  ) {
    super('UpdateElementCommand', labelOverride ?? 'Update Element');

    // Snapshot current values for all keys being changed
    const current = useCanvasStore
      .getState()
      .elements.find((el) => el.id === elementId);

    if (!current) {
      this.before = {};
    } else {
      // Deep-snapshot only the fields being changed
      this.before = Object.keys(updates).reduce((acc, key) => {
        const k = key as keyof CanvasElement;
        // Deep clone style if updating style (nested object)
        if (k === 'style' && current.style) {
          (acc as Record<string, unknown>)[k] = { ...current.style };
        } else if (k === 'bounds' && current.bounds) {
          (acc as Record<string, unknown>)[k] = { ...current.bounds };
        } else {
          (acc as Record<string, unknown>)[k] = current[k];
        }
        return acc;
      }, {} as Partial<CanvasElement>);
    }

    this.after = updates;
  }

  execute(): void {
    useCanvasStore.getState().updateElement(this.elementId, this.after);
  }

  undo(): void {
    useCanvasStore.getState().updateElement(this.elementId, this.before);
  }

  protected getPayload() {
    return { elementId: this.elementId, before: this.before, after: this.after };
  }
}
