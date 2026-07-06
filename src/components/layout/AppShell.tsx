/**
 * AppShell — master layout using CSS Grid for toolbar/sidebar/canvas/properties/statusbar.
 */

import React from 'react';
import { Toolbar } from './Toolbar';
import { TabBar } from './TabBar';
import { Sidebar } from './Sidebar';
import { CanvasArea } from './CanvasArea';
import { PropertiesPanel } from './PropertiesPanel';
import { StatusBar } from './StatusBar';
import { RecoveryBanner } from '../dialogs/RecoveryBanner';
import { ExportDialog } from '../dialogs/ExportDialog';
import { ContextMenu } from '../ui/ContextMenu';
import { ErrorBoundary } from '../utils/ErrorBoundary';
import { CommandPalette } from '../ui/CommandPalette';
import { FloatingToolbar } from '../ui/FloatingToolbar';
import { SettingsDialog } from '../dialogs/SettingsDialog';
import { ConfirmDialog } from '../dialogs/ConfirmDialog';
import { SaveAsTemplateDialog } from '../dialogs/SaveAsTemplateDialog';
import { PluginManager } from '@/plugins/PluginManager';
import { GridGeneratorPlugin } from '@/plugins/GridGeneratorPlugin';
import { useEffect } from 'react';

export const AppShell: React.FC = () => {
  useEffect(() => {
    // Register default plugins on startup
    PluginManager.register(GridGeneratorPlugin);
  }, []);

  return (
    <ErrorBoundary>
      <div id="app-shell" className="w-full h-full flex flex-col overflow-hidden bg-surface">
        <ExportDialog />
        <RecoveryBanner />
        <Toolbar />
        <TabBar />
        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <CanvasArea />
          <PropertiesPanel />
        </div>
        <StatusBar />
        <ContextMenu />
        <CommandPalette />
        <FloatingToolbar />
        <SettingsDialog />
        <ConfirmDialog />
        <SaveAsTemplateDialog />
      </div>
    </ErrorBoundary>
  );
};
