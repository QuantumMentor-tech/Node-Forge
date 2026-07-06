/**
 * toast.store.ts
 *
 * Manages the global state for toast notifications.
 */

import { create } from 'zustand';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // ms
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export const toast = {
  info: (message: string, duration = 3000) => useToastStore.getState().addToast({ type: 'info', message, duration }),
  success: (message: string, duration = 3000) => useToastStore.getState().addToast({ type: 'success', message, duration }),
  warning: (message: string, duration = 4000) => useToastStore.getState().addToast({ type: 'warning', message, duration }),
  error: (message: string, duration = 5000) => useToastStore.getState().addToast({ type: 'error', message, duration }),
};
