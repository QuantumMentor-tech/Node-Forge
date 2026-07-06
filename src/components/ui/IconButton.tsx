/**
 * IconButton — icon-only button for toolbars with optional active state.
 */

import React from 'react';
import { Tooltip } from './Tooltip';
import type { IconButtonProps } from '@/types/ui.types';

const sizeStyles: Record<string, string> = {
  sm: 'w-7 h-7 rounded-md [&>svg]:w-3.5 [&>svg]:h-3.5',
  md: 'w-8 h-8 rounded-lg [&>svg]:w-4 [&>svg]:h-4',
  lg: 'w-10 h-10 rounded-lg [&>svg]:w-5 [&>svg]:h-5',
};

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  tooltip,
  active,
  size = 'md',
  className = '',
  ...props
}) => {
  const button = (
    <button
      className={`
        inline-flex items-center justify-center
        transition-all duration-100 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
        disabled:opacity-40 disabled:pointer-events-none
        ${active
          ? 'bg-accent/15 text-accent hover:bg-accent/25'
          : 'text-text-secondary hover:text-text hover:bg-surface-overlay active:bg-surface-raised'
        }
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {icon}
    </button>
  );

  if (tooltip) {
    return <Tooltip content={tooltip}>{button}</Tooltip>;
  }

  return button;
};
