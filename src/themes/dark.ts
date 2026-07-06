/**
 * Dark theme CSS custom properties.
 * Inspired by VS Code Dark+ and Figma dark mode.
 */

export const darkTheme = {
  '--color-surface': '#0f1117',
  '--color-surface-raised': '#1a1d27',
  '--color-surface-overlay': '#242836',
  '--color-surface-sunken': '#0a0c10',

  '--color-border': '#2a2e3d',
  '--color-border-subtle': '#1e2130',
  '--color-border-strong': '#3d4259',

  '--color-text': '#e1e4ed',
  '--color-text-secondary': '#9da3b5',
  '--color-text-tertiary': '#6b7185',
  '--color-text-inverse': '#0f1117',

  '--color-accent': '#6366f1',
  '--color-accent-hover': '#818cf8',
  '--color-accent-muted': 'rgba(99, 102, 241, 0.15)',

  '--color-status-success': '#22c55e',
  '--color-status-warning': '#f59e0b',
  '--color-status-error': '#ef4444',
  '--color-status-info': '#3b82f6',

  '--color-canvas-bg': '#1e2130',
  '--color-canvas-grid': '#2a2e3d',
  '--color-canvas-dot': '#3d4259',

  '--color-toolbar-bg': '#161822',
  '--color-statusbar-bg': '#0d0f15',
  '--color-panel-bg': '#161822',

  '--shadow-sm': '0 1px 2px rgba(0, 0, 0, 0.4)',
  '--shadow-md': '0 4px 8px rgba(0, 0, 0, 0.5)',
  '--shadow-lg': '0 8px 24px rgba(0, 0, 0, 0.6)',
} as const;

export type ThemeTokens = Record<keyof typeof darkTheme, string>;
