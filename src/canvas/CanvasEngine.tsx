import React, { useEffect, useRef, useMemo } from 'react';
import { useCanvasStore } from '@/stores/canvas.store';
import { useZoomStore } from '@/stores/zoom.store';
import { useSelectionStore } from '@/stores/selection.store';
import { useInteractionStore } from '@/stores/interaction.store';
import { useLayerStore } from '@/stores/layer.store';
import { useSettingsStore } from '@/stores/settings.store';
import { InteractionManager } from './InteractionManager';
import { GridRenderer } from './GridRenderer';
import { ShapeRenderer } from './renderer/ShapeRenderer';
import { SelectionRenderer } from './renderer/SelectionRenderer';
import { ConnectorRenderer } from './renderer/ConnectorRenderer';
import { GuideRenderer } from './renderer/GuideRenderer';
import { AnchorRenderer } from './renderer/AnchorRenderer';
import { ElementType } from '@/types/canvas.types';
import { createElement } from '@/utils/element.factory';
import { screenToWorld } from '@/utils/coordinates';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { EditorActions } from '@/editor/EditorActions';

export const CanvasEngine: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const interactionManager = useRef<InteractionManager | null>(null);

  useKeyboardShortcuts();

  // We only subscribe to nothing to prevent CanvasEngine from re-rendering.
  // The render loop manually fetches state at 60fps.

  // Handle resizing
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        canvasRef.current.width = width * window.devicePixelRatio;
        canvasRef.current.height = height * window.devicePixelRatio;
        canvasRef.current.style.width = `${width}px`;
        canvasRef.current.style.height = `${height}px`;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize InteractionManager
  useEffect(() => {
    if (canvasRef.current) {
      interactionManager.current = new InteractionManager(canvasRef.current);
      return () => interactionManager.current?.destroy();
    }
  }, []);

  // Render Loop
  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { width, height } = canvas;
      
      // Reset transform to identity before clearing the canvas, otherwise the matrix compounds infinitely!
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      
      // Clear
      ctx.clearRect(0, 0, width, height);
      
      // Setup scale for Retina displays
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // Fetch dynamic state directly from stores inside the render loop
      const { elements, connectors, viewport, config } = useCanvasStore.getState();
      const { selectedIds } = useSelectionStore.getState();
      const { layers } = useLayerStore.getState();

      // Viewport Culling Bounds (with 20% margin)
      const viewW = (width / window.devicePixelRatio) / viewport.zoom;
      const viewH = (height / window.devicePixelRatio) / viewport.zoom;
      const viewX = -viewport.panX / viewport.zoom;
      const viewY = -viewport.panY / viewport.zoom;
      
      const marginX = viewW * 0.2;
      const marginY = viewH * 0.2;
      const cullBounds = {
        minX: viewX - marginX,
        minY: viewY - marginY,
        maxX: viewX + viewW + marginX,
        maxY: viewY + viewH + marginY
      };

      // Filter visible elements based on layer state and viewport culling
      const visibleLayerIds = new Set(layers.filter(l => l.visible).map(l => l.id));
      
      const visibleElements = elements.filter(el => {
        // 1. Layer Check
        if (el.layerId && !visibleLayerIds.has(el.layerId)) return false;
        
        // 2. Viewport Culling Check
        const b = el.bounds;
        if (
          b.x > cullBounds.maxX ||
          b.y > cullBounds.maxY ||
          b.x + b.width < cullBounds.minX ||
          b.y + b.height < cullBounds.minY
        ) {
          return false;
        }
        return true;
      });
      const visibleConnectors = connectors.filter(c => {
        // Find source and target layers
        const src = elements.find(el => el.id === c.sourceId);
        const tgt = elements.find(el => el.id === c.targetId);
        const srcVisible = src ? (!src.layerId || visibleLayerIds.has(src.layerId)) : true;
        const tgtVisible = tgt ? (!tgt.layerId || visibleLayerIds.has(tgt.layerId)) : true;
        return srcVisible && tgtVisible;
      });

      // 1. Render Grid
      GridRenderer.render(ctx, viewport, config.grid, width / window.devicePixelRatio, height / window.devicePixelRatio);

      // 2. Render Connectors
      ConnectorRenderer.render(ctx, visibleElements, visibleConnectors, viewport, selectedIds);

      // 3. Render Elements
      ShapeRenderer.render(ctx, visibleElements, viewport);

      // 3b. Render Anchor Points (hover indicators & connection preview)
      const interaction = useInteractionStore.getState();
      AnchorRenderer.render(ctx, visibleElements, interaction, viewport);

      // 4. Render Selection Overlay
      SelectionRenderer.render(ctx, visibleElements, selectedIds, viewport);

      // 4b. Render Snapping Guides
      const { settings } = useSettingsStore.getState();
      if (settings.showGuides) {
        GuideRenderer.render(ctx, interaction.activeGuides, viewport);
      }

      // 5. Render Box Selection (Marquee)
      if (interaction.phase === 'SELECTING_BOX' && interaction.selectionBox) {
        const box = interaction.selectionBox;
        ctx.save();
        ctx.translate(viewport.panX, viewport.panY);
        ctx.scale(viewport.zoom, viewport.zoom);
        
        ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 1 / viewport.zoom;
        ctx.fillRect(box.x, box.y, box.width, box.height);
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, []); // Empty dependency array prevents re-renders on state changes
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const { viewport } = useCanvasStore.getState();
    const { select } = useSelectionStore.getState();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const worldPos = screenToWorld(screenPos, viewport);

    // ── Case 1: Drop from shape library (type string) ──────────────────────
    const shapeType = e.dataTransfer.getData('application/nodeforge-shape') as ElementType;
    if (shapeType) {
      const newElement = createElement(shapeType, worldPos);
      newElement.bounds.x -= newElement.bounds.width / 2;
      newElement.bounds.y -= newElement.bounds.height / 2;
      EditorActions.commitElement(newElement);
      select(newElement.id);
      return;
    }

    // ── Case 2: Drop from scratchpad (full element JSON) ───────────────────
    const raw = e.dataTransfer.getData('application/nodeforge-element');
    if (raw) {
      try {
        const source = JSON.parse(raw);
        // Re-hydrate with a fresh ID and place at drop world position
        const newElement = {
          ...source,
          id: `${source.type}-${Date.now()}-${Math.floor(Math.random() * 9999)}`,
          bounds: {
            ...source.bounds,
            x: worldPos.x - source.bounds.width / 2,
            y: worldPos.y - source.bounds.height / 2,
          },
          zIndex: Date.now(),
        };
        EditorActions.commitElement(newElement);
        select(newElement.id);
      } catch {
        console.warn('[CanvasEngine] Failed to parse dropped element JSON');
      }
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full overflow-hidden bg-surface-sunken"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <canvas
        ref={canvasRef}
        className="block touch-none"
      />
    </div>
  );
};
