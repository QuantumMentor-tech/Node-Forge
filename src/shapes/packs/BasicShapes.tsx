import React from 'react';
import { ShapeDefinition } from '../core/ShapeRegistry';

const fs = (ctx: CanvasRenderingContext2D, el: any) => {
  if (el.style.fillColor && el.style.fillColor !== 'transparent') ctx.fill();
  if (el.style.strokeWidth > 0 && el.style.strokeColor !== 'transparent') ctx.stroke();
};
const I = (d: string) => <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.4" dangerouslySetInnerHTML={{ __html: d }} />;

export const BasicShapesPack: ShapeDefinition[] = [
  { type: 'rectangle', name: 'Rectangle', category: 'Basic Shapes', icon: I('<rect x="2" y="4" width="16" height="12"/>'), defaultSize: { width: 120, height: 80 },
    create: (el) => { el.style.borderRadius = 0; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.rect(x,y,w,h); fs(ctx,el); }
  },
  { type: 'ellipse', name: 'Ellipse', category: 'Basic Shapes', icon: I('<ellipse cx="10" cy="10" rx="8" ry="6"/>'), defaultSize: { width: 120, height: 80 },
    create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,Math.PI*2); fs(ctx,el); }
  },
  { type: 'rounded_rect', name: 'Rounded Rect', category: 'Basic Shapes', icon: I('<rect x="2" y="4" width="16" height="12" rx="4"/>'), defaultSize: { width: 120, height: 80 },
    create: (el) => { el.style.borderRadius = 12; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.roundRect(x,y,w,h,el.style.borderRadius||12); fs(ctx,el); }
  },
  { type: 'diamond', name: 'Diamond', category: 'Basic Shapes', icon: I('<polygon points="10,2 18,10 10,18 2,10"/>'), defaultSize: { width: 100, height: 100 },
    create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.moveTo(x+w/2,y); ctx.lineTo(x+w,y+h/2); ctx.lineTo(x+w/2,y+h); ctx.lineTo(x,y+h/2); ctx.closePath(); fs(ctx,el); }
  },
  { type: 'triangle', name: 'Triangle', category: 'Basic Shapes', icon: I('<polygon points="10,2 18,18 2,18"/>'), defaultSize: { width: 100, height: 100 },
    create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.moveTo(x+w/2,y); ctx.lineTo(x+w,y+h); ctx.lineTo(x,y+h); ctx.closePath(); fs(ctx,el); }
  },
  { type: 'right_triangle', name: 'Right Triangle', category: 'Basic Shapes', icon: I('<polygon points="2,18 2,2 18,18"/>'), defaultSize: { width: 100, height: 100 },
    create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.moveTo(x,y); ctx.lineTo(x,y+h); ctx.lineTo(x+w,y+h); ctx.closePath(); fs(ctx,el); }
  },
  { type: 'hexagon', name: 'Hexagon', category: 'Basic Shapes', icon: I('<polygon points="6,2 14,2 18,10 14,18 6,18 2,10"/>'), defaultSize: { width: 110, height: 100 },
    create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const q=w/4; ctx.moveTo(x+q,y); ctx.lineTo(x+w-q,y); ctx.lineTo(x+w,y+h/2); ctx.lineTo(x+w-q,y+h); ctx.lineTo(x+q,y+h); ctx.lineTo(x,y+h/2); ctx.closePath(); fs(ctx,el); }
  },
  { type: 'octagon', name: 'Octagon', category: 'Basic Shapes', icon: I('<polygon points="6,2 14,2 18,6 18,14 14,18 6,18 2,14 2,6"/>'), defaultSize: { width: 100, height: 100 },
    create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const c=Math.min(w,h)*0.22; ctx.moveTo(x+c,y); ctx.lineTo(x+w-c,y); ctx.lineTo(x+w,y+c); ctx.lineTo(x+w,y+h-c); ctx.lineTo(x+w-c,y+h); ctx.lineTo(x+c,y+h); ctx.lineTo(x,y+h-c); ctx.lineTo(x,y+c); ctx.closePath(); fs(ctx,el); }
  },
  { type: 'pentagon', name: 'Pentagon', category: 'Basic Shapes', icon: I('<polygon points="10,2 18,8 15,18 5,18 2,8"/>'), defaultSize: { width: 100, height: 100 },
    create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; for(let i=0;i<5;i++){const a=(i*Math.PI*2)/5-Math.PI/2; const px=x+w/2+Math.cos(a)*w/2; const py=y+h/2+Math.sin(a)*h/2; i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);} ctx.closePath(); fs(ctx,el); }
  },
  { type: 'star4', name: '4-Point Star', category: 'Basic Shapes', icon: I('<polygon points="10,2 12,8 18,10 12,12 10,18 8,12 2,10 8,8"/>'), defaultSize: { width: 100, height: 100 },
    create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const cx=x+w/2,cy=y+h/2,r=Math.min(w,h)/2,ri=r*0.4; for(let i=0;i<8;i++){const a=(i*Math.PI)/4-Math.PI/2; const rad=i%2===0?r:ri; const px=cx+Math.cos(a)*rad; const py=cy+Math.sin(a)*rad; i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);} ctx.closePath(); fs(ctx,el); }
  },
  { type: 'star5', name: '5-Point Star', category: 'Basic Shapes', icon: I('<polygon points="10,2 12,8 18,8 13,12 15,18 10,14 5,18 7,12 2,8 8,8"/>'), defaultSize: { width: 100, height: 100 },
    create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const cx=x+w/2,cy=y+h/2,r=Math.min(w,h)/2,ri=r/2.5; for(let i=0;i<10;i++){const a=(i*Math.PI)/5-Math.PI/2; const rad=i%2===0?r:ri; const px=cx+Math.cos(a)*rad; const py=cy+Math.sin(a)*rad; i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);} ctx.closePath(); fs(ctx,el); }
  },
  { type: 'star8', name: 'Starburst', category: 'Basic Shapes', icon: I('<polygon points="10,1 11.5,7 16,3 13,8 19,8 13.5,11 17,16 11.5,13 10,19 8.5,13 3,16 6.5,11 1,8 7,8 4,3 9,7"/>'), defaultSize: { width: 100, height: 100 },
    create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const cx=x+w/2,cy=y+h/2,r=Math.min(w,h)/2,ri=r*0.5; for(let i=0;i<16;i++){const a=(i*Math.PI)/8-Math.PI/2; const rad=i%2===0?r:ri; const px=cx+Math.cos(a)*rad; const py=cy+Math.sin(a)*rad; i===0?ctx.moveTo(px,py):ctx.lineTo(px,py);} ctx.closePath(); fs(ctx,el); }
  },
  { type: 'heart', name: 'Heart', category: 'Basic Shapes', icon: I('<path d="M10,16 C6,12 2,10 2,6 A4,4 0 0,1 10,4 A4,4 0 0,1 18,6 C18,10 14,12 10,16z"/>'), defaultSize: { width: 100, height: 100 },
    create: (el) => { el.style.fillColor='#ef4444'; el.style.strokeColor='#ef4444'; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const cx=x+w/2; ctx.moveTo(cx,y+h*0.85); ctx.bezierCurveTo(x,y+h*0.5,x,y+h*0.2,cx-w*0.25,y+h*0.18); ctx.bezierCurveTo(x+w*0.1,y,x+w*0.4,y,cx,y+h*0.25); ctx.bezierCurveTo(x+w*0.6,y,x+w*0.9,y,cx+w*0.25,y+h*0.18); ctx.bezierCurveTo(x+w,y+h*0.2,x+w,y+h*0.5,cx,y+h*0.85); ctx.closePath(); fs(ctx,el); }
  },
  { type: 'crescent', name: 'Crescent', category: 'Basic Shapes', icon: I('<path d="M14,10 A6,6 0 1,1 14,10.1 A4,4 0 1,0 14,10z"/>'), defaultSize: { width: 90, height: 100 },
    create: (el) => el,
    render: (ctx, el) => {
      // Use even-odd fill rule: outer circle + inner offset circle = crescent
      const {x,y,width:w,height:h}=el.bounds;
      const cx=x+w/2, cy=y+h/2, r=Math.min(w,h)/2;
      // outer circle (clockwise)
      ctx.arc(cx, cy, r, 0, Math.PI*2);
      // inner "bite" circle (also clockwise — even-odd makes it hollow)
      ctx.moveTo(cx + r*0.32 + r*0.72, cy);
      ctx.arc(cx + r*0.32, cy, r*0.72, 0, Math.PI*2);
      if (el.style.fillColor && el.style.fillColor !== 'transparent') ctx.fill('evenodd');
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
      if (el.style.strokeWidth > 0 && el.style.strokeColor !== 'transparent') ctx.stroke();
    }
  },
  { type: 'teardrop', name: 'Teardrop', category: 'Basic Shapes', icon: I('<path d="M10,2 Q18,8 18,13 A8,8 0 0,1 2,13 Q2,8 10,2z"/>'), defaultSize: { width: 80, height: 110 },
    create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const cx=x+w/2; ctx.moveTo(cx,y); ctx.bezierCurveTo(x+w*0.9,y+h*0.35,x+w,y+h*0.6,x+w,y+h*0.75); ctx.arc(cx,y+h*0.75,w/2,0,Math.PI); ctx.bezierCurveTo(x,y+h*0.6,x+w*0.1,y+h*0.35,cx,y); ctx.closePath(); fs(ctx,el); }
  },
  { type: 'callout_round', name: 'Round Callout', category: 'Basic Shapes', icon: I('<path d="M2,4 Q2,2 4,2 h12 Q18,2 18,4 v9 Q18,15 16,15 h-5 l-2,3 -1,-3 H4 Q2,15 2,13z"/>'), defaultSize: { width: 140, height: 100 },
    create: (el) => { el.label='Text'; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const bh=h*0.72,r=10; ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r); ctx.lineTo(x+w,y+bh-r); ctx.arcTo(x+w,y+bh,x+w-r,y+bh,r); ctx.lineTo(x+w*0.55,y+bh); ctx.lineTo(x+w*0.38,y+h); ctx.lineTo(x+w*0.32,y+bh); ctx.lineTo(x+r,y+bh); ctx.arcTo(x,y+bh,x,y+bh-r,r); ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r); ctx.closePath(); fs(ctx,el); }
  },
  { type: 'callout_rect', name: 'Rect Callout', category: 'Basic Shapes', icon: I('<path d="M2,2 h16 v11 h-8 l-2,4 -1,-4 H2z"/>'), defaultSize: { width: 140, height: 100 },
    create: (el) => { el.label='Text'; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const bh=h*0.72; ctx.rect(x,y,w,bh); fs(ctx,el); ctx.beginPath(); ctx.moveTo(x+w*0.35,y+bh); ctx.lineTo(x+w*0.28,y+h); ctx.lineTo(x+w*0.48,y+bh); ctx.closePath(); fs(ctx,el); }
  },
  { type: 'speech_oval', name: 'Oval Callout', category: 'Basic Shapes', icon: I('<ellipse cx="10" cy="9" rx="8" ry="6"/><circle cx="6" cy="16" r="1.5"/><circle cx="4" cy="19" r="1"/>'), defaultSize: { width: 140, height: 100 },
    create: (el) => { el.label='Text'; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.ellipse(x+w/2,y+h*0.42,w/2,h*0.42,0,0,Math.PI*2); fs(ctx,el); ctx.beginPath(); ctx.arc(x+w*0.3,y+h*0.82,h*0.1,0,Math.PI*2); fs(ctx,el); ctx.beginPath(); ctx.arc(x+w*0.18,y+h*0.95,h*0.06,0,Math.PI*2); fs(ctx,el); }
  },
  { type: 'lightning', name: 'Lightning', category: 'Basic Shapes', icon: I('<polygon points="12,2 5,11 10,11 8,18 15,9 10,9"/>'), defaultSize: { width: 70, height: 110 },
    create: (el) => { el.style.fillColor='#f59e0b'; el.style.strokeColor='#d97706'; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.moveTo(x+w*0.65,y); ctx.lineTo(x+w*0.2,y+h*0.48); ctx.lineTo(x+w*0.52,y+h*0.48); ctx.lineTo(x+w*0.35,y+h); ctx.lineTo(x+w*0.8,y+h*0.52); ctx.lineTo(x+w*0.48,y+h*0.52); ctx.closePath(); fs(ctx,el); }
  },
  { type: 'cube3d', name: '3D Cube', category: 'Basic Shapes', icon: I('<path d="M4,6 l6,-4 6,4 0,8 -6,4 -6,-4z M4,6 l6,4 6,-4 M10,10 l0,8"/>'), defaultSize: { width: 100, height: 110 },
    create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const ox=w*0.3,oy=h*0.22; ctx.moveTo(x+w*0.5,y); ctx.lineTo(x+w,y+oy); ctx.lineTo(x+w,y+h-oy); ctx.lineTo(x+w*0.5,y+h); ctx.lineTo(x,y+h-oy); ctx.lineTo(x,y+oy); ctx.closePath(); fs(ctx,el); ctx.beginPath(); ctx.moveTo(x+w*0.5,y); ctx.lineTo(x+w*0.5,y+h); ctx.moveTo(x,y+oy); ctx.lineTo(x+w,y+oy); ctx.stroke(); }
  },
  { type: 'no_entry', name: 'No Entry', category: 'Basic Shapes', icon: I('<circle cx="10" cy="10" r="8"/><line x1="4" y1="10" x2="16" y2="10"/>'), defaultSize: { width: 90, height: 90 },
    create: (el) => { el.style.fillColor='rgba(239,68,68,0.1)'; el.style.strokeColor='#ef4444'; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const cx=x+w/2,cy=y+h/2,r=Math.min(w,h)/2; ctx.arc(cx,cy,r,0,Math.PI*2); fs(ctx,el); ctx.beginPath(); ctx.moveTo(cx-r*0.6,cy); ctx.lineTo(cx+r*0.6,cy); ctx.stroke(); }
  },
  { type: 'checkmark', name: 'Check Mark', category: 'Basic Shapes', icon: I('<polyline points="2,10 7,16 18,4"/>'), defaultSize: { width: 90, height: 70 },
    create: (el) => { el.style.fillColor='transparent'; el.style.strokeColor='#22c55e'; el.style.strokeWidth=4; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.moveTo(x+w*0.08,y+h*0.55); ctx.lineTo(x+w*0.38,y+h*0.85); ctx.lineTo(x+w*0.92,y+h*0.1); ctx.stroke(); }
  },
  { type: 'cross_x', name: 'X Mark', category: 'Basic Shapes', icon: I('<line x1="4" y1="4" x2="16" y2="16"/><line x1="16" y1="4" x2="4" y2="16"/>'), defaultSize: { width: 80, height: 80 },
    create: (el) => { el.style.fillColor='transparent'; el.style.strokeColor='#ef4444'; el.style.strokeWidth=3; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.moveTo(x+w*0.15,y+h*0.15); ctx.lineTo(x+w*0.85,y+h*0.85); ctx.moveTo(x+w*0.85,y+h*0.15); ctx.lineTo(x+w*0.15,y+h*0.85); ctx.stroke(); }
  },
  { type: 'envelope', name: 'Envelope', category: 'Basic Shapes', icon: I('<rect x="2" y="5" width="16" height="12"/><polyline points="2,5 10,13 18,5"/>'), defaultSize: { width: 130, height: 90 },
    create: (el) => el,
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.rect(x,y,w,h); fs(ctx,el); ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+w/2,y+h*0.55); ctx.lineTo(x+w,y); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x,y+h); ctx.lineTo(x+w*0.38,y+h*0.5); ctx.moveTo(x+w,y+h); ctx.lineTo(x+w*0.62,y+h*0.5); ctx.stroke(); }
  },
  { type: 'smiley_happy', name: 'Happy Face', category: 'Basic Shapes', icon: I('<circle cx="10" cy="10" r="8"/><circle cx="7" cy="8" r="1" fill="currentColor"/><circle cx="13" cy="8" r="1" fill="currentColor"/><path d="M6,12 Q10,16 14,12"/>'), defaultSize: { width: 90, height: 90 },
    create: (el) => { el.style.fillColor='#fde68a'; el.style.strokeColor='#d97706'; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const cx=x+w/2,cy=y+h/2,r=Math.min(w,h)/2; ctx.arc(cx,cy,r,0,Math.PI*2); fs(ctx,el); ctx.fillStyle='#92400e'; ctx.beginPath(); ctx.arc(cx-r*0.28,cy-r*0.18,r*0.09,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(cx+r*0.28,cy-r*0.18,r*0.09,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(cx,cy+r*0.12,r*0.38,0,Math.PI); ctx.stroke(); }
  },
  { type: 'smiley_sad', name: 'Sad Face', category: 'Basic Shapes', icon: I('<circle cx="10" cy="10" r="8"/><circle cx="7" cy="8" r="1" fill="currentColor"/><circle cx="13" cy="8" r="1" fill="currentColor"/><path d="M6,14 Q10,10 14,14"/>'), defaultSize: { width: 90, height: 90 },
    create: (el) => { el.style.fillColor='#fde68a'; el.style.strokeColor='#d97706'; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const cx=x+w/2,cy=y+h/2,r=Math.min(w,h)/2; ctx.arc(cx,cy,r,0,Math.PI*2); fs(ctx,el); ctx.fillStyle='#92400e'; ctx.beginPath(); ctx.arc(cx-r*0.28,cy-r*0.18,r*0.09,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(cx+r*0.28,cy-r*0.18,r*0.09,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(cx,cy+r*0.52,r*0.38,Math.PI,0,false); ctx.stroke(); }
  },
  { type: 'sun', name: 'Sun', category: 'Basic Shapes', icon: I('<circle cx="10" cy="10" r="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="10" y1="16" x2="10" y2="18"/><line x1="2" y1="10" x2="4" y2="10"/><line x1="16" y1="10" x2="18" y2="10"/><line x1="4" y1="4" x2="5.5" y2="5.5"/><line x1="14.5" y1="14.5" x2="16" y2="16"/><line x1="16" y1="4" x2="14.5" y2="5.5"/><line x1="5.5" y1="14.5" x2="4" y2="16"/>'), defaultSize: { width: 100, height: 100 },
    create: (el) => { el.style.fillColor='#fde68a'; el.style.strokeColor='#d97706'; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; const cx=x+w/2,cy=y+h/2,r=Math.min(w,h)/2,ir=r*0.42; for(let i=0;i<8;i++){const a=(i*Math.PI)/4; ctx.beginPath(); ctx.moveTo(cx+Math.cos(a)*ir*1.1,cy+Math.sin(a)*ir*1.1); ctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r); ctx.stroke();} ctx.beginPath(); ctx.arc(cx,cy,ir,0,Math.PI*2); fs(ctx,el); }
  },
  { type: 'text', name: 'Text', category: 'Basic Shapes', icon: I('<text x="3" y="15" font-size="14" stroke="none" fill="currentColor" font-weight="bold">T</text>'), defaultSize: { width: 120, height: 50 },
    create: (el) => { el.style.fillColor='transparent'; el.style.strokeColor='transparent'; el.label='Text'; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.font=`${el.style.fontSize||14}px ${el.style.fontFamily||'Inter'}`; ctx.fillStyle=el.style.fontColor||'#1a1d27'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(el.label||'Text',x+w/2,y+h/2); }
  },
  { type: 'line', name: 'Line', category: 'Basic Shapes', icon: I('<line x1="2" y1="10" x2="18" y2="10"/>'), defaultSize: { width: 120, height: 4 },
    create: (el) => { el.style.fillColor='transparent'; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.moveTo(x,y+h/2); ctx.lineTo(x+w,y+h/2); ctx.stroke(); }
  },
];
