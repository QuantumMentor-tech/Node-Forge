/**
 * ToolManager.ts
 *
 * Centralized registry for all editor tools.
 * Manages tool activation, cursor assignment, and tool-specific state resets.
 *
 * Future extensions: sub-tools, tool options panels, tool-specific modes.
 */

import { useEditorStore } from '@/stores/editor.store';
import type { DrawTool, EditorMode } from '@/types/editor.types';

export type ToolId =
  | 'select'
  | 'pan'
  | 'rectangle'
  | 'ellipse'
  | 'diamond'
  | 'line'
  | 'arrow'
  | 'text'
  | 'freehand';

export interface ToolDefinition {
  id: ToolId;
  label: string;
  shortcut?: string;
  cursor: string;
  mode: EditorMode;
  drawTool?: DrawTool;
}

const TOOL_REGISTRY: Record<ToolId, ToolDefinition> = {
  select: {
    id: 'select',
    label: 'Select',
    shortcut: 'V',
    cursor: 'default',
    mode: 'select',
  },
  pan: {
    id: 'pan',
    label: 'Pan',
    shortcut: 'H',
    cursor: 'grab',
    mode: 'pan',
  },
  rectangle: {
    id: 'rectangle',
    label: 'Rectangle',
    shortcut: 'R',
    cursor: 'crosshair',
    mode: 'draw',
    drawTool: 'rectangle',
  },
  ellipse: {
    id: 'ellipse',
    label: 'Ellipse',
    shortcut: 'E',
    cursor: 'crosshair',
    mode: 'draw',
    drawTool: 'ellipse',
  },
  diamond: {
    id: 'diamond',
    label: 'Diamond',
    shortcut: 'D',
    cursor: 'crosshair',
    mode: 'draw',
    drawTool: 'diamond',
  },
  line: {
    id: 'line',
    label: 'Line',
    shortcut: 'L',
    cursor: 'crosshair',
    mode: 'draw',
    drawTool: 'line',
  },
  arrow: {
    id: 'arrow',
    label: 'Arrow',
    shortcut: 'A',
    cursor: 'crosshair',
    mode: 'draw',
    drawTool: 'arrow',
  },
  text: {
    id: 'text',
    label: 'Text',
    shortcut: 'T',
    cursor: 'text',
    mode: 'text',
    drawTool: 'text',
  },
  freehand: {
    id: 'freehand',
    label: 'Freehand',
    shortcut: 'P',
    cursor: 'crosshair',
    mode: 'draw',
    drawTool: 'freehand',
  },
};

export class ToolManager {
  static getAll(): ToolDefinition[] {
    return Object.values(TOOL_REGISTRY);
  }

  static get(toolId: ToolId): ToolDefinition {
    return TOOL_REGISTRY[toolId];
  }

  static getByShortcut(key: string): ToolDefinition | undefined {
    return Object.values(TOOL_REGISTRY).find(
      (t) => t.shortcut?.toLowerCase() === key.toLowerCase(),
    );
  }

  static activate(toolId: ToolId): void {
    const tool = TOOL_REGISTRY[toolId];
    if (!tool) return;

    const { setMode, setActiveTool } = useEditorStore.getState();

    if (tool.drawTool) {
      setActiveTool(tool.drawTool);
    } else {
      setMode(tool.mode);
    }

    // Update canvas cursor
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.style.cursor = tool.cursor;
    }
  }

  static getCurrentCursor(toolId: ToolId): string {
    return TOOL_REGISTRY[toolId]?.cursor ?? 'default';
  }
}
