/**
 * PropertiesPanel.tsx
 *
 * Redesigned right panel mimicking Figma's properties inspector.
 * Sections: Layout, Text, Fill, Stroke, Effects, Connector.
 */

import React, { useCallback } from 'react';
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  MousePointer2,
  BringToFront,
  SendToBack,
  AlignVerticalJustifyCenter,
  AlignHorizontalJustifyCenter,
} from 'lucide-react';
import { useSelectionStore } from '@/stores/selection.store';
import { useCanvasStore } from '@/stores/canvas.store';
import { useEditorStore } from '@/stores/editor.store';
import { EditorActions } from '@/editor/EditorActions';
import type { CanvasElement, ElementStyle, Connector, ConnectorType } from '@/types/canvas.types';

// ─── Shared UI Components ──────────────────────────────────────────────────

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="px-4 py-3 border-b border-border-subtle">
    <div className="text-xs font-semibold text-text mb-2">{title}</div>
    <div className="flex flex-col gap-2">{children}</div>
  </div>
);

const PropertyRow: React.FC<{ label?: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center gap-2 w-full">
    {label && <span className="w-12 text-2xs text-text-tertiary flex-shrink-0">{label}</span>}
    <div className="flex-1 flex gap-2">{children}</div>
  </div>
);

const InputScrubber: React.FC<{
  value: string | number;
  icon?: React.ReactNode;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
}> = ({ value, icon, onChange, type = 'text', className = '' }) => (
  <div className={`relative flex items-center bg-surface-sunken border border-border-subtle rounded hover:border-border-strong focus-within:border-accent focus-within:ring-1 focus-within:ring-accent transition-colors ${className}`}>
    {icon && <span className="absolute left-2 text-text-tertiary pointer-events-none">{icon}</span>}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-transparent text-xs text-text py-1.5 outline-none ${icon ? 'pl-7 pr-2' : 'px-2'}`}
    />
  </div>
);

const ColorInput: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <div className="flex items-center gap-2">
    <div className="relative w-6 h-6 rounded border border-border flex-shrink-0 cursor-pointer overflow-hidden shadow-inner" style={{ backgroundColor: value || 'transparent' }}>
      <input type="color" value={value && value.startsWith('#') ? value : '#000000'} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
    </div>
    <InputScrubber value={value || ''} onChange={onChange} className="flex-1" />
  </div>
);

const Select: React.FC<{
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}> = ({ value, options, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full bg-surface-sunken border border-border-subtle rounded text-xs text-text py-1.5 px-2 outline-none hover:border-border-strong focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
  >
    {options.map((opt) => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
);

const ToggleButton: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-1.5 px-2 text-2xs font-semibold rounded border transition-all ${
      active
        ? 'bg-accent/10 border-accent/30 text-accent font-bold'
        : 'bg-surface-sunken border-border-subtle text-text-secondary hover:text-text hover:bg-surface'
    }`}
  >
    {label}
  </button>
);

const TYPE_OPTIONS = [
  { value: 'straight', label: 'Straight' },
  { value: 'orthogonal', label: 'Orthogonal' },
  { value: 'curved', label: 'Curved' },
];

const DASH_OPTIONS = [
  { value: 'solid', label: 'Solid' },
  { value: '5,5', label: 'Dashed' },
  { value: '2,3', label: 'Dotted' },
];

// ─── Main Panel ────────────────────────────────────────────────────────────

export const PropertiesPanel: React.FC = () => {
  const selectedIds = useSelectionStore(state => state.selectedIds);
  const elements = useCanvasStore(state => state.elements);
  const connectors = useCanvasStore(state => state.connectors);
  const propertiesPanelCollapsed = useEditorStore(state => state.propertiesPanelCollapsed);

  if (propertiesPanelCollapsed) return null;

  const selectedElements = elements.filter((el) => selectedIds.has(el.id));
  const selectedConnectors = connectors.filter((c) => selectedIds.has(c.id));

  const singleEl = selectedElements.length === 1 ? selectedElements[0] : null;
  const singleConn = selectedConnectors.length === 1 ? selectedConnectors[0] : null;

  if (selectedElements.length === 0 && selectedConnectors.length === 0) {
    return (
      <aside className="w-properties flex flex-col bg-[var(--color-panel-bg)] border-l border-border shrink-0 animate-slide-in-right justify-center items-center p-6 text-center">
         <div className="w-12 h-12 rounded-xl bg-surface-overlay flex items-center justify-center mb-3">
           <MousePointer2 className="w-6 h-6 text-text-tertiary" />
         </div>
         <p className="text-xs text-text-secondary">No selection</p>
         <p className="text-2xs text-text-tertiary mt-1">Select an object to edit its properties</p>
      </aside>
    );
  }

  // Element Value Extractors
  const getValue = (extractor: (el: CanvasElement) => any) => {
    if (selectedElements.length === 0) return undefined;
    const val = extractor(selectedElements[0]);
    if (selectedElements.every((el) => extractor(el) === val)) return val;
    return 'Mixed';
  };

  const x = getValue((el) => el.bounds.x);
  const y = getValue((el) => el.bounds.y);
  const w = getValue((el) => el.bounds.width);
  const h = getValue((el) => el.bounds.height);
  const rotation = getValue((el) => el.rotation || 0);

  const fillColor = getValue((el) => el.style.fillColor);
  const strokeColor = getValue((el) => el.style.strokeColor);
  const strokeWidth = getValue((el) => el.style.strokeWidth);
  const opacity = getValue((el) => el.style.opacity);
  const fontColor = getValue((el) => el.style.fontColor || '#1a1d27');

  const hasText = selectedElements.some(el => el.type === 'text' || el.label);
  const fontSize = hasText ? getValue(el => el.style.fontSize) : 14;
  const textAlign = hasText ? getValue(el => el.style.textAlign) : 'center';

  // Connector Value Extractors
  const getConnValue = (extractor: (c: Connector) => any) => {
    if (selectedConnectors.length === 0) return undefined;
    const val = extractor(selectedConnectors[0]);
    if (selectedConnectors.every((c) => extractor(c) === val)) return val;
    return 'Mixed';
  };

  const connType = getConnValue((c) => c.type);
  const connStrokeColor = getConnValue((c) => c.style.strokeColor);
  const connStrokeWidth = getConnValue((c) => c.style.strokeWidth);
  const connDash = getConnValue((c) => c.style.strokeDasharray || 'solid');
  const startArrow = getConnValue((c) => c.style.startArrow);
  const endArrow = getConnValue((c) => c.style.endArrow);
  const connLabel = getConnValue((c) => c.label);

  // Updaters for Elements
  const updateBounds = (field: 'x'|'y'|'width'|'height', valStr: string) => {
    const val = parseFloat(valStr);
    if (isNaN(val)) return;
    for (const el of selectedElements) {
      EditorActions.updateElement(el.id, { bounds: { ...el.bounds, [field]: val } }, `Update ${field}`);
    }
  };

  const updateStyle = (updates: Partial<ElementStyle>) => {
    for (const el of selectedElements) {
      EditorActions.updateElement(el.id, { style: { ...el.style, ...updates } }, 'Update Style');
    }
  };

  // Updaters for Connectors
  const updateConnectorStyle = (updates: Partial<Connector['style']>) => {
    for (const c of selectedConnectors) {
      EditorActions.updateConnector(c.id, { style: { ...c.style, ...updates } }, 'Update Connector Style');
    }
  };

  const updateConnectorType = (type: ConnectorType) => {
    for (const c of selectedConnectors) {
      EditorActions.updateConnector(c.id, { type }, 'Update Connector Type');
    }
  };

  const updateConnectorLabel = (label: string) => {
    for (const c of selectedConnectors) {
      EditorActions.updateConnector(c.id, { label }, 'Update Connector Label');
    }
  };

  const updateConnectorDash = (val: string) => {
    const strokeDasharray = val === 'solid' ? undefined : val;
    for (const c of selectedConnectors) {
      EditorActions.updateConnector(c.id, { style: { ...c.style, strokeDasharray } }, 'Update Connector Dash');
    }
  };

  // Header display string
  let headerLabel = '';
  if (selectedElements.length > 0 && selectedConnectors.length === 0) {
    headerLabel = singleEl ? `${singleEl.type.charAt(0).toUpperCase() + singleEl.type.slice(1)}` : `${selectedElements.length} items selected`;
  } else if (selectedConnectors.length > 0 && selectedElements.length === 0) {
    headerLabel = singleConn ? `Connector` : `${selectedConnectors.length} connectors selected`;
  } else {
    headerLabel = `${selectedElements.length + selectedConnectors.length} items selected`;
  }

  return (
    <aside className="w-properties flex flex-col bg-[var(--color-panel-bg)] border-l border-border overflow-y-auto overflow-x-hidden shrink-0 animate-slide-in-right">
      
      {/* Selection Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border-subtle bg-surface-sunken">
        <span className="text-xs font-semibold text-text truncate">
          {headerLabel}
        </span>
      </div>

      {/* ─── Element properties ─── */}
      {selectedElements.length > 0 && (
        <>
          {/* Layout Section */}
          <Section title="Layout">
            {selectedElements.length > 1 && (
               <PropertyRow>
                 <div className="flex w-full items-center justify-between border border-border-subtle rounded bg-surface-sunken p-0.5">
                   <button onClick={() => EditorActions.align('left')} className="p-1 rounded hover:bg-surface" title="Align Left"><AlignLeft className="w-3.5 h-3.5" /></button>
                   <button onClick={() => EditorActions.align('center')} className="p-1 rounded hover:bg-surface" title="Align Center"><AlignCenter className="w-3.5 h-3.5" /></button>
                   <button onClick={() => EditorActions.align('right')} className="p-1 rounded hover:bg-surface" title="Align Right"><AlignRight className="w-3.5 h-3.5" /></button>
                   <div className="w-[1px] h-4 bg-border mx-1" />
                   <button onClick={() => EditorActions.align('top')} className="p-1 rounded hover:bg-surface rotate-90" title="Align Top"><AlignLeft className="w-3.5 h-3.5" /></button>
                   <button onClick={() => EditorActions.align('middle')} className="p-1 rounded hover:bg-surface rotate-90" title="Align Middle"><AlignCenter className="w-3.5 h-3.5" /></button>
                   <button onClick={() => EditorActions.align('bottom')} className="p-1 rounded hover:bg-surface rotate-90" title="Align Bottom"><AlignRight className="w-3.5 h-3.5" /></button>
                 </div>
               </PropertyRow>
            )}
            <PropertyRow>
              <InputScrubber icon={<span className="text-2xs font-bold">X</span>} value={x} onChange={(v) => updateBounds('x', v)} />
              <InputScrubber icon={<span className="text-2xs font-bold">Y</span>} value={y} onChange={(v) => updateBounds('y', v)} />
            </PropertyRow>
            <PropertyRow>
              <InputScrubber icon={<span className="text-2xs font-bold">W</span>} value={w} onChange={(v) => updateBounds('width', v)} />
              <InputScrubber icon={<span className="text-2xs font-bold">H</span>} value={h} onChange={(v) => updateBounds('height', v)} />
            </PropertyRow>
            <PropertyRow>
              <InputScrubber icon={<span className="text-2xs font-bold">∠</span>} value={rotation} onChange={(v) => {
                const val = parseFloat(v);
                if(!isNaN(val)) selectedElements.forEach(el => EditorActions.updateElement(el.id, { rotation: val }, 'Rotate'));
              }} />
              <InputScrubber icon={<span className="text-2xs font-bold">%</span>} value={opacity !== 'Mixed' ? Math.round(opacity * 100) : 'Mixed'} onChange={(v) => {
                const val = parseFloat(v);
                if(!isNaN(val)) updateStyle({ opacity: Math.max(0, Math.min(1, val / 100)) });
              }} />
            </PropertyRow>
          </Section>

          {/* Typography Section (Only if text applies) */}
          {hasText && (
            <Section title="Text">
              <PropertyRow>
                 <InputScrubber icon={<span className="text-2xs font-bold">A</span>} value={fontSize} onChange={v => updateStyle({ fontSize: parseFloat(v) })} className="w-1/2" />
                 <div className="flex items-center border border-border-subtle rounded bg-surface-sunken p-0.5">
                   <button onClick={() => updateStyle({ textAlign: 'left' })} className={`p-1 rounded ${textAlign === 'left' ? 'bg-surface-overlay shadow-sm' : 'hover:bg-surface'}`}>
                     <AlignLeft className="w-3.5 h-3.5" />
                   </button>
                   <button onClick={() => updateStyle({ textAlign: 'center' })} className={`p-1 rounded ${textAlign === 'center' ? 'bg-surface-overlay shadow-sm' : 'hover:bg-surface'}`}>
                     <AlignCenter className="w-3.5 h-3.5" />
                   </button>
                   <button onClick={() => updateStyle({ textAlign: 'right' })} className={`p-1 rounded ${textAlign === 'right' ? 'bg-surface-overlay shadow-sm' : 'hover:bg-surface'}`}>
                     <AlignRight className="w-3.5 h-3.5" />
                   </button>
                 </div>
              </PropertyRow>
            </Section>
          )}

          {/* Fill Section */}
          <Section title="Fill">
            <PropertyRow>
              <ColorInput value={fillColor === 'Mixed' ? '' : fillColor} onChange={(v) => updateStyle({ fillColor: v })} />
            </PropertyRow>
          </Section>

          {/* Stroke Section */}
          <Section title="Stroke">
            <PropertyRow>
              <ColorInput value={strokeColor === 'Mixed' ? '' : strokeColor} onChange={(v) => updateStyle({ strokeColor: v })} />
            </PropertyRow>
            <PropertyRow label="Width">
              <InputScrubber value={strokeWidth} onChange={(v) => updateStyle({ strokeWidth: parseFloat(v) || 0 })} />
            </PropertyRow>
          </Section>

          {/* Text Color Section */}
          <Section title="Text Color">
            <PropertyRow>
              <ColorInput
                value={fontColor === 'Mixed' ? '#1a1d27' : fontColor}
                onChange={(v) => updateStyle({ fontColor: v })}
              />
            </PropertyRow>
          </Section>
        </>
      )}

      {/* ─── Connector properties ─── */}
      {selectedConnectors.length > 0 && (
        <>
          <Section title="Connector">
            <PropertyRow label="Label">
              <InputScrubber
                value={connLabel === 'Mixed' ? 'Mixed' : connLabel}
                onChange={(v) => updateConnectorLabel(v)}
              />
            </PropertyRow>
            <PropertyRow label="Type">
              <Select
                value={connType === 'Mixed' ? 'straight' : connType}
                options={TYPE_OPTIONS}
                onChange={(v) => updateConnectorType(v as ConnectorType)}
              />
            </PropertyRow>
          </Section>

          <Section title="Line Style">
            <PropertyRow label="Color">
              <ColorInput
                value={connStrokeColor === 'Mixed' ? '' : connStrokeColor}
                onChange={(v) => updateConnectorStyle({ strokeColor: v })}
              />
            </PropertyRow>
            <PropertyRow label="Width">
              <InputScrubber
                value={connStrokeWidth === 'Mixed' ? '' : connStrokeWidth}
                onChange={(v) => updateConnectorStyle({ strokeWidth: parseFloat(v) || 1 })}
              />
            </PropertyRow>
            <PropertyRow label="Dash">
              <Select
                value={connDash === 'Mixed' ? 'solid' : connDash}
                options={DASH_OPTIONS}
                onChange={(v) => updateConnectorDash(v)}
              />
            </PropertyRow>
          </Section>

          <Section title="Arrowheads">
            <PropertyRow>
              <ToggleButton
                label="Start Arrow"
                active={startArrow === true}
                onClick={() => updateConnectorStyle({ startArrow: !startArrow })}
              />
              <ToggleButton
                label="End Arrow"
                active={endArrow === true}
                onClick={() => updateConnectorStyle({ endArrow: !endArrow })}
              />
            </PropertyRow>
          </Section>
        </>
      )}

    </aside>
  );
};
