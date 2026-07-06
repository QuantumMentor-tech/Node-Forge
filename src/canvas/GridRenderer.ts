import { Viewport, GridConfig } from '@/types/canvas.types';

/**
 * GridRenderer — draws an infinite-feeling grid that scales with zoom
 * and follows the viewport offset using modulo arithmetic.
 */
export class GridRenderer {
  /** Resolved color cache to avoid repeated DOM lookups */
  private static resolvedColors: Record<string, string> = {};

  /**
   * Resolve a CSS variable or return the raw color string.
   */
  private static resolveColor(color: string): string {
    if (!color.startsWith('var(')) return color;

    if (this.resolvedColors[color]) return this.resolvedColors[color];

    const varName = color.slice(4, -1).trim();
    const resolved = getComputedStyle(document.documentElement)
      .getPropertyValue(varName)
      .trim();

    this.resolvedColors[color] = resolved || '#2a2e3d';
    return this.resolvedColors[color];
  }

  /** Clear resolved color cache (call on theme change). */
  public static clearCache(): void {
    this.resolvedColors = {};
  }

  public static render(
    ctx: CanvasRenderingContext2D,
    viewport: Viewport,
    grid: GridConfig,
    width: number,
    height: number
  ): void {
    if (!grid.enabled) return;

    const gridColor = this.resolveColor(grid.color);
    const zoom = viewport.zoom;
    const size = grid.size * zoom;

    // Don't draw grid if spacing is too small (performance)
    if (size < 4) return;

    ctx.save();

    // ─── Dot Grid ─────────────────────────────────────────────────────
    const offsetX = ((viewport.panX % size) + size) % size;
    const offsetY = ((viewport.panY % size) + size) % size;
    const dotRadius = Math.max(0.8, zoom * 0.8);

    ctx.fillStyle = gridColor;
    ctx.globalAlpha = Math.min(0.6, 0.3 + zoom * 0.1);

    for (let x = offsetX; x <= width; x += size) {
      for (let y = offsetY; y <= height; y += size) {
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ─── Origin Axes ──────────────────────────────────────────────────
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#6366f1';

    // Horizontal origin axis
    if (viewport.panY >= 0 && viewport.panY <= height) {
      ctx.beginPath();
      ctx.moveTo(0, viewport.panY);
      ctx.lineTo(width, viewport.panY);
      ctx.stroke();
    }

    // Vertical origin axis
    if (viewport.panX >= 0 && viewport.panX <= width) {
      ctx.beginPath();
      ctx.moveTo(viewport.panX, 0);
      ctx.lineTo(viewport.panX, height);
      ctx.stroke();
    }

    ctx.restore();
  }
}
