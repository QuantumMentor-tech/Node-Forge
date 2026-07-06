/**
 * Sidebar.tsx — Professional Dynamic Shape Library + Scratchpad
 *
 * Features:
 *  ✦ Scratchpad: pin selected canvas elements for quick reuse (drag back to canvas)
 *  ✦ Collapsible shape category sections
 *  ✦ Live search with auto-expand
 *  ✦ Drag-and-drop onto canvas
 *  ✦ Click-to-add at viewport center
 *  ✦ Shape count per category
 */

import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import {
  Search,
  X,
  ChevronDown,
  ChevronRight,
  Layers,
  Bookmark,
  Trash2,
  Plus,
  Clock,
  Pencil,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

import { ShapeRegistry, ShapeDefinition, ShapeCategory } from '@/shapes';
import { useCanvasStore } from '@/stores/canvas.store';
import { useSelectionStore } from '@/stores/selection.store';
import { useScratchpadStore, ScratchpadItem } from '@/stores/scratchpad.store';
import { useLayerStore } from '@/stores/layer.store';
import { EditorActions } from '@/editor/EditorActions';
import { createElement } from '@/utils/element.factory';

// ─── Shape Card ───────────────────────────────────────────────────────────────

interface ShapeCardProps {
  shape: ShapeDefinition;
  onClickAdd: (type: string) => void;
}

const ShapeCard: React.FC<ShapeCardProps> = React.memo(({ shape, onClickAdd }) => {
  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
    e.dataTransfer.setData('application/nodeforge-shape', shape.type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <button
      title={`${shape.name}\nClick to add • Drag to place`}
      draggable
      onDragStart={handleDragStart}
      onClick={() => onClickAdd(shape.type)}
      className="
        group relative flex flex-col items-center justify-center gap-1.5
        p-2 rounded-md border border-transparent
        hover:border-accent/25 hover:bg-accent/5
        active:scale-95 active:border-accent/40
        transition-all duration-100 cursor-grab active:cursor-grabbing
        select-none
      "
    >
      <span className="text-text-tertiary group-hover:text-accent transition-colors duration-100 flex-shrink-0">
        {shape.icon}
      </span>
      <span className="
        text-[9px] font-medium leading-tight
        text-text-tertiary group-hover:text-text-secondary
        transition-colors duration-100
        truncate w-full text-center
      ">
        {shape.name}
      </span>
    </button>
  );
});
ShapeCard.displayName = 'ShapeCard';

// ─── Category Panel ───────────────────────────────────────────────────────────

interface CategoryPanelProps {
  category: ShapeCategory;
  isOpen: boolean;
  onToggle: () => void;
  onClickAdd: (type: string) => void;
}

const CategoryPanel: React.FC<CategoryPanelProps> = React.memo(
  ({ category, isOpen, onToggle, onClickAdd }) => (
    <div className="border-b border-border/50 last:border-b-0">
      <button
        onClick={onToggle}
        className="
          w-full flex items-center justify-between
          px-3 py-2 text-left
          hover:bg-white/3 transition-colors duration-100
          group select-none
        "
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {isOpen
            ? <ChevronDown className="w-3 h-3 text-text-tertiary flex-shrink-0" />
            : <ChevronRight className="w-3 h-3 text-text-tertiary flex-shrink-0" />
          }
          <span className="text-[10px] font-semibold text-text-secondary tracking-wider uppercase">
            {category.name}
          </span>
        </div>
        <span className="
          text-[9px] text-text-tertiary
          bg-white/5 rounded px-1 py-0.5
          group-hover:bg-accent/10 group-hover:text-accent
          transition-colors duration-100
        ">
          {category.shapes.length}
        </span>
      </button>

      {isOpen && (
        <div className="px-2 pb-2 grid grid-cols-3 gap-1">
          {category.shapes.map((shape) => (
            <ShapeCard key={shape.type} shape={shape} onClickAdd={onClickAdd} />
          ))}
        </div>
      )}
    </div>
  )
);
CategoryPanel.displayName = 'CategoryPanel';

// ─── Scratchpad Item Card ─────────────────────────────────────────────────────

interface ScratchpadCardProps {
  item: ScratchpadItem;
  onRemove: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

const ScratchpadCard: React.FC<ScratchpadCardProps> = React.memo(
  ({ item, onRemove, onDragStart }) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(item.name);
    const { renameItem } = useScratchpadStore();
    const inputRef = useRef<HTMLInputElement>(null);

    const commitRename = () => {
      if (draft.trim()) renameItem(item.id, draft.trim());
      else setDraft(item.name);
      setEditing(false);
    };

    useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

    return (
      <div
        draggable
        onDragStart={onDragStart}
        title={`${item.name}\nDrag to canvas`}
        className="
          group relative flex items-center gap-1.5
          px-2 py-1.5 rounded-md
          border border-border/40 hover:border-accent/30
          bg-surface-sunken/60 hover:bg-accent/5
          cursor-grab active:cursor-grabbing
          transition-all duration-100 select-none
        "
      >
        {/* Colour swatch representing the shape */}
        <div
          className="w-5 h-5 rounded flex-shrink-0 border border-border/40"
          style={{
            backgroundColor: item.element.style.fillColor === 'transparent'
              ? 'rgba(99,102,241,0.12)'
              : item.element.style.fillColor,
            borderColor: item.element.style.strokeColor === 'transparent'
              ? undefined
              : item.element.style.strokeColor,
          }}
        />

        {/* Name / rename input */}
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') { setDraft(item.name); setEditing(false); } }}
            className="flex-1 min-w-0 text-[10px] bg-surface-sunken border border-accent rounded px-1 outline-none text-text"
          />
        ) : (
          <span className="flex-1 min-w-0 text-[10px] text-text-secondary truncate">
            {item.name}
          </span>
        )}

        {/* Action buttons */}
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
            className="p-0.5 rounded hover:bg-accent/10 text-text-tertiary hover:text-accent transition-colors"
            title="Rename"
          >
            <Pencil className="w-2.5 h-2.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="p-0.5 rounded hover:bg-red-500/10 text-text-tertiary hover:text-red-400 transition-colors"
            title="Remove"
          >
            <Trash2 className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>
    );
  }
);
ScratchpadCard.displayName = 'ScratchpadCard';

// ─── Scratchpad Panel ─────────────────────────────────────────────────────────

const ScratchpadPanel: React.FC = () => {
  const { items, addItem, removeItem, clearAll } = useScratchpadStore();
  const [isOpen, setIsOpen] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);

  /** Add currently selected element(s) to scratchpad */
  const handleAddSelected = useCallback(() => {
    const { elements } = useCanvasStore.getState();
    const { selectedIds } = useSelectionStore.getState();
    if (selectedIds.size === 0) return;
    selectedIds.forEach((id) => {
      const el = elements.find((e) => e.id === id);
      if (el) addItem(el);
    });
  }, [addItem]);

  /** Handle drop of element data from canvas onto the scratchpad */
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      const raw = e.dataTransfer.getData('application/nodeforge-element');
      if (!raw) return;
      try {
        const el = JSON.parse(raw);
        addItem(el);
      } catch {
        // ignore malformed data
      }
    },
    [addItem]
  );

  /** Drag a scratchpad item back onto the canvas */
  const handleItemDragStart = useCallback(
    (e: React.DragEvent, item: ScratchpadItem) => {
      // Send the full element JSON so CanvasEngine can reconstitute it
      e.dataTransfer.setData(
        'application/nodeforge-element',
        JSON.stringify(item.element)
      );
      e.dataTransfer.effectAllowed = 'copy';
    },
    []
  );

  return (
    <div className="border-b border-border shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
        >
          {isOpen
            ? <ChevronDown className="w-3 h-3 text-accent" />
            : <ChevronRight className="w-3 h-3 text-accent" />
          }
          <Bookmark className="w-3 h-3 text-accent" />
          <span className="text-[10px] font-bold text-accent tracking-wide uppercase">
            Scratchpad
          </span>
          {items.length > 0 && (
            <span className="text-[9px] bg-accent/20 text-accent rounded px-1 py-0.5">
              {items.length}
            </span>
          )}
        </button>

        <div className="flex items-center gap-1">
          {/* Add selected */}
          <button
            onClick={handleAddSelected}
            title="Add selected element(s) to Scratchpad"
            className="
              p-1 rounded text-text-tertiary
              hover:text-accent hover:bg-accent/10
              transition-colors duration-100
            "
          >
            <Plus className="w-3 h-3" />
          </button>
          {/* Clear all */}
          {items.length > 0 && (
            <button
              onClick={clearAll}
              title="Clear scratchpad"
              className="
                p-1 rounded text-text-tertiary
                hover:text-red-400 hover:bg-red-400/10
                transition-colors duration-100
              "
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      {isOpen && (
        <div className="px-2 pb-2">
          {items.length === 0 ? (
            /* Drop zone — accepts `application/nodeforge-element` from canvas */
            <div
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`
                flex flex-col items-center justify-center gap-1.5
                rounded-md border-2 border-dashed
                py-4 px-2 cursor-pointer
                transition-all duration-150
                ${isDragOver
                  ? 'border-accent bg-accent/10 scale-[0.98]'
                  : 'border-border/40 hover:border-accent/30 hover:bg-white/2'
                }
              `}
            >
              <Clock className="w-4 h-4 text-text-tertiary opacity-50" />
              <span className="text-[9px] text-text-tertiary text-center leading-relaxed">
                Drag elements here
              </span>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`flex flex-col gap-1 transition-all duration-150 rounded-md p-1 ${isDragOver ? 'bg-accent/10 ring-1 ring-accent/30' : ''}`}
            >
              {items.map((item) => (
                <ScratchpadCard
                  key={item.id}
                  item={item}
                  onRemove={() => removeItem(item.id)}
                  onDragStart={(e) => handleItemDragStart(e, item)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Layers Panel ─────────────────────────────────────────────────────────────

const LayersPanel: React.FC = () => {
  const { layers, activeLayerId, addLayer, removeLayer, updateLayer, reorderLayer, setActiveLayer } = useLayerStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAddLayer = () => {
    const nextNum = layers.length + 1;
    addLayer(`Layer ${nextNum}`);
  };

  const sortedLayers = useMemo(() => {
    return [...layers].sort((a, b) => b.order - a.order);
  }, [layers]);

  const handleRename = (id: string, name: string) => {
    if (name.trim()) {
      updateLayer(id, { name: name.trim() });
    }
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Add Layer Bar */}
      <div className="px-3 py-2 border-b border-border shrink-0 flex items-center justify-between bg-surface-sunken">
        <span className="text-[10px] font-bold text-text-secondary uppercase">Layers</span>
        <button
          onClick={handleAddLayer}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-accent/15 text-accent hover:bg-accent/25 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Add Layer
        </button>
      </div>

      {/* Layer List */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
        {sortedLayers.map((layer, index) => {
          const isActive = layer.id === activeLayerId;
          const isFirst = index === 0;
          const isLast = index === sortedLayers.length - 1;

          return (
            <div
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              className={`
                group flex items-center justify-between gap-1.5 p-1.5 rounded-md border transition-all cursor-pointer select-none
                ${isActive
                  ? 'bg-accent/10 border-accent/30 text-accent font-semibold'
                  : 'bg-surface-sunken border-border/40 text-text-secondary hover:border-accent/20 hover:bg-white/2'
                }
              `}
            >
              {/* Left side: Active dot & Name/Input */}
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-accent' : 'bg-transparent'}`} />
                {editingId === layer.id ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleRename(layer.id, editName)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(layer.id, editName);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    autoFocus
                    className="w-full bg-surface border border-accent rounded px-1 text-[11px] outline-none text-text"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setEditingId(layer.id);
                      setEditName(layer.name);
                    }}
                    title="Double click to rename"
                    className={`text-[11px] truncate font-medium ${isActive ? 'text-text' : 'text-text-secondary'}`}
                  >
                    {layer.name}
                  </span>
                )}
              </div>

              {/* Right side: Reorder & Action buttons */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Reordering */}
                <div className="flex flex-col">
                  <button
                    disabled={isFirst}
                    onClick={(e) => {
                      e.stopPropagation();
                      const currentIdx = layers.findIndex(l => l.id === layer.id);
                      if (currentIdx !== -1) {
                        reorderLayer(layer.id, Math.min(layers.length - 1, currentIdx + 1));
                      }
                    }}
                    className="p-0.5 rounded text-text-tertiary hover:text-accent hover:bg-accent/10 disabled:opacity-20 disabled:hover:text-text-tertiary disabled:hover:bg-transparent transition-colors"
                    title="Move Layer Up"
                  >
                    <ArrowUp className="w-2.5 h-2.5" />
                  </button>
                  <button
                    disabled={isLast}
                    onClick={(e) => {
                      e.stopPropagation();
                      const currentIdx = layers.findIndex(l => l.id === layer.id);
                      if (currentIdx > 0) {
                        reorderLayer(layer.id, currentIdx - 1);
                      }
                    }}
                    className="p-0.5 rounded text-text-tertiary hover:text-accent hover:bg-accent/10 disabled:opacity-20 disabled:hover:text-text-tertiary disabled:hover:bg-transparent transition-colors"
                    title="Move Layer Down"
                  >
                    <ArrowDown className="w-2.5 h-2.5" />
                  </button>
                </div>

                {/* Lock button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateLayer(layer.id, { locked: !layer.locked });
                  }}
                  className={`p-1 rounded transition-colors ${
                    layer.locked
                      ? 'text-accent bg-accent/10 hover:bg-accent/20'
                      : 'text-text-tertiary hover:text-text hover:bg-white/5'
                  }`}
                  title={layer.locked ? 'Unlock Layer' : 'Lock Layer'}
                >
                  {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                </button>

                {/* Visibility button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateLayer(layer.id, { visible: !layer.visible });
                  }}
                  className={`p-1 rounded transition-colors ${
                    !layer.visible
                      ? 'text-text-tertiary opacity-50 hover:bg-white/5'
                      : 'text-accent bg-accent/10 hover:bg-accent/20'
                  }`}
                  title={layer.visible ? 'Hide Layer' : 'Show Layer'}
                >
                  {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </button>

                {/* Delete button (only if layers.length > 1) */}
                {layers.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLayer(layer.id);
                    }}
                    className="p-1 rounded text-text-tertiary hover:text-red-400 hover:bg-red-400/10 transition-colors"
                    title="Delete Layer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shapes' | 'layers'>('shapes');
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    new Set(['Basic Shapes'])
  );

  const allCategories = useMemo(() => ShapeRegistry.getCategories(), []);
  const { layers, activeLayerId } = useLayerStore();

  // Initialize default open state once categories load
  useEffect(() => {
    if (allCategories.length > 0) {
      setOpenCategories(new Set([allCategories[0].id]));
    }
  }, [allCategories.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayedCategories = useMemo(() => {
    if (!searchQuery.trim()) return allCategories;
    const q = searchQuery.toLowerCase();
    return allCategories
      .map((cat) => ({
        ...cat,
        shapes: cat.shapes.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.type.toLowerCase().includes(q) ||
            s.category.toLowerCase().includes(q)
        ),
      }))
      .filter((cat) => cat.shapes.length > 0);
  }, [allCategories, searchQuery]);

  // Auto-expand all categories while searching, restore on clear
  useEffect(() => {
    if (searchQuery.trim()) {
      setOpenCategories(new Set(displayedCategories.map((c) => c.id)));
    } else {
      setOpenCategories(
        new Set(allCategories.length > 0 ? [allCategories[0].id] : [])
      );
    }
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleCategory = useCallback((id: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  /** Click-to-add: place shape at center of the current viewport */
  const handleClickAdd = useCallback((shapeType: string) => {
    const { viewport } = useCanvasStore.getState();
    const shapeDef = ShapeRegistry.get(shapeType);
    const w = shapeDef?.defaultSize.width ?? 100;
    const h = shapeDef?.defaultSize.height ?? 100;

    const canvasW = window.innerWidth - 220 - 280;
    const canvasH = window.innerHeight - 40 - 24;

    const worldX = (-viewport.panX + canvasW / 2) / viewport.zoom - w / 2;
    const worldY = (-viewport.panY + canvasH / 2) / viewport.zoom - h / 2;

    const el = createElement(shapeType, { x: worldX, y: worldY });
    EditorActions.commitElement(el);
    useSelectionStore.getState().select(el.id);
  }, []);

  const totalShapes = useMemo(
    () => allCategories.reduce((sum, c) => sum + c.shapes.length, 0),
    [allCategories]
  );

  return (
    <aside
      id="shape-library-sidebar"
      className="
        w-[216px] flex-shrink-0 flex flex-col
        bg-[var(--color-toolbar-bg)] border-r border-border
        overflow-hidden
      "
    >
      {/* ── Segmented Tabs ───────────────────────── */}
      <div className="flex border-b border-border p-1 bg-surface-sunken shrink-0">
        <button
          onClick={() => setActiveTab('shapes')}
          className={`flex-1 py-1.5 text-center text-xs font-semibold rounded transition-colors ${
            activeTab === 'shapes'
              ? 'bg-surface shadow-sm text-accent font-bold'
              : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          Shapes
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-1.5 text-center text-xs font-semibold rounded transition-colors ${
            activeTab === 'layers'
              ? 'bg-surface shadow-sm text-accent font-bold'
              : 'text-text-tertiary hover:text-text-secondary'
          }`}
        >
          Layers
        </button>
      </div>

      {activeTab === 'shapes' ? (
        <>
          {/* ── Header ───────────────────────────────── */}
          <div className="px-3 pt-3 pb-2.5 shrink-0 border-b border-border">
            {/* Title row */}
            <div className="flex items-center gap-2 mb-2.5">
              <Layers className="w-3.5 h-3.5 text-accent flex-shrink-0" />
              <span className="text-[11px] font-bold text-text tracking-wide">
                Shape Library
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="
                w-3.5 h-3.5 text-text-tertiary
                absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none
              " />
              <input
                ref={searchRef}
                id="sidebar-shape-search"
                type="text"
                placeholder="Search shapes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="
                  w-full bg-surface-sunken border border-border-subtle rounded-md
                  pl-8 pr-7 py-1.5 text-xs text-text
                  placeholder:text-text-tertiary
                  focus:border-accent focus:ring-1 focus:ring-accent/30
                  outline-none transition-colors duration-150
                "
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }}
                  className="
                    absolute right-2 top-1/2 -translate-y-1/2
                    text-text-tertiary hover:text-text transition-colors
                  "
                  aria-label="Clear search"
                  >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* ── Scrollable Body ─────────────────────── */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {/* Scratchpad (always visible, above categories) */}
            {!searchQuery && <ScratchpadPanel />}

            {/* Category List */}
            {displayedCategories.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-6 gap-2">
                <Search className="w-8 h-8 text-text-tertiary opacity-40" />
                <p className="text-xs text-text-tertiary text-center">No shapes match</p>
                <p className="text-xs font-semibold text-text-secondary text-center max-w-[140px] truncate">
                  "{searchQuery}"
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-accent hover:text-accent-hover mt-1 transition-colors"
                >
                  Clear search
                </button>
              </div>
            ) : (
              displayedCategories.map((cat) => (
                <CategoryPanel
                  key={cat.id}
                  category={cat}
                  isOpen={openCategories.has(cat.id)}
                  onToggle={() => toggleCategory(cat.id)}
                  onClickAdd={handleClickAdd}
                />
              ))
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 overflow-hidden">
          <LayersPanel />
        </div>
      )}

      {/* ── Footer ─────────────────────────────── */}
      <div className="
        px-3 py-2 border-t border-border shrink-0
        flex items-center justify-between
      ">
        {activeTab === 'shapes' ? (
          <>
            <span className="text-[10px] text-text-tertiary">
              {totalShapes} shapes
            </span>
            <span className="text-[10px] text-text-tertiary">
              {allCategories.length} categories
            </span>
          </>
        ) : (
          <>
            <span className="text-[10px] text-text-tertiary">
              {layers.length} {layers.length === 1 ? 'layer' : 'layers'}
            </span>
            <span className="text-[10px] text-text-tertiary truncate max-w-[100px]">
              Active: {layers.find((l) => l.id === activeLayerId)?.name || 'None'}
            </span>
          </>
        )}
      </div>
    </aside>
  );
};

