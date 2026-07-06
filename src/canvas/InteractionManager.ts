/**
 * InteractionManager.ts
 *
 * Handles all canvas mouse and wheel events, translating them into:
 *  - Editor state changes (via EditorActions — the single mutation API)
 *  - Interaction phase changes (via interaction.store)
 *
 * Design: this class only reads state and dispatches actions.
 * It never mutates Zustand stores directly for undoable operations.
 *
 * Move pattern:
 *   mousedown → snapshot 'before' positions
 *   mousemove → optimistic live update (direct store call for performance)
 *   mouseup   → commit MoveElementsCommand with before/after positions (one undo step)
 */

import { useCanvasStore } from '@/stores/canvas.store';
import { useZoomStore } from '@/stores/zoom.store';
import { useSelectionStore } from '@/stores/selection.store';
import { useEditorStore } from '@/stores/editor.store';
import { useInteractionStore, AlignmentGuide } from '@/stores/interaction.store';
import { useLayerStore } from '@/stores/layer.store';
import { useFileStore } from '@/stores/file.store';
import { useSettingsStore } from '@/stores/settings.store';
import { EditorActions } from '@/editor/EditorActions';
import { MoveElementsCommand, type ElementPositionSnapshot } from '@/editor/commands/MoveElementsCommand';
import { CommandManager } from '@/editor/CommandManager';
import { ToolManager, type ToolId } from '@/editor/ToolManager';
import type { Point, CanvasElement, ElementType, ConnectorType, Bounds, AnchorId } from '@/types/canvas.types';
import { screenToWorld, isPointInBounds, isPointNearLine } from '@/utils/coordinates';
import { createElement } from '@/utils/element.factory';
import { AnchorEngine } from '@/utils/anchors';
import { calculateWaypoints } from '@/utils/routing';
import { getHandlePositions, type ResizeHandle } from '@/canvas/renderer/SelectionRenderer';
import { getCollectiveBounds, computeSnapping } from '@/utils/snapping';

export class InteractionManager {
  private canvas: HTMLCanvasElement;
  private lastMousePos: Point = { x: 0, y: 0 };

  // Move tracking
  private moveSnapshots: Map<string, { before: Bounds; current: Bounds }> = new Map();
  private moveStartWorld: Point = { x: 0, y: 0 };

  // Drawing tracking
  private drawStartWorld: Point = { x: 0, y: 0 };
  private drawingElementId: string | null = null;
  private freehandPoints: Point[] = [];

  // Resize tracking
  private resizeHandle: ResizeHandle | null = null;
  private resizingElementId: string | null = null;
  private resizeInitialBounds: Bounds | null = null;
  private resizeStartWorld: Point = { x: 0, y: 0 };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.init();
  }

  private init() {
    this.canvas.addEventListener('mousedown', this.handleMouseDown);
    this.canvas.addEventListener('dblclick', this.handleDoubleClick);
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave);
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);
    this.canvas.addEventListener('wheel', this.handleWheel, { passive: false });
  }

  public destroy() {
    this.canvas.removeEventListener('mousedown', this.handleMouseDown);
    this.canvas.removeEventListener('dblclick', this.handleDoubleClick);
    this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
    this.canvas.removeEventListener('wheel', this.handleWheel);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private getWorldPos(clientX: number, clientY: number): Point {
    const rect = this.canvas.getBoundingClientRect();
    const { viewport } = useCanvasStore.getState();
    return screenToWorld(
      { x: clientX - rect.left, y: clientY - rect.top },
      viewport,
    );
  }

  // ─── Mouse Down ──────────────────────────────────────────────────────────

  private handleDoubleClick = (e: MouseEvent) => {
    if (e.button !== 0) return;
    const { elements } = useCanvasStore.getState();
    const interaction = useInteractionStore.getState();
    const worldPos = this.getWorldPos(e.clientX, e.clientY);

    const hitElement = [...elements]
      .sort((a, b) => b.zIndex - a.zIndex)
      .find((el) => isPointInBounds(worldPos, el.bounds));

    if (hitElement && hitElement.type !== 'group' && hitElement.type !== 'image') {
      interaction.setInlineEditId(hitElement.id);
    }
  };

  // ─── Mouse Leave ─────────────────────────────────────────────────────────

  private handleMouseLeave = () => {
    const interaction = useInteractionStore.getState();
    interaction.setHoveredElement(null, null);
    interaction.setConnectionPreview(null, null, null);
  };

  private handleMouseDown = (e: MouseEvent) => {
    const { mode, activeTool } = useEditorStore.getState();
    const { elements, addElement, addConnector } = useCanvasStore.getState();
    const { select, clearSelection, selectedIds } = useSelectionStore.getState();
    const interaction = useInteractionStore.getState();

    this.lastMousePos = { x: e.clientX, y: e.clientY };
    const worldPos = this.getWorldPos(e.clientX, e.clientY);

    // ── Middle mouse / Pan mode ──
    if (e.button === 1 || mode === 'pan') {
      interaction.setPhase('PANNING');
      this.canvas.style.cursor = 'grabbing';
      return;
    }

    if (e.button !== 0) return;

    // Filter out hidden or locked layers
    const { layers } = useLayerStore.getState();
    const interactableLayerIds = new Set(layers.filter(l => l.visible && !l.locked).map(l => l.id));

    // Find element under cursor (top-most first)
    const hitElement = [...elements]
      .filter(el => (!el.layerId || interactableLayerIds.has(el.layerId)) && !el.locked)
      .sort((a, b) => b.zIndex - a.zIndex)
      .find((el) => isPointInBounds(worldPos, el.bounds));

    // ── Draw mode ──
    if (mode === 'draw' && activeTool) {
      if (activeTool === 'arrow' || activeTool === 'line') {
        // Connector drawing — requires a source element
        if (hitElement) {
          const connectorId = `conn-${Date.now()}`;
          interaction.setActiveConnectorId(connectorId);

          // Find nearest anchor on source element to mouse click position
          const ANCHOR_MAGNETIC_RADIUS = 40; // world units
          const nearestSourceAnchor = AnchorEngine.findNearestAnchor(
            worldPos, hitElement.bounds, ANCHOR_MAGNETIC_RADIUS
          ) ?? AnchorEngine.findBestSourceAnchor(hitElement.bounds, worldPos);

          const sourcePoint = nearestSourceAnchor
            ? { x: nearestSourceAnchor.x, y: nearestSourceAnchor.y }
            : worldPos;

          addConnector({
            id: connectorId,
            type: 'straight' as ConnectorType,
            sourceId: hitElement.id,
            targetId: '',
            sourcePoint,
            targetPoint: worldPos,
            waypoints: [],
            label: '',
            style: {
              strokeColor: '#6366f1',
              strokeWidth: 2,
              startArrow: false,
              endArrow: activeTool === 'arrow',
            },
            zIndex: Date.now(),
            sourceAnchorId: nearestSourceAnchor?.id,
          });
          interaction.setConnectionPreview(worldPos, null, null);
          interaction.setPhase('CONNECTING');
        }
        return;
      }

      // Shape drawing — live feedback element added directly, committed on mouseup
      const type = (['rectangle', 'ellipse', 'diamond', 'text', 'line', 'freehand'].includes(activeTool)
        ? activeTool
        : 'rectangle') as ElementType;

      const newElement = createElement(type, worldPos, { width: type === 'freehand' ? 1 : 0, height: type === 'freehand' ? 1 : 0 });
      if (type === 'freehand') {
        newElement.style.fillColor = 'transparent';
        newElement.metadata = {
          points: [{ x: 0, y: 0 }],
          originalWidth: 1,
          originalHeight: 1,
        };
        this.freehandPoints = [worldPos];
      }
      addElement(newElement);
      select(newElement.id);
      this.drawStartWorld = worldPos;
      this.drawingElementId = newElement.id;
      interaction.setPhase('DRAWING');
      return;
    }

    // ── Select mode ──
    if (mode === 'select') {
      // ── Check resize handle hit FIRST ─────────────────────────────────────
      if (selectedIds.size === 1) {
        const selEl = elements.find(el => selectedIds.has(el.id));
        if (selEl && !selEl.locked) {
          const { viewport } = useCanvasStore.getState();
          const zi = 1 / viewport.zoom;
          const padding = 4 * zi;
          const hitRadius = 7 * zi;
          const handles = getHandlePositions(
            selEl.bounds.x, selEl.bounds.y,
            selEl.bounds.width, selEl.bounds.height,
            padding
          );
          const HANDLE_KEYS: ResizeHandle[] = ['TL','T','TR','R','BR','B','BL','L'];
          for (const key of HANDLE_KEYS) {
            const h = handles[key];
            const dist = Math.hypot(worldPos.x - h.x, worldPos.y - h.y);
            if (dist <= hitRadius) {
              // Hit! Enter resize mode
              this.resizeHandle = key;
              this.resizingElementId = selEl.id;
              this.resizeInitialBounds = { ...selEl.bounds };
              this.resizeStartWorld = { ...worldPos };
              interaction.setPhase('RESIZING');
              // Set appropriate cursor
              const cursors: Record<ResizeHandle, string> = {
                TL:'nw-resize', T:'n-resize', TR:'ne-resize', R:'e-resize',
                BR:'se-resize', B:'s-resize', BL:'sw-resize', L:'w-resize'
              };
              this.canvas.style.cursor = cursors[key];
              return;
            }
          }
        }
      }
      if (hitElement) {
        if (!selectedIds.has(hitElement.id)) {
          select(hitElement.id);
        }

        // Snapshot 'before' positions for all currently selected elements and their children
        this.moveSnapshots.clear();
        const currentSelectedIds = useSelectionStore.getState().selectedIds;
        
        const snapshotElementAndChildren = (id: string) => {
          if (this.moveSnapshots.has(id)) return;
          const el = elements.find(e => e.id === id);
          if (el && !el.locked) {
            this.moveSnapshots.set(id, {
              before: { ...el.bounds },
              current: { ...el.bounds },
            });
            if (el.type === 'group') {
              const children = elements.filter(c => c.parentId === id);
              children.forEach(c => snapshotElementAndChildren(c.id));
            }
          }
        };

        for (const id of currentSelectedIds) {
          snapshotElementAndChildren(id);
        }

        this.moveStartWorld = { ...worldPos };
        interaction.setPhase('MOVING');
      } else {
        // Check connector selection
        const { connectors } = useCanvasStore.getState();
        let hitConnector = null;

        for (let i = connectors.length - 1; i >= 0; i--) {
          const conn = connectors[i];
          const sourceEl = elements.find((el) => el.id === conn.sourceId);
          const targetEl = elements.find((el) => el.id === conn.targetId);
          if (!sourceEl) continue;

          const targetBounds = targetEl ? targetEl.bounds : conn.targetPoint;
          const { sourceAnchor, targetAnchor } = getClosestAnchors(sourceEl.bounds, targetBounds);
          const waypoints = calculateWaypoints(sourceAnchor, targetAnchor, conn.type);

          const { viewport: vp } = useCanvasStore.getState();
          let hit = false;
          if (conn.type === 'curved' && waypoints.length === 4) {
            const p0 = waypoints[0];
            const p1 = waypoints[1];
            const p2 = waypoints[2];
            const p3 = waypoints[3];
            const samples = 10;
            let lastPt = p0;
            for (let j = 1; j <= samples; j++) {
              const t = j / samples;
              const mt = 1 - t;
              const currPt = {
                x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
                y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
              };
              if (isPointNearLine(worldPos, lastPt, currPt, 10 / vp.zoom)) {
                hit = true;
                break;
              }
              lastPt = currPt;
            }
          } else {
            for (let j = 0; j < waypoints.length - 1; j++) {
              if (isPointNearLine(worldPos, waypoints[j], waypoints[j + 1], 10 / vp.zoom)) {
                hit = true;
                break;
              }
            }
          }
          if (hit) { hitConnector = conn; break; }
        }

        if (hitConnector) {
          select(hitConnector.id);
          interaction.setPhase('IDLE');
        } else {
          // If shift is NOT held, clear selection. (If held, additive selection applies).
          if (!e.shiftKey) clearSelection();
          
          // Start box selection
          this.drawStartWorld = worldPos;
          interaction.setSelectionBox({ x: worldPos.x, y: worldPos.y, width: 0, height: 0 });
          interaction.setPhase('SELECTING_BOX');
        }
      }
    }
  };

  // ─── Mouse Move ──────────────────────────────────────────────────────────

  private handleMouseMove = (e: MouseEvent) => {
    const { viewport, setViewport, elements, updateElement, updateConnector } = useCanvasStore.getState();
    const { selectedIds } = useSelectionStore.getState();
    const interaction = useInteractionStore.getState();
    const { phase, activeConnectorId } = interaction;

    const dx = e.clientX - this.lastMousePos.x;
    const dy = e.clientY - this.lastMousePos.y;
    const worldPos = this.getWorldPos(e.clientX, e.clientY);

    if (phase === 'PANNING') {
      setViewport({ panX: viewport.panX + dx, panY: viewport.panY + dy });
    } else if (phase === 'IDLE' || phase === 'SELECTING') {
      // ── IDLE: update hover state for anchor indicator rendering ──
      const { layers } = useLayerStore.getState();
      const interactableLayerIds = new Set(layers.filter(l => l.visible && !l.locked).map(l => l.id));
      const hitEl = [...elements]
        .filter(el => (!el.layerId || interactableLayerIds.has(el.layerId)) && !el.locked)
        .sort((a, b) => b.zIndex - a.zIndex)
        .find(el => isPointInBounds(worldPos, el.bounds));

      if (hitEl) {
        const ANCHOR_HOVER_RADIUS = 24 / viewport.zoom; // 24 screen px in world units
        const nearestAnchor = AnchorEngine.findNearestAnchor(worldPos, hitEl.bounds, ANCHOR_HOVER_RADIUS);
        interaction.setHoveredElement(hitEl.id, nearestAnchor?.id ?? null);
      } else {
        interaction.setHoveredElement(null, null);
      }

      // ── Update cursor based on hover ──
      let cursorToApply = 'default';
      if (mode === 'pan') {
        cursorToApply = 'grab';
      } else if (mode === 'draw' && activeTool) {
        cursorToApply = ToolManager.getCurrentCursor(activeTool as ToolId);
      } else if (mode === 'text') {
        cursorToApply = 'text';
      } else if (mode === 'select') {
        if (hitEl) {
          cursorToApply = 'move';
        }
      }

      const { selectedIds } = useSelectionStore.getState();
      if (mode === 'select' && selectedIds.size === 1) {
        const selEl = elements.find(el => selectedIds.has(el.id));
        if (selEl && !selEl.locked) {
          const zi = 1 / viewport.zoom;
          const padding = 4 * zi;
          const hitRadius = 7 * zi;
          const handles = getHandlePositions(
            selEl.bounds.x, selEl.bounds.y,
            selEl.bounds.width, selEl.bounds.height,
            padding
          );
          const HANDLE_KEYS: ResizeHandle[] = ['TL','T','TR','R','BR','B','BL','L'];
          for (const key of HANDLE_KEYS) {
            const h = handles[key];
            const dist = Math.hypot(worldPos.x - h.x, worldPos.y - h.y);
            if (dist <= hitRadius) {
              const cursors: Record<ResizeHandle, string> = {
                TL:'nw-resize', T:'n-resize', TR:'ne-resize', R:'e-resize',
                BR:'se-resize', B:'s-resize', BL:'sw-resize', L:'w-resize'
              };
              cursorToApply = cursors[key];
              break;
            }
          }
        }
      }
      this.canvas.style.cursor = cursorToApply;
    } else if (phase === 'MOVING') {
      const { settings } = useSettingsStore.getState();
      const others = elements.filter(
        (el) => !this.moveSnapshots.has(el.id) && el.visible && !el.locked
      );

      const totalDx = worldPos.x - this.moveStartWorld.x;
      const totalDy = worldPos.y - this.moveStartWorld.y;

      const selectedElements = Array.from(selectedIds)
        .map((id) => elements.find((el) => el.id === id))
        .filter(Boolean) as CanvasElement[];
      const selectedBeforeBounds = selectedElements
        .map((el) => this.moveSnapshots.get(el.id)?.before)
        .filter(Boolean) as Bounds[];
      
      const collectiveBefore = getCollectiveBounds(selectedBeforeBounds);
      const unsnappedBounds = {
        x: collectiveBefore.x + totalDx,
        y: collectiveBefore.y + totalDy,
        width: collectiveBefore.width,
        height: collectiveBefore.height,
      };

      const canvasWidth = this.canvas.width / window.devicePixelRatio;
      const canvasHeight = this.canvas.height / window.devicePixelRatio;

      const { x: snappedX, y: snappedY, guides } = computeSnapping(
        unsnappedBounds,
        others,
        {
          snapToObjects: settings.snapToObjects,
          showGuides: settings.showGuides,
          snapStrength: settings.snapStrength,
          gridConfig: useCanvasStore.getState().config.grid,
          viewport,
          canvasWidth,
          canvasHeight,
        }
      );

      const snappedDx = snappedX - collectiveBefore.x;
      const snappedDy = snappedY - collectiveBefore.y;

      const movedIds = new Set<string>();
      const moveElementAndChildren = (id: string, dxSnap: number, dySnap: number) => {
        if (movedIds.has(id)) return;
        
        const snapshot = this.moveSnapshots.get(id);
        const el = elements.find(e => e.id === id);
        
        if (snapshot && el) {
          if (el.locked) return;
          el.bounds.x = snapshot.before.x + dxSnap;
          el.bounds.y = snapshot.before.y + dySnap;
          
          snapshot.current = { ...el.bounds };
          movedIds.add(id);

          if (el.type === 'group') {
            const children = elements.filter(child => child.parentId === id);
            for (const child of children) {
              moveElementAndChildren(child.id, dxSnap, dySnap);
            }
          }
        }
      };

      for (const id of selectedIds) {
        moveElementAndChildren(id, snappedDx, snappedDy);
      }

      interaction.setActiveGuides(guides);
    } else if (phase === 'DRAWING' && this.drawingElementId) {
      const { activeTool } = useEditorStore.getState();
      if (activeTool === 'freehand') {
        this.freehandPoints.push(worldPos);

        const xs = this.freehandPoints.map(p => p.x);
        const ys = this.freehandPoints.map(p => p.y);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs);
        const maxY = Math.max(...ys);
        const w = Math.max(1, maxX - minX);
        const h = Math.max(1, maxY - minY);

        const relativePoints = this.freehandPoints.map(p => ({
          x: p.x - minX,
          y: p.y - minY,
        }));

        updateElement(this.drawingElementId, {
          bounds: { x: minX, y: minY, width: w, height: h },
          metadata: {
            points: relativePoints,
            originalWidth: w,
            originalHeight: h,
          },
        });
      } else {
        updateElement(this.drawingElementId, {
          bounds: {
            x: Math.min(this.drawStartWorld.x, worldPos.x),
            y: Math.min(this.drawStartWorld.y, worldPos.y),
            width: Math.abs(worldPos.x - this.drawStartWorld.x),
            height: Math.abs(worldPos.y - this.drawStartWorld.y),
          },
        });
      }
    } else if (phase === 'RESIZING' && this.resizingElementId && this.resizeInitialBounds && this.resizeHandle) {
      const totalDx = worldPos.x - this.resizeStartWorld.x;
      const totalDy = worldPos.y - this.resizeStartWorld.y;
      const ib = this.resizeInitialBounds;
      const MIN = 10;
      let nx = ib.x, ny = ib.y, nw = ib.width, nh = ib.height;

      switch (this.resizeHandle) {
        case 'TL': nx=ib.x+totalDx; ny=ib.y+totalDy; nw=ib.width-totalDx; nh=ib.height-totalDy; break;
        case 'T':  ny=ib.y+totalDy; nh=ib.height-totalDy; break;
        case 'TR': nw=ib.width+totalDx; ny=ib.y+totalDy; nh=ib.height-totalDy; break;
        case 'R':  nw=ib.width+totalDx; break;
        case 'BR': nw=ib.width+totalDx; nh=ib.height+totalDy; break;
        case 'B':  nh=ib.height+totalDy; break;
        case 'BL': nx=ib.x+totalDx; nw=ib.width-totalDx; nh=ib.height+totalDy; break;
        case 'L':  nx=ib.x+totalDx; nw=ib.width-totalDx; break;
      }

      const { settings } = useSettingsStore.getState();
      const others = elements.filter(
        (el) => el.id !== this.resizingElementId && el.visible && !el.locked
      );
      const threshold = settings.snapStrength / viewport.zoom;
      const guides: AlignmentGuide[] = [];

      const gridConfig = useCanvasStore.getState().config.grid;
      const step = gridConfig.size;

      // Handle X-Resizing Snapping
      if (['TL', 'L', 'BL', 'TR', 'R', 'BR'].includes(this.resizeHandle)) {
        const isRightSide = ['TR', 'R', 'BR'].includes(this.resizeHandle);
        const val = isRightSide ? ib.x + ib.width + totalDx : ib.x + totalDx;

        let bestDeltaX = Infinity;
        let refElementX: CanvasElement | null = null;

        if (settings.snapToObjects) {
          for (const other of others) {
            const ob = other.bounds;
            const refXs = [ob.x, ob.x + ob.width / 2, ob.x + ob.width];
            for (const rx of refXs) {
              const delta = rx - val;
              if (Math.abs(delta) <= threshold && Math.abs(delta) < Math.abs(bestDeltaX)) {
                bestDeltaX = delta;
                refElementX = other;
              }
            }
          }
        }

        if (Math.abs(bestDeltaX) <= threshold) {
          const snappedVal = val + bestDeltaX;
          if (isRightSide) {
            nw = snappedVal - nx;
          } else {
            nx = snappedVal;
            nw = (ib.x + ib.width) - nx;
          }

          const lineX = snappedVal;
          const y1 = refElementX
            ? Math.min(ny, refElementX.bounds.y)
            : Math.min(ny, 0);
          const y2 = refElementX
            ? Math.max(ny + nh, refElementX.bounds.y + refElementX.bounds.height)
            : Math.max(ny + nh, 0);

          guides.push({
            type: 'v-align',
            x1: lineX,
            y1,
            x2: lineX,
            y2,
          });
        } else if (gridConfig.snapToGrid) {
          const snappedVal = Math.round(val / step) * step;
          if (isRightSide) {
            nw = snappedVal - nx;
          } else {
            nx = snappedVal;
            nw = (ib.x + ib.width) - nx;
          }
        }
      }

      // Handle Y-Resizing Snapping
      if (['TL', 'T', 'TR', 'BL', 'B', 'BR'].includes(this.resizeHandle)) {
        const isBottomSide = ['BL', 'B', 'BR'].includes(this.resizeHandle);
        const val = isBottomSide ? ib.y + ib.height + totalDy : ib.y + totalDy;

        let bestDeltaY = Infinity;
        let refElementY: CanvasElement | null = null;

        if (settings.snapToObjects) {
          for (const other of others) {
            const ob = other.bounds;
            const refYs = [ob.y, ob.y + ob.height / 2, ob.y + ob.height];
            for (const ry of refYs) {
              const delta = ry - val;
              if (Math.abs(delta) <= threshold && Math.abs(delta) < Math.abs(bestDeltaY)) {
                bestDeltaY = delta;
                refElementY = other;
              }
            }
          }
        }

        if (Math.abs(bestDeltaY) <= threshold) {
          const snappedVal = val + bestDeltaY;
          if (isBottomSide) {
            nh = snappedVal - ny;
          } else {
            ny = snappedVal;
            nh = (ib.y + ib.height) - ny;
          }

          const lineY = snappedVal;
          const x1 = refElementY
            ? Math.min(nx, refElementY.bounds.x)
            : Math.min(nx, 0);
          const x2 = refElementY
            ? Math.max(nx + nw, refElementY.bounds.x + refElementY.bounds.width)
            : Math.max(nx + nw, 0);

          guides.push({
            type: 'h-align',
            x1,
            y1: lineY,
            x2,
            y2: lineY,
          });
        } else if (gridConfig.snapToGrid) {
          const snappedVal = Math.round(val / step) * step;
          if (isBottomSide) {
            nh = snappedVal - ny;
          } else {
            ny = snappedVal;
            nh = (ib.y + ib.height) - ny;
          }
        }
      }

      // Clamp to minimum size (prevent negative/zero dimensions)
      if (nw < MIN) { if (['TL','L','BL'].includes(this.resizeHandle)) nx = ib.x + ib.width - MIN; nw = MIN; }
      if (nh < MIN) { if (['TL','T','TR'].includes(this.resizeHandle)) ny = ib.y + ib.height - MIN; nh = MIN; }

      // Live update (direct mutation for 60fps — committed on mouseup)
      const el = elements.find(e => e.id === this.resizingElementId);
      if (el) { el.bounds.x = nx; el.bounds.y = ny; el.bounds.width = nw; el.bounds.height = nh; }

      interaction.setActiveGuides(guides);
    } else if (phase === 'SELECTING_BOX') {
      const x = Math.min(this.drawStartWorld.x, worldPos.x);
      const y = Math.min(this.drawStartWorld.y, worldPos.y);
      const width = Math.abs(worldPos.x - this.drawStartWorld.x);
      const height = Math.abs(worldPos.y - this.drawStartWorld.y);
      
      interaction.setSelectionBox({ x, y, width, height });

      // Hit test against interactable elements
      const newSelection = new Set<string>();
      if (e.shiftKey) {
        // preserve existing if shift held
        useSelectionStore.getState().selectedIds.forEach(id => newSelection.add(id));
      }
      
      const { layers } = useLayerStore.getState();
      const interactableLayerIds = new Set(layers.filter(l => l.visible && !l.locked).map(l => l.id));

      for (const el of elements) {
        if (el.layerId && !interactableLayerIds.has(el.layerId)) continue;
        if (el.locked) continue;
        
        const b = el.bounds;
        // Simple AABB intersection
        if (
          x < b.x + b.width &&
          x + width > b.x &&
          y < b.y + b.height &&
          y + height > b.y
        ) {
          newSelection.add(el.id);
        }
      }

      // We use selectAll because it completely replaces the active selection
      useSelectionStore.getState().selectAll(Array.from(newSelection));
    } else if (phase === 'CONNECTING' && activeConnectorId) {
      // Find elements on interactable layers (excluding source element)
      const conn = useCanvasStore.getState().connectors.find(c => c.id === activeConnectorId);
      const sourceId = conn?.sourceId ?? '';

      const { layers: lrs } = useLayerStore.getState();
      const interactableLyrIds = new Set(lrs.filter(l => l.visible && !l.locked).map(l => l.id));

      const hitTarget = [...elements]
        .filter(el => el.id !== sourceId && (!el.layerId || interactableLyrIds.has(el.layerId)) && !el.locked)
        .sort((a, b) => b.zIndex - a.zIndex)
        .find(el => isPointInBounds(worldPos, el.bounds));

      let snappedTargetPoint = worldPos;
      let targetAnchorId: string | undefined;

      if (hitTarget) {
        const MAGNETIC_RADIUS = 40 / viewport.zoom;
        const nearestAnchor = AnchorEngine.findNearestAnchor(worldPos, hitTarget.bounds, MAGNETIC_RADIUS)
          ?? AnchorEngine.findBestSourceAnchor(hitTarget.bounds, worldPos);
        if (nearestAnchor) {
          snappedTargetPoint = { x: nearestAnchor.x, y: nearestAnchor.y };
          targetAnchorId = nearestAnchor.id;
        }
      }

      updateConnector(activeConnectorId, {
        targetId: hitTarget ? hitTarget.id : '',
        targetPoint: snappedTargetPoint,
      });

      interaction.setConnectionPreview(
        snappedTargetPoint,
        hitTarget?.id ?? null,
        targetAnchorId as AnchorId ?? null
      );
      interaction.setHoveredElement(hitTarget?.id ?? null, targetAnchorId as AnchorId ?? null);
    }

    this.lastMousePos = { x: e.clientX, y: e.clientY };
  };

  // ─── Mouse Up ────────────────────────────────────────────────────────────

  private handleMouseUp = () => {
    const interaction = useInteractionStore.getState();
    const { phase, activeConnectorId } = interaction;

    if (phase === 'RESIZING' && this.resizingElementId && this.resizeInitialBounds) {
      const { elements } = useCanvasStore.getState();
      const el = elements.find(e => e.id === this.resizingElementId);
      if (el) {
        const before = this.resizeInitialBounds;
        const after = { ...el.bounds };
        const hasMoved = before.x!==after.x || before.y!==after.y ||
                         before.width!==after.width || before.height!==after.height;
        if (hasMoved) {
          const manager = CommandManager.getInstance();
          const cmd = new MoveElementsCommand([{ id: el.id, before, after }]);
          manager.pushUndo(cmd);
          useFileStore.getState().setDirty(true);
        }
      }
      this.resizeHandle = null;
      this.resizingElementId = null;
      this.resizeInitialBounds = null;
      this.canvas.style.cursor = 'default';

    } else if (phase === 'MOVING') {
      // Commit move as a single undoable command (live positions already applied)
      const snapshots: ElementPositionSnapshot[] = [];
      for (const [id, snap] of this.moveSnapshots) {
        snapshots.push({ id, before: snap.before, after: snap.current });
      }

      const hasMoved = snapshots.some(
        (s) => s.before.x !== s.after.x || s.before.y !== s.after.y,
      );

      if (hasMoved) {
        const manager = CommandManager.getInstance();
        const moveCmd = new MoveElementsCommand(snapshots);
        // Push without re-executing — positions already updated by live drag
        manager.pushUndo(moveCmd);
        useFileStore.getState().setDirty(true);
      }

      this.moveSnapshots.clear();

    } else if (phase === 'DRAWING' && this.drawingElementId) {
      const { elements } = useCanvasStore.getState();
      const drawnElement = elements.find((el) => el.id === this.drawingElementId);

      if (drawnElement) {
        const { activeTool } = useEditorStore.getState();
        if (activeTool === 'freehand') {
          const points = drawnElement.metadata?.points as Point[] | undefined;
          if (points && points.length >= 2) {
            useCanvasStore.getState().removeElement(drawnElement.id);
            EditorActions.commitElement(drawnElement);
          } else {
            useCanvasStore.getState().removeElement(drawnElement.id);
            useSelectionStore.getState().deselect(drawnElement.id);
          }
        } else if (drawnElement.bounds.width > 4 && drawnElement.bounds.height > 4) {
          // Remove temp element and commit proper history entry
          useCanvasStore.getState().removeElement(drawnElement.id);
          EditorActions.commitElement(drawnElement);
        } else {
          // Too small — discard silently
          useCanvasStore.getState().removeElement(drawnElement.id);
          useSelectionStore.getState().deselect(drawnElement.id);
        }
      }

      this.drawingElementId = null;
      this.freehandPoints = [];
      useEditorStore.getState().setMode('select');

    } else if (phase === 'CONNECTING' && activeConnectorId) {
      const { connectors, removeConnector } = useCanvasStore.getState();
      const conn = connectors.find((c) => c.id === activeConnectorId);

      if (conn?.targetId) {
        // Valid — record the snapped targetAnchorId and commit
        const targetEl = useCanvasStore.getState().elements.find(e => e.id === conn.targetId);
        let resolvedTargetAnchorId = interaction.connectionTargetAnchorId;
        if (!resolvedTargetAnchorId && targetEl) {
          const pair = AnchorEngine.findClosestPairAnchors(
            useCanvasStore.getState().elements.find(e => e.id === conn.sourceId)?.bounds ?? conn.sourcePoint as any,
            targetEl.bounds
          );
          resolvedTargetAnchorId = pair.targetAnchor.id;
        }
        const finalConn = { ...conn, targetAnchorId: resolvedTargetAnchorId ?? undefined };
        removeConnector(activeConnectorId);
        EditorActions.commitConnector(finalConn);
      } else {
        // No valid target — discard
        removeConnector(activeConnectorId);
      }

      interaction.setConnectionPreview(null, null, null);
      interaction.setHoveredElement(null, null);
      interaction.setActiveConnectorId(null);
      useEditorStore.getState().setMode('select');
    }

    if (phase === 'PANNING') {
      this.canvas.style.cursor = 'grab';
    }

    interaction.setActiveGuides([]);
    interaction.setPhase('IDLE');
  };

  // ─── Wheel ───────────────────────────────────────────────────────────────

  private handleWheel = (e: WheelEvent) => {
    e.preventDefault();

    const { zoomIn, zoomOut } = useZoomStore.getState();
    const { viewport, setViewport } = useCanvasStore.getState();

    if (e.ctrlKey || e.metaKey) {
      const rect = this.canvas.getBoundingClientRect();
      const zoomCenter = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
      if (e.deltaY < 0) {
        zoomIn(zoomCenter);
      } else {
        zoomOut(zoomCenter);
      }
    } else {
      setViewport({
        panX: viewport.panX - e.deltaX,
        panY: viewport.panY - e.deltaY,
      });
    }
  };
}
