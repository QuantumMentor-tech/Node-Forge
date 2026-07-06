import React from 'react';
import { ShapeDefinition } from '../core/ShapeRegistry';

const fs = (ctx: CanvasRenderingContext2D, el: any) => {
  if (el.style.fillColor && el.style.fillColor !== 'transparent') ctx.fill();
  if (el.style.strokeWidth > 0 && el.style.strokeColor !== 'transparent') ctx.stroke();
};
const I = (d: string) => <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.4" dangerouslySetInnerHTML={{ __html: d }} />;

export const ERShapesPack: ShapeDefinition[] = [
  // ── Entity Table Shapes ───────────────────────────────────────────────────
  {
    type: 'er_entity', name: 'Entity', category: 'Entity Relation',
    icon: I('<rect x="2" y="3" width="16" height="14"/><line x1="2" y1="8" x2="18" y2="8"/>'),
    defaultSize: { width: 150, height: 120 },
    create: (el) => { el.label = 'Entity'; el.style.borderRadius = 0; return el; },
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const hdr = 30;
      ctx.rect(x, y, w, h); fs(ctx, el);
      ctx.beginPath(); ctx.moveTo(x, y + hdr); ctx.lineTo(x + w, y + hdr); ctx.stroke();
      ctx.font = `bold 13px Inter`; ctx.fillStyle = el.style.fontColor || '#1a1d27';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(el.label || 'Entity', x + w / 2, y + hdr / 2);
      ctx.font = '11px Inter'; ctx.globalAlpha = 0.5;
      ['+ id: int', '+ name: string', '+ created: date'].forEach((row, i) => {
        ctx.fillText(row, x + w / 2, y + hdr + 16 + i * 18);
      });
      ctx.globalAlpha = el.style.opacity;
    }
  },
  {
    type: 'er_entity_cols', name: 'Entity (2-Col)', category: 'Entity Relation',
    icon: I('<rect x="2" y="3" width="16" height="14"/><line x1="2" y1="8" x2="18" y2="8"/><line x1="10" y1="8" x2="10" y2="17"/>'),
    defaultSize: { width: 180, height: 130 },
    create: (el) => { el.label = 'Item'; return el; },
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const hdr = 30, mid = w / 2;
      ctx.rect(x, y, w, h); fs(ctx, el);
      ctx.beginPath();
      ctx.moveTo(x, y + hdr); ctx.lineTo(x + w, y + hdr);
      ctx.moveTo(x + mid, y + hdr); ctx.lineTo(x + mid, y + h);
      ctx.stroke();
      ctx.font = `bold 12px Inter`; ctx.fillStyle = el.style.fontColor || '#1a1d27';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(el.label || 'Item', x + w / 2, y + hdr / 2);
      ctx.font = '10px Inter'; ctx.globalAlpha = 0.5;
      [['PK', 'id'], ['', 'name'], ['', 'value']].forEach(([pk, name], i) => {
        ctx.textAlign = 'left'; ctx.fillText(pk, x + 6, y + hdr + 14 + i * 18);
        ctx.fillText(name, x + mid + 6, y + hdr + 14 + i * 18);
      });
      ctx.globalAlpha = el.style.opacity;
    }
  },
  {
    type: 'er_weak_entity', name: 'Weak Entity', category: 'Entity Relation',
    icon: I('<rect x="2" y="3" width="16" height="14"/><rect x="4" y="5" width="12" height="10"/><line x1="2" y1="8" x2="18" y2="8"/>'),
    defaultSize: { width: 150, height: 110 },
    create: (el) => { el.label = 'Weak Entity'; return el; },
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const hdr = 30, ins = 5;
      ctx.rect(x, y, w, h); fs(ctx, el);
      ctx.beginPath(); ctx.rect(x + ins, y + ins, w - ins * 2, h - ins * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y + hdr); ctx.lineTo(x + w, y + hdr); ctx.stroke();
      ctx.font = `bold 12px Inter`; ctx.fillStyle = el.style.fontColor || '#1a1d27';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(el.label || 'Weak Entity', x + w / 2, y + hdr / 2);
    }
  },
  {
    type: 'er_table_list', name: 'Table List', category: 'Entity Relation',
    icon: I('<rect x="2" y="2" width="16" height="16"/><line x1="2" y1="7" x2="18" y2="7"/><line x1="2" y1="11" x2="18" y2="11"/><line x1="2" y1="15" x2="18" y2="15"/>'),
    defaultSize: { width: 160, height: 150 },
    create: (el) => { el.label = 'Table'; return el; },
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const rows = 4, rh = h / rows;
      ctx.rect(x, y, w, h); fs(ctx, el);
      ctx.fillStyle = 'rgba(99,102,241,0.15)'; ctx.fillRect(x + 1, y + 1, w - 2, rh - 2);
      ctx.beginPath();
      for (let r = 1; r < rows; r++) { ctx.moveTo(x, y + r * rh); ctx.lineTo(x + w, y + r * rh); }
      ctx.stroke();
      ctx.font = `bold 11px Inter`; ctx.fillStyle = el.style.fontColor || '#1a1d27';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(el.label || 'Table', x + w / 2, y + rh / 2);
      ctx.font = '10px Inter'; ctx.globalAlpha = 0.45;
      ['row 1', 'row 2', 'row 3'].forEach((r, i) => ctx.fillText(r, x + w / 2, y + rh * (i + 1) + rh / 2));
      ctx.globalAlpha = el.style.opacity;
    }
  },
  // ── Attribute Shapes ─────────────────────────────────────────────────────
  {
    type: 'er_attribute', name: 'Attribute', category: 'Entity Relation',
    icon: I('<ellipse cx="10" cy="10" rx="8" ry="5"/>'),
    defaultSize: { width: 130, height: 60 },
    create: (el) => { el.label = 'attribute'; return el; },
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); fs(ctx, el);
      ctx.font = `12px Inter`; ctx.fillStyle = el.style.fontColor || '#1a1d27';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(el.label || 'attribute', x + w / 2, y + h / 2);
    }
  },
  {
    type: 'er_multivalued', name: 'Multi-value', category: 'Entity Relation',
    icon: I('<ellipse cx="10" cy="10" rx="8" ry="5"/><ellipse cx="10" cy="10" rx="5.5" ry="2.5"/>'),
    defaultSize: { width: 130, height: 60 },
    create: (el) => { el.label = 'attribute'; return el; },
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const ins = 6;
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); fs(ctx, el);
      ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w / 2 - ins, h / 2 - ins / 2, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.font = `12px Inter`; ctx.fillStyle = el.style.fontColor || '#1a1d27';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(el.label || 'attribute', x + w / 2, y + h / 2);
    }
  },
  {
    type: 'er_derived', name: 'Derived Attr', category: 'Entity Relation',
    icon: I('<ellipse cx="10" cy="10" rx="8" ry="5" stroke-dasharray="3 2"/>'),
    defaultSize: { width: 130, height: 60 },
    create: (el) => { el.label = 'derived'; return el; },
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      ctx.setLineDash([5, 4]);
      ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); fs(ctx, el);
      ctx.setLineDash([]);
      ctx.font = `12px Inter`; ctx.fillStyle = el.style.fontColor || '#1a1d27';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(el.label || 'derived', x + w / 2, y + h / 2);
    }
  },
  // ── Relationship Diamonds ────────────────────────────────────────────────
  {
    type: 'er_relationship', name: 'Relationship', category: 'Entity Relation',
    icon: I('<polygon points="10,2 18,10 10,18 2,10"/>'),
    defaultSize: { width: 130, height: 80 },
    create: (el) => { el.label = 'has'; return el; },
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w, y + h / 2); ctx.lineTo(x + w / 2, y + h); ctx.lineTo(x, y + h / 2); ctx.closePath(); fs(ctx, el);
      ctx.font = `12px Inter`; ctx.fillStyle = el.style.fontColor || '#1a1d27';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(el.label || 'has', x + w / 2, y + h / 2);
    }
  },
  {
    type: 'er_weak_relationship', name: 'Weak Relation', category: 'Entity Relation',
    icon: I('<polygon points="10,2 18,10 10,18 2,10"/><polygon points="10,5 15,10 10,15 5,10"/>'),
    defaultSize: { width: 130, height: 80 },
    create: (el) => { el.label = 'has'; return el; },
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const ins = 7;
      ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w, y + h / 2); ctx.lineTo(x + w / 2, y + h); ctx.lineTo(x, y + h / 2); ctx.closePath(); fs(ctx, el);
      ctx.beginPath(); ctx.moveTo(x + w / 2, y + ins); ctx.lineTo(x + w - ins, y + h / 2); ctx.lineTo(x + w / 2, y + h - ins); ctx.lineTo(x + ins, y + h / 2); ctx.closePath(); ctx.stroke();
      ctx.font = `12px Inter`; ctx.fillStyle = el.style.fontColor || '#1a1d27';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(el.label || 'has', x + w / 2, y + h / 2);
    }
  },
  // ── ERD Relationship Line Notations (Crow's Foot) ────────────────────────
  {
    type: 'er_line_one', name: 'One (|)', category: 'Entity Relation',
    icon: I('<line x1="2" y1="10" x2="18" y2="10"/><line x1="13" y1="5" x2="13" y2="15"/>'),
    defaultSize: { width: 120, height: 40 },
    create: (el) => { el.style.fillColor = 'transparent'; return el; },
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const cy = y + h / 2, tick = h * 0.55;
      ctx.moveTo(x, cy); ctx.lineTo(x + w, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + w * 0.75, cy - tick); ctx.lineTo(x + w * 0.75, cy + tick); ctx.stroke();
    }
  },
  {
    type: 'er_line_many', name: 'Many (>)', category: 'Entity Relation',
    icon: I('<line x1="2" y1="10" x2="18" y2="10"/><line x1="18" y1="10" x2="10" y2="4"/><line x1="18" y1="10" x2="10" y2="16"/>'),
    defaultSize: { width: 120, height: 40 },
    create: (el) => { el.style.fillColor = 'transparent'; return el; },
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const cy = y + h / 2, spread = h * 0.55, tip = x + w;
      ctx.moveTo(x, cy); ctx.lineTo(tip, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tip, cy); ctx.lineTo(tip - w * 0.28, cy - spread); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tip, cy); ctx.lineTo(tip - w * 0.28, cy + spread); ctx.stroke();
    }
  },
  {
    type: 'er_line_one_only', name: 'One Only (||)', category: 'Entity Relation',
    icon: I('<line x1="2" y1="10" x2="18" y2="10"/><line x1="14" y1="5" x2="14" y2="15"/><line x1="11" y1="5" x2="11" y2="15"/>'),
    defaultSize: { width: 120, height: 40 },
    create: (el) => { el.style.fillColor = 'transparent'; return el; },
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const cy = y + h / 2, tick = h * 0.55;
      ctx.moveTo(x, cy); ctx.lineTo(x + w, cy); ctx.stroke();
      [0.75, 0.62].forEach(p => { ctx.beginPath(); ctx.moveTo(x + w * p, cy - tick); ctx.lineTo(x + w * p, cy + tick); ctx.stroke(); });
    }
  },
  {
    type: 'er_line_zero_one', name: 'Zero or One (O|)', category: 'Entity Relation',
    icon: I('<line x1="2" y1="10" x2="18" y2="10"/><circle cx="9" cy="10" r="3"/><line x1="14" y1="5" x2="14" y2="15"/>'),
    defaultSize: { width: 120, height: 40 },
    create: (el) => { el.style.fillColor = 'transparent'; return el; },
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const cy = y + h / 2, r = h * 0.28, tick = h * 0.55;
      ctx.moveTo(x, cy); ctx.lineTo(x + w, cy); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + w * 0.55, cy, r, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + w * 0.78, cy - tick); ctx.lineTo(x + w * 0.78, cy + tick); ctx.stroke();
    }
  },
  {
    type: 'er_line_one_many', name: 'One or Many (|>)', category: 'Entity Relation',
    icon: I('<line x1="2" y1="10" x2="18" y2="10"/><line x1="10" y1="5" x2="10" y2="15"/><line x1="18" y1="10" x2="12" y2="4"/><line x1="18" y1="10" x2="12" y2="16"/>'),
    defaultSize: { width: 120, height: 40 },
    create: (el) => { el.style.fillColor = 'transparent'; return el; },
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const cy = y + h / 2, spread = h * 0.55, tip = x + w;
      ctx.moveTo(x, cy); ctx.lineTo(tip, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x + w * 0.35, cy - spread); ctx.lineTo(x + w * 0.35, cy + spread); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tip, cy); ctx.lineTo(tip - w * 0.3, cy - spread); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tip, cy); ctx.lineTo(tip - w * 0.3, cy + spread); ctx.stroke();
    }
  },
  {
    type: 'er_line_zero_many', name: 'Zero or Many (O>)', category: 'Entity Relation',
    icon: I('<line x1="2" y1="10" x2="18" y2="10"/><circle cx="8" cy="10" r="3"/><line x1="18" y1="10" x2="12" y2="4"/><line x1="18" y1="10" x2="12" y2="16"/>'),
    defaultSize: { width: 120, height: 40 },
    create: (el) => { el.style.fillColor = 'transparent'; return el; },
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const cy = y + h / 2, r = h * 0.28, spread = h * 0.55, tip = x + w;
      ctx.moveTo(x, cy); ctx.lineTo(tip, cy); ctx.stroke();
      ctx.beginPath(); ctx.arc(x + w * 0.45, cy, r, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tip, cy); ctx.lineTo(tip - w * 0.3, cy - spread); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tip, cy); ctx.lineTo(tip - w * 0.3, cy + spread); ctx.stroke();
    }
  },
  {
    type: 'er_line_plain', name: 'Relation Line', category: 'Entity Relation',
    icon: I('<line x1="2" y1="10" x2="18" y2="10"/>'),
    defaultSize: { width: 120, height: 20 },
    create: (el) => { el.style.fillColor = 'transparent'; return el; },
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2); ctx.stroke();
    }
  },
  {
    type: 'er_line_dashed', name: 'Dashed Line', category: 'Entity Relation',
    icon: I('<line x1="2" y1="10" x2="18" y2="10" stroke-dasharray="3 2"/>'),
    defaultSize: { width: 120, height: 20 },
    create: (el) => { el.style.fillColor = 'transparent'; return el; },
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      ctx.setLineDash([8, 5]);
      ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2); ctx.stroke();
      ctx.setLineDash([]);
    }
  },
  {
    type: 'er_line_crow_r', name: "Crow's Foot R", category: 'Entity Relation',
    icon: I('<line x1="2" y1="10" x2="18" y2="10"/><line x1="18" y1="10" x2="12" y2="4"/><line x1="18" y1="10" x2="12" y2="16"/><line x1="12" y1="4" x2="12" y2="16"/>'),
    defaultSize: { width: 120, height: 40 },
    create: (el) => { el.style.fillColor = 'transparent'; return el; },
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const cy = y + h / 2, spread = h * 0.6, tip = x + w, base = tip - w * 0.35;
      ctx.moveTo(x, cy); ctx.lineTo(tip, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tip, cy); ctx.lineTo(base, cy - spread); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tip, cy); ctx.lineTo(base, cy + spread); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(base, cy - spread); ctx.lineTo(base, cy + spread); ctx.stroke();
    }
  },
  {
    type: 'er_line_crow_l', name: "Crow's Foot L", category: 'Entity Relation',
    icon: I('<line x1="2" y1="10" x2="18" y2="10"/><line x1="2" y1="10" x2="8" y2="4"/><line x1="2" y1="10" x2="8" y2="16"/><line x1="8" y1="4" x2="8" y2="16"/>'),
    defaultSize: { width: 120, height: 40 },
    create: (el) => { el.style.fillColor = 'transparent'; return el; },
    render: (ctx, el) => {
      const { x, y, width: w, height: h } = el.bounds;
      const cy = y + h / 2, spread = h * 0.6, tip = x, base = tip + w * 0.35;
      ctx.moveTo(tip, cy); ctx.lineTo(x + w, cy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tip, cy); ctx.lineTo(base, cy - spread); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tip, cy); ctx.lineTo(base, cy + spread); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(base, cy - spread); ctx.lineTo(base, cy + spread); ctx.stroke();
    }
  },
];
