/**
 * SettingsDialog.tsx
 *
 * Fully functional Settings modal with 4 working tabs:
 *  • Editor   — Theme (live apply), Autosave, Grid, Snap-to-Grid
 *  • Storage  — View localStorage usage, clear diagram data
 *  • Performance — High-quality rendering toggle
 *  • Plugins  — Enable / disable installed plugins
 */

import React, { useState, useEffect } from 'react';
import { X, Monitor, HardDrive, Zap, Puzzle, Trash2, Info } from 'lucide-react';
import { useSettingsStore } from '@/stores/settings.store';
import { usePluginStore } from '@/stores/plugin.store';
import { useThemeStore } from '@/stores/theme.store';
import { useCanvasStore } from '@/stores/canvas.store';
import { PluginManager } from '@/plugins/PluginManager';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'editor' | 'storage' | 'performance' | 'plugins';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'editor',      label: 'Editor',      icon: <Monitor   className="w-4 h-4" /> },
  { id: 'storage',     label: 'Storage',     icon: <HardDrive className="w-4 h-4" /> },
  { id: 'performance', label: 'Performance', icon: <Zap       className="w-4 h-4" /> },
  { id: 'plugins',     label: 'Plugins',     icon: <Puzzle    className="w-4 h-4" /> },
];

const TITLES: Record<Tab, string> = {
  editor:      'Editor Preferences',
  storage:     'Storage & Data',
  performance: 'Performance',
  plugins:     'Plugin Manager',
};

// ─── Shared UI ────────────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <h4 className="text-xs font-bold text-text-tertiary uppercase tracking-wider pb-1 border-b border-border-subtle">
    {title}
  </h4>
);

const Toggle: React.FC<{ checked: boolean; onChange: (v: boolean) => void }> = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
    <input type="checkbox" className="sr-only peer" checked={checked} onChange={e => onChange(e.target.checked)} />
    <div className="w-9 h-5 bg-surface-sunken border border-border rounded-full peer
      peer-checked:bg-accent peer-checked:border-accent
      after:content-[''] after:absolute after:top-[2px] after:left-[2px]
      after:bg-white after:border after:border-gray-300 after:rounded-full
      after:h-4 after:w-4 after:transition-all
      peer-checked:after:translate-x-full peer-checked:after:border-white" />
  </label>
);

const SettingRow: React.FC<{
  label: string;
  description?: string;
  children: React.ReactNode;
}> = ({ label, description, children }) => (
  <div className="flex items-center justify-between gap-4 py-1">
    <div className="min-w-0">
      <div className="text-sm text-text font-medium">{label}</div>
      {description && <div className="text-xs text-text-secondary mt-0.5">{description}</div>}
    </div>
    <div className="flex-shrink-0">{children}</div>
  </div>
);

// ─── Tab Panels ───────────────────────────────────────────────────────────────

const EditorTab: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  const { setMode } = useThemeStore();

  const handleThemeChange = (theme: 'dark' | 'light' | 'system') => {
    updateSettings({ theme });
    // Actually apply the theme immediately
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setMode(prefersDark ? 'dark' : 'light');
    } else {
      setMode(theme);
    }
  };

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <SectionHeader title="Appearance" />
        <SettingRow label="Theme" description="Select your preferred color interface">
          <select
            className="bg-surface-sunken border border-border text-sm text-text rounded-md px-3 py-1.5 outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors cursor-pointer"
            value={settings.theme}
            onChange={e => handleThemeChange(e.target.value as 'dark' | 'light' | 'system')}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="system">System Default</option>
          </select>
        </SettingRow>
      </section>

      <section className="space-y-4">
        <SectionHeader title="Behavior" />
        <SettingRow label="Autosave" description="Automatically save diagram state every minute">
          <Toggle checked={settings.autoSave} onChange={v => updateSettings({ autoSave: v })} />
        </SettingRow>
        <SettingRow label="Show Grid" description="Display the canvas dot/line grid">
          <Toggle
            checked={settings.showGrid}
            onChange={v => {
              updateSettings({ showGrid: v });
              useCanvasStore.getState().setGridConfig({ enabled: v });
            }}
          />
        </SettingRow>
        <SettingRow label="Snap to Grid" description="Snap elements to the nearest grid point while moving">
          <Toggle
            checked={settings.snapToGrid}
            onChange={v => {
              updateSettings({ snapToGrid: v });
              useCanvasStore.getState().setGridConfig({ snapToGrid: v });
            }}
          />
        </SettingRow>
        <SettingRow label="Smart Snapping" description="Snap to align with other elements, centers, and spacing">
          <Toggle checked={settings.snapToObjects} onChange={v => updateSettings({ snapToObjects: v })} />
        </SettingRow>
        <SettingRow label="Show Alignment Guides" description="Display alignment guidelines while dragging elements">
          <Toggle checked={settings.showGuides} onChange={v => updateSettings({ showGuides: v })} />
        </SettingRow>
        <SettingRow label="Snap Strength" description={`Snapping sensitivity range: ${settings.snapStrength} pixels`}>
          <input
            type="range"
            min="4"
            max="20"
            step="1"
            className="w-24 accent-accent cursor-pointer"
            value={settings.snapStrength}
            onChange={e => updateSettings({ snapStrength: parseInt(e.target.value) })}
          />
        </SettingRow>
      </section>
    </div>
  );
};

const StorageTab: React.FC = () => {
  const [usage, setUsage] = useState<{ key: string; kb: number }[]>([]);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    // Compute localStorage usage per key
    const items: { key: string; kb: number }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)!;
      const bytes = new Blob([localStorage.getItem(key) || '']).size;
      items.push({ key, kb: parseFloat((bytes / 1024).toFixed(2)) });
    }
    items.sort((a, b) => b.kb - a.kb);
    setUsage(items);
  }, [cleared]);

  const totalKb = usage.reduce((s, i) => s + i.kb, 0);

  const handleClearDiagram = () => {
    // Clear only diagram/canvas data, not settings or scratchpad
    const keysToKeep = [
      'nodeforge_settings',
      'nodeforge-scratchpad-v1',
      'nodeforge-theme',
      'nodeforge_recent_projects',
      'drawio_settings',
      'drawio-scratchpad-v1',
      'drawio-theme',
      'drawio_recent_projects'
    ];
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i)!;
      if (!keysToKeep.some(k => key.startsWith(k))) {
        localStorage.removeItem(key);
      }
    }
    // Also clear in-memory canvas state
    useCanvasStore.getState().clearElements();
    setCleared(c => !c);
  };

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <SectionHeader title="Local Storage Usage" />
        <div className="bg-surface-sunken rounded-lg border border-border-subtle overflow-hidden">
          {usage.length === 0 ? (
            <div className="px-4 py-3 text-sm text-text-tertiary">No data stored.</div>
          ) : (
            usage.map(({ key, kb }) => (
              <div key={key} className="flex items-center justify-between px-4 py-2.5 border-b border-border-subtle last:border-b-0">
                <span className="text-xs text-text-secondary truncate max-w-[280px]" title={key}>{key}</span>
                <span className="text-xs text-text-tertiary font-mono ml-4">{kb} KB</span>
              </div>
            ))
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-text-tertiary">
          <span className="flex items-center gap-1"><Info className="w-3 h-3" /> Total used</span>
          <span className="font-mono font-semibold text-text">{totalKb.toFixed(1)} KB</span>
        </div>
      </section>

      <section className="space-y-3">
        <SectionHeader title="Data Management" />
        <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
          <div>
            <div className="text-sm font-medium text-text">Clear Diagram Data</div>
            <div className="text-xs text-text-secondary mt-0.5">Removes all canvas elements from storage. Settings and scratchpad are preserved.</div>
          </div>
          <button
            onClick={handleClearDiagram}
            className="ml-4 flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm rounded-md border border-red-500/30 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </section>
    </div>
  );
};

const PerformanceTab: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();
  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <SectionHeader title="Rendering" />
        <SettingRow
          label="High Quality Rendering"
          description="Use device pixel ratio scaling for crisp visuals on HiDPI / Retina displays. May reduce FPS on very large diagrams."
        >
          <Toggle checked={settings.highQualityRendering} onChange={v => updateSettings({ highQualityRendering: v })} />
        </SettingRow>
        <SettingRow
          label="Show Grid"
          description="Rendering the grid has a small constant cost each frame."
        >
          <Toggle checked={settings.showGrid} onChange={v => updateSettings({ showGrid: v })} />
        </SettingRow>
      </section>

      <section className="space-y-3">
        <SectionHeader title="Info" />
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Render Engine', value: 'HTML5 Canvas 2D' },
            { label: 'Frame Budget', value: '16.7 ms (60 fps)' },
            { label: 'Viewport Culling', value: 'Enabled (+20% margin)' },
            { label: 'zIndex Sort', value: 'Per-frame, ascending' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface-sunken rounded-lg border border-border-subtle px-3 py-2.5">
              <div className="text-2xs text-text-tertiary uppercase tracking-wide">{label}</div>
              <div className="text-sm text-text font-medium mt-0.5">{value}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const PluginsTab: React.FC = () => {
  const { plugins, activePluginIds } = usePluginStore();
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <SectionHeader title={`Installed Plugins (${plugins.length})`} />
        {plugins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Puzzle className="w-10 h-10 text-text-tertiary opacity-30 mb-3" />
            <div className="text-sm text-text-secondary">No plugins installed</div>
            <div className="text-xs text-text-tertiary mt-1">Plugins extend Draw.io with extra shapes,<br />exporters, and automation.</div>
          </div>
        ) : (
          plugins.map(plugin => {
            const isActive = activePluginIds.has(plugin.id);
            return (
              <div key={plugin.id} className="flex items-start justify-between p-3 border border-border-subtle rounded-lg bg-surface-sunken hover:border-border transition-colors">
                <div className="flex items-start gap-2.5 min-w-0">
                  <Puzzle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm text-text font-medium flex items-center gap-1.5">
                      {plugin.name}
                      <span className="text-xs text-text-tertiary font-normal">v{plugin.version}</span>
                      {isActive && <span className="text-xs bg-accent/15 text-accent px-1.5 py-0.5 rounded font-medium">Active</span>}
                    </div>
                    <div className="text-xs text-text-secondary mt-0.5">{plugin.description}</div>
                  </div>
                </div>
                <div className="ml-3 flex-shrink-0 mt-0.5">
                  <Toggle
                    checked={isActive}
                    onChange={() => {
                      if (isActive) PluginManager.deactivate(plugin.id);
                      else PluginManager.activate(plugin.id);
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};

// ─── Main Dialog ──────────────────────────────────────────────────────────────

export const SettingsDialog: React.FC = () => {
  const { isSettingsOpen, closeSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState<Tab>('editor');

  if (!isSettingsOpen) return null;

  const PANELS: Record<Tab, React.ReactNode> = {
    editor:      <EditorTab />,
    storage:     <StorageTab />,
    performance: <PerformanceTab />,
    plugins:     <PluginsTab />,
  };

  return (
    <div
      className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={closeSettings}
    >
      <div
        className="w-[640px] h-[520px] bg-surface border border-border shadow-2xl rounded-xl flex overflow-hidden animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Left nav ── */}
        <div className="w-44 bg-surface-sunken border-r border-border p-3 flex flex-col gap-0.5 flex-shrink-0">
          <h2 className="text-xs font-bold text-text-tertiary uppercase tracking-wider px-3 py-2 mb-1">Settings</h2>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-3 py-2 text-sm rounded-md transition-colors text-left w-full ${
                activeTab === tab.id
                  ? 'bg-accent/10 text-accent font-medium border border-accent/20'
                  : 'text-text-secondary hover:text-text hover:bg-surface'
              }`}
            >
              <span className={activeTab === tab.id ? 'text-accent' : 'text-text-tertiary'}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle flex-shrink-0">
            <h3 className="font-semibold text-text">{TITLES[activeTab]}</h3>
            <button
              onClick={closeSettings}
              className="p-1 text-text-tertiary hover:text-text rounded-md hover:bg-surface-sunken transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Panel body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {PANELS[activeTab]}
          </div>
        </div>
      </div>
    </div>
  );
};
