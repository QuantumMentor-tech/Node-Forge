/**
 * UpdateConnectorCommand.ts
 *
 * Records a property or style change on a single connector.
 * Supports partial updates to a Connector — label, type, waypoints, style, etc.
 *
 * execute() → applies the new values
 * undo()    → restores the previous values
 */

import { BaseCommand } from './Command';
import { useCanvasStore } from '@/stores/canvas.store';
import type { Connector } from '@/types/canvas.types';

export class UpdateConnectorCommand extends BaseCommand {
  private readonly before: Partial<Connector>;
  private readonly after: Partial<Connector>;

  constructor(
    private readonly connectorId: string,
    updates: Partial<Connector>,
    labelOverride?: string,
  ) {
    super('UpdateConnectorCommand', labelOverride ?? 'Update Connector');

    const current = useCanvasStore
      .getState()
      .connectors.find((c) => c.id === connectorId);

    if (!current) {
      this.before = {};
    } else {
      // Snapshot the previous state of the fields that are being modified
      this.before = Object.keys(updates).reduce((acc, key) => {
        const k = key as keyof Connector;
        if (k === 'style' && current.style) {
          (acc as Record<string, unknown>)[k] = { ...current.style };
        } else if (k === 'waypoints' && current.waypoints) {
          (acc as Record<string, unknown>)[k] = current.waypoints.map((p) => ({ ...p }));
        } else if (k === 'sourcePoint' && current.sourcePoint) {
          (acc as Record<string, unknown>)[k] = { ...current.sourcePoint };
        } else if (k === 'targetPoint' && current.targetPoint) {
          (acc as Record<string, unknown>)[k] = { ...current.targetPoint };
        } else {
          (acc as Record<string, unknown>)[k] = current[k];
        }
        return acc;
      }, {} as Partial<Connector>);
    }

    this.after = updates;
  }

  execute(): void {
    useCanvasStore.getState().updateConnector(this.connectorId, this.after);
  }

  undo(): void {
    useCanvasStore.getState().updateConnector(this.connectorId, this.before);
  }

  protected getPayload() {
    return { connectorId: this.connectorId, before: this.before, after: this.after };
  }
}
