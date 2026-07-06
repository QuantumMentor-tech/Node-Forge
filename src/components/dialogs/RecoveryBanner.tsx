/**
 * RecoveryBanner.tsx
 *
 * Appears at the top of the screen when an autosaved session is detected.
 */

import React from 'react';
import { AlertCircle, FileClock, X } from 'lucide-react';
import { useRecoveryStore, RecoveryManager } from '@/storage/RecoveryManager';

export const RecoveryBanner: React.FC = () => {
  const { hasRecoveryData, recoveryRecord } = useRecoveryStore();

  if (!hasRecoveryData || !recoveryRecord) return null;

  const handleRestore = () => {
    RecoveryManager.restoreSession();
  };

  const handleDiscard = () => {
    RecoveryManager.discardSession();
  };

  return (
    <div className="bg-status-warning/10 border-b border-status-warning/30 px-4 py-2 flex items-center gap-3 animate-slide-in-top z-50 shadow-sm relative">
      <div className="flex items-center gap-2 text-status-warning flex-1">
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
        <span className="text-xs font-medium">
          An unsaved session for "{recoveryRecord.originalFileName}" was recovered.
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleRestore}
          className="flex items-center gap-1.5 px-3 py-1 bg-status-warning text-status-warning-foreground rounded text-xs font-semibold hover:bg-status-warning/90 transition-colors"
        >
          <FileClock className="w-3.5 h-3.5" />
          Restore Session
        </button>
        <button
          onClick={handleDiscard}
          className="px-3 py-1 bg-transparent border border-border-subtle hover:bg-surface-hover rounded text-text text-xs transition-colors"
        >
          Discard
        </button>
      </div>
      <button
        onClick={() => useRecoveryStore.getState().dismissRecovery()}
        className="absolute top-1 right-1 p-1 text-text-tertiary hover:text-text rounded transition-colors"
        title="Dismiss"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};
