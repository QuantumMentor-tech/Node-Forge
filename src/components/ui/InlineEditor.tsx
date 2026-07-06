/**
 * InlineEditor.tsx
 *
 * Renders a floating textarea precisely over the element being edited.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useInteractionStore } from '@/stores/interaction.store';
import { useCanvasStore } from '@/stores/canvas.store';
import { EditorActions } from '@/editor/EditorActions';

export const InlineEditor: React.FC = () => {
  const { inlineEditId, setInlineEditId } = useInteractionStore();
  const { elements, viewport } = useCanvasStore();
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const el = elements.find(e => e.id === inlineEditId);

  useEffect(() => {
    if (el) {
      setValue(el.label || '');
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.select();
        }
      }, 10);
    }
  }, [el?.id]);

  if (!inlineEditId || !el) return null;

  // Convert element bounds to screen coordinates
  const screenX = el.bounds.x * viewport.zoom + viewport.panX;
  const screenY = el.bounds.y * viewport.zoom + viewport.panY;
  const screenWidth = el.bounds.width * viewport.zoom;
  const screenHeight = el.bounds.height * viewport.zoom;

  const handleBlur = () => {
    if ((el.label ?? '') !== value) {
      EditorActions.updateElement(el.id, { label: value });
    }
    setInlineEditId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setInlineEditId(null); // Cancel
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleBlur(); // Commit
    }
  };

  const { style } = el;
  const fontSize = (style.fontSize || 14) * viewport.zoom;

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={e => setValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className="absolute z-50 bg-transparent outline-none resize-none border-2 border-accent/50 rounded shadow-elevated overflow-hidden"
      style={{
        left: screenX,
        top: screenY,
        width: Math.max(screenWidth, 100),
        height: Math.max(screenHeight, 40),
        fontFamily: style.fontFamily || 'Inter',
        fontSize: `${fontSize}px`,
        color: style.fontColor || '#000',
        textAlign: style.textAlign as React.CSSProperties['textAlign'] || 'center',
        lineHeight: `${fontSize * 1.4}px`,
        // Vertically centre the text in the shape for single-line labels
        paddingTop: `${Math.max(0, (Math.max(screenHeight, 40) - fontSize * 1.4) / 2)}px`,
        boxSizing: 'border-box',
      }}
    />
  );
};
