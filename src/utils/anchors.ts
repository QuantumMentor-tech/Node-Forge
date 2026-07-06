import { Bounds, Point, AnchorId, AnchorPoint } from '@/types/canvas.types';

// ─── Anchor Profile ─────────────────────────────────────────────────────────

/** Defines which named anchors are enabled by default for a shape type. */
const DEFAULT_ENABLED: Set<AnchorId> = new Set(['T', 'R', 'B', 'L', 'C']);

// ─── Core AnchorEngine ──────────────────────────────────────────────────────

export const AnchorEngine = {
  /**
   * Returns all 9 potential anchor points for a given bounds.
   * Corner anchors (TL, TR, BR, BL) are disabled by default.
   */
  getAnchorPoints(bounds: Bounds, enableCorners = false): AnchorPoint[] {
    const { x, y, width: w, height: h } = bounds;
    const cx = x + w / 2;
    const cy = y + h / 2;

    const all: AnchorPoint[] = [
      { id: 'T',  x: cx,   y: y,    direction: { x:  0, y: -1 }, enabled: true },
      { id: 'R',  x: x+w,  y: cy,   direction: { x:  1, y:  0 }, enabled: true },
      { id: 'B',  x: cx,   y: y+h,  direction: { x:  0, y:  1 }, enabled: true },
      { id: 'L',  x: x,    y: cy,   direction: { x: -1, y:  0 }, enabled: true },
      { id: 'C',  x: cx,   y: cy,   direction: { x:  0, y:  0 }, enabled: true },
      { id: 'TL', x: x,    y: y,    direction: { x: -1, y: -1 }, enabled: enableCorners },
      { id: 'TR', x: x+w,  y: y,    direction: { x:  1, y: -1 }, enabled: enableCorners },
      { id: 'BR', x: x+w,  y: y+h,  direction: { x:  1, y:  1 }, enabled: enableCorners },
      { id: 'BL', x: x,    y: y+h,  direction: { x: -1, y:  1 }, enabled: enableCorners },
    ];

    return all;
  },

  /**
   * Returns only the enabled anchor points for a bounds.
   */
  getEnabledAnchors(bounds: Bounds, enableCorners = false): AnchorPoint[] {
    return this.getAnchorPoints(bounds, enableCorners).filter(a => a.enabled);
  },

  /**
   * Returns the world position of a specific named anchor on a bounds.
   * If anchorId is not provided, returns the center.
   */
  getAnchorWorldPos(anchorId: AnchorId | undefined, bounds: Bounds): Point {
    if (!anchorId) {
      return { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
    }
    const anchors = this.getAnchorPoints(bounds, true);
    return anchors.find(a => a.id === anchorId) ?? { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 };
  },

  /**
   * Finds the nearest enabled anchor on a shape to a world position, within maxDistance.
   * Returns null if no anchor is within range.
   */
  findNearestAnchor(worldPos: Point, bounds: Bounds, maxDistance: number): AnchorPoint | null {
    const anchors = this.getEnabledAnchors(bounds);
    let best: AnchorPoint | null = null;
    let bestDist = maxDistance;

    for (const anchor of anchors) {
      const dist = Math.hypot(worldPos.x - anchor.x, worldPos.y - anchor.y);
      if (dist < bestDist) {
        bestDist = dist;
        best = anchor;
      }
    }

    return best;
  },

  /**
   * Finds the globally closest anchor pair between two shapes.
   * Returns the best source and target AnchorPoints.
   */
  findClosestPairAnchors(
    sourceBounds: Bounds,
    targetBounds: Bounds
  ): { sourceAnchor: AnchorPoint; targetAnchor: AnchorPoint } {
    const srcAnchors = this.getEnabledAnchors(sourceBounds);
    const tgtAnchors = this.getEnabledAnchors(targetBounds);

    let minDist = Infinity;
    let bestSrc = srcAnchors[0];
    let bestTgt = tgtAnchors[0];

    for (const s of srcAnchors) {
      for (const t of tgtAnchors) {
        const dist = Math.hypot(t.x - s.x, t.y - s.y);
        if (dist < minDist) {
          minDist = dist;
          bestSrc = s;
          bestTgt = t;
        }
      }
    }

    return { sourceAnchor: bestSrc, targetAnchor: bestTgt };
  },

  /**
   * Finds the nearest anchor on a shape to an arbitrary floating point.
   * Used during CONNECTING drag when no target element is hovered.
   */
  findBestSourceAnchor(sourceBounds: Bounds, towardPoint: Point): AnchorPoint {
    const anchors = this.getEnabledAnchors(sourceBounds).filter(a => a.id !== 'C');
    let best = anchors[0];
    let bestDist = Infinity;

    for (const a of anchors) {
      const dist = Math.hypot(towardPoint.x - a.x, towardPoint.y - a.y);
      if (dist < bestDist) {
        bestDist = dist;
        best = a;
      }
    }

    return best;
  },
};

// ─── Backward Compatibility Shim ────────────────────────────────────────────

/**
 * @deprecated Use AnchorEngine.findClosestPairAnchors() instead.
 * Kept for backward compatibility with any code that imports this directly.
 */
export function getElementAnchors(bounds: Bounds): Point[] {
  return AnchorEngine.getEnabledAnchors(bounds).filter(a => a.id !== 'C').map(a => ({ x: a.x, y: a.y }));
}

/**
 * @deprecated Use AnchorEngine.findClosestPairAnchors() instead.
 */
export function getClosestAnchors(
  sourceBounds: Bounds,
  targetBounds: Bounds | Point
): { sourceAnchor: Point; targetAnchor: Point } {
  const isPoint = !('width' in targetBounds);

  if (isPoint) {
    const src = AnchorEngine.findBestSourceAnchor(sourceBounds, targetBounds as Point);
    return { sourceAnchor: src, targetAnchor: targetBounds as Point };
  }

  const { sourceAnchor, targetAnchor } = AnchorEngine.findClosestPairAnchors(
    sourceBounds,
    targetBounds as Bounds
  );
  return { sourceAnchor, targetAnchor };
}
