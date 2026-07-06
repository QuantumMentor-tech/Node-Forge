/**
 * Confirm store — manages a global promise-based confirmation dialog.
 */

import { create } from 'zustand';

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  resolvePromise: ((value: boolean) => void) | null;

  // Actions
  askConfirm: (options: {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
  }) => Promise<boolean>;
  confirm: () => void;
  cancel: () => void;
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  isOpen: false,
  title: '',
  message: '',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  resolvePromise: null,

  askConfirm: ({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel' }) => {
    // If there is an existing pending promise, reject/cancel it first
    const { resolvePromise } = get();
    if (resolvePromise) {
      resolvePromise(false);
    }

    return new Promise<boolean>((resolve) => {
      set({
        isOpen: true,
        title,
        message,
        confirmLabel,
        cancelLabel,
        resolvePromise: resolve,
      });
    });
  },

  confirm: () => {
    const { resolvePromise } = get();
    if (resolvePromise) resolvePromise(true);
    set({ isOpen: false, resolvePromise: null });
  },

  cancel: () => {
    const { resolvePromise } = get();
    if (resolvePromise) resolvePromise(false);
    set({ isOpen: false, resolvePromise: null });
  },
}));
