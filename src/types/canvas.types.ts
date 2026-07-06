/**
 * Canvas-related type definitions for the diagram editor.
 */

// ─── Anchor System ───────────────────────────────────────────────────────────

/** Identifies a named anchor position on a shape. */
export type AnchorId = 'T' | 'R' | 'B' | 'L' | 'C' | 'TL' | 'TR' | 'BR' | 'BL';

/**
 * A resolved anchor point in world coordinates.
 * Each anchor has an identity, position, and preferred outgoing direction.
 */
export interface AnchorPoint {
  id: AnchorId;
  x: number;
  y: number;
  /** Unit direction vector for the outgoing connector (away from shape). */
  direction: Point;
  /** Whether this anchor is active (shown and connectable). */
  enabled: boolean;
}

// ─── Geometry ───────────────────────────────────────────────────────────────

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ─── Layers & Elements ──────────────────────────────────────────────────────

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  order: number;
}

export type ElementType = string;
export type ConnectorType = 'straight' | 'orthogonal' | 'curved';

export interface ElementStyle {
  fillColor: string;
  strokeColor: string;
  strokeWidth: number;
  opacity: number;
  borderRadius: number;
  fontSize?: number;
  fontFamily?: string;
  fontColor?: string;
  textAlign?: 'left' | 'center' | 'right';
}

export interface CanvasElement {
  id: string;
  type: ElementType;
  bounds: Bounds;
  label: string;
  style: ElementStyle;
  rotation: number;
  locked: boolean;
  visible: boolean;
  parentId?: string;
  layerId?: string;
  zIndex: number;
  metadata?: Record<string, unknown>;
}

export interface Connector {
  id: string;
  type: ConnectorType;
  sourceId: string;
  targetId: string;
  sourcePoint: Point;
  targetPoint: Point;
  waypoints: Point[];
  label: string;
  style: {
    strokeColor: string;
    strokeWidth: number;
    strokeDasharray?: string;
    startArrow: boolean;
    endArrow: boolean;
  };
  zIndex: number;
  /** Pinned source anchor. When set, the connector always starts at this anchor. */
  sourceAnchorId?: AnchorId;
  /** Pinned target anchor. When set, the connector always ends at this anchor. */
  targetAnchorId?: AnchorId;
}

// ─── Canvas State Types ─────────────────────────────────────────────────────

export interface Viewport {
  panX: number;
  panY: number;
  zoom: number;
}

export interface GridConfig {
  enabled: boolean;
  size: number;
  snapToGrid: boolean;
  color: string;
}

export interface CanvasConfig {
  width: number;
  height: number;
  backgroundColor: string;
  grid: GridConfig;
}
