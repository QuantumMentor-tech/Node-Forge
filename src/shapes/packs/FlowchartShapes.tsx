import React from 'react';
import { ShapeDefinition } from '../core/ShapeRegistry';

const fs = (ctx: CanvasRenderingContext2D, el: any) => {
  if (el.style.fillColor && el.style.fillColor !== 'transparent') ctx.fill();
  if (el.style.strokeWidth > 0 && el.style.strokeColor !== 'transparent') ctx.stroke();
};
const I = (d: string) => <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.4" dangerouslySetInnerHTML={{ __html: d }} />;

export const FlowchartShapesPack: ShapeDefinition[] = [
  {
    type: 'fc_process', name: 'Process', category: 'Flowchart',
    icon: I('<rect x="2" y="5" width="16" height="10"/>'),
    defaultSize: { width: 130, height: 80 }, create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.rect(x,y,w,h); fs(ctx,el); }
  },
  {
    type: 'fc_decision', name: 'Decision', category: 'Flowchart',
    icon: I('<polygon points="10,2 18,10 10,18 2,10"/>'),
    defaultSize: { width: 120, height: 80 }, create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.moveTo(x+w/2,y); ctx.lineTo(x+w,y+h/2); ctx.lineTo(x+w/2,y+h); ctx.lineTo(x,y+h/2); ctx.closePath(); fs(ctx,el); }
  },
  {
    type: 'fc_terminal', name: 'Terminal', category: 'Flowchart',
    icon: I('<rect x="2" y="5" width="16" height="10" rx="5"/>'),
    defaultSize: { width: 130, height: 60 }, create: (el) => { el.label='Start'; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const r=h/2; ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+r,r); ctx.arcTo(x+w,y+h,x+r,y+h,r); ctx.arcTo(x,y+h,x,y+r,r); ctx.arcTo(x,y,x+r,y,r); ctx.closePath(); fs(ctx,el); }
  },
  {
    type: 'fc_data', name: 'Data (I/O)', category: 'Flowchart',
    icon: I('<polygon points="5,5 18,5 15,15 2,15"/>'),
    defaultSize: { width: 130, height: 70 }, create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const s=w*0.18; ctx.moveTo(x+s,y); ctx.lineTo(x+w,y); ctx.lineTo(x+w-s,y+h); ctx.lineTo(x,y+h); ctx.closePath(); fs(ctx,el); }
  },
  {
    type: 'fc_predefined', name: 'Predefined', category: 'Flowchart',
    icon: I('<rect x="2" y="4" width="16" height="12"/><line x1="5" y1="4" x2="5" y2="16"/><line x1="15" y1="4" x2="15" y2="16"/>'),
    defaultSize: { width: 130, height: 80 }, create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.rect(x,y,w,h); fs(ctx,el); const bar=w*0.12; ctx.beginPath(); ctx.moveTo(x+bar,y); ctx.lineTo(x+bar,y+h); ctx.moveTo(x+w-bar,y); ctx.lineTo(x+w-bar,y+h); ctx.stroke(); }
  },
  {
    type: 'fc_document', name: 'Document', category: 'Flowchart',
    icon: I('<path d="M2,3 h16 v11 Q14,18 10,14 Q6,11 2,14z"/>'),
    defaultSize: { width: 130, height: 90 }, create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.moveTo(x,y); ctx.lineTo(x+w,y); ctx.lineTo(x+w,y+h*0.78); ctx.bezierCurveTo(x+w-w/3,y+h,x+w/3,y+h*0.6,x,y+h*0.78); ctx.closePath(); fs(ctx,el); }
  },
  {
    type: 'fc_database', name: 'Database', category: 'Flowchart',
    icon: I('<ellipse cx="10" cy="5" rx="8" ry="3"/><line x1="2" y1="5" x2="2" y2="15"/><line x1="18" y1="5" x2="18" y2="15"/><ellipse cx="10" cy="15" rx="8" ry="3"/>'),
    defaultSize: { width: 90, height: 120 }, create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const ry=Math.max(h*0.12,10); ctx.moveTo(x,y+ry); ctx.lineTo(x,y+h-ry); ctx.ellipse(x+w/2,y+h-ry,w/2,ry,0,Math.PI,0,false); ctx.lineTo(x+w,y+ry); ctx.ellipse(x+w/2,y+ry,w/2,ry,0,0,Math.PI,false); ctx.closePath(); fs(ctx,el); ctx.beginPath(); ctx.ellipse(x+w/2,y+ry,w/2,ry,0,0,Math.PI*2); fs(ctx,el); }
  },
  {
    type: 'fc_connector', name: 'Connector', category: 'Flowchart',
    icon: I('<circle cx="10" cy="10" r="7"/>'),
    defaultSize: { width: 60, height: 60 }, create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.arc(x+w/2,y+h/2,Math.min(w,h)/2,0,Math.PI*2); fs(ctx,el); }
  },
  {
    type: 'fc_summing', name: 'Summing Junct.', category: 'Flowchart',
    icon: I('<circle cx="10" cy="10" r="7"/><line x1="3" y1="10" x2="17" y2="10"/><line x1="10" y1="3" x2="10" y2="17"/>'),
    defaultSize: { width: 70, height: 70 }, create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const cx=x+w/2,cy=y+h/2,r=Math.min(w,h)/2; ctx.arc(cx,cy,r,0,Math.PI*2); fs(ctx,el); ctx.beginPath(); ctx.moveTo(cx-r,cy); ctx.lineTo(cx+r,cy); ctx.moveTo(cx,cy-r); ctx.lineTo(cx,cy+r); ctx.stroke(); }
  },
  {
    type: 'fc_or', name: 'Or Junction', category: 'Flowchart',
    icon: I('<circle cx="10" cy="10" r="7"/><line x1="4.5" y1="4.5" x2="15.5" y2="15.5"/><line x1="15.5" y1="4.5" x2="4.5" y2="15.5"/>'),
    defaultSize: { width: 70, height: 70 }, create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const cx=x+w/2,cy=y+h/2,r=Math.min(w,h)/2; ctx.arc(cx,cy,r,0,Math.PI*2); fs(ctx,el); const d=r*0.7; ctx.beginPath(); ctx.moveTo(cx-d,cy-d); ctx.lineTo(cx+d,cy+d); ctx.moveTo(cx+d,cy-d); ctx.lineTo(cx-d,cy+d); ctx.stroke(); }
  },
  {
    type: 'fc_manual_op', name: 'Manual Op.', category: 'Flowchart',
    icon: I('<polygon points="2,4 18,4 15,16 5,16"/>'),
    defaultSize: { width: 130, height: 70 }, create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const s=w*0.12; ctx.moveTo(x,y); ctx.lineTo(x+w,y); ctx.lineTo(x+w-s,y+h); ctx.lineTo(x+s,y+h); ctx.closePath(); fs(ctx,el); }
  },
  {
    type: 'fc_preparation', name: 'Preparation', category: 'Flowchart',
    icon: I('<polygon points="5,2 15,2 18,10 15,18 5,18 2,10"/>'),
    defaultSize: { width: 120, height: 70 }, create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const s=w*0.16; ctx.moveTo(x+s,y); ctx.lineTo(x+w-s,y); ctx.lineTo(x+w,y+h/2); ctx.lineTo(x+w-s,y+h); ctx.lineTo(x+s,y+h); ctx.lineTo(x,y+h/2); ctx.closePath(); fs(ctx,el); }
  },
  {
    type: 'fc_delay', name: 'Delay', category: 'Flowchart',
    icon: I('<path d="M2,5 h12 q6,0 6,5 q0,5 -6,5 h-12z"/>'),
    defaultSize: { width: 130, height: 70 }, create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const r=h/2; ctx.moveTo(x,y); ctx.lineTo(x+w-r,y); ctx.arc(x+w-r,y+r,r,-Math.PI/2,Math.PI/2); ctx.lineTo(x,y+h); ctx.closePath(); fs(ctx,el); }
  },
  {
    type: 'fc_display', name: 'Display', category: 'Flowchart',
    icon: I('<path d="M5,10 L2,10 M2,10 l4,-6 h9 q4,0 4,6 q0,6 -4,6 h-9z"/>'),
    defaultSize: { width: 140, height: 80 }, create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const pt=w*0.15,r=h*0.35; ctx.moveTo(x+pt,y); ctx.lineTo(x+w-r,y); ctx.arc(x+w-r,y+h/2,h/2,-Math.PI/2,Math.PI/2); ctx.lineTo(x+pt,y+h); ctx.lineTo(x,y+h/2); ctx.closePath(); fs(ctx,el); }
  },
  {
    type: 'fc_internal_storage', name: 'Internal Store', category: 'Flowchart',
    icon: I('<rect x="2" y="2" width="16" height="16"/><line x1="2" y1="7" x2="18" y2="7"/><line x1="7" y1="2" x2="7" y2="18"/>'),
    defaultSize: { width: 100, height: 100 }, create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.rect(x,y,w,h); fs(ctx,el); ctx.beginPath(); ctx.moveTo(x,y+h*0.25); ctx.lineTo(x+w,y+h*0.25); ctx.moveTo(x+w*0.25,y); ctx.lineTo(x+w*0.25,y+h); ctx.stroke(); }
  },
  {
    type: 'fc_extract', name: 'Extract', category: 'Flowchart',
    icon: I('<polygon points="2,2 18,2 10,18"/>'),
    defaultSize: { width: 100, height: 80 }, create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.moveTo(x,y); ctx.lineTo(x+w,y); ctx.lineTo(x+w/2,y+h); ctx.closePath(); fs(ctx,el); }
  },
  {
    type: 'fc_merge', name: 'Merge', category: 'Flowchart',
    icon: I('<polygon points="2,18 18,18 10,2"/>'),
    defaultSize: { width: 100, height: 80 }, create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.moveTo(x,y+h); ctx.lineTo(x+w,y+h); ctx.lineTo(x+w/2,y); ctx.closePath(); fs(ctx,el); }
  },
  {
    type: 'fc_collate', name: 'Collate', category: 'Flowchart',
    icon: I('<polygon points="2,2 18,2 10,10"/><polygon points="2,18 18,18 10,10"/>'),
    defaultSize: { width: 100, height: 100 }, create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.moveTo(x,y); ctx.lineTo(x+w,y); ctx.lineTo(x+w/2,y+h/2); ctx.closePath(); fs(ctx,el); ctx.beginPath(); ctx.moveTo(x,y+h); ctx.lineTo(x+w,y+h); ctx.lineTo(x+w/2,y+h/2); ctx.closePath(); fs(ctx,el); }
  },
  {
    type: 'fc_annotation', name: 'Annotation', category: 'Flowchart',
    icon: I('<path d="M10,4 L4,4 L4,16 L10,16" fill="none"/>'),
    defaultSize: { width: 80, height: 100 }, create: (el) => { el.style.fillColor='transparent'; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.moveTo(x+w*0.5,y); ctx.lineTo(x,y); ctx.lineTo(x,y+h); ctx.lineTo(x+w*0.5,y+h); ctx.stroke(); }
  },
  {
    type: 'fc_card', name: 'Card', category: 'Flowchart',
    icon: I('<polygon points="5,2 18,2 18,18 2,18 2,7"/>'),
    defaultSize: { width: 120, height: 90 }, create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const c=h*0.28; ctx.moveTo(x+c,y); ctx.lineTo(x+w,y); ctx.lineTo(x+w,y+h); ctx.lineTo(x,y+h); ctx.lineTo(x,y+c); ctx.closePath(); fs(ctx,el); ctx.beginPath(); ctx.moveTo(x,y+c); ctx.lineTo(x+c,y+c); ctx.lineTo(x+c,y); ctx.stroke(); }
  },
  {
    type: 'fc_multi_doc', name: 'Multi-Document', category: 'Flowchart',
    icon: I('<path d="M4,6 h12 v8 Q13,16 10,13 Q7,11 4,13z"/><path d="M3,5 h12 v1 H3z"/><path d="M2,4 h12 v1 H2z"/>'),
    defaultSize: { width: 130, height: 100 }, create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds;
      [{ ox:6,oy:0 },{ ox:3,oy:h*0.08 },{ ox:0,oy:h*0.16 }].forEach(({ox,oy},i) => {
        ctx.beginPath();
        ctx.moveTo(x+ox,y+oy); ctx.lineTo(x+ox+w,y+oy); ctx.lineTo(x+ox+w,y+oy+h*0.78);
        ctx.bezierCurveTo(x+ox+w-w/3,y+oy+h,x+ox+w/3,y+oy+h*0.65,x+ox,y+oy+h*0.78);
        ctx.closePath(); if(i===2) fs(ctx,el); else ctx.stroke();
      });
    }
  },
  {
    type: 'fc_offpage', name: 'Off-Page Ref', category: 'Flowchart',
    icon: I('<polygon points="2,2 18,2 18,13 10,18 2,13"/>'),
    defaultSize: { width: 100, height: 100 }, create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.moveTo(x,y); ctx.lineTo(x+w,y); ctx.lineTo(x+w,y+h*0.7); ctx.lineTo(x+w/2,y+h); ctx.lineTo(x,y+h*0.7); ctx.closePath(); fs(ctx,el); }
  },
  {
    type: 'fc_stored_data', name: 'Stored Data', category: 'Flowchart',
    icon: I('<path d="M5,5 h11 Q19,10 16,15 h-11 Q8,10 5,5z"/>'),
    defaultSize: { width: 130, height: 70 }, create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const c=w*0.15; ctx.moveTo(x+c,y); ctx.lineTo(x+w,y); ctx.bezierCurveTo(x+w+c,y,x+w+c,y+h,x+w,y+h); ctx.lineTo(x+c,y+h); ctx.bezierCurveTo(x-c,y+h,x-c,y,x+c,y); ctx.closePath(); fs(ctx,el); }
  },
  {
    type: 'fc_loop_limit', name: 'Loop Limit', category: 'Flowchart',
    icon: I('<polygon points="5,2 15,2 18,6 18,18 2,18 2,6"/>'),
    defaultSize: { width: 120, height: 90 }, create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const c=w*0.2; ctx.moveTo(x+c,y); ctx.lineTo(x+w-c,y); ctx.lineTo(x+w,y+h*0.28); ctx.lineTo(x+w,y+h); ctx.lineTo(x,y+h); ctx.lineTo(x,y+h*0.28); ctx.closePath(); fs(ctx,el); }
  },
  {
    type: 'fc_manual_input', name: 'Manual Input', category: 'Flowchart',
    icon: I('<polygon points="2,7 18,2 18,18 2,18"/>'),
    defaultSize: { width: 130, height: 80 }, create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const sl=h*0.3; ctx.moveTo(x,y+sl); ctx.lineTo(x+w,y); ctx.lineTo(x+w,y+h); ctx.lineTo(x,y+h); ctx.closePath(); fs(ctx,el); }
  },
  {
    type: 'fc_cloud', name: 'Cloud', category: 'Flowchart',
    icon: I('<path d="M5,13 Q2,13 2,10 Q2,7 5,7 Q5,4 8,4 Q10,2 13,4 Q16,3 17,6 Q20,6 19,9 Q20,13 17,13z"/>'),
    defaultSize: { width: 140, height: 90 }, create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds;
      ctx.moveTo(x+w*0.2,y+h*0.55);
      ctx.bezierCurveTo(x,y+h*0.55,x,y+h*0.8,x+w*0.18,y+h*0.8);
      ctx.bezierCurveTo(x+w*0.18,y+h,x+w*0.5,y+h,x+w*0.55,y+h*0.8);
      ctx.bezierCurveTo(x+w*0.85,y+h*0.82,x+w*0.88,y+h*0.55,x+w*0.78,y+h*0.45);
      ctx.bezierCurveTo(x+w*0.85,y+h*0.12,x+w*0.55,y,x+w*0.42,y+h*0.22);
      ctx.bezierCurveTo(x+w*0.28,y,x+w*0.08,y+h*0.15,x+w*0.1,y+h*0.38);
      ctx.bezierCurveTo(x,y+h*0.38,x,y+h*0.55,x+w*0.2,y+h*0.55);
      ctx.closePath(); fs(ctx,el);
    }
  },
];
