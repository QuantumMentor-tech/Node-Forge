/**
 * SVGRenderer.ts
 *
 * Vector Serialization Engine.
 * Takes the editor state (elements and connectors) and generates a standalone,
 * highly accurate SVG string. This is the source of truth for all graphical exports.
 */

import type { CanvasElement, Connector, Point, Bounds, ElementStyle } from '@/types/canvas.types';
import { getClosestAnchors } from '@/utils/anchors';
import { calculateWaypoints } from '@/utils/routing';
import { ShapeRegistry } from '@/shapes';
import { SELF_LABEL_TYPES } from '@/canvas/renderer/ShapeRenderer';

export interface ExportBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SVGExportOptions {
  elements: CanvasElement[];
  connectors: Connector[];
  bounds: ExportBounds;
  transparentBackground: boolean;
  backgroundColor: string;
  padding: number;
}

export class SVGRenderer {
  /**
   * Generates a complete SVG document string.
   */
  static renderToString(options: SVGExportOptions): string {
    const { elements, connectors, bounds, transparentBackground, backgroundColor, padding } = options;

    const viewBoxX = bounds.x - padding;
    const viewBoxY = bounds.y - padding;
    const viewBoxWidth = bounds.width + padding * 2;
    const viewBoxHeight = bounds.height + padding * 2;

    const defs = this.renderDefs();
    
    // Sort elements by zIndex
    const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const sortedConnectors = [...connectors].sort((a, b) => a.zIndex - b.zIndex);

    // Build the SVG body
    let svgContent = '';

    if (!transparentBackground) {
      svgContent += `<rect x="${viewBoxX}" y="${viewBoxY}" width="${viewBoxWidth}" height="${viewBoxHeight}" fill="${backgroundColor}" />\n`;
    }

    // Connectors
    for (const connector of sortedConnectors) {
      svgContent += this.renderConnector(connector, elements);
    }

    // Elements
    for (const el of sortedElements) {
      if (!el.visible) continue;
      svgContent += this.renderElement(el);
    }

    return `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}"
        width="${viewBoxWidth}"
        height="${viewBoxHeight}"
      >
        <defs>
          ${defs}
        </defs>
        ${svgContent}
      </svg>
    `.trim();
  }

  /**
   * Defines standard SVG elements like arrowheads for reuse.
   */
  private static renderDefs(): string {
    return `
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
      </marker>
    `;
  }

  private static rasterizeShape(el: CanvasElement): string {
    const { width, height } = el.bounds;
    const canvas = document.createElement('canvas');
    const scale = 3; // 3x scale for crispness
    canvas.width = Math.max(1, width * scale);
    canvas.height = Math.max(1, height * scale);

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.scale(scale, scale);

    // Apply styles to context
    ctx.globalAlpha = el.style.opacity;
    ctx.fillStyle = el.style.fillColor;
    ctx.strokeStyle = el.style.strokeColor;
    ctx.lineWidth = el.style.strokeWidth;

    const relativeEl: CanvasElement = {
      ...el,
      bounds: {
        x: 0,
        y: 0,
        width,
        height,
      },
    };

    const shapeDef = ShapeRegistry.get(el.type);
    if (shapeDef) {
      shapeDef.render(ctx, relativeEl);
    } else {
      ctx.roundRect(0, 0, width, height, 4);
      if (el.style.fillColor !== 'transparent') ctx.fill();
      if (el.style.strokeWidth > 0) ctx.stroke();
    }

    return canvas.toDataURL('image/png');
  }

  /**
   * Convert an individual element to SVG.
   */
  private static renderElement(el: CanvasElement): string {
    const { x, y, width, height } = el.bounds;
    const { style } = el;
    
    const fill = style.fillColor === 'transparent' ? 'none' : style.fillColor;
    const stroke = style.strokeWidth > 0 ? (style.strokeColor === 'transparent' ? 'none' : style.strokeColor) : 'none';
    const opacity = style.opacity ?? 1;

    let transform = '';
    if (el.rotation) {
      const cx = x + width / 2;
      const cy = y + height / 2;
      transform = `transform="rotate(${el.rotation} ${cx} ${cy})"`;
    }

    const commonAttrs = `fill="${fill}" stroke="${stroke}" stroke-width="${style.strokeWidth}" opacity="${opacity}" ${transform}`;

    let shape = '';

    switch (el.type) {
      case 'rectangle':
      case 'image': // Render image background as rectangle for now
        shape = `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${style.borderRadius || 0}" ry="${style.borderRadius || 0}" ${commonAttrs} />`;
        break;
      
      case 'ellipse':
        shape = `<ellipse cx="${x + width / 2}" cy="${y + height / 2}" rx="${width / 2}" ry="${height / 2}" ${commonAttrs} />`;
        break;

      case 'diamond':
        const dPts = `${x + width / 2},${y} ${x + width},${y + height / 2} ${x + width / 2},${y + height} ${x},${y + height / 2}`;
        shape = `<polygon points="${dPts}" ${commonAttrs} stroke-linejoin="round" />`;
        break;

      case 'freehand':
        const pts = el.metadata?.points as Point[] | undefined;
        if (pts && pts.length > 0) {
          const origW = (el.metadata?.originalWidth as number) || width || 1;
          const origH = (el.metadata?.originalHeight as number) || height || 1;
          const scaleX = width / origW;
          const scaleY = height / origH;

          let pathData = `M ${x + pts[0].x * scaleX} ${y + pts[0].y * scaleY}`;
          for (let i = 1; i < pts.length; i++) {
            pathData += ` L ${x + pts[i].x * scaleX} ${y + pts[i].y * scaleY}`;
          }
          shape = `<path d="${pathData}" stroke-linecap="round" stroke-linejoin="round" fill="none" stroke="${stroke}" stroke-width="${style.strokeWidth}" opacity="${opacity}" ${transform} />`;
        }
        break;

      case 'line':
        shape = `<line x1="${x}" y1="${y + height / 2}" x2="${x + width}" y2="${y + height / 2}" ${commonAttrs} />`;
        break;

      default:
        // Use OffscreenCanvas / HTML5 canvas rendering to rasterize custom registry shapes to a PNG data URL,
        // and embed them inside the SVG as an <image> element for pixel-perfect vector-embedded fidelity.
        const dataUrl = this.rasterizeShape(el);
        shape = `<image x="${x}" y="${y}" width="${width}" height="${height}" href="${dataUrl}" opacity="${opacity}" ${transform} />`;
        break;
    }

    let text = '';
    if (el.label && el.type !== 'line' && el.type !== 'freehand' && !SELF_LABEL_TYPES.has(el.type)) {
      const fontSize = style.fontSize || 14;
      const fontFamily = style.fontFamily || 'Inter, sans-serif';
      const fontColor = style.fontColor || '#1a1d27';
      const align = style.textAlign || 'center';
      
      let textAnchor = 'middle';
      let textX = x + width / 2;
      
      if (align === 'left') {
        textAnchor = 'start';
        textX = x + 8; // padding
      } else if (align === 'right') {
        textAnchor = 'end';
        textX = x + width - 8;
      }

      const textY = y + height / 2;
      
      // We use dominant-baseline for vertical centering
      text = `<text x="${textX}" y="${textY}" font-family="${fontFamily}" font-size="${fontSize}px" fill="${fontColor}" text-anchor="${textAnchor}" dominant-baseline="central" ${transform}>${this.escapeHtml(el.label)}</text>`;
    }

    return `<g id="${el.id}">\n  ${shape}\n  ${text}\n</g>\n`;
  }

  /**
   * Render a connector path.
   */
  private static renderConnector(connector: Connector, elements: CanvasElement[]): string {
    const sourceEl = elements.find((e) => e.id === connector.sourceId);
    const targetEl = elements.find((e) => e.id === connector.targetId);

    if (!sourceEl) return '';

    const targetBounds = targetEl ? targetEl.bounds : connector.targetPoint;
    const { sourceAnchor, targetAnchor } = getClosestAnchors(sourceEl.bounds, targetBounds);
    const waypoints = calculateWaypoints(sourceAnchor, targetAnchor, connector.type);

    if (waypoints.length < 2) return '';

    const { strokeColor, strokeWidth, strokeDasharray, startArrow, endArrow } = connector.style;

    let d = '';
    if (connector.type === 'curved' && waypoints.length === 4) {
      d = `M ${waypoints[0].x} ${waypoints[0].y} C ${waypoints[1].x} ${waypoints[1].y}, ${waypoints[2].x} ${waypoints[2].y}, ${waypoints[3].x} ${waypoints[3].y}`;
    } else {
      d = `M ${waypoints[0].x} ${waypoints[0].y}`;
      for (let i = 1; i < waypoints.length; i++) {
        d += ` L ${waypoints[i].x} ${waypoints[i].y}`;
      }
    }

    const stroke = strokeColor === 'transparent' ? 'none' : strokeColor;
    const dash = strokeDasharray ? `stroke-dasharray="${strokeDasharray}"` : '';
    
    // We recreate arrowheads as polygons to ensure they export identically to the canvas
    let arrows = '';
    
    if (endArrow) {
      arrows += this.renderManualArrowhead(waypoints[waypoints.length - 2], waypoints[waypoints.length - 1], stroke);
    }
    if (startArrow) {
      arrows += this.renderManualArrowhead(waypoints[1], waypoints[0], stroke);
    }

    return `
      <g id="${connector.id}">
        <path d="${d}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" ${dash} stroke-linejoin="round" />
        ${arrows}
      </g>
    `;
  }

  /**
   * Renders a manual polygon arrowhead (to bypass browser bugs with SVG marker coloring)
   */
  private static renderManualArrowhead(from: Point, to: Point, color: string): string {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const headLen = 12;
    
    const p1 = { x: to.x, y: to.y };
    const p2 = {
      x: to.x - headLen * Math.cos(angle - Math.PI / 6),
      y: to.y - headLen * Math.sin(angle - Math.PI / 6),
    };
    const p3 = {
      x: to.x - headLen * Math.cos(angle + Math.PI / 6),
      y: to.y - headLen * Math.sin(angle + Math.PI / 6),
    };

    return `<polygon points="${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}" fill="${color}" />`;
  }

  private static escapeHtml(unsafe: string): string {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  }
}
