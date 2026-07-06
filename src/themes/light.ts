/**
 * Light theme CSS custom properties.
 */

import type { ThemeTokens } from './dark';

export const lightTheme: ThemeTokens = {
  '--color-surface': '#ffffff',
  '--color-surface-raised': '#f8f9fb',
  '--color-surface-overlay': '#f0f1f5',
  '--color-surface-sunken': '#ebedf2',

  '--color-border': '#d4d7e0',
  '--color-border-subtle': '#e8eaef',
  '--color-border-strong': '#b4b9c8',

  '--color-text': '#1a1d27',
  '--color-text-secondary': '#5a6072',
  '--color-text-tertiary': '#8a90a3',
  '--color-text-inverse': '#ffffff',

  '--color-accent': '#6366f1',
  '--color-accent-hover': '#4f46e5',
  '--color-accent-muted': 'rgba(99, 102, 241, 0.1)',

  '--color-status-success': '#16a34a',
  '--color-status-warning': '#d97706',
  '--color-status-error': '#dc2626',
  '--color-status-info': '#2563eb',

  '--color-canvas-bg': '#ffffff',
  '--color-canvas-grid': '#e8eaef',
  '--color-canvas-dot': '#d4d7e0',

  '--color-toolbar-bg': '#f8f9fb',
  '--color-statusbar-bg': '#ebedf2',
  '--color-panel-bg': '#f8f9fb',

  '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.06)',
  '--shadow-md': '0 4px 8px rgba(0, 0, 0, 0.1)',
  '--shadow-lg': '0 8px 24px rgba(0, 0, 0, 0.12)',
};
