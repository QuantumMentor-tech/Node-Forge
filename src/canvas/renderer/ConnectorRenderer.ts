import { CanvasElement, Connector, Viewport } from '@/types/canvas.types';
import { AnchorEngine } from '@/utils/anchors';
import { calculateWaypoints } from '@/utils/routing';

export class ConnectorRenderer {
  public static render(
    ctx: CanvasRenderingContext2D,
    elements: CanvasElement[],
    connectors: Connector[],
    viewport: Viewport,
    selectedIds: Set<string>
  ): void {
    ctx.save();
    ctx.translate(viewport.panX, viewport.panY);
    ctx.scale(viewport.zoom, viewport.zoom);

    for (const connector of connectors) {
      const sourceEl = elements.find((e) => e.id === connector.sourceId);
      const targetEl = elements.find((e) => e.id === connector.targetId);

      // If source doesn't exist, skip. Orphan cleanup handles this.
      if (!sourceEl) continue;

      let sourceAnchor: { x: number; y: number };
      let targetAnchor: { x: number; y: number };

      if (targetEl) {
        // Both endpoints connected to elements — use pinned anchors if set, else closest pair
        if (connector.sourceAnchorId && connector.targetAnchorId) {
          sourceAnchor = AnchorEngine.getAnchorWorldPos(connector.sourceAnchorId, sourceEl.bounds);
          targetAnchor = AnchorEngine.getAnchorWorldPos(connector.targetAnchorId, targetEl.bounds);
        } else {
          // Fall back: compute dynamically from closest pair
          const pair = AnchorEngine.findClosestPairAnchors(sourceEl.bounds, targetEl.bounds);
          sourceAnchor = connector.sourceAnchorId
            ? AnchorEngine.getAnchorWorldPos(connector.sourceAnchorId, sourceEl.bounds)
            : pair.sourceAnchor;
          targetAnchor = connector.targetAnchorId
            ? AnchorEngine.getAnchorWorldPos(connector.targetAnchorId, targetEl.bounds)
            : pair.targetAnchor;
        }
      } else {
        // No target element — use closest anchor on source toward floating point
        sourceAnchor = AnchorEngine.findBestSourceAnchor(sourceEl.bounds, connector.targetPoint);
        targetAnchor = connector.targetPoint;
      }

      const waypoints = calculateWaypoints(sourceAnchor, targetAnchor, connector.type);

      if (waypoints.length < 2) continue;

      const isSelected = selectedIds.has(connector.id);

      ctx.save();
      ctx.beginPath();
      
      const { strokeColor, strokeWidth, strokeDasharray, startArrow, endArrow } = connector.style;
      
      ctx.strokeStyle = isSelected ? '#6366f1' : strokeColor;
      ctx.lineWidth = isSelected ? strokeWidth + 1 : strokeWidth;
      
      if (strokeDasharray) {
        ctx.setLineDash(strokeDasharray.split(',').map(Number));
      }

      ctx.moveTo(waypoints[0].x, waypoints[0].y);
      if (connector.type === 'curved' && waypoints.length === 4) {
        ctx.bezierCurveTo(
          waypoints[1].x, waypoints[1].y,
          waypoints[2].x, waypoints[2].y,
          waypoints[3].x, waypoints[3].y
        );
      } else {
        for (let i = 1; i < waypoints.length; i++) {
          ctx.lineTo(waypoints[i].x, waypoints[i].y);
        }
      }
      ctx.stroke();

      // Reset dash for arrowheads
      ctx.setLineDash([]);

      // Render Arrowheads
      if (endArrow) {
        this.renderArrowhead(ctx, waypoints[waypoints.length - 2], waypoints[waypoints.length - 1], ctx.strokeStyle as string);
      }
      if (startArrow) {
        this.renderArrowhead(ctx, waypoints[1], waypoints[0], ctx.strokeStyle as string);
      }

      ctx.restore();
    }
    
    ctx.restore();
  }

  private static renderArrowhead(
    ctx: CanvasRenderingContext2D,
    from: { x: number; y: number },
    to: { x: number; y: number },
    color: string
  ) {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const headLen = 12;
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - headLen * Math.cos(angle - Math.PI / 6), to.y - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(to.x - headLen * Math.cos(angle + Math.PI / 6), to.y - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }
}
