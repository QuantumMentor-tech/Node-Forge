/**
 * ExportEngine.ts
 *
 * Core service for generating export files (PNG, SVG, PDF, JSON).
 * Uses the SVGRenderer to generate the graphical source of truth,
 * then converts it to the requested format.
 */

import { jsPDF } from 'jspdf';
import 'svg2pdf.js'; // Augments jsPDF with .svg()
import { SVGRenderer, type SVGExportOptions } from './SVGRenderer';
import { ProjectSerializer } from '@/storage/ProjectSerializer';
import { useExportStore } from '@/stores/export.store';
import type { CanvasElement, Connector } from '@/types/canvas.types';

export type ExportFormat = 'png' | 'svg' | 'pdf' | 'json';
export type ExportScope = 'all' | 'selection';

export interface ExportConfig {
  format: ExportFormat;
  scope: ExportScope;
  scale: number; // 1, 2, 4
  transparentBackground: boolean;
  padding: number;
}

export class ExportEngine {
  
  /**
   * Main entry point to generate an export payload.
   * Updates the export.store progress during generation.
   */
  static async generateExport(
    elements: CanvasElement[],
    connectors: Connector[],
    selectedIds: Set<string>,
    backgroundColor: string,
    config: ExportConfig
  ): Promise<{ data: Uint8Array | string; extension: string }> {
    
    useExportStore.getState().setProgress(10);

    // 1. JSON Export bypasses graphics rendering
    if (config.format === 'json') {
      const project = ProjectSerializer.serialize();
      const str = JSON.stringify(project, null, 2);
      useExportStore.getState().setProgress(100);
      return { data: str, extension: 'nodeforge' };
    }

    // 2. Filter scope
    let exportElements = elements;
    let exportConnectors = connectors;

    if (config.scope === 'selection' && selectedIds.size > 0) {
      exportElements = elements.filter(e => selectedIds.has(e.id));
      exportConnectors = connectors.filter(c => selectedIds.has(c.id));
    }

    if (exportElements.length === 0) {
      throw new Error('No elements to export.');
    }

    // 3. Calculate Bounds
    const bounds = this.calculateBounds(exportElements);

    // 4. Generate SVG string (Source of truth)
    useExportStore.getState().setProgress(40);
    const svgString = SVGRenderer.renderToString({
      elements: exportElements,
      connectors: exportConnectors,
      bounds,
      transparentBackground: config.transparentBackground,
      backgroundColor,
      padding: config.padding,
    });

    if (config.format === 'svg') {
      useExportStore.getState().setProgress(100);
      return { data: svgString, extension: 'svg' };
    }

    // 5. PDF Export
    if (config.format === 'pdf') {
      useExportStore.getState().setProgress(60);
      const width = bounds.width + config.padding * 2;
      const height = bounds.height + config.padding * 2;
      
      const doc = new jsPDF({
        orientation: width > height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [width, height],
      });

      // svg2pdf requires a DOM element or a string parsed into a DOM element
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;

      useExportStore.getState().setProgress(80);
      
      await doc.svg(svgElement, {
        x: 0,
        y: 0,
        width,
        height,
      });

      const arrayBuffer = doc.output('arraybuffer');
      useExportStore.getState().setProgress(100);
      return { data: new Uint8Array(arrayBuffer), extension: 'pdf' };
    }

    // 6. PNG Export
    if (config.format === 'png') {
      useExportStore.getState().setProgress(50);
      const pngData = await this.svgToPng(svgString, bounds.width + config.padding * 2, bounds.height + config.padding * 2, config.scale);
      useExportStore.getState().setProgress(100);
      return { data: pngData, extension: 'png' };
    }

    throw new Error(`Unsupported export format: ${config.format}`);
  }

  /**
   * Calculates the bounding box of a set of elements.
   */
  private static calculateBounds(elements: CanvasElement[]) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const el of elements) {
      if (el.bounds.x < minX) minX = el.bounds.x;
      if (el.bounds.y < minY) minY = el.bounds.y;
      if (el.bounds.x + el.bounds.width > maxX) maxX = el.bounds.x + el.bounds.width;
      if (el.bounds.y + el.bounds.height > maxY) maxY = el.bounds.y + el.bounds.height;
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
    };
  }

  /**
   * Converts an SVG string to a PNG Uint8Array via an offscreen canvas.
   */
  private static async svgToPng(svgString: string, width: number, height: number, scale: number): Promise<Uint8Array> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get 2d context'));
          return;
        }

        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, width, height);

        URL.revokeObjectURL(url);

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to create PNG blob'));
            return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
            const arrayBuffer = reader.result as ArrayBuffer;
            resolve(new Uint8Array(arrayBuffer));
          };
          reader.onerror = reject;
          reader.readAsArrayBuffer(blob);
        }, 'image/png');
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG into Image'));
      };

      img.src = url;
    });
  }
}
