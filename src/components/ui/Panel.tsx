/**
 * Panel — collapsible container with title header for sidebars and property groups.
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { PanelProps } from '@/types/ui.types';

export const Panel: React.FC<PanelProps> = ({
  title,
  children,
  collapsible = true,
  defaultCollapsed = false,
  className = '',
  id,
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div
      id={id}
      className={`border-b border-border-subtle ${className}`}
    >
      {/* Header */}
      <button
        className={`
          w-full flex items-center gap-2 px-3 py-2
          text-xs font-semibold uppercase tracking-wider
          text-text-secondary hover:text-text
          transition-colors duration-100
          ${collapsible ? 'cursor-pointer' : 'cursor-default'}
        `}
        onClick={() => collapsible && setCollapsed(!collapsed)}
        aria-expanded={!collapsed}
      >
        {collapsible && (
          <span className="flex-shrink-0 [&>svg]:w-3 [&>svg]:h-3 text-text-tertiary">
            {collapsed ? <ChevronRight /> : <ChevronDown />}
          </span>
        )}
        <span>{title}</span>
      </button>

      {/* Content */}
      {!collapsed && (
        <div className="px-3 pb-3 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};
