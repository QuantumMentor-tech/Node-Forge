import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCcw, AlertTriangle } from 'lucide-react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React boundary:', error, errorInfo);
  }

  private handleReload = () => {
    // A more sophisticated app might attempt to save dirty state to localStorage first
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="absolute inset-0 z-[9999] flex flex-col items-center justify-center bg-[var(--color-bg)] text-text">
          <div className="flex flex-col items-center bg-surface-raised p-8 rounded-xl shadow-elevated border border-border max-w-md text-center">
            <div className="w-16 h-16 bg-status-error/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-status-error" />
            </div>
            <h2 className="text-xl font-bold mb-2">Editor Crashed</h2>
            <p className="text-sm text-text-secondary mb-6">
              An unexpected error occurred in the rendering engine. Your recent unsaved changes might be lost.
            </p>
            <div className="bg-surface p-3 rounded border border-border-subtle w-full mb-6 overflow-x-auto text-left">
              <code className="text-2xs text-status-error break-words whitespace-pre-wrap">
                {this.state.error?.message || 'Unknown render error'}
              </code>
            </div>
            <button
              onClick={this.handleReload}
              className="flex items-center gap-2 bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded shadow-sm transition-colors font-medium"
            >
              <RefreshCcw className="w-4 h-4" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
