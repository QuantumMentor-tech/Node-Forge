/**
 * ReorderElementsCommand.ts
 *
 * Changes the z-index of elements for arrangement operations
 * (bring to front, send to back, etc.)
 */

import { BaseCommand } from './Command';
import { useCanvasStore } from '@/stores/canvas.store';

export interface ZIndexSnapshot {
  id: string;
  before: number;
  after: number;
}

export class ReorderElementsCommand extends BaseCommand {
  private snapshots: ZIndexSnapshot[];

  constructor(snapshots: ZIndexSnapshot[], label: string) {
    super('ReorderElementsCommand', label);
    this.snapshots = snapshots;
  }

  execute(): void {
    const { updateElement } = useCanvasStore.getState();
    for (const snap of this.snapshots) {
      updateElement(snap.id, { zIndex: snap.after });
    }
  }

  undo(): void {
    const { updateElement } = useCanvasStore.getState();
    for (const snap of this.snapshots) {
      updateElement(snap.id, { zIndex: snap.before });
    }
  }
}
