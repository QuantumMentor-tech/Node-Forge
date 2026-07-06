/**
 * Editor-related type definitions.
 */

export type EditorMode = 'select' | 'pan' | 'draw' | 'connect' | 'text';

export type DrawTool =
  | 'rectangle'
  | 'ellipse'
  | 'diamond'
  | 'line'
  | 'arrow'
  | 'text'
  | 'freehand';

export interface EditorPreferences {
  autoSave: boolean;
  autoSaveInterval: number; // ms
  showMinimap: boolean;
  showRulers: boolean;
  snapToGrid: boolean;
  snapToElements: boolean;
  defaultFontFamily: string;
  defaultFontSize: number;
}

export interface RecentFile {
  filePath: string;
  fileName: string;
  lastOpened: number; // timestamp
}

export type ExportFormat = 'png' | 'svg' | 'pdf' | 'json';

export interface ExportOptions {
  format: ExportFormat;
  scale: number;
  transparent: boolean;
  includeGrid: boolean;
  selectedOnly: boolean;
}
