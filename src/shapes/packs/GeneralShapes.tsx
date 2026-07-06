import React from 'react';
import { ShapeDefinition } from '../core/ShapeRegistry';

// Shared fill/stroke helper
const fillAndStroke = (ctx: CanvasRenderingContext2D, el: any) => {
  if (el.style.fillColor && el.style.fillColor !== 'transparent') ctx.fill();
  if (el.style.strokeWidth > 0 && el.style.strokeColor !== 'transparent') ctx.stroke();
};

// ─── SVG-like icons as inline React elements ──────────────────────────────────
const ParallelogramIcon = () => (
  <svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor">
    <polygon points="4,16 6,4 16,4 14,16" fillOpacity="0" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
const CylinderIcon = () => (
  <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
    <ellipse cx="10" cy="5" rx="7" ry="2.5" />
    <ellipse cx="10" cy="15" rx="7" ry="2.5" />
    <line x1="3" y1="5" x2="3" y2="15" />
    <line x1="17" y1="5" x2="17" y2="15" />
  </svg>
);
const CrossIcon = () => (
  <svg viewBox="0 0 20 20" className="w-5 h-5" fill="currentColor">
    <polygon points="7,2 13,2 13,7 18,7 18,13 13,13 13,18 7,18 7,13 2,13 2,7 7,7" fillOpacity="0" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
const CalloutIcon = () => (
  <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
    <rect x="2" y="3" width="16" height="11" rx="2" />
    <polygon points="6,14 4,18 10,14" fill="currentColor" />
  </svg>
);
const TrapezoidIcon = () => (
  <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
    <polygon points="3,16 6,4 14,4 17,16" />
  </svg>
);

export const GeneralShapesPack: ShapeDefinition[] = [
  {
    type: 'parallelogram',
    name: 'Parallelogram',
    category: 'General',
    icon: <ParallelogramIcon />,
    defaultSize: { width: 120, height: 70 },
    create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width, height } = el.bounds;
      const offset = width * 0.2;
      ctx.moveTo(x + offset, y);
      ctx.lineTo(x + width, y);
      ctx.lineTo(x + width - offset, y + height);
      ctx.lineTo(x, y + height);
      ctx.closePath();
      fillAndStroke(ctx, el);
    }
  },
  {
    type: 'trapezoid',
    name: 'Trapezoid',
    category: 'General',
    icon: <TrapezoidIcon />,
    defaultSize: { width: 120, height: 70 },
    create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width, height } = el.bounds;
      const inset = width * 0.15;
      ctx.moveTo(x + inset, y);
      ctx.lineTo(x + width - inset, y);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x, y + height);
      ctx.closePath();
      fillAndStroke(ctx, el);
    }
  },
  {
    type: 'cylinder',
    name: 'Cylinder',
    category: 'General',
    icon: <CylinderIcon />,
    defaultSize: { width: 80, height: 120 },
    create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width, height } = el.bounds;
      const rx = width / 2;
      const ry = Math.max(height * 0.12, 8);
      // Body
      ctx.moveTo(x, y + ry);
      ctx.lineTo(x, y + height - ry);
      ctx.ellipse(x + rx, y + height - ry, rx, ry, 0, Math.PI, 0, false);
      ctx.lineTo(x + width, y + ry);
      ctx.ellipse(x + rx, y + ry, rx, ry, 0, 0, Math.PI, false);
      ctx.closePath();
      fillAndStroke(ctx, el);
      // Top cap
      ctx.beginPath();
      ctx.ellipse(x + rx, y + ry, rx, ry, 0, 0, Math.PI * 2);
      fillAndStroke(ctx, el);
    }
  },
  {
    type: 'callout',
    name: 'Callout',
    category: 'General',
    icon: <CalloutIcon />,
    defaultSize: { width: 140, height: 90 },
    create: (el) => {
      el.style.borderRadius = 8;
      return el;
    },
    render: (ctx, el) => {
      const { x, y, width, height } = el.bounds;
      const bodyH = height * 0.75;
      const r = 8;
      // Rounded rect body
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + width - r, y);
      ctx.arcTo(x + width, y, x + width, y + r, r);
      ctx.lineTo(x + width, y + bodyH - r);
      ctx.arcTo(x + width, y + bodyH, x + width - r, y + bodyH, r);
      ctx.lineTo(x + width * 0.5 + 15, y + bodyH);
      ctx.lineTo(x + width * 0.25, y + height);
      ctx.lineTo(x + width * 0.25 - 10, y + bodyH);
      ctx.lineTo(x + r, y + bodyH);
      ctx.arcTo(x, y + bodyH, x, y + bodyH - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
      fillAndStroke(ctx, el);
    }
  },
  {
    type: 'cross',
    name: 'Cross',
    category: 'General',
    icon: <CrossIcon />,
    defaultSize: { width: 90, height: 90 },
    create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width, height } = el.bounds;
      const t = width / 3;
      ctx.moveTo(x + t, y);
      ctx.lineTo(x + t * 2, y);
      ctx.lineTo(x + t * 2, y + t);
      ctx.lineTo(x + width, y + t);
      ctx.lineTo(x + width, y + t * 2);
      ctx.lineTo(x + t * 2, y + t * 2);
      ctx.lineTo(x + t * 2, y + height);
      ctx.lineTo(x + t, y + height);
      ctx.lineTo(x + t, y + t * 2);
      ctx.lineTo(x, y + t * 2);
      ctx.lineTo(x, y + t);
      ctx.lineTo(x + t, y + t);
      ctx.closePath();
      fillAndStroke(ctx, el);
    }
  }
];
