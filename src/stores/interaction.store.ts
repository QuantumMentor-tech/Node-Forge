/**
 * interaction.store.ts
 *
 * Zustand store for the canvas interaction state machine.
 * Replaces the private InteractionState type inside InteractionManager
 * with a proper reactive store so UI components can respond to interaction phases.
 *
 * This enables:
 *  - Showing contextual cursor indicators
 *  - Disabling property panel during drag
 *  - Displaying "drawing..." hints in status bar
 */

import { create } from 'zustand';
import type { AnchorId, Point } from '@/types/canvas.types';

export type InteractionPhase =
  | 'IDLE'
  | 'PANNING'
  | 'SELECTING'
  | 'MOVING'
  | 'DRAWING'
  | 'CONNECTING'
  | 'RESIZING'
  | 'SELECTING_BOX';

export interface AlignmentGuide {
  type: 'h-align' | 'v-align' | 'h-spacing' | 'v-spacing';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  label?: string;
}

interface InteractionState {
  phase: InteractionPhase;

  /** ID of the connector being drawn (CONNECTING phase only) */
  activeConnectorId: string | null;

  /** Start position of current draw gesture (DRAWING phase) */
  drawStartX: number;
  drawStartY: number;

  /** Marquee selection box coordinates */
  selectionBox: { x: number, y: number, width: number, height: number } | null;

  /** ID of the element currently being edited inline */
  inlineEditId: string | null;

  /** Active alignment guides for snapping rendering */
  activeGuides: AlignmentGuide[];

  // ─── Anchor / Hover State ────────────────────────────────────────────────

  /** Element currently under the mouse cursor (any phase — used for anchor rendering). */
  hoveredElementId: string | null;

  /** The nearest anchor on the hovered element to the mouse position. */
  hoveredAnchorId: AnchorId | null;

  /** Live cursor position while in CONNECTING phase (for connector preview). */
  connectionPreviewPoint: Point | null;

  /** Target element under cursor while drawing a connector. */
  connectionTargetId: string | null;

  /** Snapped target anchor on the connection target element. */
  connectionTargetAnchorId: AnchorId | null;

  // Actions
  setPhase: (phase: InteractionPhase) => void;
  setActiveConnectorId: (id: string | null) => void;
  setDrawStart: (x: number, y: number) => void;
  setSelectionBox: (box: { x: number, y: number, width: number, height: number } | null) => void;
  setInlineEditId: (id: string | null) => void;
  setActiveGuides: (guides: AlignmentGuide[]) => void;
  setHoveredElement: (id: string | null, anchorId: AnchorId | null) => void;
  setConnectionPreview: (point: Point | null, targetId: string | null, anchorId: AnchorId | null) => void;
  reset: () => void;
}

export const useInteractionStore = create<InteractionState>((set) => ({
  phase: 'IDLE',
  activeConnectorId: null,
  drawStartX: 0,
  drawStartY: 0,
  selectionBox: null,
  inlineEditId: null,
  activeGuides: [],

  hoveredElementId: null,
  hoveredAnchorId: null,
  connectionPreviewPoint: null,
  connectionTargetId: null,
  connectionTargetAnchorId: null,

  setPhase: (phase) => set({ phase }),
  setActiveConnectorId: (id) => set({ activeConnectorId: id }),
  setDrawStart: (x, y) => set({ drawStartX: x, drawStartY: y }),
  setSelectionBox: (box) => set({ selectionBox: box }),
  setInlineEditId: (id) => set({ inlineEditId: id }),
  setActiveGuides: (guides) => set({ activeGuides: guides }),

  setHoveredElement: (id, anchorId) =>
    set({ hoveredElementId: id, hoveredAnchorId: anchorId }),

  setConnectionPreview: (point, targetId, anchorId) =>
    set({
      connectionPreviewPoint: point,
      connectionTargetId: targetId,
      connectionTargetAnchorId: anchorId,
    }),

  reset: () =>
    set({
      phase: 'IDLE',
      activeConnectorId: null,
      drawStartX: 0,
      drawStartY: 0,
      selectionBox: null,
      inlineEditId: null,
      activeGuides: [],
      hoveredElementId: null,
      hoveredAnchorId: null,
      connectionPreviewPoint: null,
      connectionTargetId: null,
      connectionTargetAnchorId: null,
    }),
}));
