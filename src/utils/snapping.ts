import { Bounds, Point, CanvasElement, Viewport, GridConfig } from '@/types/canvas.types';
import { AlignmentGuide } from '@/stores/interaction.store';

/**
 * Calculates the bounding box that encloses all given bounds.
 */
export function getCollectiveBounds(rects: Bounds[]): Bounds {
  if (rects.length === 0) return { x: 0, y: 0, width: 0, height: 0 };

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const r of rects) {
    minX = Math.min(minX, r.x);
    minY = Math.min(minY, r.y);
    maxX = Math.max(maxX, r.x + r.width);
    maxY = Math.max(maxY, r.y + r.height);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

interface SnapOptions {
  snapToObjects: boolean;
  showGuides: boolean;
  snapStrength: number;
  gridConfig: GridConfig;
  viewport: Viewport;
  canvasWidth: number;
  canvasHeight: number;
}

/**
 * Computes snapping and generates alignment/spacing guides.
 */
export function computeSnapping(
  dragged: Bounds,
  others: CanvasElement[],
  options: SnapOptions
): { x: number; y: number; guides: AlignmentGuide[] } {
  const { snapToObjects, snapStrength, gridConfig, viewport, canvasWidth, canvasHeight } = options;
  const threshold = snapStrength / viewport.zoom;

  let snappedX = dragged.x;
  let snappedY = dragged.y;
  const guides: AlignmentGuide[] = [];

  let xSnapped = false;
  let ySnapped = false;

  // 1. Spacing Snapping (Check first as it represents precise positioning)
  if (snapToObjects && others.length >= 2) {
    // ── Horizontal Spacing ──
    let bestSpacingXDelta = Infinity;
    let spacingXGuides: AlignmentGuide[] = [];
    let spacingTargetX = snappedX;

    for (let i = 0; i < others.length; i++) {
      for (let j = 0; j < others.length; j++) {
        if (i === j) continue;
        const elA = others[i].bounds;
        const elB = others[j].bounds;

        // Ensure A is left of B
        if (elA.x + elA.width > elB.x) continue;
        const gap = elB.x - (elA.x + elA.width);
        if (gap < 4) continue; // ignore tiny/overlapping gaps

        const midY = (Math.min(elA.y, elB.y) + Math.max(elA.y + elA.height, elB.y + elB.height)) / 2;

        // Case 1: Dragged element is to the right of B
        if (dragged.x >= elB.x + elB.width - gap) {
          const targetX = elB.x + elB.width + gap;
          const delta = targetX - dragged.x;
          if (Math.abs(delta) <= threshold && Math.abs(delta) < Math.abs(bestSpacingXDelta)) {
            bestSpacingXDelta = delta;
            spacingTargetX = targetX;
            spacingXGuides = [
              {
                type: 'h-spacing',
                x1: elA.x + elA.width,
                y1: midY,
                x2: elB.x,
                y2: midY,
                label: `${Math.round(gap)}`,
              },
              {
                type: 'h-spacing',
                x1: elB.x + elB.width,
                y1: midY,
                x2: targetX,
                y2: midY,
                label: `${Math.round(gap)}`,
              },
            ];
          }
        }
        // Case 2: Dragged element is to the left of A
        if (dragged.x + dragged.width <= elA.x + gap) {
          const targetX = elA.x - gap - dragged.width;
          const delta = targetX - dragged.x;
          if (Math.abs(delta) <= threshold && Math.abs(delta) < Math.abs(bestSpacingXDelta)) {
            bestSpacingXDelta = delta;
            spacingTargetX = targetX;
            spacingXGuides = [
              {
                type: 'h-spacing',
                x1: elA.x + elA.width,
                y1: midY,
                x2: elB.x,
                y2: midY,
                label: `${Math.round(gap)}`,
              },
              {
                type: 'h-spacing',
                x1: targetX + dragged.width,
                y1: midY,
                x2: elA.x,
                y2: midY,
                label: `${Math.round(gap)}`,
              },
            ];
          }
        }
        // Case 3: Dragged element is between A and B
        if (dragged.x > elA.x + elA.width && dragged.x + dragged.width < elB.x) {
          const targetX = elA.x + elA.width + (gap - dragged.width) / 2;
          const delta = targetX - dragged.x;
          if (Math.abs(delta) <= threshold && Math.abs(delta) < Math.abs(bestSpacingXDelta)) {
            bestSpacingXDelta = delta;
            spacingTargetX = targetX;
            spacingXGuides = [
              {
                type: 'h-spacing',
                x1: elA.x + elA.width,
                y1: midY,
                x2: targetX,
                y2: midY,
                label: `${Math.round((gap - dragged.width) / 2)}`,
              },
              {
                type: 'h-spacing',
                x1: targetX + dragged.width,
                y1: midY,
                x2: elB.x,
                y2: midY,
                label: `${Math.round((gap - dragged.width) / 2)}`,
              },
            ];
          }
        }
      }
    }

    if (Math.abs(bestSpacingXDelta) <= threshold) {
      snappedX = spacingTargetX;
      guides.push(...spacingXGuides);
      xSnapped = true;
    }

    // ── Vertical Spacing ──
    let bestSpacingYDelta = Infinity;
    let spacingYGuides: AlignmentGuide[] = [];
    let spacingTargetY = snappedY;

    for (let i = 0; i < others.length; i++) {
      for (let j = 0; j < others.length; j++) {
        if (i === j) continue;
        const elA = others[i].bounds;
        const elB = others[j].bounds;

        // Ensure A is above B
        if (elA.y + elA.height > elB.y) continue;
        const gap = elB.y - (elA.y + elA.height);
        if (gap < 4) continue;

        const midX = (Math.min(elA.x, elB.x) + Math.max(elA.x + elA.width, elB.x + elB.width)) / 2;

        // Case 1: Dragged element is below B
        if (dragged.y >= elB.y + elB.height - gap) {
          const targetY = elB.y + elB.height + gap;
          const delta = targetY - dragged.y;
          if (Math.abs(delta) <= threshold && Math.abs(delta) < Math.abs(bestSpacingYDelta)) {
            bestSpacingYDelta = delta;
            spacingTargetY = targetY;
            spacingYGuides = [
              {
                type: 'v-spacing',
                x1: midX,
                y1: elA.y + elA.height,
                x2: midX,
                y2: elB.y,
                label: `${Math.round(gap)}`,
              },
              {
                type: 'v-spacing',
                x1: midX,
                y1: elB.y + elB.height,
                x2: midX,
                y2: targetY,
                label: `${Math.round(gap)}`,
              },
            ];
          }
        }
        // Case 2: Dragged element is above A
        if (dragged.y + dragged.height <= elA.y + gap) {
          const targetY = elA.y - gap - dragged.height;
          const delta = targetY - dragged.y;
          if (Math.abs(delta) <= threshold && Math.abs(delta) < Math.abs(bestSpacingYDelta)) {
            bestSpacingYDelta = delta;
            spacingTargetY = targetY;
            spacingYGuides = [
              {
                type: 'v-spacing',
                x1: midX,
                y1: elA.y + elA.height,
                x2: midX,
                y2: elB.y,
                label: `${Math.round(gap)}`,
              },
              {
                type: 'v-spacing',
                x1: midX,
                y1: targetY + dragged.height,
                x2: midX,
                y2: elA.y,
                label: `${Math.round(gap)}`,
              },
            ];
          }
        }
        // Case 3: Dragged element is between A and B
        if (dragged.y > elA.y + elA.height && dragged.y + dragged.height < elB.y) {
          const targetY = elA.y + elA.height + (gap - dragged.height) / 2;
          const delta = targetY - dragged.y;
          if (Math.abs(delta) <= threshold && Math.abs(delta) < Math.abs(bestSpacingYDelta)) {
            bestSpacingYDelta = delta;
            spacingTargetY = targetY;
            spacingYGuides = [
              {
                type: 'v-spacing',
                x1: midX,
                y1: elA.y + elA.height,
                x2: midX,
                y2: targetY,
                label: `${Math.round((gap - dragged.height) / 2)}`,
              },
              {
                type: 'v-spacing',
                x1: midX,
                y1: targetY + dragged.height,
                x2: midX,
                y2: elB.y,
                label: `${Math.round((gap - dragged.height) / 2)}`,
              },
            ];
          }
        }
      }
    }

    if (Math.abs(bestSpacingYDelta) <= threshold) {
      snappedY = spacingTargetY;
      guides.push(...spacingYGuides);
      ySnapped = true;
    }
  }

  // 2. Object Edge and Center Snapping (if not already snapped by spacing)
  if (snapToObjects) {
    if (!xSnapped) {
      let bestDeltaX = Infinity;
      let refElementX: CanvasElement | null = null;
      let snapTargetX = snappedX;

      // Check against other elements
      for (const other of others) {
        const ob = other.bounds;
        const refXs = [
          { value: ob.x, label: 'L' },
          { value: ob.x + ob.width / 2, label: 'C' },
          { value: ob.x + ob.width, label: 'R' },
        ];
        const draggedXs = [
          { value: dragged.x, offset: 0, label: 'L' },
          { value: dragged.x + dragged.width / 2, offset: -dragged.width / 2, label: 'C' },
          { value: dragged.x + dragged.width, offset: -dragged.width, label: 'R' },
        ];

        for (const rx of refXs) {
          for (const dx of draggedXs) {
            const delta = rx.value - dx.value;
            if (Math.abs(delta) <= threshold && Math.abs(delta) < Math.abs(bestDeltaX)) {
              bestDeltaX = delta;
              snapTargetX = dragged.x + delta;
              refElementX = other;
            }
          }
        }
      }

      // Check against canvas origin (0) and screen viewport center
      const viewCenterX = -viewport.panX / viewport.zoom + canvasWidth / (2 * viewport.zoom);
      const virtualRefs = [0, viewCenterX];
      for (const rx of virtualRefs) {
        const draggedXs = [
          { value: dragged.x, offset: 0 },
          { value: dragged.x + dragged.width / 2, offset: -dragged.width / 2 },
          { value: dragged.x + dragged.width, offset: -dragged.width },
        ];
        for (const dx of draggedXs) {
          const delta = rx - dx.value;
          if (Math.abs(delta) <= threshold && Math.abs(delta) < Math.abs(bestDeltaX)) {
            bestDeltaX = delta;
            snapTargetX = dragged.x + delta;
            refElementX = null; // canvas snaps have no source element
          }
        }
      }

      if (Math.abs(bestDeltaX) <= threshold) {
        snappedX = snapTargetX;
        xSnapped = true;

        // Generate guide
        const lineX = snappedX + (bestDeltaX === 0 ? 0 : bestDeltaX); // aligned X coord
        const y1 = refElementX
          ? Math.min(dragged.y, refElementX.bounds.y)
          : Math.min(dragged.y, 0);
        const y2 = refElementX
          ? Math.max(dragged.y + dragged.height, refElementX.bounds.y + refElementX.bounds.height)
          : Math.max(dragged.y + dragged.height, 0);

        guides.push({
          type: 'v-align',
          x1: lineX,
          y1,
          x2: lineX,
          y2,
        });
      }
    }

    if (!ySnapped) {
      let bestDeltaY = Infinity;
      let refElementY: CanvasElement | null = null;
      let snapTargetY = snappedY;

      // Check against other elements
      for (const other of others) {
        const ob = other.bounds;
        const refYs = [
          { value: ob.y, label: 'T' },
          { value: ob.y + ob.height / 2, label: 'C' },
          { value: ob.y + ob.height, label: 'B' },
        ];
        const draggedYs = [
          { value: dragged.y, offset: 0, label: 'T' },
          { value: dragged.y + dragged.height / 2, offset: -dragged.height / 2, label: 'C' },
          { value: dragged.y + dragged.height, offset: -dragged.height, label: 'B' },
        ];

        for (const ry of refYs) {
          for (const dy of draggedYs) {
            const delta = ry.value - dy.value;
            if (Math.abs(delta) <= threshold && Math.abs(delta) < Math.abs(bestDeltaY)) {
              bestDeltaY = delta;
              snapTargetY = dragged.y + delta;
              refElementY = other;
            }
          }
        }
      }

      // Check against canvas origin (0) and screen viewport center
      const viewCenterY = -viewport.panY / viewport.zoom + canvasHeight / (2 * viewport.zoom);
      const virtualRefs = [0, viewCenterY];
      for (const ry of virtualRefs) {
        const draggedYs = [
          { value: dragged.y, offset: 0 },
          { value: dragged.y + dragged.height / 2, offset: -dragged.height / 2 },
          { value: dragged.y + dragged.height, offset: -dragged.height },
        ];
        for (const dy of draggedYs) {
          const delta = ry - dy.value;
          if (Math.abs(delta) <= threshold && Math.abs(delta) < Math.abs(bestDeltaY)) {
            bestDeltaY = delta;
            snapTargetY = dragged.y + delta;
            refElementY = null;
          }
        }
      }

      if (Math.abs(bestDeltaY) <= threshold) {
        snappedY = snapTargetY;
        ySnapped = true;

        // Generate guide
        const lineY = snappedY;
        const x1 = refElementY
          ? Math.min(dragged.x, refElementY.bounds.x)
          : Math.min(dragged.x, 0);
        const x2 = refElementY
          ? Math.max(dragged.x + dragged.width, refElementY.bounds.x + refElementY.bounds.width)
          : Math.max(dragged.x + dragged.width, 0);

        guides.push({
          type: 'h-align',
          x1,
          y1: lineY,
          x2,
          y2: lineY,
        });
      }
    }
  }

  // 3. Grid Snapping Fallback (Only if we didn't snap to an object in that dimension)
  if (gridConfig.snapToGrid) {
    if (!xSnapped) {
      const step = gridConfig.size;
      const gx = Math.round(dragged.x / step) * step;
      snappedX = gx;
    }
    if (!ySnapped) {
      const step = gridConfig.size;
      const gy = Math.round(dragged.y / step) * step;
      snappedY = gy;
    }
  }

  return { x: snappedX, y: snappedY, guides };
}
