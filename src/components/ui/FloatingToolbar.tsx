/**
 * FloatingToolbar.tsx
 *
 * Contextual floating toolbar that appears above selected elements.
 * Features smart positioning, collision avoidance, and direct styles/actions.
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Copy, Trash2, Lock, Unlock, 
  Grid, Layers, ChevronDown, AlignLeft, 
  AlignCenter, AlignRight, Check
} from 'lucide-react';
import { useCanvasStore } from '@/stores/canvas.store';
import { useSelectionStore } from '@/stores/selection.store';
import { useLayerStore } from '@/stores/layer.store';
import { EditorActions } from '@/editor/EditorActions';

const CURATED_COLORS = [
  { name: 'Transparent', value: 'transparent' },
  { name: 'White', value: '#ffffff' },
  { name: 'Red', value: '#f87171' },
  { name: 'Orange', value: '#fb923c' },
  { name: 'Yellow', value: '#facc15' },
  { name: 'Green', value: '#4ade80' },
  { name: 'Blue', value: '#60a5fa' },
  { name: 'Purple', value: '#c084fc' },
];

export const FloatingToolbar: React.FC = () => {
  const { selectedIds } = useSelectionStore();
  const { elements, viewport } = useCanvasStore();
  const { layers } = useLayerStore();

  const [position, setPosition] = useState<{ x: number; y: number; placeBelow: boolean }>({ x: 0, y: 0, placeBelow: false });
  const [activeDropdown, setActiveDropdown] = useState<'fill' | 'stroke' | 'layer' | null>(null);
  
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Filter out elements that are selected
  const selectedElements = elements.filter(el => selectedIds.has(el.id));
  const hasSelection = selectedElements.length > 0;
  
  // Calculate selected group states
  const hasGroup = selectedElements.some(el => el.type === 'group');
  const allLocked = selectedElements.length > 0 && selectedElements.every(el => el.locked);

  useEffect(() => {
    if (!hasSelection) return;

    // Calculate union bounding box in world space
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    selectedElements.forEach(el => {
      minX = Math.min(minX, el.bounds.x);
      minY = Math.min(minY, el.bounds.y);
      maxX = Math.max(maxX, el.bounds.x + el.bounds.width);
      maxY = Math.max(maxY, el.bounds.y + el.bounds.height);
    });

    // Project bounds to screen space using active viewport zoom/pan
    const screenMinX = minX * viewport.zoom + viewport.panX;
    const screenMinY = minY * viewport.zoom + viewport.panY;
    const screenMaxX = maxX * viewport.zoom + viewport.panX;
    const screenMaxY = maxY * viewport.zoom + viewport.panY;

    // Get toolbar width & height
    const toolbarW = toolbarRef.current?.offsetWidth || 340;
    const toolbarH = toolbarRef.current?.offsetHeight || 44;

    // Align toolbar horizontally centered with selection
    let x = screenMinX + (screenMaxX - screenMinX) / 2 - toolbarW / 2;
    
    // Bounds constraints to avoid clipping under panels
    const leftBound = 260; // width of left panel + margin
    const rightBound = window.innerWidth - 320 - toolbarW; // viewport - right panel width
    x = Math.max(leftBound, Math.min(x, rightBound));

    // Collision avoidance for top header boundary
    const spaceAbove = screenMinY - 60; // header space
    const placeBelow = spaceAbove < toolbarH + 16;
    
    const y = placeBelow 
      ? screenMaxY + 12 
      : screenMinY - toolbarH - 12;

    setPosition({ x, y, placeBelow });
  }, [selectedIds, elements, viewport, hasSelection]);

  // Click outside listener to close color/dropdown pickers
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  if (!hasSelection) return null;

  const handleFillColor = (color: string) => {
    selectedElements.forEach(el => {
      EditorActions.updateElement(el.id, {
        style: { ...el.style, fillColor: color }
      }, 'Update Fill Color');
    });
    setActiveDropdown(null);
  };

  const handleStrokeColor = (color: string) => {
    selectedElements.forEach(el => {
      EditorActions.updateElement(el.id, {
        style: { ...el.style, strokeColor: color }
      }, 'Update Stroke Color');
    });
    setActiveDropdown(null);
  };

  const handleAssignLayer = (layerId: string) => {
    selectedElements.forEach(el => {
      EditorActions.updateElement(el.id, { layerId }, 'Assign Layer');
    });
    setActiveDropdown(null);
  };

  const handleToggleLock = () => {
    const nextLocked = !allLocked;
    selectedElements.forEach(el => {
      EditorActions.updateElement(el.id, { locked: nextLocked }, nextLocked ? 'Lock Elements' : 'Unlock Elements');
    });
  };

  return (
    <div 
      ref={toolbarRef}
      style={{ top: `${position.y}px`, left: `${position.x}px` }}
      className="fixed z-[500] flex items-center gap-1.5 px-3 py-1.5 bg-surface-raised/85 backdrop-blur-md border border-border shadow-2xl rounded-xl transition-all duration-150 ease-out transform scale-100 animate-fade-in-up"
    >
      {/* Duplicate */}
      <button 
        onClick={() => EditorActions.duplicateSelected()}
        className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-sunken hover:text-text transition-colors"
        title="Duplicate (Ctrl+D)"
      >
        <Copy className="w-4 h-4" />
      </button>

      {/* Delete */}
      <button 
        onClick={() => EditorActions.deleteSelected()}
        className="p-1.5 rounded-lg text-text-secondary hover:bg-red-500/10 hover:text-red-400 transition-colors"
        title="Delete (Delete)"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="w-[1px] h-5 bg-border self-center mx-1" />

      {/* Fill Color Dropdown */}
      <div className="relative">
        <button
          onClick={() => setActiveDropdown(activeDropdown === 'fill' ? null : 'fill')}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-text-secondary hover:bg-surface-sunken hover:text-text transition-colors text-xs font-medium ${
            activeDropdown === 'fill' ? 'bg-surface-sunken text-text' : ''
          }`}
          title="Fill Color"
        >
          <div 
            className="w-3.5 h-3.5 rounded border border-border-subtle"
            style={{ backgroundColor: selectedElements[0]?.style.fillColor || 'transparent' }}
          />
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>

        {activeDropdown === 'fill' && (
          <div className="absolute left-0 mt-2 z-[600] min-w-[140px] bg-surface border border-border rounded-lg shadow-xl p-2 grid grid-cols-4 gap-1.5 animate-slide-in-down">
            {CURATED_COLORS.map(col => (
              <button
                key={col.value}
                onClick={() => handleFillColor(col.value)}
                className="w-6 h-6 rounded border border-border-subtle hover:scale-110 transition-transform relative flex items-center justify-center"
                style={{ backgroundColor: col.value === 'transparent' ? undefined : col.value }}
                title={col.name}
              >
                {col.value === 'transparent' && <div className="absolute inset-0 bg-red-500/20 rotate-45 h-0.5 w-full m-auto" />}
                {selectedElements[0]?.style.fillColor === col.value && <Check className="w-3.5 h-3.5 text-black drop-shadow" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stroke Color Dropdown */}
      <div className="relative">
        <button
          onClick={() => setActiveDropdown(activeDropdown === 'stroke' ? null : 'stroke')}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-text-secondary hover:bg-surface-sunken hover:text-text transition-colors text-xs font-medium ${
            activeDropdown === 'stroke' ? 'bg-surface-sunken text-text' : ''
          }`}
          title="Stroke Color"
        >
          <div 
            className="w-3.5 h-3.5 rounded border-2 border-border-subtle bg-transparent"
            style={{ borderColor: selectedElements[0]?.style.strokeColor || '#6366f1' }}
          />
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>

        {activeDropdown === 'stroke' && (
          <div className="absolute left-0 mt-2 z-[600] min-w-[140px] bg-surface border border-border rounded-lg shadow-xl p-2 grid grid-cols-4 gap-1.5 animate-slide-in-down">
            {CURATED_COLORS.map(col => (
              <button
                key={col.value}
                onClick={() => handleStrokeColor(col.value)}
                className="w-6 h-6 rounded border border-border-subtle hover:scale-110 transition-transform relative flex items-center justify-center"
                style={{ backgroundColor: col.value === 'transparent' ? undefined : col.value }}
                title={col.name}
              >
                {col.value === 'transparent' && <div className="absolute inset-0 bg-red-500/20 rotate-45 h-0.5 w-full m-auto" />}
                {selectedElements[0]?.style.strokeColor === col.value && <Check className="w-3.5 h-3.5 text-black drop-shadow" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-[1px] h-5 bg-border self-center mx-1" />

      {/* Alignment (Multiple items only) */}
      {selectedElements.length >= 2 && (
        <>
          <button 
            onClick={() => EditorActions.align('left')}
            className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-sunken hover:text-text transition-colors"
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => EditorActions.align('center')}
            className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-sunken hover:text-text transition-colors"
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button 
            onClick={() => EditorActions.align('right')}
            className="p-1.5 rounded-lg text-text-secondary hover:bg-surface-sunken hover:text-text transition-colors"
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-5 bg-border self-center mx-1" />
        </>
      )}

      {/* Grouping (Context dependent) */}
      {selectedElements.length >= 2 && !hasGroup && (
        <button 
          onClick={() => EditorActions.groupSelected()}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-text-secondary hover:bg-surface-sunken hover:text-text transition-colors text-xs font-medium"
          title="Group Shapes"
        >
          <Grid className="w-4 h-4" />
          <span>Group</span>
        </button>
      )}

      {selectedElements.length === 1 && selectedElements[0].type === 'group' && (
        <button 
          onClick={() => EditorActions.ungroupSelected()}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-text-secondary hover:bg-surface-sunken hover:text-text transition-colors text-xs font-medium"
          title="Ungroup Shapes"
        >
          <Grid className="w-4 h-4 text-accent" />
          <span>Ungroup</span>
        </button>
      )}

      {/* Lock/Unlock Toggle */}
      <button 
        onClick={handleToggleLock}
        className={`p-1.5 rounded-lg transition-colors ${
          allLocked 
            ? 'text-accent hover:bg-accent/10' 
            : 'text-text-secondary hover:bg-surface-sunken hover:text-text'
        }`}
        title={allLocked ? "Unlock Elements" : "Lock Elements"}
      >
        {allLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
      </button>

      {/* Assign Layer Dropdown */}
      <div className="relative">
        <button
          onClick={() => setActiveDropdown(activeDropdown === 'layer' ? null : 'layer')}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-text-secondary hover:bg-surface-sunken hover:text-text transition-colors text-xs font-medium ${
            activeDropdown === 'layer' ? 'bg-surface-sunken text-text' : ''
          }`}
          title="Assign to Layer"
        >
          <Layers className="w-4 h-4" />
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>

        {activeDropdown === 'layer' && (
          <div className="absolute right-0 mt-2 z-[600] min-w-[160px] bg-surface border border-border rounded-lg shadow-xl py-1 animate-slide-in-down max-h-[160px] overflow-y-auto">
            {layers.map(layer => (
              <button
                key={layer.id}
                onClick={() => handleAssignLayer(layer.id)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-left text-text hover:bg-surface-sunken transition-colors"
              >
                <span>{layer.name}</span>
                {selectedElements[0]?.layerId === layer.id && <Check className="w-3 h-3 text-accent" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
