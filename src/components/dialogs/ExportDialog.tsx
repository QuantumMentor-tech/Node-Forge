/**
 * ExportDialog.tsx
 *
 * Professional export modal allowing users to configure resolution, format,
 * background, and bounds before generating the export file.
 */

import React, { useState } from 'react';
import { Download, X, Loader2 } from 'lucide-react';
import { useExportStore } from '@/stores/export.store';
import { useCanvasStore } from '@/stores/canvas.store';
import { useSelectionStore } from '@/stores/selection.store';
import { useFileStore } from '@/stores/file.store';
import { ExportEngine, type ExportFormat, type ExportScope } from '@/export/ExportEngine';

export const ExportDialog: React.FC = () => {
  const { isExportDialogOpen, closeDialog, isExporting, setExporting, progress } = useExportStore();
  const { elements, connectors, config } = useCanvasStore();
  const { selectedIds } = useSelectionStore();
  const { currentFileName } = useFileStore();

  const [format, setFormat] = useState<ExportFormat>('png');
  const [scope, setScope] = useState<ExportScope>('all');
  const [scale, setScale] = useState<number>(2);
  const [transparent, setTransparent] = useState<boolean>(true);
  const [padding, setPadding] = useState<number>(20);

  if (!isExportDialogOpen) return null;

  const handleExport = async () => {
    try {
      setExporting(true);

      // Give UI a chance to render loading state
      await new Promise((resolve) => setTimeout(resolve, 50));

      const { data, extension } = await ExportEngine.generateExport(
        elements,
        connectors,
        selectedIds,
        config.backgroundColor,
        { format, scope, scale, transparentBackground: transparent, padding }
      );

      const baseName = currentFileName.replace(/\.[^/.]+$/, "") || 'Untitled Diagram';
      const defaultName = `${baseName}_export.${extension}`;

      // Call IPC to save file
      if (window.electronAPI && window.electronAPI.exportFile) {
        let arrayData: Uint8Array;
        
        if (typeof data === 'string') {
           const encoder = new TextEncoder();
           arrayData = encoder.encode(data);
        } else {
           arrayData = data;
        }

        const filters = [
          { name: `${extension.toUpperCase()} File`, extensions: [extension] },
          { name: 'All Files', extensions: ['*'] }
        ];

        const result = await window.electronAPI.exportFile(defaultName, arrayData, filters);
        
        if (!result.success && result.error !== 'Export cancelled') {
          throw new Error(result.error);
        }
      }

    } catch (error) {
      console.error('[ExportDialog] Failed to export:', error);
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setExporting(false);
      closeDialog();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-border rounded-lg shadow-xl w-full max-w-md animate-slide-in-bottom">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-text flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Diagram
          </h2>
          <button
            onClick={closeDialog}
            disabled={isExporting}
            className="text-text-tertiary hover:text-text disabled:opacity-50 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Format */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as ExportFormat)}
              disabled={isExporting}
              className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="png">PNG (High Resolution Image)</option>
              <option value="svg">SVG (Scalable Vector Graphics)</option>
              <option value="pdf">PDF (Printable Document)</option>
              <option value="json">JSON (Project Data)</option>
            </select>
          </div>

          {/* Scope */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-text-secondary">Export Scope</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as ExportScope)}
              disabled={isExporting}
              className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="all">Entire Diagram</option>
              <option value="selection" disabled={selectedIds.size === 0}>
                Selection Only {selectedIds.size === 0 && '(None selected)'}
              </option>
            </select>
          </div>

          {/* PNG specific options */}
          {format === 'png' && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Scale (Resolution)</label>
              <div className="flex gap-2">
                {[1, 2, 4].map((s) => (
                  <button
                    key={s}
                    onClick={() => setScale(s)}
                    disabled={isExporting}
                    className={`flex-1 py-1.5 rounded text-sm font-medium border transition-colors ${
                      scale === s
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-background border-border text-text-secondary hover:border-border-hover'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Background & Padding (Not applicable for JSON) */}
          {format !== 'json' && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary">Padding (px)</label>
                <input
                  type="number"
                  value={padding}
                  onChange={(e) => setPadding(Number(e.target.value))}
                  disabled={isExporting}
                  min={0}
                  max={200}
                  className="w-full bg-background border border-border rounded px-3 py-1.5 text-sm text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="export-transparent"
                  checked={transparent}
                  onChange={(e) => setTransparent(e.target.checked)}
                  disabled={isExporting || format === 'pdf'} // PDF usually doesn't have transparent bg in the same way
                  className="rounded border-border bg-background text-primary focus:ring-primary"
                />
                <label htmlFor="export-transparent" className="text-sm text-text">
                  Transparent Background
                </label>
              </div>
            </>
          )}

          {/* Progress Bar */}
          {isExporting && (
            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-xs text-text-tertiary">
                <span>Generating {format.toUpperCase()}...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-border bg-surface-hover/50 rounded-b-lg">
          <button
            onClick={closeDialog}
            disabled={isExporting}
            className="px-4 py-1.5 rounded text-sm font-medium text-text bg-background border border-border hover:bg-surface transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isExporting ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
};
