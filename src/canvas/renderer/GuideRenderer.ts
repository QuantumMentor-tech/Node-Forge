import { Viewport } from '@/types/canvas.types';
import { AlignmentGuide } from '@/stores/interaction.store';

export class GuideRenderer {
  /**
   * Renders the alignment and spacing guides in screen space for pixel-perfection.
   */
  static render(
    ctx: CanvasRenderingContext2D,
    guides: AlignmentGuide[],
    viewport: Viewport
  ): void {
    if (!guides || guides.length === 0) return;

    ctx.save();
    // Do NOT apply canvas scale/translation, we are rendering in screen space!

    for (const guide of guides) {
      // Project world points to screen coordinates
      const p1 = {
        x: guide.x1 * viewport.zoom + viewport.panX,
        y: guide.y1 * viewport.zoom + viewport.panY,
      };
      const p2 = {
        x: guide.x2 * viewport.zoom + viewport.panX,
        y: guide.y2 * viewport.zoom + viewport.panY,
      };

      if (guide.type === 'h-align' || guide.type === 'v-align') {
        // ── Alignment Guides ──
        ctx.strokeStyle = '#d946ef'; // Magenta
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);

        // Draw alignment line
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // Draw small dot at start and end points
        ctx.setLineDash([]);
        ctx.fillStyle = '#d946ef';
        
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p2.x, p2.y, 3, 0, Math.PI * 2);
        ctx.fill();

      } else if (guide.type === 'h-spacing' || guide.type === 'v-spacing') {
        // ── Spacing Guides ──
        ctx.strokeStyle = '#e11d48'; // Red/Pink
        ctx.lineWidth = 1.2;
        ctx.setLineDash([]);

        // Draw the main line
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        // Draw T-bar ticks at endpoints
        const tickLength = 8; // in screen pixels
        ctx.beginPath();
        if (guide.type === 'h-spacing') {
          // Vertical ticks for horizontal spacing
          ctx.moveTo(p1.x, p1.y - tickLength / 2);
          ctx.lineTo(p1.x, p1.y + tickLength / 2);
          ctx.moveTo(p2.x, p2.y - tickLength / 2);
          ctx.lineTo(p2.x, p2.y + tickLength / 2);
        } else {
          // Horizontal ticks for vertical spacing
          ctx.moveTo(p1.x - tickLength / 2, p1.y);
          ctx.lineTo(p1.x + tickLength / 2, p1.y);
          ctx.moveTo(p2.x - tickLength / 2, p2.y);
          ctx.lineTo(p2.x + tickLength / 2, p2.y);
        }
        ctx.stroke();

        // Draw numeric value badge in the middle
        if (guide.label) {
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;

          ctx.font = 'bold 9px sans-serif';
          const textWidth = ctx.measureText(guide.label).width;
          const paddingX = 6;
          const paddingY = 3;
          const badgeW = textWidth + paddingX * 2;
          const badgeH = 14;

          // Draw rounded rect background
          ctx.fillStyle = '#e11d48';
          
          const bx = midX - badgeW / 2;
          const by = midY - badgeH / 2;
          const br = 3; // radius

          ctx.beginPath();
          ctx.roundRect?.(bx, by, badgeW, badgeH, br) || ctx.rect(bx, by, badgeW, badgeH);
          ctx.fill();

          // Draw label text
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(guide.label, midX, midY + 0.5);
        }
      }
    }

    ctx.restore();
  }
}
