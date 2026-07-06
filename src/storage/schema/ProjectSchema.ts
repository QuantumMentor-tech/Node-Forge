/**
 * ProjectSchema.ts
 *
 * The canonical typed schema for a .drawio project file.
 * This is the serialized form of the editor state — everything stored on disk.
 *
 * Design principles:
 *  - All fields are plain JSON-serializable (no classes, no Date objects)
 *  - Versioned for schema migrations
 *  - Prepared for layers, templates, cloud sync, and encrypted payloads
 *  - Forward-compatible: unknown fields are preserved on load (roundtrip safe)
 */

import type { CanvasElement, Connector, Viewport, GridConfig } from '@/types/canvas.types';

// ─── Schema version — increment when making breaking schema changes ──────────

export const CURRENT_SCHEMA_VERSION = 1;
export const CURRENT_APP_VERSION = '1.0.0';
export const PROJECT_FILE_EXTENSION = '.nodeforge';
export const AUTOSAVE_EXTENSION = '.autosave.nodeforge';

// ─── Project Metadata ────────────────────────────────────────────────────────

export interface ProjectMetadata {
  /** Unique project ID (UUID) — stable across renames */
  id: string;

  /** Display name of the project */
  title: string;

  /** Optional description */
  description: string;

  /** Creation timestamp (Unix ms) */
  createdAt: number;

  /** Last modification timestamp (Unix ms) */
  modifiedAt: number;

  /** Author name (from system or set by user) */
  author: string;

  /** User-defined tags for organization */
  tags: string[];

  /** Thumbnail data URL (base64 PNG, for recent projects preview) */
  thumbnail?: string;
}

// ─── Editor Preferences (persisted per-project) ──────────────────────────────

export interface ProjectPreferences {
  /** Theme mode at the time of save */
  theme: 'dark' | 'light';

  /** Whether the properties panel was open */
  propertiesPanelOpen: boolean;
}

// ─── Layer (future — prepared for multi-layer support) ───────────────────────

export interface ProjectLayer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  /** Future: opacity, blend mode, etc. */
}

// ─── Root Project Schema ──────────────────────────────────────────────────────

export interface ProjectFile {
  /** Human-readable format identifier */
  format: 'nodeforge' | 'drawio-desktop';

  /** Semantic application version that wrote this file */
  version: string;

  /** Integer schema version for migration decisions */
  schemaVersion: number;

  /** Project identity and timestamps */
  metadata: ProjectMetadata;

  /** Viewport state at time of save */
  viewport: Viewport;

  /** Grid configuration */
  grid: GridConfig;

  /** All canvas elements (shapes, text, images) */
  elements: CanvasElement[];

  /** All connectors between elements */
  connectors: Connector[];

  /** Editor UI preferences */
  preferences: ProjectPreferences;

  /** Layer definitions (future) */
  layers: ProjectLayer[];

  /**
   * Reserved for future features:
   * - plugins: plugin-generated content
   * - assets: embedded image references
   * - cloudSync: sync metadata
   */
  extensions?: Record<string, unknown>;
}

// ─── Autosave Session Record ──────────────────────────────────────────────────

export interface AutosaveRecord {
  /** Original file path — null if unsaved session */
  originalFilePath: string | null;

  /** Filename for display */
  originalFileName: string;

  /** Timestamp of autosave */
  savedAt: number;

  /** The full project data */
  project: ProjectFile;
}

// ─── Recent Project Entry ─────────────────────────────────────────────────────

export interface RecentProjectEntry {
  filePath: string;
  fileName: string;
  title: string;
  lastOpened: number;
  thumbnail?: string;
}
