/**
 * SchemaValidator.ts
 *
 * Validates that a loaded JSON object conforms to the expected ProjectFile schema.
 * Used when opening files from disk to catch corrupted or invalid project files
 * before they crash the application.
 *
 * Does NOT use a heavy validation library — uses lightweight structural checks
 * to stay fast and dependency-free.
 */

import type { ProjectFile } from './ProjectSchema';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class SchemaValidator {
  /**
   * Validate that a parsed JSON object looks like a valid ProjectFile.
   * Returns detailed error messages for user-facing error display.
   */
  static validate(data: unknown): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      return { valid: false, errors: ['File content is not a valid JSON object.'], warnings };
    }

    const obj = data as Record<string, unknown>;

    // ─── Required top-level fields ────────────────────────────────────────

    // Accept both new format name and legacy name for backward compatibility
    const VALID_FORMATS = ['nodeforge', 'drawio-desktop'];
    if (!VALID_FORMATS.includes(obj['format'] as string)) {
      errors.push(`Invalid format identifier: "${obj['format']}". Expected "nodeforge".`);
    }

    if (typeof obj['schemaVersion'] !== 'number') {
      errors.push('Missing or invalid "schemaVersion" field.');
    }

    if (typeof obj['version'] !== 'string') {
      warnings.push('Missing "version" field — using default.');
    }

    // ─── Metadata ─────────────────────────────────────────────────────────

    if (!SchemaValidator.isObject(obj['metadata'])) {
      errors.push('Missing or invalid "metadata" field.');
    } else {
      const meta = obj['metadata'] as Record<string, unknown>;
      if (typeof meta['id'] !== 'string') errors.push('metadata.id must be a string.');
      if (typeof meta['title'] !== 'string') warnings.push('metadata.title is missing — using "Untitled".');
      if (typeof meta['createdAt'] !== 'number') warnings.push('metadata.createdAt is missing.');
      if (typeof meta['modifiedAt'] !== 'number') warnings.push('metadata.modifiedAt is missing.');
    }

    // ─── Viewport ─────────────────────────────────────────────────────────

    if (!SchemaValidator.isObject(obj['viewport'])) {
      errors.push('Missing or invalid "viewport" field.');
    } else {
      const vp = obj['viewport'] as Record<string, unknown>;
      if (typeof vp['panX'] !== 'number') errors.push('viewport.panX must be a number.');
      if (typeof vp['panY'] !== 'number') errors.push('viewport.panY must be a number.');
      if (typeof vp['zoom'] !== 'number') errors.push('viewport.zoom must be a number.');
    }

    // ─── Elements ─────────────────────────────────────────────────────────

    if (!Array.isArray(obj['elements'])) {
      errors.push('"elements" must be an array.');
    } else {
      const elements = obj['elements'] as unknown[];
      elements.forEach((el, i) => {
        if (!SchemaValidator.isObject(el)) {
          errors.push(`elements[${i}] is not a valid object.`);
          return;
        }
        const elem = el as Record<string, unknown>;
        if (typeof elem['id'] !== 'string') errors.push(`elements[${i}].id must be a string.`);
        if (typeof elem['type'] !== 'string') errors.push(`elements[${i}].type must be a string.`);
        if (!SchemaValidator.isObject(elem['bounds'])) {
          errors.push(`elements[${i}].bounds is missing or invalid.`);
        }
      });
    }

    // ─── Connectors ───────────────────────────────────────────────────────

    if (!Array.isArray(obj['connectors'])) {
      errors.push('"connectors" must be an array.');
    } else {
      const connectors = obj['connectors'] as unknown[];
      connectors.forEach((conn, i) => {
        if (!SchemaValidator.isObject(conn)) {
          errors.push(`connectors[${i}] is not a valid object.`);
          return;
        }
        const c = conn as Record<string, unknown>;
        if (typeof c['id'] !== 'string') errors.push(`connectors[${i}].id must be a string.`);
        if (typeof c['sourceId'] !== 'string') errors.push(`connectors[${i}].sourceId must be a string.`);
        if (typeof c['targetId'] !== 'string') errors.push(`connectors[${i}].targetId must be a string.`);
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Quick check — just returns true/false without detailed errors.
   * Use for hot paths where full validation is unnecessary.
   */
  static isProjectFile(data: unknown): data is ProjectFile {
    const result = SchemaValidator.validate(data);
    return result.valid;
  }

  private static isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}
