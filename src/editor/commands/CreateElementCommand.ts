/**
 * CreateElementCommand.ts
 *
 * Handles the creation of a new CanvasElement.
 * execute() → adds the element
 * undo()    → removes the element (and any connectors that reference it)
 */

import { BaseCommand } from './Command';
import { useCanvasStore } from '@/stores/canvas.store';
import { useSelectionStore } from '@/stores/selection.store';
import type { CanvasElement } from '@/types/canvas.types';

export class CreateElementCommand extends BaseCommand {
  constructor(private readonly element: CanvasElement) {
    super('CreateElementCommand', `Create ${element.type}`);
  }

  execute(): void {
    useCanvasStore.getState().addElement(this.element);
    useSelectionStore.getState().select(this.element.id);
  }

  undo(): void {
    useSelectionStore.getState().deselect(this.element.id);
    useCanvasStore.getState().removeElement(this.element.id);
  }

  protected getPayload() {
    return { element: this.element };
  }
}
