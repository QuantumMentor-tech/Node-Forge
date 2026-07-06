/**
 * EditorActions.ts
 *
 * THE single public API for all editor mutations.
 *
 * Every UI component, canvas interaction, and keyboard shortcut calls this object.
 * NO component should call Zustand store mutation methods directly for editor state changes.
 *
 * This layer:
 *  1. Creates the appropriate Command
 *  2. Passes it through CommandManager (or TransactionManager if a transaction is active)
 *  3. Handles cross-cutting concerns: dirty-state, selection cleanup, lifecycle
 *
 * Future integrations: collaboration broadcast, plugin hooks, macro recording.
 */

import { CommandManager } from './CommandManager';
import { TransactionManager } from './TransactionManager';
import { ToolManager, type ToolId } from './ToolManager';

import { CreateElementCommand } from './commands/CreateElementCommand';
import { DeleteElementsCommand } from './commands/DeleteElementsCommand';
import { MoveElementsCommand, type ElementPositionSnapshot } from './commands/MoveElementsCommand';
import { UpdateElementCommand } from './commands/UpdateElementCommand';
import { ReorderElementsCommand, type ZIndexSnapshot } from './commands/ReorderElementsCommand';
import { CreateConnectorCommand } from './commands/CreateConnectorCommand';
import { DeleteConnectorCommand } from './commands/DeleteConnectorCommand';
import { UpdateConnectorCommand } from './commands/UpdateConnectorCommand';

import { useCanvasStore } from '@/stores/canvas.store';
import { useSelectionStore } from '@/stores/selection.store';
import { useFileStore } from '@/stores/file.store';
import { useClipboardStore } from '@/stores/clipboard.store';
import { useLayerStore } from '@/stores/layer.store';
import { createElement } from '@/utils/element.factory';

import type { CanvasElement, Connector, ElementType, Point } from '@/types/canvas.types';

// ─── Convenience shortcuts ────────────────────────────────────────────────────

const cmd = () => CommandManager.getInstance();
const tx = () => TransactionManager.getInstance();

// ─── EditorActions public API ─────────────────────────────────────────────────

export const EditorActions = {

  // ═══════════════════════════════════════════════════════════════
  // HISTORY
  // ═══════════════════════════════════════════════════════════════

  undo(): void {
    cmd().undo();
    useFileStore.getState().setDirty(true);
  },

  redo(): void {
    cmd().redo();
    useFileStore.getState().setDirty(true);
  },

  clearHistory(): void {
    cmd().clear();
  },

  // ═══════════════════════════════════════════════════════════════
  // ELEMENTS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Create a new element on the canvas at the given world position.
   * Returns the created element ID for downstream use.
   */
  createElement(type: ElementType, position: Point): string {
    const element = createElement(type, position);
    element.layerId = useLayerStore.getState().activeLayerId;
    const command = new CreateElementCommand(element);
    cmd().execute(command);
    useFileStore.getState().setDirty(true);
    return element.id;
  },

  /**
   * Create an element from an already-constructed CanvasElement object.
   * Used by InteractionManager after the draw gesture completes.
   */
  commitElement(element: CanvasElement): void {
    if (!element.layerId) {
      element.layerId = useLayerStore.getState().activeLayerId;
    }
    const command = new CreateElementCommand(element);
    cmd().execute(command);
    useFileStore.getState().setDirty(true);
  },

  /**
   * Delete currently selected elements (shapes + connectors).
   */
  deleteSelected(): void {
    const { selectedIds } = useSelectionStore.getState();
    if (selectedIds.size === 0) return;

    const ids = Array.from(selectedIds);
    const { connectors } = useCanvasStore.getState();

    // Separate element IDs from connector IDs
    const connectorIds = ids.filter((id) => connectors.some((c) => c.id === id));
    const elementIds = ids.filter((id) => !connectorIds.includes(id));

    // Batch as a single undo unit
    if (elementIds.length > 0 && connectorIds.length === 0) {
      cmd().execute(new DeleteElementsCommand(elementIds));
    } else if (connectorIds.length > 0 && elementIds.length === 0) {
      cmd().batchExecute(
        connectorIds.map((id) => new DeleteConnectorCommand(id)),
        'Delete Connectors',
      );
    } else {
      // Mixed: delete elements first (cascades connectors), then remaining standalone connectors
      const remainingConnectorIds = connectorIds.filter((cid) => {
        const conn = connectors.find((c) => c.id === cid);
        if (!conn) return false;
        return !elementIds.includes(conn.sourceId) && !elementIds.includes(conn.targetId);
      });

      const cmds = [
        ...(elementIds.length > 0 ? [new DeleteElementsCommand(elementIds)] : []),
        ...remainingConnectorIds.map((id) => new DeleteConnectorCommand(id)),
      ];
      cmd().batchExecute(cmds, 'Delete Selection');
    }

    useFileStore.getState().setDirty(true);
  },

  /**
   * Commit a move operation. Called ONCE on mouseup with before/after snapshots.
   * The InteractionManager handles the live update during drag; this records the history entry.
   */
  commitMove(snapshots: ElementPositionSnapshot[]): void {
    if (snapshots.length === 0) return;
    // Filter out no-ops (element didn't actually move)
    const actualMoves = snapshots.filter(
      (s) =>
        s.before.x !== s.after.x ||
        s.before.y !== s.after.y,
    );
    if (actualMoves.length === 0) return;

    cmd().execute(new MoveElementsCommand(actualMoves));
    useFileStore.getState().setDirty(true);
  },

  /**
   * Nudge selected elements and their children by a specified amount (e.g. arrow keys).
   * Creates an undoable history entry.
   */
  nudge(dx: number, dy: number): void {
    const { selectedIds } = useSelectionStore.getState();
    const { elements } = useCanvasStore.getState();
    if (selectedIds.size === 0) return;

    const snapshots: ElementPositionSnapshot[] = [];
    const collectElementAndChildren = (id: string, dxVal: number, dyVal: number) => {
      const el = elements.find(e => e.id === id);
      if (el) {
        const before = { ...el.bounds };
        const after = { ...el.bounds, x: el.bounds.x + dxVal, y: el.bounds.y + dyVal };
        snapshots.push({ id, before, after });
        if (el.type === 'group') {
          const children = elements.filter(c => c.parentId === id);
          children.forEach(c => collectElementAndChildren(c.id, dxVal, dyVal));
        }
      }
    };

    for (const id of selectedIds) {
      collectElementAndChildren(id, dx, dy);
    }

    if (snapshots.length > 0) {
      cmd().execute(new MoveElementsCommand(snapshots));
      useFileStore.getState().setDirty(true);
    }
  },

  /**
   * Update a single element's properties. Creates an undoable history entry.
   */
  updateElement(elementId: string, updates: Partial<CanvasElement>, label?: string): void {
    cmd().execute(new UpdateElementCommand(elementId, updates, label));
    useFileStore.getState().setDirty(true);
  },

  /**
   * Update a single connector's properties. Creates an undoable history entry.
   */
  updateConnector(connectorId: string, updates: Partial<Connector>, label?: string): void {
    cmd().execute(new UpdateConnectorCommand(connectorId, updates, label));
    useFileStore.getState().setDirty(true);
  },

  /**
   * Duplicate selected elements with an offset.
   */
  duplicateSelected(): void {
    const { selectedIds } = useSelectionStore.getState();
    if (selectedIds.size === 0) return;

    const { elements } = useCanvasStore.getState();
    const selected = elements.filter((el) => selectedIds.has(el.id));

    tx().begin('Duplicate Elements');
    const newIds: string[] = [];

    for (const el of selected) {
      const newEl: CanvasElement = {
        ...el,
        id: `${el.type}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        bounds: {
          ...el.bounds,
          x: el.bounds.x + 20,
          y: el.bounds.y + 20,
        },
        zIndex: Date.now(),
      };
      tx().add(new CreateElementCommand(newEl));
      newIds.push(newEl.id);
    }

    tx().commit();

    // Select the new duplicates
    useSelectionStore.getState().selectAll(newIds);
    useFileStore.getState().setDirty(true);
  },

  // ═══════════════════════════════════════════════════════════════
  // CLIPBOARD
  // ═══════════════════════════════════════════════════════════════

  copySelected(): void {
    const { selectedIds } = useSelectionStore.getState();
    if (selectedIds.size === 0) return;

    const { elements, connectors } = useCanvasStore.getState();
    const copiedElements = elements.filter(el => selectedIds.has(el.id));
    const copiedConnectors = connectors.filter(c => selectedIds.has(c.id));

    useClipboardStore.getState().copy(copiedElements, copiedConnectors);
  },

  cutSelected(): void {
    this.copySelected();
    this.deleteSelected();
  },

  paste(): void {
    const { elements, connectors } = useClipboardStore.getState();
    if (elements.length === 0 && connectors.length === 0) return;

    tx().begin('Paste');
    const newIds: string[] = [];

    // Map old IDs to new IDs to maintain connector links
    const idMap = new Map<string, string>();

    for (const el of elements) {
      const newEl: CanvasElement = {
        ...el,
        id: `${el.type}-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        bounds: {
          ...el.bounds,
          x: el.bounds.x + 20, // Offset paste
          y: el.bounds.y + 20,
        },
        zIndex: Date.now(),
      };
      idMap.set(el.id, newEl.id);
      tx().add(new CreateElementCommand(newEl));
      newIds.push(newEl.id);
    }

    for (const c of connectors) {
      // Only paste connectors if both ends were pasted
      if (idMap.has(c.sourceId) && idMap.has(c.targetId)) {
        const newConn: Connector = {
          ...c,
          id: `conn-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          sourceId: idMap.get(c.sourceId)!,
          targetId: idMap.get(c.targetId)!,
          zIndex: Date.now()
        };
        tx().add(new CreateConnectorCommand(newConn));
        newIds.push(newConn.id);
      }
    }

    tx().commit();

    useSelectionStore.getState().selectAll(newIds);
    useFileStore.getState().setDirty(true);
  },

  // ═══════════════════════════════════════════════════════════════
  // SELECTION
  // ═══════════════════════════════════════════════════════════════

  selectAll(): void {
    const { elements } = useCanvasStore.getState();
    useSelectionStore.getState().selectAll(elements.map((el) => el.id));
  },

  // ═══════════════════════════════════════════════════════════════
  // ARRANGEMENT (Z-INDEX)
  // ═══════════════════════════════════════════════════════════════

  bringToFront(): void {
    const { selectedIds } = useSelectionStore.getState();
    if (selectedIds.size === 0) return;
    
    const { elements } = useCanvasStore.getState();
    const maxZ = Math.max(...elements.map(e => e.zIndex), 0);
    
    const snapshots: ZIndexSnapshot[] = [];
    let currentZ = maxZ + 1;
    
    for (const id of selectedIds) {
      const el = elements.find(e => e.id === id);
      if (el) {
        snapshots.push({ id, before: el.zIndex, after: currentZ++ });
      }
    }
    
    cmd().execute(new ReorderElementsCommand(snapshots, 'Bring to Front'));
    useFileStore.getState().setDirty(true);
  },

  sendToBack(): void {
    const { selectedIds } = useSelectionStore.getState();
    if (selectedIds.size === 0) return;
    
    const { elements } = useCanvasStore.getState();
    const minZ = Math.min(...elements.map(e => e.zIndex), 0);
    
    const snapshots: ZIndexSnapshot[] = [];
    let currentZ = minZ - 1;
    
    for (const id of selectedIds) {
      const el = elements.find(e => e.id === id);
      if (el) {
        snapshots.push({ id, before: el.zIndex, after: currentZ-- });
      }
    }
    
    cmd().execute(new ReorderElementsCommand(snapshots, 'Send to Back'));
    useFileStore.getState().setDirty(true);
  },

  bringForward(): void {
    const { selectedIds } = useSelectionStore.getState();
    if (selectedIds.size === 0) return;
    
    const { elements } = useCanvasStore.getState();
    const snapshots: ZIndexSnapshot[] = [];
    
    for (const id of selectedIds) {
      const el = elements.find(e => e.id === id);
      if (el) {
        snapshots.push({ id, before: el.zIndex, after: el.zIndex + 1 });
      }
    }
    
    cmd().execute(new ReorderElementsCommand(snapshots, 'Bring Forward'));
    useFileStore.getState().setDirty(true);
  },

  sendBackward(): void {
    const { selectedIds } = useSelectionStore.getState();
    if (selectedIds.size === 0) return;
    
    const { elements } = useCanvasStore.getState();
    const snapshots: ZIndexSnapshot[] = [];
    
    for (const id of selectedIds) {
      const el = elements.find(e => e.id === id);
      if (el) {
        snapshots.push({ id, before: el.zIndex, after: el.zIndex - 1 });
      }
    }
    
    cmd().execute(new ReorderElementsCommand(snapshots, 'Send Backward'));
    useFileStore.getState().setDirty(true);
  },

  // ═══════════════════════════════════════════════════════════════
  // ALIGNMENT & DISTRIBUTION
  // ═══════════════════════════════════════════════════════════════

  align(direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'): void {
    const { selectedIds } = useSelectionStore.getState();
    if (selectedIds.size < 2) return;

    const { elements } = useCanvasStore.getState();
    const selected = elements.filter(e => selectedIds.has(e.id));
    
    // Find bounds of the entire selection
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    selected.forEach(el => {
      if (el.bounds.x < minX) minX = el.bounds.x;
      if (el.bounds.y < minY) minY = el.bounds.y;
      if (el.bounds.x + el.bounds.width > maxX) maxX = el.bounds.x + el.bounds.width;
      if (el.bounds.y + el.bounds.height > maxY) maxY = el.bounds.y + el.bounds.height;
    });

    const midX = minX + (maxX - minX) / 2;
    const midY = minY + (maxY - minY) / 2;

    const snapshots: ElementPositionSnapshot[] = [];

    selected.forEach(el => {
      const before = { ...el.bounds };
      let after = { ...el.bounds };

      switch (direction) {
        case 'left': after.x = minX; break;
        case 'center': after.x = midX - el.bounds.width / 2; break;
        case 'right': after.x = maxX - el.bounds.width; break;
        case 'top': after.y = minY; break;
        case 'middle': after.y = midY - el.bounds.height / 2; break;
        case 'bottom': after.y = maxY - el.bounds.height; break;
      }

      if (before.x !== after.x || before.y !== after.y) {
        snapshots.push({ id: el.id, before, after });
      }
    });

    if (snapshots.length > 0) {
      cmd().execute(new MoveElementsCommand(snapshots));
      useFileStore.getState().setDirty(true);
    }
  },

  distribute(axis: 'horizontal' | 'vertical'): void {
    const { selectedIds } = useSelectionStore.getState();
    if (selectedIds.size < 3) return;

    const { elements } = useCanvasStore.getState();
    const selected = elements.filter(e => selectedIds.has(e.id));

    // Sort elements based on axis
    selected.sort((a, b) => 
      axis === 'horizontal' ? a.bounds.x - b.bounds.x : a.bounds.y - b.bounds.y
    );

    const first = selected[0];
    const last = selected[selected.length - 1];

    if (axis === 'horizontal') {
      const totalWidth = last.bounds.x + last.bounds.width - first.bounds.x;
      const elementsWidth = selected.reduce((sum, el) => sum + el.bounds.width, 0);
      const gap = (totalWidth - elementsWidth) / (selected.length - 1);

      let currentX = first.bounds.x + first.bounds.width + gap;
      const snapshots: ElementPositionSnapshot[] = [];

      for (let i = 1; i < selected.length - 1; i++) {
        const el = selected[i];
        if (el.bounds.x !== currentX) {
          snapshots.push({
            id: el.id,
            before: { ...el.bounds },
            after: { ...el.bounds, x: currentX }
          });
        }
        currentX += el.bounds.width + gap;
      }

      if (snapshots.length > 0) {
        cmd().execute(new MoveElementsCommand(snapshots));
        useFileStore.getState().setDirty(true);
      }
    } else {
      const totalHeight = last.bounds.y + last.bounds.height - first.bounds.y;
      const elementsHeight = selected.reduce((sum, el) => sum + el.bounds.height, 0);
      const gap = (totalHeight - elementsHeight) / (selected.length - 1);

      let currentY = first.bounds.y + first.bounds.height + gap;
      const snapshots: ElementPositionSnapshot[] = [];

      for (let i = 1; i < selected.length - 1; i++) {
        const el = selected[i];
        if (el.bounds.y !== currentY) {
          snapshots.push({
            id: el.id,
            before: { ...el.bounds },
            after: { ...el.bounds, y: currentY }
          });
        }
        currentY += el.bounds.height + gap;
      }

      if (snapshots.length > 0) {
        cmd().execute(new MoveElementsCommand(snapshots));
        useFileStore.getState().setDirty(true);
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // GROUPING
  // ═══════════════════════════════════════════════════════════════

  groupSelected(): void {
    const { selectedIds } = useSelectionStore.getState();
    if (selectedIds.size < 2) return;

    const { elements } = useCanvasStore.getState();
    const selected = elements.filter(e => selectedIds.has(e.id));
    
    // Cannot group items that are already inside another group
    if (selected.some(e => e.parentId)) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    selected.forEach(el => {
      if (el.bounds.x < minX) minX = el.bounds.x;
      if (el.bounds.y < minY) minY = el.bounds.y;
      if (el.bounds.x + el.bounds.width > maxX) maxX = el.bounds.x + el.bounds.width;
      if (el.bounds.y + el.bounds.height > maxY) maxY = el.bounds.y + el.bounds.height;
    });

    tx().begin('Group Elements');

    // Create the group element
    const groupId = `group-${Date.now()}`;
    const groupEl: CanvasElement = {
      id: groupId,
      type: 'group',
      bounds: { x: minX, y: minY, width: maxX - minX, height: maxY - minY },
      label: 'Group',
      style: { fillColor: 'transparent', strokeColor: 'transparent', strokeWidth: 0, opacity: 1, borderRadius: 0 },
      rotation: 0,
      locked: false,
      visible: true,
      zIndex: Date.now(),
      layerId: useLayerStore.getState().activeLayerId,
    };

    tx().add(new CreateElementCommand(groupEl));

    // Update children to reference the group
    for (const el of selected) {
      tx().add(new UpdateElementCommand(el.id, { parentId: groupId }));
    }

    tx().commit();

    useSelectionStore.getState().selectAll([groupId]);
    useFileStore.getState().setDirty(true);
  },

  ungroupSelected(): void {
    const { selectedIds } = useSelectionStore.getState();
    if (selectedIds.size === 0) return;

    const { elements } = useCanvasStore.getState();
    const groupsToUngroup = elements.filter(e => selectedIds.has(e.id) && e.type === 'group');

    if (groupsToUngroup.length === 0) return;

    tx().begin('Ungroup Elements');

    const newSelectionIds: string[] = [];

    for (const group of groupsToUngroup) {
      const children = elements.filter(e => e.parentId === group.id);
      
      // Remove parentId from children
      for (const child of children) {
        tx().add(new UpdateElementCommand(child.id, { parentId: undefined }));
        newSelectionIds.push(child.id);
      }

      // Delete the group element itself
      tx().add(new DeleteElementsCommand([group.id]));
    }

    tx().commit();

    useSelectionStore.getState().selectAll(newSelectionIds);
    useFileStore.getState().setDirty(true);
  },

  // ═══════════════════════════════════════════════════════════════
  // CONNECTORS
  // ═══════════════════════════════════════════════════════════════

  commitConnector(connector: Connector): void {
    cmd().execute(new CreateConnectorCommand(connector));
    useFileStore.getState().setDirty(true);
  },

  deleteConnector(connectorId: string): void {
    try {
      cmd().execute(new DeleteConnectorCommand(connectorId));
      useFileStore.getState().setDirty(true);
    } catch {
      // Connector not found — no-op
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // SELECTION
  // ═══════════════════════════════════════════════════════════════

  selectElement(id: string, multi = false): void {
    const sel = useSelectionStore.getState();
    if (multi) {
      sel.multiSelect(id);
    } else {
      sel.select(id);
    }
  },

  clearSelection(): void {
    useSelectionStore.getState().clearSelection();
  },

  // ═══════════════════════════════════════════════════════════════
  // TOOLS
  // ═══════════════════════════════════════════════════════════════

  setActiveTool(toolId: ToolId): void {
    ToolManager.activate(toolId);
  },

  // ═══════════════════════════════════════════════════════════════
  // TRANSACTIONS (for external use by complex operations)
  // ═══════════════════════════════════════════════════════════════

  beginTransaction(label: string): void {
    tx().begin(label);
  },

  commitTransaction(): void {
    tx().commit();
  },

  rollbackTransaction(): void {
    tx().rollback();
  },
};
