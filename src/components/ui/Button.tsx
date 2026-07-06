/**
 * Button — reusable button with variant and size support.
 */

import React from 'react';
import type { ButtonProps } from '@/types/ui.types';

const variantStyles: Record<string, string> = {
  primary:
    'bg-accent text-white hover:bg-accent-hover active:brightness-90 shadow-sm',
  secondary:
    'bg-surface-overlay text-text border border-border hover:bg-surface-raised hover:border-border-strong active:brightness-90',
  ghost:
    'bg-transparent text-text-secondary hover:text-text hover:bg-surface-overlay active:bg-surface-raised',
  danger:
    'bg-status-error/10 text-status-error hover:bg-status-error/20 active:bg-status-error/30',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-2.5 py-1 text-xs gap-1.5 rounded-md',
  md: 'px-3.5 py-1.5 text-sm gap-2 rounded-lg',
  lg: 'px-5 py-2.5 text-sm gap-2 rounded-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'secondary',
  size = 'md',
  icon,
  loading,
  disabled,
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-100 ease-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-surface
        disabled:opacity-40 disabled:pointer-events-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0 [&>svg]:w-4 [&>svg]:h-4">{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
    </button>
  );
};
