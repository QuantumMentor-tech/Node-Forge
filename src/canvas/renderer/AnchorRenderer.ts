import { CanvasElement, Viewport } from '@/types/canvas.types';
import { AnchorEngine } from '@/utils/anchors';

interface AnchorRenderState {
  hoveredElementId: string | null;
  hoveredAnchorId: string | null;
  connectionTargetId: string | null;
  connectionTargetAnchorId: string | null;
  phase: string;
  connectionPreviewPoint: { x: number; y: number } | null;
  activeConnectorId: string | null;
}

export class AnchorRenderer {
  // Radius in world units for an anchor point indicator
  private static ANCHOR_RADIUS = 5;
  private static ANCHOR_HOT_RADIUS = 8;

  static render(
    ctx: CanvasRenderingContext2D,
    elements: CanvasElement[],
    state: AnchorRenderState,
    viewport: Viewport
  ): void {
    const {
      hoveredElementId,
      hoveredAnchorId,
      connectionTargetId,
      connectionTargetAnchorId,
      phase,
    } = state;

    const hasHover = hoveredElementId !== null;
    const isConnecting = phase === 'CONNECTING';

    if (!hasHover && !isConnecting) return;

    ctx.save();
    ctx.translate(viewport.panX, viewport.panY);
    ctx.scale(viewport.zoom, viewport.zoom);

    // ── Render hovered element anchor indicators ──────────────────────────
    if (hoveredElementId) {
      const el = elements.find(e => e.id === hoveredElementId);
      if (el) {
        const isSource = isConnecting; // It's the source when we're in CONNECTING mode
        this.renderElementAnchors(ctx, el, hoveredAnchorId, isSource ? 'source' : 'hover');
      }
    }

    // ── Render connection target element anchors ─────────────────────────
    if (isConnecting && connectionTargetId && connectionTargetId !== hoveredElementId) {
      const targetEl = elements.find(e => e.id === connectionTargetId);
      if (targetEl) {
        this.renderElementAnchors(ctx, targetEl, connectionTargetAnchorId, 'target');
      }
    }

    // ── Render live preview endpoint crosshair ───────────────────────────
    if (isConnecting && state.connectionPreviewPoint) {
      const p = state.connectionPreviewPoint;
      const r = this.ANCHOR_RADIUS;
      const color = connectionTargetId ? '#22c55e' : '#6366f1';

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5 / viewport.zoom;
      ctx.setLineDash([3 / viewport.zoom, 3 / viewport.zoom]);
      ctx.globalAlpha = 0.85;

      // Crosshair lines
      ctx.beginPath();
      ctx.moveTo(p.x - r * 2, p.y);
      ctx.lineTo(p.x + r * 2, p.y);
      ctx.moveTo(p.x, p.y - r * 2);
      ctx.lineTo(p.x, p.y + r * 2);
      ctx.stroke();

      // Circle
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.stroke();

      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  private static renderElementAnchors(
    ctx: CanvasRenderingContext2D,
    el: CanvasElement,
    hotAnchorId: string | null,
    mode: 'hover' | 'source' | 'target'
  ): void {
    const anchors = AnchorEngine.getEnabledAnchors(el.bounds);

    // Element hover ring
    if (mode === 'hover' || mode === 'source') {
      ctx.save();
      ctx.strokeStyle = mode === 'source' ? '#6366f1' : '#8b5cf6';
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.35;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(
        el.bounds.x - 3,
        el.bounds.y - 3,
        el.bounds.width + 6,
        el.bounds.height + 6
      );
      ctx.restore();
    } else if (mode === 'target') {
      ctx.save();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.4;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(
        el.bounds.x - 3,
        el.bounds.y - 3,
        el.bounds.width + 6,
        el.bounds.height + 6
      );
      ctx.restore();
    }

    for (const anchor of anchors) {
      const isHot = anchor.id === hotAnchorId;
      const r = isHot ? this.ANCHOR_HOT_RADIUS : this.ANCHOR_RADIUS;

      let fillColor: string;
      let strokeColor: string;
      let alpha: number;

      if (mode === 'target') {
        fillColor = isHot ? '#22c55e' : 'rgba(34,197,94,0.15)';
        strokeColor = '#22c55e';
        alpha = isHot ? 0.95 : 0.6;
      } else if (mode === 'source') {
        fillColor = isHot ? '#6366f1' : 'rgba(99,102,241,0.1)';
        strokeColor = '#6366f1';
        alpha = isHot ? 0.95 : 0.5;
      } else {
        fillColor = isHot ? '#8b5cf6' : 'rgba(139,92,246,0.08)';
        strokeColor = '#8b5cf6';
        alpha = isHot ? 0.9 : 0.45;
      }

      ctx.save();
      ctx.globalAlpha = alpha;

      // Outer glow ring for hot anchors
      if (isHot) {
        ctx.beginPath();
        ctx.arc(anchor.x, anchor.y, r * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.globalAlpha = 0.12;
        ctx.fill();
        ctx.globalAlpha = alpha;
      }

      // Main anchor circle
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, r, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = isHot ? 2 : 1.5;
      ctx.stroke();

      ctx.restore();
    }
  }
}
