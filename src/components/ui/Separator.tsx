/**
 * Separator — horizontal or vertical divider.
 */

import React from 'react';
import type { SeparatorProps } from '@/types/ui.types';

export const Separator: React.FC<SeparatorProps> = ({
  orientation = 'horizontal',
  className = '',
}) => {
  return (
    <div
      role="separator"
      className={`
        flex-shrink-0 bg-border-subtle
        ${orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full'}
        ${className}
      `}
    />
  );
};
