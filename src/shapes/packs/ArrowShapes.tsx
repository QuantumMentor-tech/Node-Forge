import React from 'react';
import { ShapeDefinition } from '../core/ShapeRegistry';

const fs = (ctx: CanvasRenderingContext2D, el: any) => {
  if (el.style.fillColor && el.style.fillColor !== 'transparent') ctx.fill();
  if (el.style.strokeWidth > 0 && el.style.strokeColor !== 'transparent') ctx.stroke();
};

const I = (d: string) => (
  <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.4"
    dangerouslySetInnerHTML={{ __html: d }} />
);

// Helper: draw a right block arrow
const rightArrow = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, headRatio = 0.38, stemRatio = 0.4) => {
  const hw = w * headRatio, sh = h * stemRatio, sy = y + (h - sh) / 2;
  ctx.moveTo(x, sy); ctx.lineTo(x + w - hw, sy); ctx.lineTo(x + w - hw, y);
  ctx.lineTo(x + w, y + h / 2); ctx.lineTo(x + w - hw, y + h);
  ctx.lineTo(x + w - hw, sy + sh); ctx.lineTo(x, sy + sh); ctx.closePath();
};

export const ArrowShapesPack: ShapeDefinition[] = [
  // ── Row 1: Block Directional Arrows ──────────────────────────────────────
  {
    type: 'arrow_right', name: 'Right Arrow', category: 'Arrows',
    icon: I('<polygon points="2,7 12,7 12,4 18,10 12,16 12,13 2,13"/>'),
    defaultSize: { width: 120, height: 60 }, create: (el) => el,
    render: (ctx, el) => { const { x, y, width: w, height: h } = el.bounds; rightArrow(ctx, x, y, w, h); fs(ctx, el); }
  },
  {
    type: 'arrow_left', name: 'Left Arrow', category: 'Arrows',
    icon: I('<polygon points="18,7 8,7 8,4 2,10 8,16 8,13 18,13"/>'),
    defaultSize: { width: 120, height: 60 }, create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const hw = w * 0.38, sh = h * 0.4, sy = y + (h - sh) / 2;
      ctx.moveTo(x + w, sy); ctx.lineTo(x + hw, sy); ctx.lineTo(x + hw, y);
      ctx.lineTo(x, y + h / 2); ctx.lineTo(x + hw, y + h);
      ctx.lineTo(x + hw, sy + sh); ctx.lineTo(x + w, sy + sh); ctx.closePath();
      fs(ctx, el);
    }
  },
  {
    type: 'arrow_up', name: 'Up Arrow', category: 'Arrows',
    icon: I('<polygon points="7,18 7,8 4,8 10,2 16,8 13,8 13,18"/>'),
    defaultSize: { width: 60, height: 120 }, create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const hh = h * 0.38, sw = w * 0.4, sx = x + (w - sw) / 2;
      ctx.moveTo(sx, y + h); ctx.lineTo(sx, y + hh); ctx.lineTo(x, y + hh);
      ctx.lineTo(x + w / 2, y); ctx.lineTo(x + w, y + hh); ctx.lineTo(sx + sw, y + hh);
      ctx.lineTo(sx + sw, y + h); ctx.closePath(); fs(ctx, el);
    }
  },
  {
    type: 'arrow_down', name: 'Down Arrow', category: 'Arrows',
    icon: I('<polygon points="7,2 7,12 4,12 10,18 16,12 13,12 13,2"/>'),
    defaultSize: { width: 60, height: 120 }, create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const hh = h * 0.38, sw = w * 0.4, sx = x + (w - sw) / 2;
      ctx.moveTo(sx, y); ctx.lineTo(sx, y + h - hh); ctx.lineTo(x, y + h - hh);
      ctx.lineTo(x + w / 2, y + h); ctx.lineTo(x + w, y + h - hh); ctx.lineTo(sx + sw, y + h - hh);
      ctx.lineTo(sx + sw, y); ctx.closePath(); fs(ctx, el);
    }
  },
  {
    type: 'arrow_chevron', name: 'Chevron Arrow', category: 'Arrows',
    icon: I('<polygon points="2,4 13,4 19,10 13,16 2,16 8,10"/>'),
    defaultSize: { width: 120, height: 60 }, create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const t = w * 0.3;
      ctx.moveTo(x, y); ctx.lineTo(x + w - t, y); ctx.lineTo(x + w, y + h / 2);
      ctx.lineTo(x + w - t, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x + t, y + h / 2);
      ctx.closePath(); fs(ctx, el);
    }
  },
  // ── Row 2: Line / Notch Arrows ────────────────────────────────────────────
  {
    type: 'arrow_right_outline', name: 'Outline Arrow', category: 'Arrows',
    icon: I('<polygon points="2,7 12,7 12,4 18,10 12,16 12,13 2,13" fill="none"/>'),
    defaultSize: { width: 120, height: 60 },
    create: (el) => { el.style.fillColor = 'transparent'; return el; },
    render: (ctx, el) => { const { x, y, width: w, height: h } = el.bounds; rightArrow(ctx, x, y, w, h); fs(ctx, el); }
  },
  {
    type: 'arrow_notched_right', name: 'Notched Arrow', category: 'Arrows',
    icon: I('<polygon points="2,10 6,4 16,4 18,10 16,16 6,16"/>'),
    defaultSize: { width: 130, height: 60 }, create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const notch = w * 0.12, tip = w * 0.15;
      ctx.moveTo(x, y + h / 2); ctx.lineTo(x + notch, y);
      ctx.lineTo(x + w - tip, y); ctx.lineTo(x + w, y + h / 2);
      ctx.lineTo(x + w - tip, y + h); ctx.lineTo(x + notch, y + h);
      ctx.closePath(); fs(ctx, el);
    }
  },
  {
    type: 'arrow_double', name: 'Double Arrow', category: 'Arrows',
    icon: I('<polygon points="2,10 6,4 6,7 14,7 14,4 18,10 14,16 14,13 6,13 6,16"/>'),
    defaultSize: { width: 140, height: 60 }, create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const hw = w * 0.3, sh = h * 0.4, sy = y + (h - sh) / 2;
      ctx.moveTo(x + hw, sy); ctx.lineTo(x + w - hw, sy); ctx.lineTo(x + w - hw, y);
      ctx.lineTo(x + w, y + h / 2); ctx.lineTo(x + w - hw, y + h);
      ctx.lineTo(x + w - hw, sy + sh); ctx.lineTo(x + hw, sy + sh);
      ctx.lineTo(x + hw, y + h); ctx.lineTo(x, y + h / 2); ctx.lineTo(x + hw, y);
      ctx.closePath(); fs(ctx, el);
    }
  },
  {
    type: 'arrow_striped', name: 'Striped Arrow', category: 'Arrows',
    icon: I('<polygon points="2,7 4,7 4,13 2,13"/><polygon points="6,7 10,7 10,13 6,13"/><polygon points="10,4 18,10 10,16"/>'),
    defaultSize: { width: 130, height: 60 }, create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const hw = w * 0.35, sh = h * 0.4, sy = y + (h - sh) / 2;
      // Two stem bars
      [[0, 0.25], [0.3, 0.25]].forEach(([ox, bw]) => {
        ctx.beginPath();
        ctx.rect(x + w * ox, sy, w * bw, sh); fs(ctx, el);
      });
      // Arrowhead
      ctx.beginPath();
      ctx.moveTo(x + hw, y); ctx.lineTo(x + w, y + h / 2); ctx.lineTo(x + hw, y + h);
      ctx.closePath(); fs(ctx, el);
    }
  },
  {
    type: 'arrow_bent_up', name: 'Bent Up Arrow', category: 'Arrows',
    icon: I('<path d="M2,16 L2,8 L8,8 L8,4 L14,10 L8,16 L8,12 L5,12 L5,16z"/>'),
    defaultSize: { width: 110, height: 100 }, create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const sw = w * 0.3, hh = h * 0.4, hw = w * 0.35, stemX = x + sw;
      ctx.moveTo(x, y + h); ctx.lineTo(x, y + hh);
      ctx.lineTo(stemX, y + hh); ctx.lineTo(stemX, y);
      ctx.lineTo(stemX + hw, y + hh); ctx.lineTo(stemX + hw - (hw * 0.3), y + hh);
      ctx.lineTo(stemX + hw - (hw * 0.3), y + h);
      ctx.lineTo(x + sw, y + h);
      // Correct shape
      ctx.closePath(); fs(ctx, el);
    }
  },
  // ── Row 3: Turn / Corner Arrows ──────────────────────────────────────────
  {
    type: 'arrow_turn_right', name: 'Turn Right', category: 'Arrows',
    icon: I('<path d="M4,16 L4,8 L12,8 L12,4 L18,10 L12,16 L12,12 L8,12 L8,16z"/>'),
    defaultSize: { width: 110, height: 100 }, create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const sw = w * 0.3, hh = h * 0.45, hw = h * 0.38;
      const vx = x + w * 0.4;
      ctx.moveTo(x, y + h); ctx.lineTo(x, y + h - sw);
      ctx.lineTo(vx, y + h - sw); ctx.lineTo(vx, y);
      ctx.lineTo(x + w, y + hh); ctx.lineTo(vx, y + hw * 2);
      ctx.lineTo(vx + sw * 0.6, y + hw * 2); ctx.lineTo(vx + sw * 0.6, y + h);
      ctx.closePath(); fs(ctx, el);
    }
  },
  {
    type: 'arrow_turn_left', name: 'Turn Left', category: 'Arrows',
    icon: I('<path d="M16,16 L16,8 L8,8 L8,4 L2,10 L8,16 L8,12 L12,12 L12,16z"/>'),
    defaultSize: { width: 110, height: 100 }, create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const sw = w * 0.3, hh = h * 0.45, hw = h * 0.38;
      const vx = x + w * 0.6;
      ctx.moveTo(x + w, y + h); ctx.lineTo(x + w, y + h - sw);
      ctx.lineTo(vx, y + h - sw); ctx.lineTo(vx, y);
      ctx.lineTo(x, y + hh); ctx.lineTo(vx, y + hw * 2);
      ctx.lineTo(vx - sw * 0.6, y + hw * 2); ctx.lineTo(vx - sw * 0.6, y + h);
      ctx.closePath(); fs(ctx, el);
    }
  },
  {
    type: 'arrow_curved_right', name: 'Curved Arrow', category: 'Arrows',
    icon: I('<path d="M4,14 Q4,6 12,6 L12,3 L18,8 L12,13 L12,10 Q8,10 8,14z"/>'),
    defaultSize: { width: 110, height: 100 }, create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const hw = w * 0.35, sw = h * 0.28;
      ctx.moveTo(x, y + h * 0.85);
      ctx.bezierCurveTo(x, y + h * 0.2, x + w * 0.6, y + h * 0.15, x + w * 0.6, y + h * 0.35);
      ctx.lineTo(x + w * 0.6, y + h * 0.1);
      ctx.lineTo(x + w, y + h * 0.38);
      ctx.lineTo(x + w * 0.6, y + h * 0.65);
      ctx.lineTo(x + w * 0.6, y + h * 0.48);
      ctx.bezierCurveTo(x + w * 0.6, y + h * 0.48, x + sw, y + h * 0.48, x + sw, y + h * 0.85);
      ctx.closePath(); fs(ctx, el);
    }
  },
  {
    type: 'arrow_curved_left', name: 'Undo Arrow', category: 'Arrows',
    icon: I('<path d="M16,14 Q16,6 8,6 L8,3 L2,8 L8,13 L8,10 Q12,10 12,14z"/>'),
    defaultSize: { width: 110, height: 100 }, create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const sw = h * 0.28;
      ctx.moveTo(x + w, y + h * 0.85);
      ctx.bezierCurveTo(x + w, y + h * 0.2, x + w * 0.4, y + h * 0.15, x + w * 0.4, y + h * 0.35);
      ctx.lineTo(x + w * 0.4, y + h * 0.1);
      ctx.lineTo(x, y + h * 0.38);
      ctx.lineTo(x + w * 0.4, y + h * 0.65);
      ctx.lineTo(x + w * 0.4, y + h * 0.48);
      ctx.bezierCurveTo(x + w * 0.4, y + h * 0.48, x + w - sw, y + h * 0.48, x + w - sw, y + h * 0.85);
      ctx.closePath(); fs(ctx, el);
    }
  },
  // ── Row 4: Multi-Direction Arrows ─────────────────────────────────────────
  {
    type: 'arrow_4way', name: '4-Way Arrow', category: 'Arrows',
    icon: I('<path d="M10,2l3,3h-2v3h3v-2l3,3-3,3v-2h-3v3h2l-3,3-3,-3h2v-3h-3v2l-3,-3 3,-3v2h3v-3h-2z"/>'),
    defaultSize: { width: 90, height: 90 }, create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const t = w / 3.6, a = w / 4.2, cx = x + w / 2, cy = y + h / 2;
      ctx.moveTo(cx - t/2, cy - t/2);
      ctx.lineTo(cx - t/2, y + a); ctx.lineTo(x, cy); ctx.lineTo(cx - t/2, y + h - a);
      ctx.lineTo(cx - t/2, cy + t/2);
      ctx.lineTo(x + a, cy + t/2); ctx.lineTo(cx, y + h); ctx.lineTo(x + w - a, cy + t/2);
      ctx.lineTo(cx + t/2, cy + t/2);
      ctx.lineTo(cx + t/2, y + h - a); ctx.lineTo(x + w, cy); ctx.lineTo(cx + t/2, y + a);
      ctx.lineTo(cx + t/2, cy - t/2);
      ctx.lineTo(x + w - a, cy - t/2); ctx.lineTo(cx, y); ctx.lineTo(x + a, cy - t/2);
      ctx.closePath(); fs(ctx, el);
    }
  },
  {
    type: 'arrow_diagonal', name: 'Diagonal Arrow', category: 'Arrows',
    icon: I('<polygon points="10,2 18,2 18,10 15,7 7,15 5,13 13,5"/><line x1="2" y1="18" x2="5" y2="13"/>'),
    defaultSize: { width: 100, height: 100 }, create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const t = w * 0.22, a = w * 0.3;
      // diagonal stem
      const cos45 = Math.SQRT2 / 2, sin45 = cos45;
      const perpX = -sin45 * t / 2, perpY = cos45 * t / 2;
      ctx.moveTo(x + perpX, y + h - perpY);
      ctx.lineTo(x + w - a * cos45 + perpX, y + a * sin45 - perpY);
      ctx.lineTo(x + w - a * cos45, y + a * sin45 - t);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w - t, y + a);
      // Arrowhead base
      ctx.lineTo(x + w - a * cos45 - perpX, y + a * sin45 + perpY);
      ctx.lineTo(x - perpX, y + h + perpY);
      ctx.closePath(); fs(ctx, el);
    }
  },
  {
    type: 'arrow_paper_plane', name: 'Paper Plane', category: 'Arrows',
    icon: I('<polygon points="2,10 18,3 11,18 9,12"/><line x1="9" y1="12" x2="18" y2="3"/>'),
    defaultSize: { width: 90, height: 90 }, create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const cx = x + w / 2, cy = y + h / 2;
      ctx.moveTo(x, cy); ctx.lineTo(x + w, y); ctx.lineTo(cx, y + h);
      ctx.lineTo(cx - w * 0.1, cy + h * 0.05); ctx.closePath(); fs(ctx, el);
      ctx.beginPath();
      ctx.moveTo(x + w, y); ctx.lineTo(cx - w * 0.1, cy + h * 0.05); ctx.stroke();
    }
  },
  {
    type: 'arrow_double_v', name: 'Vert Dbl Arrow', category: 'Arrows',
    icon: I('<polygon points="10,2 6,7 8,7 8,13 6,13 10,18 14,13 12,13 12,7 14,7"/>'),
    defaultSize: { width: 60, height: 120 }, create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const hh = h * 0.28, sw = w * 0.36, sx = x + (w - sw) / 2;
      ctx.moveTo(sx, y + hh); ctx.lineTo(sx, y + h - hh);
      ctx.lineTo(x, y + h - hh); ctx.lineTo(x + w / 2, y + h); ctx.lineTo(x + w, y + h - hh);
      ctx.lineTo(sx + sw, y + h - hh); ctx.lineTo(sx + sw, y + hh);
      ctx.lineTo(x + w, y + hh); ctx.lineTo(x + w / 2, y); ctx.lineTo(x, y + hh);
      ctx.closePath(); fs(ctx, el);
    }
  },
  {
    type: 'arrow_u_turn', name: 'U-Turn Arrow', category: 'Arrows',
    icon: I('<path d="M4,16 L4,8 Q4,3 10,3 Q16,3 16,8 L16,12 L13,12 L17,17 L20,12 L17,12 L17,8 Q17,1 10,1 Q3,1 3,8 L3,16z" transform="scale(0.9)"/>'),
    defaultSize: { width: 100, height: 110 }, create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const sw = w * 0.25, r = w * 0.3;
      const lx = x + sw * 0.5, rx = x + w - sw * 0.5;
      ctx.moveTo(lx - sw / 2, y + h);
      ctx.lineTo(lx - sw / 2, y + r + sw);
      ctx.arc(x + w / 2, y + r + sw, w / 2 - sw * 0.5, Math.PI, 0, false);
      ctx.lineTo(rx + sw / 2, y + h * 0.55);
      ctx.lineTo(rx + sw / 2 + sw, y + h * 0.55);
      ctx.lineTo(rx, y + h);
      ctx.lineTo(rx - sw, y + h * 0.55);
      ctx.lineTo(rx - sw / 2, y + h * 0.55);
      ctx.lineTo(rx - sw / 2, y + r + sw);
      ctx.arc(x + w / 2, y + r + sw, w / 2 - sw * 1.5, 0, Math.PI, true);
      ctx.lineTo(lx + sw / 2, y + h);
      ctx.closePath(); fs(ctx, el);
    }
  },
];
