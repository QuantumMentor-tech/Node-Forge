/**
 * CreateConnectorCommand.ts
 *
 * Handles the creation of a connector between two elements.
 *
 * execute() → adds connector to canvas store
 * undo()    → removes connector
 */

import { BaseCommand } from './Command';
import { useCanvasStore } from '@/stores/canvas.store';
import { useSelectionStore } from '@/stores/selection.store';
import type { Connector } from '@/types/canvas.types';

export class CreateConnectorCommand extends BaseCommand {
  constructor(private readonly connector: Connector) {
    super('CreateConnectorCommand', 'Create Connector');
  }

  execute(): void {
    useCanvasStore.getState().addConnector(this.connector);
    useSelectionStore.getState().select(this.connector.id);
  }

  undo(): void {
    useSelectionStore.getState().deselect(this.connector.id);
    useCanvasStore.getState().removeConnector(this.connector.id);
  }

  protected getPayload() {
    return { connector: this.connector };
  }
}
