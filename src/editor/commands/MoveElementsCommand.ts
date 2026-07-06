/**
 * MoveElementsCommand.ts
 *
 * Records the before/after positions of moved elements.
 * This is committed ONCE on mouseup — not on every mousemove pixel.
 *
 * execute() → applies the final positions
 * undo()    → restores the original positions
 */

import { BaseCommand } from './Command';
import { useCanvasStore } from '@/stores/canvas.store';
import type { Bounds } from '@/types/canvas.types';

export interface ElementPositionSnapshot {
  id: string;
  before: Bounds;
  after: Bounds;
}

export class MoveElementsCommand extends BaseCommand {
  constructor(private readonly snapshots: ElementPositionSnapshot[]) {
    super(
      'MoveElementsCommand',
      snapshots.length === 1 ? 'Move Element' : `Move ${snapshots.length} Elements`,
    );
  }

  execute(): void {
    const { updateElement } = useCanvasStore.getState();
    for (const snap of this.snapshots) {
      updateElement(snap.id, { bounds: snap.after });
    }
  }

  undo(): void {
    const { updateElement } = useCanvasStore.getState();
    for (const snap of this.snapshots) {
      updateElement(snap.id, { bounds: snap.before });
    }
  }

  protected getPayload() {
    return { snapshots: this.snapshots };
  }
}
