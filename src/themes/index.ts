/**
 * Theme system entry point.
 * Provides helpers to apply theme tokens as CSS custom properties.
 */

import { darkTheme, type ThemeTokens } from './dark';
import { lightTheme } from './light';

export type ThemeMode = 'light' | 'dark';

export const themes: Record<ThemeMode, ThemeTokens> = {
  dark: darkTheme,
  light: lightTheme,
};

/**
 * Apply a theme's CSS custom properties to a target element.
 */
export function applyTheme(mode: ThemeMode, element: HTMLElement = document.documentElement): void {
  const tokens = themes[mode];
  Object.entries(tokens).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });

  // Update the dark class for TailwindCSS
  if (mode === 'dark') {
    element.classList.add('dark');
  } else {
    element.classList.remove('dark');
  }
}
