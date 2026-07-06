/**
 * StatusBar — bottom bar with zoom, cursor position, file info, editor mode, and history status.
 */

import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, History, Maximize } from 'lucide-react';
import { useZoomStore } from '@/stores/zoom.store';
import { useFileStore } from '@/stores/file.store';
import { useEditorStore } from '@/stores/editor.store';
import { useCanvasStore } from '@/stores/canvas.store';
import { useSelectionStore } from '@/stores/selection.store';
import { useCommandStore } from '@/stores/command.store';
import { useInteractionStore } from '@/stores/interaction.store';

const PHASE_LABELS: Record<string, string> = {
  IDLE: '',
  PANNING: 'Panning',
  MOVING: 'Moving',
  DRAWING: 'Drawing…',
  CONNECTING: 'Connecting…',
  RESIZING: 'Resizing',
  SELECTING: 'Selecting',
};

export const StatusBar: React.FC = () => {
  const { zoomIn, zoomOut, resetZoom, fitToScreen, getZoomPercentage } = useZoomStore();
  const currentFileName = useFileStore(state => state.currentFileName);
  const isDirty = useFileStore(state => state.isDirty);
  const lastSaved = useFileStore(state => state.lastSaved);
  
  const mode = useEditorStore(state => state.mode);
  const activeTool = useEditorStore(state => state.activeTool);
  
  const config = useCanvasStore(state => state.config);
  const selectedIds = useSelectionStore(state => state.selectedIds);
  
  const canUndo = useCommandStore(state => state.canUndo);
  const canRedo = useCommandStore(state => state.canRedo);
  const undoCount = useCommandStore(state => state.undoCount);
  const undoLabel = useCommandStore(state => state.undoLabel);
  
  const phase = useInteractionStore(state => state.phase);

  const currentTool = activeTool ?? mode;
  const phaseLabel = PHASE_LABELS[phase] ?? '';
  
  const isMac = window.electronAPI 
    ? window.electronAPI.platform === 'darwin' 
    : /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

  return (
    <footer
      id="status-bar"
      className="h-statusbar flex items-center justify-between px-3 bg-[var(--color-statusbar-bg)] border-t border-border text-2xs select-none"
    >
      {/* Left — status + mode + phase */}
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-text-tertiary">
          <span className="w-1.5 h-1.5 rounded-full bg-status-success" />
          Ready
        </span>
        <span className="text-border">|</span>
        <span className="text-text-secondary capitalize">{currentTool}</span>

        {phaseLabel && (
          <>
            <span className="text-border">|</span>
            <span className="text-status-info animate-pulse">{phaseLabel}</span>
          </>
        )}

        {selectedIds.size > 0 && (
          <>
            <span className="text-border">|</span>
            <span className="text-accent">{selectedIds.size} selected</span>
          </>
        )}
      </div>

      {/* Center — history indicator */}
      <div className="flex items-center gap-2">
        {undoCount > 0 && (
          <span className="flex items-center gap-1 text-text-tertiary">
            <History className="w-3 h-3" />
            <span className="font-mono">{undoCount}</span>
            {undoLabel && (
              <span className="text-text-tertiary truncate max-w-[120px]">
                · {undoLabel}
              </span>
            )}
          </span>
        )}
        {(canUndo || canRedo) && (
          <div className="flex items-center gap-0.5">
            <span
              className={`text-2xs px-1 rounded ${canUndo ? 'text-text-secondary' : 'text-text-tertiary opacity-40'}`}
              title={isMac ? 'Undo (⌘Z)' : 'Undo (Ctrl+Z)'}
            >
              {isMac ? '⌘Z' : 'Ctrl+Z'}
            </span>
            <span
              className={`text-2xs px-1 rounded ${canRedo ? 'text-text-secondary' : 'text-text-tertiary opacity-40'}`}
              title={isMac ? 'Redo (⌘Y)' : 'Redo (Ctrl+Y)'}
            >
              {isMac ? '⌘Y' : 'Ctrl+Y'}
            </span>
          </div>
        )}
      </div>

      {/* Right — file + grid + zoom */}
      <div className="flex items-center gap-2">
        <span className={isDirty ? 'text-status-warning' : 'text-text-tertiary'}>
          {isDirty ? '● Unsaved' : (lastSaved ? `✓ Saved ${new Date(lastSaved).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : currentFileName)}
        </span>
        <span className="text-border">|</span>
        <span className="text-text-tertiary">{config.grid.enabled ? 'Grid: On' : 'Grid: Off'}</span>
        <span className="text-border">|</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => zoomOut()}
            className="p-0.5 text-text-tertiary hover:text-text transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetZoom}
            className="px-1 text-text-secondary hover:text-text font-mono transition-colors min-w-[3rem] text-center"
            title="Reset Zoom (Ctrl+0)"
          >
            {getZoomPercentage()}%
          </button>
          <button
            onClick={() => zoomIn()}
            className="p-0.5 text-text-tertiary hover:text-text transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <span className="text-border mx-1">|</span>
          <button
            onClick={fitToScreen}
            className="p-0.5 text-text-tertiary hover:text-text transition-colors"
            title="Fit to Screen (Ctrl+9)"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
