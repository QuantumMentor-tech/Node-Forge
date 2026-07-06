/**
 * Minimap.tsx
 *
 * Professional minimap component for viewport navigation.
 */

import React, { useRef, useEffect, useState } from 'react';
import { useCanvasStore } from '@/stores/canvas.store';
import { calculateMinimapBounds } from '@/utils/coordinates';

const MINIMAP_SIZE = 150;
const PADDING = 20;

export const Minimap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const elements = useCanvasStore(state => state.elements);
  const viewport = useCanvasStore(state => state.viewport);
  const setViewport = useCanvasStore(state => state.setViewport);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { minX, minY, scale, offsetX, offsetY } = calculateMinimapBounds(
      elements,
      PADDING,
      MINIMAP_SIZE
    );

    // Set high-dpi resolution
    const dpr = window.devicePixelRatio || 1;
    canvas.width = MINIMAP_SIZE * dpr;
    canvas.height = MINIMAP_SIZE * dpr;
    canvas.style.width = `${MINIMAP_SIZE}px`;
    canvas.style.height = `${MINIMAP_SIZE}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

    // Draw elements
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    ctx.translate(-minX, -minY);

    ctx.fillStyle = 'rgba(99, 102, 241, 0.4)'; // Accent color muted
    
    elements.forEach(el => {
      ctx.fillRect(el.bounds.x, el.bounds.y, el.bounds.width, el.bounds.height);
    });

    // Draw current viewport
    const viewW = window.innerWidth / viewport.zoom;
    const viewH = window.innerHeight / viewport.zoom;
    const viewX = -viewport.panX / viewport.zoom;
    const viewY = -viewport.panY / viewport.zoom;

    ctx.strokeStyle = '#ef4444'; // Red viewport outline
    ctx.lineWidth = 2 / scale;
    ctx.strokeRect(viewX, viewY, viewW, viewH);

    // Add subtle fill to viewport
    ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
    ctx.fillRect(viewX, viewY, viewW, viewH);

    ctx.restore();
  }, [elements, viewport]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    updateViewport(e);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    updateViewport(e);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const updateViewport = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const { minX, minY, scale, offsetX, offsetY } = calculateMinimapBounds(
      elements,
      PADDING,
      MINIMAP_SIZE
    );

    // Convert local minimap click back to world coordinates
    const worldX = (x - offsetX) / scale + minX;
    const worldY = (y - offsetY) / scale + minY;

    // Center viewport on this point
    const viewW = window.innerWidth / viewport.zoom;
    const viewH = window.innerHeight / viewport.zoom;

    setViewport({
      panX: -(worldX - viewW / 2) * viewport.zoom,
      panY: -(worldY - viewH / 2) * viewport.zoom,
    });
  };

  return (
    <div 
      ref={containerRef}
      className="absolute bottom-4 right-4 z-40 bg-surface-raised border border-border rounded-lg shadow-panel overflow-hidden opacity-80 hover:opacity-100 transition-opacity cursor-crosshair"
      style={{ width: MINIMAP_SIZE, height: MINIMAP_SIZE }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      title="Minimap (Drag to Pan)"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
