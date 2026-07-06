import React from 'react';
import { ShapeDefinition } from '../core/ShapeRegistry';

const fs = (ctx: CanvasRenderingContext2D, el: any) => {
  if (el.style.fillColor && el.style.fillColor !== 'transparent') ctx.fill();
  if (el.style.strokeWidth > 0 && el.style.strokeColor !== 'transparent') ctx.stroke();
};

const I = (paths: string) => (
  <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5"
    dangerouslySetInnerHTML={{ __html: paths }} />
);

export const AdvancedShapesPack: ShapeDefinition[] = [
  // ── Row 1: Geometric Basics ──────────────────────────────────────────────
  {
    type: 'adv_rounded_rect',
    name: 'Rounded Box',
    category: 'Advanced',
    icon: I('<rect x="2" y="5" width="16" height="10" rx="4"/>'),
    defaultSize: { width: 120, height: 70 },
    create: (el) => { el.style.borderRadius = 16; return el; },
    render: (ctx, el) => {
      const { x, y, width, height } = el.bounds;
      ctx.roundRect(x, y, width, height, 16);
      fs(ctx, el);
    }
  },
  {
    type: 'adv_pill',
    name: 'Pill',
    category: 'Advanced',
    icon: I('<rect x="2" y="6" width="16" height="8" rx="4"/>'),
    defaultSize: { width: 140, height: 60 },
    create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width, height } = el.bounds;
      const r = height / 2;
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + width, y, x + width, y + r, r);
      ctx.arcTo(x + width, y + height, x + r, y + height, r);
      ctx.arcTo(x, y + height, x, y + r, r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
      fs(ctx, el);
    }
  },
  {
    type: 'adv_pentagon',
    name: 'Pentagon',
    category: 'Advanced',
    icon: I('<polygon points="10,2 18,8 15,18 5,18 2,8"/>'),
    defaultSize: { width: 100, height: 100 },
    create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width, height } = el.bounds;
      const cx = x + width / 2;
      for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const px = cx + Math.cos(angle) * width / 2;
        const py = y + height / 2 + Math.sin(angle) * height / 2;
        i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.closePath();
      fs(ctx, el);
    }
  },
  {
    type: 'adv_chevron',
    name: 'Chevron',
    category: 'Advanced',
    icon: I('<polygon points="2,5 13,5 18,10 13,15 2,15 7,10"/>'),
    defaultSize: { width: 130, height: 70 },
    create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width, height } = el.bounds;
      const tip = width * 0.3;
      ctx.moveTo(x, y);
      ctx.lineTo(x + width - tip, y);
      ctx.lineTo(x + width, y + height / 2);
      ctx.lineTo(x + width - tip, y + height);
      ctx.lineTo(x, y + height);
      ctx.lineTo(x + tip, y + height / 2);
      ctx.closePath();
      fs(ctx, el);
    }
  },
  // ── Row 2: Arrow Shapes ──────────────────────────────────────────────────
  {
    type: 'adv_arrow_dbl_h',
    name: 'H. Dbl Arrow',
    category: 'Advanced',
    icon: I('<path d="M2,10 l4,-5 0,3 8,0 0,-3 4,5 -4,5 0,-3 -8,0 0,3z"/>'),
    defaultSize: { width: 130, height: 60 },
    create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width, height } = el.bounds;
      const hw = width * 0.28, sh = height * 0.36, sy = y + (height - sh) / 2;
      ctx.moveTo(x + hw, sy);
      ctx.lineTo(x + width - hw, sy);
      ctx.lineTo(x + width - hw, y);
      ctx.lineTo(x + width, y + height / 2);
      ctx.lineTo(x + width - hw, y + height);
      ctx.lineTo(x + width - hw, sy + sh);
      ctx.lineTo(x + hw, sy + sh);
      ctx.lineTo(x + hw, y + height);
      ctx.lineTo(x, y + height / 2);
      ctx.lineTo(x + hw, y);
      ctx.closePath();
      fs(ctx, el);
    }
  },
  {
    type: 'adv_arrow_dbl_v',
    name: 'V. Dbl Arrow',
    category: 'Advanced',
    icon: I('<path d="M10,2 l5,4 -3,0 0,8 3,0 -5,4 -5,-4 3,0 0,-8 -3,0z"/>'),
    defaultSize: { width: 60, height: 130 },
    create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width, height } = el.bounds;
      const hh = height * 0.28, sw = width * 0.36, sx = x + (width - sw) / 2;
      ctx.moveTo(sx, y + hh);
      ctx.lineTo(sx, y + height - hh);
      ctx.lineTo(x, y + height - hh);
      ctx.lineTo(x + width / 2, y + height);
      ctx.lineTo(x + width, y + height - hh);
      ctx.lineTo(sx + sw, y + height - hh);
      ctx.lineTo(sx + sw, y + hh);
      ctx.lineTo(x + width, y + hh);
      ctx.lineTo(x + width / 2, y);
      ctx.lineTo(x, y + hh);
      ctx.closePath();
      fs(ctx, el);
    }
  },
  {
    type: 'adv_person',
    name: 'Person',
    category: 'Advanced',
    icon: I('<circle cx="10" cy="5" r="3"/><path d="M4,20 Q4,12 10,12 Q16,12 16,20"/>'),
    defaultSize: { width: 70, height: 110 },
    create: (el) => { el.style.fillColor = 'transparent'; el.label = ''; return el; },
    render: (ctx, el) => {
      const { x, y, width, height } = el.bounds;
      const cx = x + width / 2, r = width * 0.28;
      ctx.arc(cx, y + r, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + width * 0.1, y + height);
      ctx.quadraticCurveTo(x + width * 0.1, y + r * 2 + height * 0.3, cx, y + r * 2 + height * 0.25);
      ctx.quadraticCurveTo(x + width * 0.9, y + r * 2 + height * 0.3, x + width * 0.9, y + height);
      ctx.closePath();
      fs(ctx, el);
    }
  },
  {
    type: 'adv_cross_arrow',
    name: '4-Way Arrow',
    category: 'Advanced',
    icon: I('<path d="M10,2l3,3h-2v3h3v-2l3,3-3,3v-2h-3v3h2l-3,3-3,-3h2v-3h-3v2l-3,-3 3,-3v2h3v-3h-2z"/>'),
    defaultSize: { width: 90, height: 90 },
    create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const t = w / 3.5, ax = w / 4.5;
      const cx = x + w / 2, cy = y + h / 2;
      ctx.moveTo(cx - t / 2, cy - t / 2);
      ctx.lineTo(cx - t / 2, y + ax); ctx.lineTo(x, cy); ctx.lineTo(cx - t / 2, y + h - ax);
      ctx.lineTo(cx - t / 2, cy + t / 2);
      ctx.lineTo(x + ax, cy + t / 2); ctx.lineTo(cx, y + h); ctx.lineTo(x + w - ax, cy + t / 2);
      ctx.lineTo(cx + t / 2, cy + t / 2);
      ctx.lineTo(cx + t / 2, y + h - ax); ctx.lineTo(x + w, cy); ctx.lineTo(cx + t / 2, y + ax);
      ctx.lineTo(cx + t / 2, cy - t / 2);
      ctx.lineTo(x + w - ax, cy - t / 2); ctx.lineTo(cx, y); ctx.lineTo(x + ax, cy - t / 2);
      ctx.closePath();
      fs(ctx, el);
    }
  },
  // ── Row 3: Symbol Shapes ─────────────────────────────────────────────────
  {
    type: 'adv_tbar',
    name: 'T-Bar',
    category: 'Advanced',
    icon: I('<rect x="2" y="4" width="16" height="5"/><rect x="7" y="9" width="6" height="8"/>'),
    defaultSize: { width: 110, height: 90 },
    create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width, height } = el.bounds;
      const stemW = width * 0.35, stemX = x + (width - stemW) / 2, capH = height * 0.35;
      ctx.rect(x, y, width, capH);
      fs(ctx, el);
      ctx.beginPath();
      ctx.rect(stemX, y + capH, stemW, height - capH);
      fs(ctx, el);
    }
  },
  {
    type: 'adv_barrel',
    name: 'Barrel',
    category: 'Advanced',
    icon: I('<ellipse cx="5" cy="10" rx="3" ry="6"/><rect x="5" y="4" width="10" height="12"/><ellipse cx="15" cy="10" rx="3" ry="6"/>'),
    defaultSize: { width: 130, height: 80 },
    create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width, height } = el.bounds;
      const rx = Math.max(height * 0.18, 10);
      ctx.ellipse(x + rx, y + height / 2, rx, height / 2, 0, 0, Math.PI * 2);
      fs(ctx, el);
      ctx.beginPath();
      ctx.moveTo(x + rx, y);
      ctx.lineTo(x + width - rx, y);
      ctx.ellipse(x + width - rx, y + height / 2, rx, height / 2, 0, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(x + rx, y + height);
      ctx.ellipse(x + rx, y + height / 2, rx, height / 2, 0, Math.PI / 2, -Math.PI / 2);
      ctx.closePath();
      fs(ctx, el);
    }
  },
  {
    type: 'adv_no_entry',
    name: 'No Entry',
    category: 'Advanced',
    icon: I('<circle cx="10" cy="10" r="8"/><line x1="5" y1="5" x2="15" y2="15"/><line x1="15" y1="5" x2="5" y2="15"/>'),
    defaultSize: { width: 90, height: 90 },
    create: (el) => { el.style.strokeColor = '#ef4444'; el.style.fillColor = 'rgba(239,68,68,0.1)'; return el; },
    render: (ctx, el) => {
      const { x, y, width, height } = el.bounds;
      const cx = x + width / 2, cy = y + height / 2, r = Math.min(width, height) / 2;
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      fs(ctx, el);
      ctx.beginPath();
      ctx.moveTo(cx - r * 0.6, cy - r * 0.6); ctx.lineTo(cx + r * 0.6, cy + r * 0.6);
      ctx.moveTo(cx + r * 0.6, cy - r * 0.6); ctx.lineTo(cx - r * 0.6, cy + r * 0.6);
      ctx.stroke();
    }
  },
  {
    type: 'adv_target',
    name: 'Target',
    category: 'Advanced',
    icon: I('<circle cx="10" cy="10" r="8"/><circle cx="10" cy="10" r="5"/><circle cx="10" cy="10" r="2"/>'),
    defaultSize: { width: 90, height: 90 },
    create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width, height } = el.bounds;
      const cx = x + width / 2, cy = y + height / 2, r = Math.min(width, height) / 2;
      [r, r * 0.66, r * 0.33].forEach(radius => {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        fs(ctx, el);
      });
    }
  },
  // ── Row 4: Special Shapes ────────────────────────────────────────────────
  {
    type: 'adv_half_circle',
    name: 'Half Circle',
    category: 'Advanced',
    icon: I('<path d="M2,10 a8,8 0 0,1 16,0z"/><line x1="2" y1="10" x2="18" y2="10"/>'),
    defaultSize: { width: 110, height: 70 },
    create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width, height } = el.bounds;
      ctx.moveTo(x, y + height);
      ctx.arcTo(x, y, x + width, y, height);
      ctx.arcTo(x + width, y, x + width, y + height, height);
      ctx.lineTo(x, y + height);
      ctx.closePath();
      fs(ctx, el);
    }
  },
  {
    type: 'adv_bowtie',
    name: 'Bowtie',
    category: 'Advanced',
    icon: I('<polygon points="2,4 18,16 18,4 2,16"/>'),
    defaultSize: { width: 120, height: 80 },
    create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width, height } = el.bounds;
      ctx.moveTo(x, y);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x + width, y);
      ctx.lineTo(x, y + height);
      ctx.closePath();
      fs(ctx, el);
    }
  },
  {
    type: 'adv_hourglass',
    name: 'Hourglass',
    category: 'Advanced',
    icon: I('<polygon points="2,2 18,2 10,10 18,18 2,18 10,10"/>'),
    defaultSize: { width: 80, height: 120 },
    create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width, height } = el.bounds;
      ctx.moveTo(x, y);
      ctx.lineTo(x + width, y);
      ctx.lineTo(x + width / 2, y + height / 2);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x, y + height);
      ctx.lineTo(x + width / 2, y + height / 2);
      ctx.closePath();
      fs(ctx, el);
    }
  },
  {
    type: 'adv_octagon',
    name: 'Octagon',
    category: 'Advanced',
    icon: I('<polygon points="6,2 14,2 18,6 18,14 14,18 6,18 2,14 2,6"/>'),
    defaultSize: { width: 100, height: 100 },
    create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width, height } = el.bounds;
      const cut = Math.min(width, height) * 0.22;
      ctx.moveTo(x + cut, y);
      ctx.lineTo(x + width - cut, y);
      ctx.lineTo(x + width, y + cut);
      ctx.lineTo(x + width, y + height - cut);
      ctx.lineTo(x + width - cut, y + height);
      ctx.lineTo(x + cut, y + height);
      ctx.lineTo(x, y + height - cut);
      ctx.lineTo(x, y + cut);
      ctx.closePath();
      fs(ctx, el);
    }
  },
  // ── Row 5: Table / Data Shapes ───────────────────────────────────────────
  {
    type: 'adv_table',
    name: 'Table',
    category: 'Advanced',
    icon: I('<rect x="2" y="2" width="16" height="16"/><line x1="2" y1="7" x2="18" y2="7"/><line x1="2" y1="12" x2="18" y2="12"/><line x1="8" y1="2" x2="8" y2="18"/>'),
    defaultSize: { width: 160, height: 120 },
    create: (el) => { el.label = ''; return el; },
    render: (ctx, el) => {
      const { x, y, width, height } = el.bounds;
      const rows = 3, cols = 3;
      const cw = width / cols, rh = height / rows;
      ctx.rect(x, y, width, height);
      fs(ctx, el);
      ctx.beginPath();
      for (let r = 1; r < rows; r++) { ctx.moveTo(x, y + r * rh); ctx.lineTo(x + width, y + r * rh); }
      for (let c = 1; c < cols; c++) { ctx.moveTo(x + c * cw, y); ctx.lineTo(x + c * cw, y + height); }
      ctx.stroke();
      // Header fill
      ctx.fillStyle = 'rgba(99,102,241,0.15)';
      ctx.fillRect(x + 1, y + 1, width - 2, rh - 2);
    }
  },
  {
    type: 'adv_list_box',
    name: 'List Box',
    category: 'Advanced',
    icon: I('<rect x="2" y="2" width="16" height="16"/><line x1="5" y1="7" x2="15" y2="7"/><line x1="5" y1="10" x2="15" y2="10"/><line x1="5" y1="13" x2="15" y2="13"/>'),
    defaultSize: { width: 140, height: 140 },
    create: (el) => { el.label = 'List Box'; return el; },
    render: (ctx, el) => {
      const { x, y, width, height } = el.bounds;
      const hdr = 30;
      ctx.rect(x, y, width, height);
      fs(ctx, el);
      ctx.fillStyle = 'rgba(99,102,241,0.2)';
      ctx.fillRect(x + 1, y + 1, width - 2, hdr - 2);
      ctx.beginPath();
      ctx.moveTo(x, y + hdr); ctx.lineTo(x + width, y + hdr);
      [0.4, 0.58, 0.76].forEach(p => {
        ctx.moveTo(x + 10, y + height * p);
        ctx.lineTo(x + width - 10, y + height * p);
      });
      ctx.strokeStyle = el.style.strokeColor;
      ctx.stroke();
      ctx.font = `bold 11px Inter`;
      ctx.fillStyle = el.style.fontColor || '#1a1d27';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(el.label || 'List Box', x + width / 2, y + hdr / 2);
    }
  },
  {
    type: 'adv_card',
    name: 'Card',
    category: 'Advanced',
    icon: I('<rect x="2" y="2" width="16" height="16" rx="2"/><rect x="5" y="5" width="10" height="5" rx="1"/><line x1="5" y1="13" x2="10" y2="13"/><line x1="5" y1="15" x2="12" y2="15"/>'),
    defaultSize: { width: 160, height: 120 },
    create: (el) => { el.style.borderRadius = 8; el.label = 'Card Title'; return el; },
    render: (ctx, el) => {
      const { x, y, width, height } = el.bounds;
      const r = 8, hdr = 36;
      ctx.roundRect(x, y, width, height, r);
      fs(ctx, el);
      ctx.fillStyle = 'rgba(99,102,241,0.12)';
      ctx.beginPath();
      ctx.roundRect(x + 1, y + 1, width - 2, hdr, [r, r, 0, 0]);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x, y + hdr); ctx.lineTo(x + width, y + hdr); ctx.stroke();
      // Mini content lines
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      [[0.58, 0.5], [0.7, 0.8]].forEach(([py, pw]) => {
        ctx.moveTo(x + 12, y + height * py);
        ctx.lineTo(x + width * pw, y + height * py);
      });
      ctx.stroke();
      ctx.globalAlpha = el.style.opacity;
      ctx.font = `bold 12px Inter`;
      ctx.fillStyle = el.style.fontColor || '#1a1d27';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(el.label || 'Card Title', x + width / 2, y + hdr / 2);
    }
  },
  {
    type: 'adv_columns',
    name: 'Columns',
    category: 'Advanced',
    icon: I('<rect x="2" y="2" width="4" height="16"/><rect x="8" y="2" width="4" height="16"/><rect x="14" y="2" width="4" height="16"/>'),
    defaultSize: { width: 150, height: 110 },
    create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width, height } = el.bounds;
      const cols = 3, gap = 6, cw = (width - gap * (cols + 1)) / cols;
      for (let i = 0; i < cols; i++) {
        const cx = x + gap + i * (cw + gap);
        ctx.beginPath();
        ctx.roundRect(cx, y, cw, height, 4);
        fs(ctx, el);
      }
    }
  },
  {
    type: 'adv_frame',
    name: 'Frame',
    category: 'Advanced',
    icon: I('<rect x="2" y="2" width="16" height="16"/><rect x="5" y="5" width="10" height="10"/>'),
    defaultSize: { width: 200, height: 160 },
    create: (el) => { el.label = 'Frame'; el.style.borderRadius = 4; return el; },
    render: (ctx, el) => {
      const { x, y, width, height } = el.bounds;
      const hdr = 28;
      ctx.roundRect(x, y, width, height, 4);
      fs(ctx, el);
      ctx.fillStyle = 'rgba(99,102,241,0.1)';
      ctx.beginPath();
      ctx.roundRect(x + 1, y + 1, width - 2, hdr, [4, 4, 0, 0]);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x, y + hdr); ctx.lineTo(x + width, y + hdr); ctx.stroke();
      ctx.font = `11px Inter`;
      ctx.fillStyle = el.style.fontColor || '#1a1d27';
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.7;
      ctx.fillText(el.label || 'Frame', x + 8, y + hdr / 2);
      ctx.globalAlpha = el.style.opacity;
    }
  },
  {
    type: 'adv_data_grid',
    name: 'Data Grid',
    category: 'Advanced',
    icon: I('<rect x="2" y="2" width="16" height="16"/><line x1="2" y1="6" x2="18" y2="6"/><line x1="2" y1="10" x2="18" y2="10"/><line x1="2" y1="14" x2="18" y2="14"/><line x1="7" y1="2" x2="7" y2="18"/><line x1="13" y1="2" x2="13" y2="18"/>'),
    defaultSize: { width: 180, height: 140 },
    create: (el) => el,
    render: (ctx, el) => {
      const { x, y, width, height } = el.bounds;
      const rows = 4, cols = 3;
      const rh = height / rows, cw = width / cols;
      ctx.rect(x, y, width, height);
      fs(ctx, el);
      // Header row
      ctx.fillStyle = 'rgba(99,102,241,0.18)';
      ctx.fillRect(x + 1, y + 1, width - 2, rh - 2);
      // Alternating rows
      for (let r = 2; r < rows; r += 2) {
        ctx.fillStyle = 'rgba(99,102,241,0.05)';
        ctx.fillRect(x + 1, y + r * rh, width - 2, rh);
      }
      ctx.beginPath();
      for (let r = 1; r < rows; r++) { ctx.moveTo(x, y + r * rh); ctx.lineTo(x + width, y + r * rh); }
      for (let c = 1; c < cols; c++) { ctx.moveTo(x + c * cw, y); ctx.lineTo(x + c * cw, y + height); }
      ctx.strokeStyle = el.style.strokeColor; ctx.stroke();
    }
  },
];
