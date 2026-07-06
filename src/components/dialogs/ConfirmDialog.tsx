/**
 * ConfirmDialog.tsx
 *
 * A premium, highly stylized confirmation dialog that acts as a dropdown/overlay
 * replacement for window.confirm().
 */

import React, { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useConfirmStore } from '@/stores/confirm.store';

export const ConfirmDialog: React.FC = () => {
  const { isOpen, title, message, confirmLabel, cancelLabel, confirm, cancel } = useConfirmStore();

  // Handle escape key to cancel
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cancel();
      } else if (e.key === 'Enter') {
        confirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, confirm, cancel]);

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={cancel}
    >
      <div
        className="w-[420px] bg-surface border border-border shadow-2xl rounded-xl overflow-hidden p-6 flex flex-col gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-4">
          <div className="p-3 bg-status-warning/10 text-status-warning rounded-lg h-fit">
            <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <h3 className="font-semibold text-text text-base leading-snug">{title}</h3>
            <p className="text-text-secondary text-sm leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={cancel}
            className="px-4 py-2 border border-border hover:bg-surface-hover rounded-md text-text text-sm transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={confirm}
            className="px-4 py-2 bg-accent text-accent-foreground rounded-md text-sm font-semibold hover:bg-accent/90 transition-colors shadow-sm"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
