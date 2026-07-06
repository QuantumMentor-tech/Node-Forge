/**
 * SchemaMigration.ts
 *
 * Handles migrating project data from older schema versions to the current version.
 * Ensures forward compatibility when the application updates.
 */

import { type ProjectFile, CURRENT_SCHEMA_VERSION, CURRENT_APP_VERSION } from './ProjectSchema';

export class SchemaMigration {
  /**
   * Migrate loaded JSON data to the current schema version.
   * If the data is already up to date, it returns it typed as ProjectFile.
   */
  static migrate(data: unknown): ProjectFile {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid project data.');
    }

    let current = data as Record<string, unknown>;
    const version = typeof current['schemaVersion'] === 'number' ? current['schemaVersion'] : 1;

    // Run migration pipeline sequentially
    // e.g., if version === 1, run migrateV1toV2(), then version becomes 2, etc.
    /*
    if (version < 2) {
      current = this.migrateV1toV2(current);
    }
    */

    if (version > CURRENT_SCHEMA_VERSION) {
      console.warn(`Project schema version (${version}) is newer than application version (${CURRENT_SCHEMA_VERSION}). Some features may not work.`);
    }

    // Ensure version and format fields are correct
    current['format'] = 'nodeforge';
    current['version'] = CURRENT_APP_VERSION;
    current['schemaVersion'] = CURRENT_SCHEMA_VERSION;

    return current as unknown as ProjectFile;
  }

  // ─── Migration Handlers (Future) ──────────────────────────────────────────

  /*
  private static migrateV1toV2(data: Record<string, unknown>): Record<string, unknown> {
    // Modify data to match v2 schema
    data['schemaVersion'] = 2;
    return data;
  }
  */
}
