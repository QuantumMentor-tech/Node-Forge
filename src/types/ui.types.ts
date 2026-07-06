/**
 * UI component prop types and shared UI type definitions.
 */

import type { ReactNode, ButtonHTMLAttributes } from 'react';

// ─── Button ─────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  loading?: boolean;
}

// ─── Icon Button ────────────────────────────────────────────────────────────

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  tooltip?: string;
  active?: boolean;
  size?: ButtonSize;
}

// ─── Panel ──────────────────────────────────────────────────────────────────

export interface PanelProps {
  title: string;
  children: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  id?: string;
}

// ─── Tooltip ────────────────────────────────────────────────────────────────

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: string;
  position?: TooltipPosition;
  children: ReactNode;
  shortcut?: string;
}

// ─── Separator ──────────────────────────────────────────────────────────────

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

