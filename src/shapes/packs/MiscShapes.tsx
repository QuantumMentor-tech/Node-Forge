import React from 'react';
import { ShapeDefinition } from '../core/ShapeRegistry';

const fs = (ctx: CanvasRenderingContext2D, el: any) => {
  if (el.style.fillColor && el.style.fillColor !== 'transparent') ctx.fill();
  if (el.style.strokeWidth > 0 && el.style.strokeColor !== 'transparent') ctx.stroke();
};
const I = (d: string) => <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.4" dangerouslySetInnerHTML={{ __html: d }} />;

export const MiscShapesPack: ShapeDefinition[] = [
  // ── Text Variants ─────────────────────────────────────────────────────────
  {
    type: 'misc_text_label', name: 'Text Label', category: 'Misc',
    icon: I('<text x="2" y="14" font-size="11" stroke="none" fill="currentColor">Text</text>'),
    defaultSize: { width: 120, height: 40 },
    create: (el) => { el.style.fillColor='transparent'; el.style.strokeColor='transparent'; el.label='Label'; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.font=`${el.style.fontSize||14}px ${el.style.fontFamily||'Inter'}`; ctx.fillStyle=el.style.fontColor||'#1a1d27'; ctx.textAlign='left'; ctx.textBaseline='middle'; ctx.fillText(el.label||'Label',x+4,y+h/2); }
  },
  {
    type: 'misc_text_link', name: 'Link', category: 'Misc',
    icon: I('<text x="2" y="14" font-size="11" stroke="none" fill="#3b82f6" text-decoration="underline">Link</text><line x1="2" y1="15" x2="18" y2="15" stroke="#3b82f6"/>'),
    defaultSize: { width: 120, height: 40 },
    create: (el) => { el.style.fillColor='transparent'; el.style.strokeColor='transparent'; el.style.fontColor='#3b82f6'; el.label='Link'; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.font=`${el.style.fontSize||14}px ${el.style.fontFamily||'Inter'}`; ctx.fillStyle=el.style.fontColor||'#3b82f6'; ctx.textAlign='left'; ctx.textBaseline='middle'; ctx.fillText(el.label||'Link',x+4,y+h/2); const m=ctx.measureText(el.label||'Link'); ctx.beginPath(); ctx.moveTo(x+4,y+h/2+9); ctx.lineTo(x+4+m.width,y+h/2+9); ctx.strokeStyle=el.style.fontColor||'#3b82f6'; ctx.stroke(); }
  },
  // ── Table / Grid Shapes ────────────────────────────────────────────────────
  {
    type: 'misc_table_3col', name: 'Table 3-Col', category: 'Misc',
    icon: I('<rect x="1" y="3" width="18" height="14"/><line x1="7" y1="3" x2="7" y2="17"/><line x1="13" y1="3" x2="13" y2="17"/><line x1="1" y1="8" x2="19" y2="8"/>'),
    defaultSize: { width: 180, height: 120 },
    create: (el) => { el.label=''; return el; },
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds; const cols=3,rows=3,cw=w/cols,rh=h/rows;
      ctx.rect(x,y,w,h); fs(ctx,el);
      ctx.fillStyle='rgba(99,102,241,0.15)'; ctx.fillRect(x+1,y+1,w-2,rh-2);
      ctx.beginPath();
      for(let r=1;r<rows;r++){ctx.moveTo(x,y+r*rh);ctx.lineTo(x+w,y+r*rh);}
      for(let c=1;c<cols;c++){ctx.moveTo(x+c*cw,y);ctx.lineTo(x+c*cw,y+h);}
      ctx.stroke();
    }
  },
  {
    type: 'misc_table_4col', name: 'Table 4-Col', category: 'Misc',
    icon: I('<rect x="1" y="3" width="18" height="14"/><line x1="5.5" y1="3" x2="5.5" y2="17"/><line x1="10" y1="3" x2="10" y2="17"/><line x1="14.5" y1="3" x2="14.5" y2="17"/><line x1="1" y1="8" x2="19" y2="8"/>'),
    defaultSize: { width: 200, height: 130 },
    create: (el) => { el.label=''; return el; },
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds; const cols=4,rows=3,cw=w/cols,rh=h/rows;
      ctx.rect(x,y,w,h); fs(ctx,el);
      ctx.fillStyle='rgba(99,102,241,0.15)'; ctx.fillRect(x+1,y+1,w-2,rh-2);
      ctx.beginPath();
      for(let r=1;r<rows;r++){ctx.moveTo(x,y+r*rh);ctx.lineTo(x+w,y+r*rh);}
      for(let c=1;c<cols;c++){ctx.moveTo(x+c*cw,y);ctx.lineTo(x+c*cw,y+h);}
      ctx.stroke();
    }
  },
  {
    type: 'misc_table_hdr', name: 'Header Table', category: 'Misc',
    icon: I('<rect x="1" y="3" width="18" height="14"/><rect x="1" y="3" width="18" height="5" fill="currentColor" opacity="0.2"/><line x1="1" y1="8" x2="19" y2="8"/><line x1="1" y1="12" x2="19" y2="12"/>'),
    defaultSize: { width: 160, height: 150 },
    create: (el) => { el.label='Title'; return el; },
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds; const hdr=32,rh=28;
      ctx.rect(x,y,w,h); fs(ctx,el);
      ctx.fillStyle='rgba(99,102,241,0.2)'; ctx.fillRect(x+1,y+1,w-2,hdr-2);
      ctx.beginPath(); ctx.moveTo(x,y+hdr); ctx.lineTo(x+w,y+hdr); ctx.stroke();
      const rowCount=Math.floor((h-hdr)/rh);
      for(let r=1;r<rowCount;r++){ctx.beginPath();ctx.moveTo(x,y+hdr+r*rh);ctx.lineTo(x+w,y+hdr+r*rh);ctx.stroke();}
      ctx.font='bold 12px Inter'; ctx.fillStyle=el.style.fontColor||'#1a1d27'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(el.label||'Title',x+w/2,y+hdr/2);
    }
  },
  // ── 3D / Special Shapes ────────────────────────────────────────────────────
  {
    type: 'misc_cube', name: '3D Cube', category: 'Misc',
    icon: I('<path d="M5,14 L5,6 L10,3 L15,6 L15,14 L10,17z M5,6 L10,9 L15,6 M10,9 L10,17"/>'),
    defaultSize: { width: 100, height: 110 },
    create: (el) => el,
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds; const ox=w*0.3,oy=h*0.22;
      ctx.moveTo(x+w*0.5,y); ctx.lineTo(x+w,y+oy); ctx.lineTo(x+w,y+h-oy); ctx.lineTo(x+w*0.5,y+h); ctx.lineTo(x,y+h-oy); ctx.lineTo(x,y+oy); ctx.closePath(); fs(ctx,el);
      ctx.beginPath(); ctx.moveTo(x+w*0.5,y); ctx.lineTo(x+w*0.5,y+h); ctx.moveTo(x,y+oy); ctx.lineTo(x+w,y+oy); ctx.stroke();
    }
  },
  {
    type: 'misc_sphere', name: 'Sphere', category: 'Misc',
    icon: I('<circle cx="10" cy="10" r="8"/><ellipse cx="10" cy="10" rx="4" ry="8"/>'),
    defaultSize: { width: 90, height: 90 },
    create: (el) => el,
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds; const cx=x+w/2,cy=y+h/2,r=Math.min(w,h)/2;
      ctx.arc(cx,cy,r,0,Math.PI*2); fs(ctx,el);
      ctx.beginPath(); ctx.ellipse(cx,cy,r*0.45,r,0,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx-r,cy); ctx.lineTo(cx+r,cy); ctx.stroke();
    }
  },
  {
    type: 'misc_gear', name: 'Gear', category: 'Misc',
    icon: I('<circle cx="10" cy="10" r="4"/><path d="M10,2 l1,2 -1,0 -1,0z M10,18 l1,-2 -1,0 -1,0z M2,10 l2,-1 0,1 0,1z M18,10 l-2,-1 0,1 0,1z"/>'),
    defaultSize: { width: 90, height: 90 },
    create: (el) => { el.style.fillColor='#f59e0b'; el.style.strokeColor='#d97706'; return el; },
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds;
      const cx=x+w/2, cy=y+h/2;
      const r=Math.min(w,h)/2, teeth=10, holeR=r*0.38;
      const outerR=r, innerR=r*0.78;
      // Draw gear teeth as alternating outer/inner vertices (star polygon)
      ctx.beginPath();
      for (let i=0; i<teeth*2; i++) {
        const angle=(i*Math.PI)/teeth - Math.PI/2;
        const rad=i%2===0 ? outerR : innerR;
        if (i===0) ctx.moveTo(cx+Math.cos(angle)*rad, cy+Math.sin(angle)*rad);
        else ctx.lineTo(cx+Math.cos(angle)*rad, cy+Math.sin(angle)*rad);
      }
      ctx.closePath();
      // Center hole using even-odd rule (counter-clockwise = subtract)
      ctx.moveTo(cx+holeR, cy);
      ctx.arc(cx, cy, holeR, 0, Math.PI*2, true);
      if (el.style.fillColor && el.style.fillColor !== 'transparent') ctx.fill('evenodd');
      ctx.beginPath();
      for (let i=0; i<teeth*2; i++) {
        const angle=(i*Math.PI)/teeth - Math.PI/2;
        const rad=i%2===0 ? outerR : innerR;
        if (i===0) ctx.moveTo(cx+Math.cos(angle)*rad, cy+Math.sin(angle)*rad);
        else ctx.lineTo(cx+Math.cos(angle)*rad, cy+Math.sin(angle)*rad);
      }
      ctx.closePath();
      if (el.style.strokeWidth > 0 && el.style.strokeColor !== 'transparent') ctx.stroke();
      // Draw hole border
      ctx.beginPath(); ctx.arc(cx,cy,holeR,0,Math.PI*2);
      if (el.style.strokeWidth > 0 && el.style.strokeColor !== 'transparent') ctx.stroke();
    }
  },
  {
    type: 'misc_play_btn', name: 'Play Button', category: 'Misc',
    icon: I('<circle cx="10" cy="10" r="8"/><polygon points="8,6 15,10 8,14" fill="currentColor"/>'),
    defaultSize: { width: 80, height: 80 },
    create: (el) => { el.style.fillColor='#22c55e'; el.style.strokeColor='#16a34a'; return el; },
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds; const cx=x+w/2,cy=y+h/2,r=Math.min(w,h)/2;
      ctx.arc(cx,cy,r,0,Math.PI*2); fs(ctx,el);
      ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.beginPath();
      ctx.moveTo(cx-r*0.22,cy-r*0.38); ctx.lineTo(cx+r*0.42,cy); ctx.lineTo(cx-r*0.22,cy+r*0.38); ctx.closePath(); ctx.fill();
    }
  },
  // ── Bracket / Angle Symbols ────────────────────────────────────────────────
  {
    type: 'misc_angle_right', name: 'Angle >', category: 'Misc',
    icon: I('<polyline points="6,4 14,10 6,16"/>'),
    defaultSize: { width: 50, height: 80 },
    create: (el) => { el.style.fillColor='transparent'; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.moveTo(x+w*0.2,y); ctx.lineTo(x+w,y+h/2); ctx.lineTo(x+w*0.2,y+h); ctx.stroke(); }
  },
  {
    type: 'misc_angle_left', name: 'Angle <', category: 'Misc',
    icon: I('<polyline points="14,4 6,10 14,16"/>'),
    defaultSize: { width: 50, height: 80 },
    create: (el) => { el.style.fillColor='transparent'; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.moveTo(x+w*0.8,y); ctx.lineTo(x,y+h/2); ctx.lineTo(x+w*0.8,y+h); ctx.stroke(); }
  },
  {
    type: 'misc_vline', name: 'Vertical Line', category: 'Misc',
    icon: I('<line x1="10" y1="2" x2="10" y2="18"/>'),
    defaultSize: { width: 20, height: 100 },
    create: (el) => { el.style.fillColor='transparent'; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.moveTo(x+w/2,y); ctx.lineTo(x+w/2,y+h); ctx.stroke(); }
  },
  {
    type: 'misc_hline', name: 'Horizontal Line', category: 'Misc',
    icon: I('<line x1="2" y1="10" x2="18" y2="10"/>'),
    defaultSize: { width: 120, height: 20 },
    create: (el) => { el.style.fillColor='transparent'; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.moveTo(x,y+h/2); ctx.lineTo(x+w,y+h/2); ctx.stroke(); }
  },
  {
    type: 'misc_dashed_line', name: 'Dashed Line', category: 'Misc',
    icon: I('<line x1="2" y1="10" x2="18" y2="10" stroke-dasharray="3 2"/>'),
    defaultSize: { width: 120, height: 20 },
    create: (el) => { el.style.fillColor='transparent'; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.setLineDash([8,5]); ctx.moveTo(x,y+h/2); ctx.lineTo(x+w,y+h/2); ctx.stroke(); ctx.setLineDash([]); }
  },
  {
    type: 'misc_wavy_line', name: 'Wavy Line', category: 'Misc',
    icon: I('<path d="M2,10 Q4,7 6,10 Q8,13 10,10 Q12,7 14,10 Q16,13 18,10"/>'),
    defaultSize: { width: 150, height: 40 },
    create: (el) => { el.style.fillColor='transparent'; return el; },
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds; const seg=5,sw=w/seg;
      ctx.moveTo(x,y+h/2);
      for(let i=0;i<seg;i++){const sx=x+i*sw; ctx.quadraticCurveTo(sx+sw*0.25,y+(i%2===0?h*0.2:h*0.8),sx+sw*0.5,y+h/2); ctx.quadraticCurveTo(sx+sw*0.75,y+(i%2===0?h*0.8:h*0.2),sx+sw,y+h/2);}
      ctx.stroke();
    }
  },
  // ── Step / Staircase Shapes ────────────────────────────────────────────────
  {
    type: 'misc_steps', name: 'Steps', category: 'Misc',
    icon: I('<path d="M2,18 L2,12 L7,12 L7,7 L12,7 L12,2 L18,2" fill="none"/>'),
    defaultSize: { width: 110, height: 110 },
    create: (el) => { el.style.fillColor='transparent'; return el; },
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds; const steps=3,sw=w/steps,sh=h/steps;
      ctx.moveTo(x,y+h);
      for(let i=0;i<steps;i++){ctx.lineTo(x+i*sw,y+h-i*sh); ctx.lineTo(x+(i+1)*sw,y+h-i*sh); ctx.lineTo(x+(i+1)*sw,y+h-(i+1)*sh);}
      ctx.stroke();
    }
  },
  {
    type: 'misc_l_shape', name: 'L Shape', category: 'Misc',
    icon: I('<path d="M5,3 L5,17 L17,17" fill="none"/>'),
    defaultSize: { width: 100, height: 100 },
    create: (el) => { el.style.fillColor='transparent'; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const t=Math.min(w,h)*0.2; ctx.moveTo(x,y); ctx.lineTo(x,y+h); ctx.lineTo(x+w,y+h); ctx.lineTo(x+w,y+h-t); ctx.lineTo(x+t,y+h-t); ctx.lineTo(x+t,y); ctx.closePath(); fs(ctx,el); }
  },
  {
    type: 'misc_t_shape', name: 'T Shape', category: 'Misc',
    icon: I('<path d="M2,4 L18,4 M10,4 L10,18" fill="none"/>'),
    defaultSize: { width: 110, height: 90 },
    create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const t=w*0.3,capH=h*0.3,sx=x+(w-t)/2; ctx.rect(x,y,w,capH); fs(ctx,el); ctx.beginPath(); ctx.rect(sx,y+capH,t,h-capH); fs(ctx,el); }
  },
  {
    type: 'misc_cross', name: 'Plus / Cross', category: 'Misc',
    icon: I('<path d="M8,2 h4 v6 h6 v4 h-6 v6 h-4 v-6 h-6 v-4 h6z"/>'),
    defaultSize: { width: 90, height: 90 },
    create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const t=w/3; ctx.moveTo(x+t,y); ctx.lineTo(x+t*2,y); ctx.lineTo(x+t*2,y+t); ctx.lineTo(x+w,y+t); ctx.lineTo(x+w,y+t*2); ctx.lineTo(x+t*2,y+t*2); ctx.lineTo(x+t*2,y+h); ctx.lineTo(x+t,y+h); ctx.lineTo(x+t,y+t*2); ctx.lineTo(x,y+t*2); ctx.lineTo(x,y+t); ctx.lineTo(x+t,y+t); ctx.closePath(); fs(ctx,el); }
  },
  {
    type: 'misc_redo_arrow', name: 'Redo Arrow', category: 'Misc',
    icon: I('<path d="M4,14 Q4,5 12,5 L12,2 L18,7 L12,12 L12,9 Q8,9 8,14z"/>'),
    defaultSize: { width: 100, height: 90 },
    create: (el) => el,
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds;
      ctx.moveTo(x,y+h*0.85);
      ctx.bezierCurveTo(x,y+h*0.2,x+w*0.6,y+h*0.15,x+w*0.6,y+h*0.35);
      ctx.lineTo(x+w*0.6,y+h*0.1); ctx.lineTo(x+w,y+h*0.38); ctx.lineTo(x+w*0.6,y+h*0.65);
      ctx.lineTo(x+w*0.6,y+h*0.48);
      ctx.bezierCurveTo(x+w*0.6,y+h*0.48,x+h*0.25,y+h*0.48,x+h*0.25,y+h*0.85);
      ctx.closePath(); fs(ctx,el);
    }
  },
  {
    type: 'misc_terminator', name: 'Terminator', category: 'Misc',
    icon: I('<rect x="2" y="6" width="16" height="8" rx="4"/>'),
    defaultSize: { width: 120, height: 50 },
    create: (el) => { el.label='Start / End'; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const r=h/2; ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+r,r); ctx.arcTo(x+w,y+h,x+r,y+h,r); ctx.arcTo(x,y+h,x,y+r,r); ctx.arcTo(x,y,x+r,y,r); ctx.closePath(); fs(ctx,el); }
  },
  {
    type: 'misc_manual_input', name: 'Manual Input', category: 'Misc',
    icon: I('<polygon points="2,7 18,2 18,18 2,18"/>'),
    defaultSize: { width: 120, height: 70 },
    create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.moveTo(x,y+h*0.3); ctx.lineTo(x+w,y); ctx.lineTo(x+w,y+h); ctx.lineTo(x,y+h); ctx.closePath(); fs(ctx,el); }
  },
  {
    type: 'misc_delay', name: 'Delay', category: 'Misc',
    icon: I('<path d="M2,5 h12 q6,0 6,5 q0,5 -6,5 h-12z"/>'),
    defaultSize: { width: 130, height: 70 },
    create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const r=h/2; ctx.moveTo(x,y); ctx.lineTo(x+w-r,y); ctx.arc(x+w-r,y+r,r,-Math.PI/2,Math.PI/2); ctx.lineTo(x,y+h); ctx.closePath(); fs(ctx,el); }
  },
  {
    type: 'misc_corner_bracket', name: 'Corner Bracket', category: 'Misc',
    icon: I('<path d="M3,14 L3,3 L14,3" fill="none"/>'),
    defaultSize: { width: 80, height: 80 },
    create: (el) => { el.style.fillColor='transparent'; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.moveTo(x+w,y); ctx.lineTo(x,y); ctx.lineTo(x,y+h); ctx.stroke(); }
  },
];
