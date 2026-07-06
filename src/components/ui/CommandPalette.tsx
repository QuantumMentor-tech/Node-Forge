/**
 * CommandPalette.tsx — Advanced Command Palette with fuzzy search, prefix modes,
 * recently used commands, shape insertion, layer navigation, and canvas element focusing.
 *
 * PREFIX MODES:
 *   > = commands only
 *   @ = navigate to canvas elements by label
 *   / = insert a shape at center
 *   # = select a layer
 *   (blank) = universal search across all types
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search, Command as CommandIcon, Box, Layers,
  Layout, ChevronRight, Clock
} from 'lucide-react';
import { usePaletteStore } from '@/stores/palette.store';
import { useCanvasStore } from '@/stores/canvas.store';
import { useLayerStore } from '@/stores/layer.store';
import { CommandRegistry, type CommandDefinition } from '@/editor/CommandRegistry';
import { ShapeRegistry } from '@/shapes/core/ShapeRegistry';
import { EditorActions } from '@/editor/EditorActions';
import { builtInTemplates, loadTemplate } from '@/utils/builtinTemplates';

// ─── Types ─────────────────────────────────────────────────────────────────

type ResultType = 'command' | 'shape' | 'element' | 'layer' | 'template';

interface PaletteResult {
  id: string;
  type: ResultType;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  score: number;
  execute: () => void;
}

// ─── Recently-Used Store (localStorage) ─────────────────────────────────────

const RECENT_KEY = 'palette_recent_commands';
const MAX_RECENT = 5;

function loadRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
  } catch {
    return [];
  }
}

function pushRecent(id: string) {
  const recents = loadRecent().filter((r) => r !== id);
  recents.unshift(id);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recents.slice(0, MAX_RECENT)));
}

// ─── Fuzzy Score ─────────────────────────────────────────────────────────────

function fuzzyScore(text: string, query: string): number {
  if (!query) return 1;
  const t = text.toLowerCase();
  const q = query.toLowerCase();

  // Exact start → highest priority
  if (t.startsWith(q)) return 100 + (100 - t.length);
  // Contains whole query
  if (t.includes(q)) return 80 + (100 - t.length);

  // Sequential character match
  let score = 0;
  let qi = 0;
  let lastMatchIdx = -1;

  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      score += qi === 0 ? 10 : (i - lastMatchIdx === 1 ? 8 : 3);
      lastMatchIdx = i;
      qi++;
    }
  }
  return qi === q.length ? score : 0;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const CommandPalette: React.FC = () => {
  const isOpen = usePaletteStore((s) => s.isOpen);
  const closePalette = usePaletteStore((s) => s.closePalette);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  // ── Derive prefix ────────────────────────────────────────────────────────
  const prefix = query.startsWith('>') ? '>'
    : query.startsWith('@') ? '@'
    : query.startsWith('/') ? '/'
    : query.startsWith('#') ? '#'
    : '';
  const searchText = query.slice(prefix.length).trim();

  // ── Data sources (reactive) ───────────────────────────────────────────────
  const allCommands = useMemo(() => CommandRegistry.getAll(), [isOpen]);
  const allShapes = useMemo(() => ShapeRegistry.getAll(), [isOpen]);
  const elements = useCanvasStore((s) => s.elements);
  const viewport = useCanvasStore((s) => s.viewport);
  const layers = useLayerStore((s) => s.layers);
  const setActiveLayer = useLayerStore((s) => s.setActiveLayer);

  // ── Results computation ───────────────────────────────────────────────────
  const results: PaletteResult[] = useMemo(() => {
    // Recently used commands
    const buildRecentResults = (): PaletteResult[] => {
      return recentIds
        .map((id) => allCommands.find((c) => c.id === id))
        .filter(Boolean)
        .map((cmd) => ({
          id: `recent_${cmd!.id}`,
          type: 'command' as ResultType,
          label: cmd!.label,
          sublabel: `${cmd!.category} · Recently used`,
          icon: <Clock className="w-3.5 h-3.5 text-accent opacity-80" />,
          score: 200,
          execute: () => { cmd!.execute(); pushRecent(cmd!.id); setRecentIds(loadRecent()); },
        }));
    };

    // If no query, show recents + all commands
    if (!query.trim()) {
      const recents = buildRecentResults();
      const rest = allCommands
        .filter((c) => !recentIds.includes(c.id))
        .map((cmd) => toCommandResult(cmd, '', 0));
      return [...recents, ...rest];
    }

    // > commands only
    if (prefix === '>') {
      return allCommands
        .map((cmd) => {
          const score = fuzzyScore(cmd.label, searchText) || fuzzyScore(cmd.keywords?.join(' ') || '', searchText);
          return score > 0 ? toCommandResult(cmd, searchText, score) : null;
        })
        .filter(Boolean)
        .sort((a, b) => b!.score - a!.score) as PaletteResult[];
    }

    // @ navigate elements
    if (prefix === '@') {
      return elements
        .filter((el) => el.label && fuzzyScore(el.label, searchText) > 0)
        .map((el) => {
          const score = fuzzyScore(el.label, searchText);
          return {
            id: `elem_${el.id}`,
            type: 'element' as ResultType,
            label: el.label || el.type,
            sublabel: `Canvas Element · ${el.type}`,
            icon: <Box className="w-3.5 h-3.5 text-green-400" />,
            score,
            execute: () => {
              // Select and center viewport on element
              EditorActions.selectElement(el.id);
              const centerX = el.bounds.x + el.bounds.width / 2;
              const centerY = el.bounds.y + el.bounds.height / 2;
              const canvasEl = document.getElementById('canvas-area');
              if (!canvasEl) return;
              const { width, height } = canvasEl.getBoundingClientRect();
              const zoom = viewport.zoom;
              useCanvasStore.getState().setViewport({
                panX: width / 2 - centerX * zoom,
                panY: height / 2 - centerY * zoom,
              });
            },
          };
        })
        .sort((a, b) => b.score - a.score);
    }

    // / insert shape
    if (prefix === '/') {
      return allShapes
        .filter((s) => !searchText || fuzzyScore(s.name, searchText) > 0)
        .map((shape) => {
          const score = searchText ? fuzzyScore(shape.name, searchText) : 50;
          return {
            id: `shape_${shape.type}`,
            type: 'shape' as ResultType,
            label: shape.name,
            sublabel: `Insert Shape · ${shape.category || 'General'}`,
            icon: <Box className="w-3.5 h-3.5 text-blue-400" />,
            score,
            execute: () => {
              // Insert at canvas center
              const canvasEl = document.getElementById('canvas-area');
              const rect = canvasEl?.getBoundingClientRect();
              const cvp = useCanvasStore.getState().viewport;
              const screenCX = (rect?.width || 800) / 2;
              const screenCY = (rect?.height || 600) / 2;
              const worldX = (screenCX - cvp.panX) / cvp.zoom;
              const worldY = (screenCY - cvp.panY) / cvp.zoom;
              EditorActions.createElement(shape.type, {
                x: worldX - (shape.defaultSize?.width || 100) / 2,
                y: worldY - (shape.defaultSize?.height || 60) / 2,
              });
            },
          };
        })
        .sort((a, b) => b.score - a.score);
    }

    // # layer navigation
    if (prefix === '#') {
      return layers
        .filter((l) => !searchText || fuzzyScore(l.name, searchText) > 0)
        .map((layer) => {
          const score = searchText ? fuzzyScore(layer.name, searchText) : 50;
          return {
            id: `layer_${layer.id}`,
            type: 'layer' as ResultType,
            label: layer.name,
            sublabel: `Layer · ${layer.visible ? 'Visible' : 'Hidden'}${layer.locked ? ' · Locked' : ''}`,
            icon: <Layers className="w-3.5 h-3.5 text-purple-400" />,
            score,
            execute: () => setActiveLayer(layer.id),
          };
        })
        .sort((a, b) => b.score - a.score);
    }

    // Universal search across all types
    const all: PaletteResult[] = [];

    allCommands.forEach((cmd) => {
      const score = fuzzyScore(cmd.label, searchText) || fuzzyScore((cmd.keywords || []).join(' '), searchText);
      if (score > 0) all.push(toCommandResult(cmd, searchText, score));
    });

    allShapes.forEach((shape) => {
      const score = fuzzyScore(shape.name, searchText);
      if (score > 0) {
        all.push({
          id: `shape_${shape.type}`,
          type: 'shape',
          label: shape.name,
          sublabel: `Insert Shape`,
          icon: <Box className="w-3.5 h-3.5 text-blue-400" />,
          score,
          execute: () => {
            const canvasEl = document.getElementById('canvas-area');
            const rect = canvasEl?.getBoundingClientRect();
            const cvp = useCanvasStore.getState().viewport;
            const screenCX = (rect?.width || 800) / 2;
            const screenCY = (rect?.height || 600) / 2;
            const worldX = (screenCX - cvp.panX) / cvp.zoom;
            const worldY = (screenCY - cvp.panY) / cvp.zoom;
            EditorActions.createElement(shape.type, {
              x: worldX - (shape.defaultSize?.width || 100) / 2,
              y: worldY - (shape.defaultSize?.height || 60) / 2,
            });
          },
        });
      }
    });

    builtInTemplates.forEach((tmpl) => {
      const score = fuzzyScore(tmpl.title, searchText) || fuzzyScore(tmpl.category, searchText);
      if (score > 0) {
        all.push({
          id: `tmpl_${tmpl.id}`,
          type: 'template',
          label: tmpl.title,
          sublabel: `Template · ${tmpl.category}`,
          icon: <Layout className="w-3.5 h-3.5 text-orange-400" />,
          score,
          execute: () => loadTemplate(tmpl),
        });
      }
    });

    layers.forEach((layer) => {
      const score = fuzzyScore(layer.name, searchText);
      if (score > 0) {
        all.push({
          id: `layer_${layer.id}`,
          type: 'layer',
          label: layer.name,
          sublabel: 'Switch Layer',
          icon: <Layers className="w-3.5 h-3.5 text-purple-400" />,
          score,
          execute: () => setActiveLayer(layer.id),
        });
      }
    });

    return all.sort((a, b) => b.score - a.score);
  }, [query, recentIds, isOpen]);

  // ── Auto-scroll selected item into view ──────────────────────────────────
  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedIndex]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setRecentIds(loadRecent());
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  // Clamp selected index whenever results change
  useEffect(() => {
    setSelectedIndex((prev) => Math.min(prev, Math.max(results.length - 1, 0)));
  }, [results.length]);

  if (!isOpen) return null;

  const handleExecute = useCallback((result: PaletteResult) => {
    result.execute();
    if (result.type === 'command') pushRecent(result.id.replace('recent_', ''));
    closePalette();
  }, [closePalette]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closePalette();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const result = results[selectedIndex];
      if (result) handleExecute(result);
    }
  };

  const prefixHintMap: Record<string, { icon: React.ReactNode; hint: string; color: string }> = {
    '>': { icon: <CommandIcon className="w-3.5 h-3.5" />, hint: 'Commands', color: 'text-accent' },
    '@': { icon: <Box className="w-3.5 h-3.5" />, hint: 'Canvas Elements', color: 'text-green-400' },
    '/': { icon: <Zap className="w-3.5 h-3.5" />, hint: 'Insert Shape', color: 'text-blue-400' },
    '#': { icon: <Layers className="w-3.5 h-3.5" />, hint: 'Layers', color: 'text-purple-400' },
  };

  const activeHint = prefixHintMap[prefix];

  const typeIcons: Record<ResultType, React.ReactNode> = {
    command: <CommandIcon className="w-3.5 h-3.5 text-text-tertiary" />,
    shape: <Box className="w-3.5 h-3.5 text-blue-400" />,
    element: <Box className="w-3.5 h-3.5 text-green-400" />,
    layer: <Layers className="w-3.5 h-3.5 text-purple-400" />,
    template: <Layout className="w-3.5 h-3.5 text-orange-400" />,
  };

  return (
    <div
      className="fixed inset-0 z-[900] flex justify-center pt-28 bg-black/30 backdrop-blur-sm animate-fade-in"
      onClick={closePalette}
    >
      <div
        className="w-full max-w-2xl bg-surface-raised border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[60vh] animate-slide-in-down"
        style={{ boxShadow: '0 25px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-border bg-surface/60 gap-3">
          {activeHint ? (
            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-surface text-xs font-semibold border border-border ${activeHint.color} shrink-0`}>
              {activeHint.icon}
              <span>{activeHint.hint}</span>
            </div>
          ) : (
            <Search className="w-5 h-5 text-text-tertiary shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-text text-base placeholder-text-tertiary"
            placeholder={prefix
              ? prefixHintMap[prefix]?.hint
                ? `Search ${prefixHintMap[prefix].hint.toLowerCase()}...`
                : 'Type to search...'
              : 'Search commands, shapes, layers...'}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <div className="flex items-center gap-1 shrink-0">
            {[['>', 'cmds'], ['@', 'elem'], ['/', 'shape'], ['#', 'layers']].map(([p, hint]) => (
              <button
                key={p}
                onClick={() => { setQuery(p); inputRef.current?.focus(); }}
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded border border-border-subtle text-text-tertiary hover:text-text hover:bg-surface-sunken transition-colors ${
                  prefix === p ? 'border-accent/50 text-accent bg-accent/5' : ''
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div ref={listRef} className="flex-1 overflow-y-auto py-1.5">
          {results.length === 0 ? (
            <div className="px-4 py-10 text-center text-text-tertiary text-sm">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p>No results for <span className="font-mono text-text-secondary">"{searchText}"</span></p>
              <p className="text-xs mt-1 opacity-60">Try a different term or prefix (&gt;, @, /, #)</p>
            </div>
          ) : (
            (() => {
              // Group by type when no prefix
              const grouped: { type: string; label: string; items: PaletteResult[] }[] = [];

              if (!query.trim() && recentIds.length > 0) {
                const recents = results.filter(r => r.id.startsWith('recent_'));
                const rest = results.filter(r => !r.id.startsWith('recent_'));
                if (recents.length > 0) grouped.push({ type: 'recent', label: 'Recently Used', items: recents });
                // Deduplicate rest from recents
                const recentOrigIds = new Set(recents.map(r => r.id.replace('recent_', '')));
                const filteredRest = rest.filter(r => !recentOrigIds.has(r.id));
                if (filteredRest.length > 0) grouped.push({ type: 'all', label: 'Commands', items: filteredRest.slice(0, 12) });
              } else if (prefix === '' && query.trim()) {
                // Grouped by result type
                const types: ResultType[] = ['command', 'shape', 'layer', 'template', 'element'];
                const typeLabels: Record<ResultType, string> = {
                  command: 'Commands',
                  shape: 'Shapes',
                  element: 'Canvas Elements',
                  layer: 'Layers',
                  template: 'Templates',
                };
                types.forEach(type => {
                  const items = results.filter(r => r.type === type).slice(0, 4);
                  if (items.length > 0) grouped.push({ type, label: typeLabels[type], items });
                });
              } else {
                grouped.push({ type: 'default', label: '', items: results.slice(0, 20) });
              }

              let flatIndex = 0;
              return grouped.map((group) => (
                <div key={group.type}>
                  {group.label && (
                    <div className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-widest text-text-tertiary font-semibold">
                      {group.label}
                    </div>
                  )}
                  {group.items.map((result) => {
                    const idx = flatIndex++;
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={result.id}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors group ${
                          isSelected
                            ? 'bg-accent/10 text-text'
                            : 'text-text-secondary hover:bg-surface-sunken hover:text-text'
                        }`}
                        onClick={() => handleExecute(result)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`shrink-0 transition-colors ${isSelected ? 'opacity-100' : 'opacity-60'}`}>
                            {result.icon ?? typeIcons[result.type]}
                          </span>
                          <div className="min-w-0">
                            <span className="text-sm font-medium truncate block">{result.label}</span>
                            {result.sublabel && (
                              <span className="text-[11px] text-text-tertiary truncate block">{result.sublabel}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          {isSelected && <ChevronRight className="w-3.5 h-3.5 text-accent opacity-70" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ));
            })()
          )}
        </div>

        {/* Footer hints */}
        <div className="px-4 py-2 border-t border-border bg-surface/40 flex items-center gap-4 text-[11px] text-text-tertiary">
          <span className="flex items-center gap-1"><kbd className="font-mono bg-surface-sunken px-1 rounded border border-border-subtle">↑↓</kbd> navigate</span>
          <span className="flex items-center gap-1"><kbd className="font-mono bg-surface-sunken px-1 rounded border border-border-subtle">↵</kbd> execute</span>
          <span className="flex items-center gap-1"><kbd className="font-mono bg-surface-sunken px-1 rounded border border-border-subtle">Esc</kbd> close</span>
          <span className="ml-auto opacity-50">Type <span className="font-mono">&gt;</span> <span className="font-mono">@</span> <span className="font-mono">/</span> <span className="font-mono">#</span> for modes</span>
        </div>
      </div>
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function toCommandResult(cmd: CommandDefinition, _query: string, score: number): PaletteResult {
  return {
    id: cmd.id,
    type: 'command',
    label: cmd.label,
    sublabel: cmd.category + (cmd.shortcut ? ` · ${cmd.shortcut}` : ''),
    icon: <CommandIcon className="w-3.5 h-3.5 text-text-tertiary" />,
    score,
    execute: () => {
      cmd.execute();
      pushRecent(cmd.id);
    },
  };
}
