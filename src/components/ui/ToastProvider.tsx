/**
 * ToastProvider.tsx
 *
 * Renders active toast notifications overlaying the application.
 */

import React, { useEffect } from 'react';
import { useToastStore, type Toast } from '@/stores/toast.store';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';

const ToastItem: React.FC<{ toast: Toast }> = ({ toast }) => {
  const { removeToast } = useToastStore();

  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        removeToast(toast.id);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast, removeToast]);

  const Icon = {
    info: Info,
    success: CheckCircle2,
    warning: AlertCircle,
    error: XCircle,
  }[toast.type];

  const colors = {
    info: 'bg-surface border-border text-text',
    success: 'bg-status-success/10 border-status-success/20 text-status-success',
    warning: 'bg-status-warning/10 border-status-warning/20 text-status-warning',
    error: 'bg-status-error/10 border-status-error/20 text-status-error',
  }[toast.type];

  return (
    <div className={`pointer-events-auto flex items-center gap-3 w-80 p-3 rounded-lg border shadow-lg animate-slide-in-bottom backdrop-blur-sm ${colors}`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="opacity-50 hover:opacity-100 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastProvider: React.FC = () => {
  const { toasts } = useToastStore();

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};
