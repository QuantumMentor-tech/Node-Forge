/**
 * ProjectSerializer.ts
 *
 * Responsible for converting the active editor state into a ProjectFile object,
 * and converting a loaded ProjectFile back into the editor state.
 */

import { useCanvasStore } from '@/stores/canvas.store';
import { useFileStore } from '@/stores/file.store';
import { useEditorStore } from '@/stores/editor.store';
import { useThemeStore } from '@/stores/theme.store';
import { type ProjectFile, CURRENT_APP_VERSION, CURRENT_SCHEMA_VERSION } from './schema/ProjectSchema';
import { SchemaValidator } from './schema/SchemaValidator';
import { SchemaMigration } from './schema/SchemaMigration';

export class ProjectSerializer {
  /**
   * Capture the current editor state and serialize it into a ProjectFile.
   */
  static serialize(): ProjectFile {
    const canvasState = useCanvasStore.getState();
    const fileState = useFileStore.getState();
    const editorState = useEditorStore.getState();
    const themeState = useThemeStore.getState();

    // Preserve existing metadata or generate new
    const now = Date.now();
    
    // We store metadata in the file store or derive it
    // For now, we will use a basic implementation, assuming a fresh save or overwriting existing.
    // A robust app might keep track of the loaded metadata in the file store.
    const metadata = {
      id: fileState.currentFilePath || crypto.randomUUID(), // Use path or generate UUID if new
      title: fileState.currentFileName || 'Untitled Diagram',
      description: '',
      createdAt: fileState.lastSaved || now,
      modifiedAt: now,
      author: 'Unknown',
      tags: [],
    };

    const project: ProjectFile = {
      format: 'nodeforge',
      version: CURRENT_APP_VERSION,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      metadata,
      viewport: canvasState.viewport,
      grid: canvasState.config.grid,
      elements: canvasState.elements,
      connectors: canvasState.connectors,
      preferences: {
        theme: themeState.mode,
        propertiesPanelOpen: !editorState.propertiesPanelCollapsed,
      },
      layers: [],
    };

    return project;
  }

  /**
   * Parse a raw JSON string into a validated ProjectFile.
   * Throws an error if the file is invalid or corrupted.
   */
  static parse(jsonContent: string): ProjectFile {
    let data: unknown;
    try {
      data = JSON.parse(jsonContent);
    } catch (e) {
      throw new Error('Failed to parse project file (invalid JSON).');
    }

    const validation = SchemaValidator.validate(data);
    if (!validation.valid) {
      throw new Error(`Corrupted project file:\n- ${validation.errors.join('\n- ')}`);
    }

    if (validation.warnings.length > 0) {
      console.warn('Project load warnings:', validation.warnings);
    }

    return SchemaMigration.migrate(data);
  }

  /**
   * Apply a ProjectFile to the active editor state.
   */
  static deserializeAndApply(project: ProjectFile, filePath: string, fileName: string): void {
    const { setElements, setConnectors, setViewport, setGridConfig } = useCanvasStore.getState();
    const { setCurrentFile, setDirty } = useFileStore.getState();
    const { setMode: setThemeMode } = useThemeStore.getState();

    // Apply canvas state
    setElements(project.elements || []);
    setConnectors(project.connectors || []);
    setViewport(project.viewport || { panX: 0, panY: 0, zoom: 1 });
    
    if (project.grid) {
      setGridConfig(project.grid);
    }

    // Apply UI preferences if they exist
    if (project.preferences) {
      if (project.preferences.theme) {
        setThemeMode(project.preferences.theme);
      }
      
      const newPropertiesCollapsed = project.preferences.propertiesPanelOpen !== undefined ? !project.preferences.propertiesPanelOpen : false;
      
      useEditorStore.setState({
        propertiesPanelCollapsed: newPropertiesCollapsed
      });
    }

    // Update file state
    setCurrentFile(filePath, fileName);
    setDirty(false); // Freshly loaded file is not dirty
  }
}
