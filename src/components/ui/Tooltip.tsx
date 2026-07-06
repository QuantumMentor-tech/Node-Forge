/**
 * Tooltip — hover tooltip with configurable position.
 */

import React, { useState, useRef } from 'react';
import type { TooltipProps } from '@/types/ui.types';

const positionStyles: Record<string, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  position = 'bottom',
  children,
  shortcut,
}) => {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), 500);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      {visible && (
        <div
          className={`
            absolute z-50 px-2 py-1 rounded-md
            bg-surface-overlay text-text text-2xs font-medium
            shadow-tooltip whitespace-nowrap pointer-events-none
            animate-fade-in border border-border-subtle
            ${positionStyles[position]}
          `}
        >
          <span>{content}</span>
          {shortcut && (
            <span className="ml-2 text-text-tertiary font-mono">{shortcut}</span>
          )}
        </div>
      )}
    </div>
  );
};
