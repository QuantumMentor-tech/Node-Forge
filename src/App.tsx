import React, { useEffect } from 'react';
import { AppShell, StartupScreen } from '@/components/layout';
import { ToastProvider } from '@/components/ui/ToastProvider';
import { useTemplateStore } from '@/stores/template.store';
import { useThemeStore } from '@/stores/theme.store';
import { useSettingsStore } from '@/stores/settings.store';
import { useCanvasStore } from '@/stores/canvas.store';
import { useWorkspaceStore } from '@/stores/workspace.store';
import { AutosaveManager } from '@/storage/AutosaveManager';
import { RecoveryManager } from '@/storage/RecoveryManager';
import { RecentProjectsManager } from '@/storage/RecentProjectsManager';
import { useMenuEvents } from '@/hooks/useMenuEvents';
import { CommandRegistry } from '@/editor/CommandRegistry';

const App: React.FC = () => {
  const initTheme = useThemeStore((s) => s.initTheme);
  const welcomeScreenOpen = useTemplateStore((s) => s.welcomeScreenOpen);
  const tabsCount = useWorkspaceStore((s) => s.tabs.length);
  
  const showStartup = welcomeScreenOpen || tabsCount === 0;

  useMenuEvents();

  useEffect(() => {
    initTheme();

    // Apply saved user preferences to runtime stores on startup
    const { settings } = useSettingsStore.getState();
    const { setGridConfig } = useCanvasStore.getState();
    const { setMode } = useThemeStore.getState();

    // Sync grid visibility and snap from settings
    setGridConfig({ enabled: settings.showGrid, snapToGrid: settings.snapToGrid });

    // Apply saved theme
    if (settings.theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(prefersDark ? 'dark' : 'light');
    } else {
      setMode(settings.theme);
    }

    // Initialize storage managers
    AutosaveManager.getInstance();
    RecentProjectsManager.load();
    RecoveryManager.checkForRecoveryData();

    // Initialize centralized command registry (palette, shortcuts, menus)
    CommandRegistry.initialize();

    // Restore multi-document tabs session
    useWorkspaceStore.getState().loadSession();
  }, [initTheme]);

  // Global Multi-Document Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;

      if (isCtrl) {
        const { tabs, activeTabId, selectTab, openTab, closeTab, reopenClosedTab } = useWorkspaceStore.getState();

        if (e.key === 'Tab') {
          e.preventDefault();
          if (tabs.length <= 1) return;
          const currentIdx = tabs.findIndex((t) => t.id === activeTabId);
          if (currentIdx === -1) return;
          let nextIdx = 0;
          if (isShift) {
            nextIdx = (currentIdx - 1 + tabs.length) % tabs.length;
          } else {
            nextIdx = (currentIdx + 1) % tabs.length;
          }
          selectTab(tabs[nextIdx].id);
        } else if (e.key.toLowerCase() === 'w') {
          e.preventDefault();
          if (activeTabId) {
            await closeTab(activeTabId);
          }
        } else if (e.key.toLowerCase() === 't') {
          e.preventDefault();
          if (isShift) {
            reopenClosedTab();
          } else {
            openTab(null, 'Untitled');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {showStartup ? <StartupScreen /> : <AppShell />}
      <ToastProvider />
    </>
  );
};

export default App;
