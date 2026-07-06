import { CanvasElement, Viewport } from '@/types/canvas.types';

/** The 8 resize handle positions (exported so InteractionManager can reuse). */
export type ResizeHandle = 'TL' | 'T' | 'TR' | 'R' | 'BR' | 'B' | 'BL' | 'L';

/** Compute world-space center points for all 8 handles around a selection box. */
export function getHandlePositions(
  x: number, y: number, w: number, h: number, padding: number
): Record<ResizeHandle, { x: number; y: number }> {
  const l = x - padding;
  const r = x + w + padding;
  const t = y - padding;
  const b = y + h + padding;
  const mx = x + w / 2;
  const my = y + h / 2;
  return {
    TL: { x: l,  y: t  },
    T:  { x: mx, y: t  },
    TR: { x: r,  y: t  },
    R:  { x: r,  y: my },
    BR: { x: r,  y: b  },
    B:  { x: mx, y: b  },
    BL: { x: l,  y: b  },
    L:  { x: l,  y: my },
  };
}

export class SelectionRenderer {
  public static render(
    ctx: CanvasRenderingContext2D,
    elements: CanvasElement[],
    selectedIds: Set<string>,
    viewport: Viewport
  ): void {
    if (selectedIds.size === 0) return;

    ctx.save();
    ctx.translate(viewport.panX, viewport.panY);
    ctx.scale(viewport.zoom, viewport.zoom);

    for (const el of elements) {
      if (!selectedIds.has(el.id)) continue;

      ctx.save();
      const { x, y, width, height } = el.bounds;

      // Keep selection outline crisp regardless of zoom level
      const zi = 1 / viewport.zoom;
      const padding = 4 * zi;
      const handleSize = 7 * zi;

      // ── Selection outline ───────────────────────────────────────────────
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 1.5 * zi;
      ctx.setLineDash([]);
      ctx.strokeRect(x - padding, y - padding, width + padding * 2, height + padding * 2);

      // ── 8 Resize handles ────────────────────────────────────────────────
      const handles = getHandlePositions(x, y, width, height, padding);
      const cornerHandles: ResizeHandle[] = ['TL', 'TR', 'BR', 'BL'];
      const edgeHandles: ResizeHandle[]   = ['T', 'R', 'B', 'L'];

      const drawHandle = (hx: number, hy: number, isCorner: boolean) => {
        const half = handleSize / 2;
        // White fill
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(hx - half, hy - half, handleSize, handleSize);
        // Indigo stroke (corners) / slightly lighter (edges)
        ctx.strokeStyle = isCorner ? '#6366f1' : '#818cf8';
        ctx.lineWidth = 1.5 * zi;
        ctx.strokeRect(hx - half, hy - half, handleSize, handleSize);
      };

      for (const key of cornerHandles) {
        const h = handles[key];
        drawHandle(h.x, h.y, true);
      }
      for (const key of edgeHandles) {
        const h = handles[key];
        drawHandle(h.x, h.y, false);
      }

      ctx.restore();
    }

    ctx.restore();
  }
}
