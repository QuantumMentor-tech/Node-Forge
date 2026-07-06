/**
 * DeleteElementsCommand.ts
 *
 * Handles the deletion of one or more CanvasElements.
 * Automatically captures and restores any connectors that referenced the deleted elements.
 *
 * execute() → removes elements + their dependent connectors
 * undo()    → restores elements + their connectors in exact original order
 */

import { BaseCommand } from './Command';
import { useCanvasStore } from '@/stores/canvas.store';
import { useSelectionStore } from '@/stores/selection.store';
import type { CanvasElement, Connector } from '@/types/canvas.types';

export class DeleteElementsCommand extends BaseCommand {
  private readonly elements: CanvasElement[];
  private readonly affectedConnectors: Connector[];

  constructor(elementIds: string[]) {
    super('DeleteElementsCommand', elementIds.length === 1 ? 'Delete Element' : `Delete ${elementIds.length} Elements`);

    // Snapshot state at command creation time (before execute)
    const { elements, connectors } = useCanvasStore.getState();
    const idSet = new Set(elementIds);

    this.elements = elements.filter((el) => idSet.has(el.id));
    this.affectedConnectors = connectors.filter(
      (c) => idSet.has(c.sourceId) || idSet.has(c.targetId) || idSet.has(c.id),
    );
  }

  execute(): void {
    const ids = this.elements.map((el) => el.id);
    useSelectionStore.getState().clearSelection();
    useCanvasStore.getState().removeElements(ids);
  }

  undo(): void {
    const { addElement, addConnector } = useCanvasStore.getState();
    // Restore elements first (connectors reference element IDs)
    for (const el of this.elements) {
      addElement(el);
    }
    // Then restore connectors
    for (const conn of this.affectedConnectors) {
      addConnector(conn);
    }
    // Restore selection
    useSelectionStore.getState().selectAll(this.elements.map((el) => el.id));
  }

  protected getPayload() {
    return {
      elementIds: this.elements.map((el) => el.id),
      affectedConnectorIds: this.affectedConnectors.map((c) => c.id),
    };
  }
}
