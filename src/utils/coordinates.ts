import { Point, Viewport, Bounds } from '@/types/canvas.types';

/**
 * Converts screen coordinates (mouse) to world coordinates (canvas).
 */
export function screenToWorld(point: Point, viewport: Viewport): Point {
  return {
    x: (point.x - viewport.panX) / viewport.zoom,
    y: (point.y - viewport.panY) / viewport.zoom,
  };
}

/**
 * Converts world coordinates (canvas) to screen coordinates.
 */
export function worldToScreen(point: Point, viewport: Viewport): Point {
  return {
    x: point.x * viewport.zoom + viewport.panX,
    y: point.y * viewport.zoom + viewport.panY,
  };
}

/**
 * Calculates the new pan offset required to keep a specific point (the cursor)
 * fixed in the same relative position after a zoom change.
 */
export function getZoomedOffset(
  cursorPos: Point,
  currentPan: Point,
  oldZoom: number,
  newZoom: number
): Point {
  // Point under cursor in world coordinates before zoom
  const worldX = (cursorPos.x - currentPan.x) / oldZoom;
  const worldY = (cursorPos.y - currentPan.y) / oldZoom;

  // New pan to keep that world point at the same screen position
  return {
    x: cursorPos.x - worldX * newZoom,
    y: cursorPos.y - worldY * newZoom,
  };
}

/**
 * Checks if a point is inside a bounding box.
 */
export function isPointInBounds(point: Point, bounds: Bounds): boolean {
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  );
}

/**
 * Calculates the center point of a bounding box.
 */
export function getBoundsCenter(bounds: Bounds): Point {
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };
}

/**
 * Checks if a point is near a line segment (used for selecting connectors).
 */
export function isPointNearLine(p: Point, p1: Point, p2: Point, tolerance = 5): boolean {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  
  // Line segment length squared
  const l2 = dx * dx + dy * dy;
  
  if (l2 === 0) {
    // p1 == p2, just check distance to that point
    const distSq = (p.x - p1.x) * (p.x - p1.x) + (p.y - p1.y) * (p.y - p1.y);
    return distSq <= tolerance * tolerance;
  }
  
  // Consider the line extending the segment, parameterized as p1 + t (p2 - p1).
  // We find projection of point p onto the line. 
  // It falls where t = [(p-p1) . (p2-p1)] / |p2-p1|^2
  let t = ((p.x - p1.x) * dx + (p.y - p1.y) * dy) / l2;
  t = Math.max(0, Math.min(1, t));
  
  // Projection point
  const projX = p1.x + t * dx;
  const projY = p1.y + t * dy;
  
  // Distance from point to projection point
  const distSq = (p.x - projX) * (p.x - projX) + (p.y - projY) * (p.y - projY);
  return distSq <= tolerance * tolerance;
}

/**
 * Bounds calculation helper for Minimap.
 */
export interface MinimapBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  scale: number;
  offsetX: number;
  offsetY: number;
}

export function calculateMinimapBounds(
  elements: Array<{ bounds: Bounds }>,
  padding: number,
  minimapSize: number
): MinimapBounds {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  if (elements.length > 0) {
    elements.forEach(el => {
      if (el.bounds.x < minX) minX = el.bounds.x;
      if (el.bounds.y < minY) minY = el.bounds.y;
      if (el.bounds.x + el.bounds.width > maxX) maxX = el.bounds.x + el.bounds.width;
      if (el.bounds.y + el.bounds.height > maxY) maxY = el.bounds.y + el.bounds.height;
    });
  } else {
    minX = 0;
    minY = 0;
    maxX = 1000;
    maxY = 1000;
  }

  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  const contentWidth = maxX - minX;
  const contentHeight = maxY - minY;

  const scale = Math.min(minimapSize / contentWidth, minimapSize / contentHeight);
  const offsetX = (minimapSize - contentWidth * scale) / 2;
  const offsetY = (minimapSize - contentHeight * scale) / 2;

  return { minX, minY, maxX, maxY, scale, offsetX, offsetY };
}
