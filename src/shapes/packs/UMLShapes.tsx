import React from 'react';
import { ShapeDefinition } from '../core/ShapeRegistry';

const fs = (ctx: CanvasRenderingContext2D, el: any) => {
  if (el.style.fillColor && el.style.fillColor !== 'transparent') ctx.fill();
  if (el.style.strokeWidth > 0 && el.style.strokeColor !== 'transparent') ctx.stroke();
};
const I = (d: string) => <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.4" dangerouslySetInnerHTML={{ __html: d }} />;

export const UMLShapesPack: ShapeDefinition[] = [
  // ── Class Diagrams ────────────────────────────────────────────────────────
  {
    type: 'uml_class', name: 'Class', category: 'UML',
    icon: I('<rect x="2" y="2" width="16" height="16"/><line x1="2" y1="7" x2="18" y2="7"/><line x1="2" y1="13" x2="18" y2="13"/>'),
    defaultSize: { width: 160, height: 140 }, create: (el) => { el.label='ClassName'; el.style.borderRadius=0; return el; },
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds; const hdr=32,mid=Math.floor(h*0.4);
      ctx.rect(x,y,w,h); fs(ctx,el);
      ctx.beginPath(); ctx.moveTo(x,y+hdr); ctx.lineTo(x+w,y+hdr); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x,y+hdr+mid); ctx.lineTo(x+w,y+hdr+mid); ctx.stroke();
      ctx.font='bold 12px Inter'; ctx.fillStyle=el.style.fontColor||'#1a1d27'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(el.label||'ClassName',x+w/2,y+hdr/2);
      ctx.font='10px Inter'; ctx.textAlign='left'; ctx.globalAlpha=0.5;
      ctx.fillText('+ attr: Type',x+6,y+hdr+mid/2);
      ctx.fillText('+ method()',x+6,y+hdr+mid+(h-hdr-mid)/2);
      ctx.globalAlpha=el.style.opacity;
    }
  },
  {
    type: 'uml_interface', name: 'Interface', category: 'UML',
    icon: I('<rect x="2" y="2" width="16" height="16" stroke-dasharray="3 2"/><line x1="2" y1="7" x2="18" y2="7"/><line x1="2" y1="13" x2="18" y2="13"/>'),
    defaultSize: { width: 160, height: 140 }, create: (el) => { el.label='IInterface'; el.style.borderRadius=0; return el; },
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds; const hdr=42;
      ctx.setLineDash([4,3]); ctx.rect(x,y,w,h); fs(ctx,el); ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(x,y+hdr); ctx.lineTo(x+w,y+hdr); ctx.stroke();
      ctx.font='italic 10px Inter'; ctx.fillStyle=el.style.fontColor||'#1a1d27'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('«interface»',x+w/2,y+hdr/3);
      ctx.font='bold 12px Inter'; ctx.fillText(el.label||'IInterface',x+w/2,y+hdr*0.72);
      ctx.font='10px Inter'; ctx.textAlign='left'; ctx.globalAlpha=0.5;
      ctx.fillText('+ method(): void',x+6,y+hdr+(h-hdr)/2);
      ctx.globalAlpha=el.style.opacity;
    }
  },
  {
    type: 'uml_abstract', name: 'Abstract Class', category: 'UML',
    icon: I('<rect x="2" y="2" width="16" height="16"/><line x1="2" y1="7" x2="18" y2="7"/><line x1="2" y1="13" x2="18" y2="13"/><text x="4" y="6" font-size="4" font-style="italic" stroke="none" fill="currentColor">«abstract»</text>'),
    defaultSize: { width: 160, height: 140 }, create: (el) => { el.label='AbstractClass'; return el; },
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds; const hdr=42, mid=Math.floor(h*0.38);
      ctx.rect(x,y,w,h); fs(ctx,el);
      ctx.beginPath(); ctx.moveTo(x,y+hdr); ctx.lineTo(x+w,y+hdr); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x,y+hdr+mid); ctx.lineTo(x+w,y+hdr+mid); ctx.stroke();
      ctx.font='italic 10px Inter'; ctx.fillStyle=el.style.fontColor||'#1a1d27'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('«abstract»',x+w/2,y+hdr/3);
      ctx.font='bold italic 12px Inter'; ctx.fillText(el.label||'AbstractClass',x+w/2,y+hdr*0.72);
      ctx.font='10px Inter'; ctx.textAlign='left'; ctx.globalAlpha=0.5;
      ctx.fillText('# attr: Type',x+6,y+hdr+mid/2);
      ctx.fillText('+ method()',x+6,y+hdr+mid+(h-hdr-mid)/2);
      ctx.globalAlpha=el.style.opacity;
    }
  },
  {
    type: 'uml_object', name: 'Object', category: 'UML',
    icon: I('<rect x="2" y="2" width="16" height="16"/><line x1="2" y1="8" x2="18" y2="8"/><line x1="5" y1="5" x2="15" y2="5"/>'),
    defaultSize: { width: 160, height: 100 }, create: (el) => { el.label='obj:Class'; return el; },
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds; const hdr=32;
      ctx.rect(x,y,w,h); fs(ctx,el);
      ctx.beginPath(); ctx.moveTo(x,y+hdr); ctx.lineTo(x+w,y+hdr); ctx.stroke();
      ctx.font='bold 12px Inter'; ctx.fillStyle=el.style.fontColor||'#1a1d27'; ctx.textAlign='center'; ctx.textBaseline='middle';
      // Underlined name
      const lbl=el.label||'obj:Class'; ctx.fillText(lbl,x+w/2,y+hdr/2);
      const m=ctx.measureText(lbl); ctx.beginPath(); ctx.moveTo(x+w/2-m.width/2,y+hdr/2+8); ctx.lineTo(x+w/2+m.width/2,y+hdr/2+8); ctx.stroke();
      ctx.font='10px Inter'; ctx.textAlign='left'; ctx.globalAlpha=0.5;
      ctx.fillText('attr = value',x+6,y+hdr+(h-hdr)/2); ctx.globalAlpha=el.style.opacity;
    }
  },
  {
    type: 'uml_note', name: 'Note', category: 'UML',
    icon: I('<polygon points="2,2 14,2 18,6 18,18 2,18"/><polyline points="14,2 14,6 18,6"/>'),
    defaultSize: { width: 140, height: 90 }, create: (el) => { el.label='Note text...'; return el; },
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds; const fold=22;
      ctx.moveTo(x,y); ctx.lineTo(x+w-fold,y); ctx.lineTo(x+w,y+fold); ctx.lineTo(x+w,y+h); ctx.lineTo(x,y+h); ctx.closePath(); fs(ctx,el);
      ctx.beginPath(); ctx.moveTo(x+w-fold,y); ctx.lineTo(x+w-fold,y+fold); ctx.lineTo(x+w,y+fold); ctx.stroke();
    }
  },
  {
    type: 'uml_package', name: 'Package', category: 'UML',
    icon: I('<rect x="2" y="6" width="16" height="12"/><rect x="2" y="3" width="7" height="3"/>'),
    defaultSize: { width: 180, height: 140 }, create: (el) => { el.label='Package'; return el; },
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds; const tabW=w*0.35,tabH=22;
      ctx.rect(x,y+tabH,w,h-tabH); fs(ctx,el);
      ctx.beginPath(); ctx.rect(x,y,tabW,tabH); fs(ctx,el);
      ctx.font='11px Inter'; ctx.fillStyle=el.style.fontColor||'#1a1d27'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(el.label||'Package',x+w/2,y+tabH+(h-tabH)/2);
    }
  },
  {
    type: 'uml_component', name: 'Component', category: 'UML',
    icon: I('<rect x="5" y="2" width="13" height="16"/><rect x="2" y="6" width="5" height="3"/><rect x="2" y="11" width="5" height="3"/>'),
    defaultSize: { width: 160, height: 100 }, create: (el) => { el.label='Component'; return el; },
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds; const ins=16,tw=12,th=8;
      ctx.rect(x+ins,y,w-ins,h); fs(ctx,el);
      [[h*0.28,tw,th],[h*0.62,tw,th]].forEach(([ty,tw2,th2]) => {
        ctx.beginPath(); ctx.rect(x,(y+ty as number)-th2/2,tw2,th2); fs(ctx,el);
      });
      ctx.font='12px Inter'; ctx.fillStyle=el.style.fontColor||'#1a1d27'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(el.label||'Component',x+ins+(w-ins)/2,y+h/2);
    }
  },
  {
    type: 'uml_actor', name: 'Actor', category: 'UML',
    icon: I('<circle cx="10" cy="4" r="2.5"/><line x1="10" y1="6.5" x2="10" y2="13"/><line x1="5" y1="9" x2="15" y2="9"/><line x1="10" y1="13" x2="6" y2="18"/><line x1="10" y1="13" x2="14" y2="18"/>'),
    defaultSize: { width: 60, height: 110 }, create: (el) => { el.style.fillColor='transparent'; el.label='Actor'; return el; },
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds; const cx=x+w/2,r=w*0.25;
      const bTop=y+r*2+4,bH=h*0.38;
      ctx.arc(cx,y+r,r,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx,bTop); ctx.lineTo(cx,bTop+bH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x+4,bTop+bH*0.3); ctx.lineTo(x+w-4,bTop+bH*0.3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx,bTop+bH); ctx.lineTo(x+4,y+h-14); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx,bTop+bH); ctx.lineTo(x+w-4,y+h-14); ctx.stroke();
      ctx.font='11px Inter'; ctx.fillStyle=el.style.fontColor||'#1a1d27'; ctx.textAlign='center'; ctx.textBaseline='top';
      ctx.fillText(el.label||'Actor',cx,y+h-12);
    }
  },
  {
    type: 'uml_usecase', name: 'Use Case', category: 'UML',
    icon: I('<ellipse cx="10" cy="10" rx="8" ry="5"/>'),
    defaultSize: { width: 160, height: 80 }, create: (el) => { el.label='Use Case'; return el; },
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds;
      ctx.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,Math.PI*2); fs(ctx,el);
      ctx.font='12px Inter'; ctx.fillStyle=el.style.fontColor||'#1a1d27'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(el.label||'Use Case',x+w/2,y+h/2);
    }
  },
  // ── UML Boundary / Control / Entity (Robustness) ──────────────────────────
  {
    type: 'uml_boundary', name: 'Boundary', category: 'UML',
    icon: I('<circle cx="12" cy="10" r="6"/><line x1="2" y1="5" x2="2" y2="15"/><line x1="2" y1="10" x2="6" y2="10"/>'),
    defaultSize: { width: 90, height: 90 }, create: (el) => { el.style.fillColor='transparent'; el.label='Boundary'; return el; },
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds; const r=Math.min(w,h)/2*0.7,cx=x+w/2+r*0.3,cy=y+h/2;
      ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x,cy-r); ctx.lineTo(x,cy+r); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x,cy); ctx.lineTo(cx-r,cy); ctx.stroke();
      ctx.font='10px Inter'; ctx.fillStyle=el.style.fontColor||'#1a1d27'; ctx.textAlign='center'; ctx.textBaseline='top';
      ctx.fillText(el.label||'Boundary',x+w/2,y+h-14);
    }
  },
  {
    type: 'uml_control', name: 'Control', category: 'UML',
    icon: I('<circle cx="10" cy="11" r="6"/><path d="M10,5 L13,2 M10,5 L7,2"/>'),
    defaultSize: { width: 80, height: 90 }, create: (el) => { el.style.fillColor='transparent'; el.label='Control'; return el; },
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds; const r=Math.min(w,h)/2*0.65,cx=x+w/2,cy=y+h/2+r*0.2;
      ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx,cy-r); ctx.lineTo(cx+r*0.4,y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx,cy-r); ctx.lineTo(cx-r*0.4,y); ctx.stroke();
      ctx.font='10px Inter'; ctx.fillStyle=el.style.fontColor||'#1a1d27'; ctx.textAlign='center'; ctx.textBaseline='top';
      ctx.fillText(el.label||'Control',cx,y+h-14);
    }
  },
  {
    type: 'uml_entity_node', name: 'Entity Node', category: 'UML',
    icon: I('<circle cx="10" cy="9" r="6"/><line x1="4" y1="17" x2="16" y2="17"/>'),
    defaultSize: { width: 80, height: 90 }, create: (el) => { el.style.fillColor='transparent'; el.label='Entity'; return el; },
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds; const r=Math.min(w,h)/2*0.6,cx=x+w/2,cy=y+h/2-r*0.2;
      ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx-r,cy+r); ctx.lineTo(cx+r,cy+r); ctx.stroke();
      ctx.font='10px Inter'; ctx.fillStyle=el.style.fontColor||'#1a1d27'; ctx.textAlign='center'; ctx.textBaseline='top';
      ctx.fillText(el.label||'Entity',cx,y+h-14);
    }
  },
  // ── State Diagram Shapes ──────────────────────────────────────────────────
  {
    type: 'uml_state', name: 'State', category: 'UML',
    icon: I('<rect x="2" y="4" width="16" height="12" rx="5"/>'),
    defaultSize: { width: 140, height: 70 }, create: (el) => { el.label='State'; el.style.borderRadius=20; return el; },
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds; ctx.roundRect(x,y,w,h,h/2); fs(ctx,el);
      ctx.font='12px Inter'; ctx.fillStyle=el.style.fontColor||'#1a1d27'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(el.label||'State',x+w/2,y+h/2);
    }
  },
  {
    type: 'uml_initial_state', name: 'Initial State', category: 'UML',
    icon: I('<circle cx="10" cy="10" r="7" fill="currentColor"/>'),
    defaultSize: { width: 50, height: 50 }, create: (el) => { el.style.fillColor='#1a1d27'; el.label=''; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.arc(x+w/2,y+h/2,Math.min(w,h)/2,0,Math.PI*2); fs(ctx,el); }
  },
  {
    type: 'uml_final_state', name: 'Final State', category: 'UML',
    icon: I('<circle cx="10" cy="10" r="7"/><circle cx="10" cy="10" r="4" fill="currentColor"/>'),
    defaultSize: { width: 55, height: 55 }, create: (el) => { el.label=''; return el; },
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds; const cx=x+w/2,cy=y+h/2,r=Math.min(w,h)/2;
      ctx.arc(cx,cy,r,0,Math.PI*2); fs(ctx,el);
      ctx.beginPath(); ctx.arc(cx,cy,r*0.55,0,Math.PI*2); ctx.fillStyle=el.style.strokeColor||'#1a1d27'; ctx.fill();
    }
  },
  {
    type: 'uml_choice', name: 'Choice', category: 'UML',
    icon: I('<polygon points="10,2 18,10 10,18 2,10"/>'),
    defaultSize: { width: 60, height: 60 }, create: (el) => { el.label=''; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.moveTo(x+w/2,y); ctx.lineTo(x+w,y+h/2); ctx.lineTo(x+w/2,y+h); ctx.lineTo(x,y+h/2); ctx.closePath(); fs(ctx,el); }
  },
  {
    type: 'uml_fork', name: 'Fork / Join', category: 'UML',
    icon: I('<rect x="2" y="8" width="16" height="4" fill="currentColor"/>'),
    defaultSize: { width: 160, height: 14 }, create: (el) => { el.style.fillColor='#1a1d27'; el.label=''; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.rect(x,y,w,h); fs(ctx,el); }
  },
  // ── Sequence Diagram Shapes ────────────────────────────────────────────────
  {
    type: 'uml_lifeline', name: 'Lifeline', category: 'UML',
    icon: I('<rect x="5" y="2" width="10" height="6"/><line x1="10" y1="8" x2="10" y2="18" stroke-dasharray="3 2"/>'),
    defaultSize: { width: 100, height: 180 }, create: (el) => { el.label='Object'; return el; },
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds; const boxH=36,cx=x+w/2;
      ctx.rect(x+w*0.1,y,w*0.8,boxH); fs(ctx,el);
      ctx.font='12px Inter'; ctx.fillStyle=el.style.fontColor||'#1a1d27'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(el.label||'Object',cx,y+boxH/2);
      ctx.setLineDash([6,4]); ctx.beginPath(); ctx.moveTo(cx,y+boxH); ctx.lineTo(cx,y+h); ctx.stroke(); ctx.setLineDash([]);
    }
  },
  {
    type: 'uml_activation', name: 'Activation Box', category: 'UML',
    icon: I('<rect x="7" y="2" width="6" height="16"/>'),
    defaultSize: { width: 20, height: 100 }, create: (el) => { el.style.borderRadius=0; el.label=''; return el; },
    render: (ctx, el) => { const {x,y,width:w,height:h}=el.bounds; ctx.rect(x,y,w,h); fs(ctx,el); }
  },
  {
    type: 'uml_destruction', name: 'Destruction', category: 'UML',
    icon: I('<line x1="4" y1="4" x2="16" y2="16"/><line x1="16" y1="4" x2="4" y2="16"/>'),
    defaultSize: { width: 60, height: 60 }, create: (el) => { el.style.fillColor='transparent'; el.label=''; return el; },
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds;
      ctx.moveTo(x+w*0.15,y+h*0.15); ctx.lineTo(x+w*0.85,y+h*0.85); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x+w*0.85,y+h*0.15); ctx.lineTo(x+w*0.15,y+h*0.85); ctx.stroke();
    }
  },
  // ── Interface Notations ────────────────────────────────────────────────────
  {
    type: 'uml_provided', name: 'Provided Iface', category: 'UML',
    icon: I('<line x1="10" y1="2" x2="10" y2="10"/><circle cx="10" cy="14" r="5"/>'),
    defaultSize: { width: 50, height: 90 }, create: (el) => { el.label=''; return el; },
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds; const cx=x+w/2,r=Math.min(w,h)*0.28;
      ctx.moveTo(cx,y); ctx.lineTo(cx,y+h-r*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx,y+h-r,r,0,Math.PI*2); fs(ctx,el);
    }
  },
  {
    type: 'uml_required', name: 'Required Iface', category: 'UML',
    icon: I('<line x1="10" y1="2" x2="10" y2="10"/><path d="M5,15 a5,5 0 0,0 10,0"/>'),
    defaultSize: { width: 50, height: 90 }, create: (el) => { el.style.fillColor='transparent'; el.label=''; return el; },
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds; const cx=x+w/2,r=Math.min(w,h)*0.28;
      ctx.moveTo(cx,y); ctx.lineTo(cx,y+h-r*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx,y+h-r,r,0,Math.PI); ctx.stroke();
    }
  },
  // ── Frame / Constraint ────────────────────────────────────────────────────
  {
    type: 'uml_frame', name: 'Frame', category: 'UML',
    icon: I('<rect x="2" y="2" width="16" height="16"/><polygon points="2,2 8,2 10,5 8,8 2,8"/>'),
    defaultSize: { width: 220, height: 160 }, create: (el) => { el.label='seq'; return el; },
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds; const tabW=Math.min(w*0.3,70),tabH=28;
      ctx.rect(x,y,w,h); fs(ctx,el);
      ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+tabW,y); ctx.lineTo(x+tabW+8,y+tabH/2); ctx.lineTo(x+tabW,y+tabH); ctx.lineTo(x,y+tabH); ctx.closePath(); ctx.fillStyle='rgba(99,102,241,0.15)'; ctx.fill(); ctx.stroke();
      ctx.font='bold 11px Inter'; ctx.fillStyle=el.style.fontColor||'#1a1d27'; ctx.textAlign='left'; ctx.textBaseline='middle';
      ctx.fillText(el.label||'seq',x+6,y+tabH/2);
    }
  },
  {
    type: 'uml_constraint', name: 'Constraint', category: 'UML',
    icon: I('<text x="2" y="14" font-size="10" stroke="none" fill="currentColor">{constraint}</text>'),
    defaultSize: { width: 140, height: 40 }, create: (el) => { el.style.fillColor='transparent'; el.style.strokeColor='transparent'; el.label='{constraint}'; return el; },
    render: (ctx, el) => {
      const {x,y,width:w,height:h}=el.bounds;
      ctx.font=`italic ${el.style.fontSize||13}px Inter`; ctx.fillStyle=el.style.fontColor||'#1a1d27';
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(el.label||'{constraint}',x+w/2,y+h/2);
    }
  },
];
