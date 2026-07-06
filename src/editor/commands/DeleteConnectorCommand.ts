/**
 * DeleteConnectorCommand.ts
 *
 * Handles deletion of a single connector by ID.
 *
 * execute() → removes connector
 * undo()    → restores connector
 */

import { BaseCommand } from './Command';
import { useCanvasStore } from '@/stores/canvas.store';
import { useSelectionStore } from '@/stores/selection.store';
import type { Connector } from '@/types/canvas.types';

export class DeleteConnectorCommand extends BaseCommand {
  private readonly connector: Connector;

  constructor(connectorId: string) {
    super('DeleteConnectorCommand', 'Delete Connector');

    const found = useCanvasStore
      .getState()
      .connectors.find((c) => c.id === connectorId);

    if (!found) {
      throw new Error(`DeleteConnectorCommand: connector ${connectorId} not found`);
    }
    this.connector = found;
  }

  execute(): void {
    useSelectionStore.getState().deselect(this.connector.id);
    useCanvasStore.getState().removeConnector(this.connector.id);
  }

  undo(): void {
    useCanvasStore.getState().addConnector(this.connector);
    useSelectionStore.getState().select(this.connector.id);
  }

  protected getPayload() {
    return { connectorId: this.connector.id };
  }
}
