/**
 * Toolbar.tsx
 *
 * Top navigation and central segmented controls for editor modes and tools.
 */

import React from 'react';
import nodeForgeLogo from '../../../NodeForge Icons/NodeForge logo.png';

import {
  MousePointer2,
  Hand,
  Square,
  Circle,
  Diamond,
  Type,
  Minus,
  Spline,
  CornerDownRight,
  Menu,
  MonitorPlay,
  Settings,
} from 'lucide-react';
import { IconButton } from '@/components/ui/IconButton';
import { Separator } from '@/components/ui/Separator';
import { useEditorStore } from '@/stores/editor.store';
import { useZoomStore } from '@/stores/zoom.store';
import { useExportStore } from '@/stores/export.store';
import { useSettingsStore } from '@/stores/settings.store';
import { useTemplateStore } from '@/stores/template.store';
import { FileActions } from '@/file/FileActions';
import type { DrawTool, EditorMode } from '@/types/editor.types';

interface ToolButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  shortcut?: string;
}

const ToolButton: React.FC<ToolButtonProps> = ({ icon, label, isActive, onClick, shortcut }) => (
  <button
    onClick={onClick}
    title={`${label} ${shortcut ? `(${shortcut})` : ''}`}
    className={`flex items-center justify-center w-8 h-8 rounded-md transition-all duration-150 ${
      isActive 
        ? 'bg-accent text-white shadow-sm' 
        : 'text-text-secondary hover:text-text hover:bg-surface-overlay'
    }`}
  >
    {icon}
  </button>
);

export const Toolbar: React.FC = () => {
  const { mode, activeTool, setMode, setActiveTool } = useEditorStore();
  const { getZoomPercentage } = useZoomStore();
  const { setWelcomeScreenOpen } = useTemplateStore();
  const { setSaveTemplateOpen } = useTemplateStore();

  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isMenuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    // Delay to let click event propagate first
    const timer = setTimeout(() => {
      window.addEventListener('click', handleOutsideClick);
    }, 0);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [isMenuOpen]);

  const handleToolSelect = (selectedMode: EditorMode, tool?: DrawTool) => {
    if (selectedMode === 'draw' && tool) {
      setActiveTool(tool);
    } else if (selectedMode === 'connect') {
      setMode('connect');
    } else if (selectedMode === 'text') {
      setMode('text');
    } else {
      setMode(selectedMode);
    }
  };

  const handleMenuAction = (action: () => void) => {
    setIsMenuOpen(false);
    action();
  };

  return (
    <header
      id="main-toolbar"
      className="h-toolbar w-full flex items-center justify-between px-3 bg-[var(--color-toolbar-bg)] border-b border-border z-20 shrink-0"
    >
      {/* Left section: App Menu / File */}
      <div className="flex items-center gap-1 w-1/3 relative" ref={menuRef}>
        <IconButton 
          icon={<Menu className="w-4 h-4" />} 
          tooltip="File Menu" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        />

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-11 left-0 w-60 bg-surface border border-border shadow-2xl rounded-xl p-1.5 z-50 flex flex-col gap-0.5 animate-fade-in font-sans">
            <button
              onClick={() => handleMenuAction(() => setWelcomeScreenOpen(true))}
              className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-left text-xs font-semibold text-text-secondary hover:text-accent hover:bg-accent/10 transition-colors"
            >
              <span>Home Dashboard</span>
              <span className="text-3xs text-text-tertiary">Esc</span>
            </button>
            <div className="h-[1px] bg-border my-1" />
            <button
              onClick={() => handleMenuAction(() => FileActions.newProject())}
              className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-left text-xs font-semibold text-text-secondary hover:text-accent hover:bg-accent/10 transition-colors"
            >
              <span>New Diagram</span>
              <span className="text-3xs text-text-tertiary">Ctrl + N</span>
            </button>
            <button
              onClick={() => handleMenuAction(() => FileActions.openProject())}
              className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-left text-xs font-semibold text-text-secondary hover:text-accent hover:bg-accent/10 transition-colors"
            >
              <span>Open File...</span>
              <span className="text-3xs text-text-tertiary">Ctrl + O</span>
            </button>
            <button
              onClick={() => handleMenuAction(() => FileActions.saveProject())}
              className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-left text-xs font-semibold text-text-secondary hover:text-accent hover:bg-accent/10 transition-colors"
            >
              <span>Save Workspace</span>
              <span className="text-3xs text-text-tertiary">Ctrl + S</span>
            </button>
            <button
              onClick={() => handleMenuAction(() => FileActions.saveProjectAs())}
              className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-left text-xs font-semibold text-text-secondary hover:text-accent hover:bg-accent/10 transition-colors"
            >
              <span>Save As...</span>
              <span className="text-3xs text-text-tertiary">Ctrl + Shift + S</span>
            </button>
            <div className="h-[1px] bg-border my-1" />
            <button
              onClick={() => handleMenuAction(() => setSaveTemplateOpen(true))}
              className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-left text-xs font-semibold text-text-secondary hover:text-accent hover:bg-accent/10 transition-colors"
            >
              <span>Save as Template...</span>
            </button>
            <div className="h-[1px] bg-border my-1" />
            <button
              onClick={() => handleMenuAction(() => useSettingsStore.getState().openSettings())}
              className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-left text-xs font-semibold text-text-secondary hover:text-accent hover:bg-accent/10 transition-colors"
            >
              <span>Preferences</span>
              <span className="text-3xs text-text-tertiary">Ctrl + ,</span>
            </button>
          </div>
        )}

        <Separator orientation="vertical" className="h-5 mx-1" />
        <img src={nodeForgeLogo} alt="NodeForge" className="h-6 w-6 object-contain rounded" />
        <span className="text-sm font-bold text-text select-none tracking-tight">NodeForge</span>
      </div>

      {/* Center section: Segmented Tools */}
      <div className="flex items-center justify-center gap-1 w-1/3">
        <div className="flex items-center p-1 rounded-lg bg-surface-sunken border border-border-subtle shadow-inner">
          <ToolButton
            icon={<MousePointer2 className="w-4 h-4" />}
            label="Select"
            shortcut="V"
            isActive={mode === 'select'}
            onClick={() => handleToolSelect('select')}
          />
          <ToolButton
            icon={<Hand className="w-4 h-4" />}
            label="Pan"
            shortcut="Space"
            isActive={mode === 'pan'}
            onClick={() => handleToolSelect('pan')}
          />
          
          <div className="w-[1px] h-5 bg-border mx-1" />

          <ToolButton
            icon={<Square className="w-4 h-4" />}
            label="Rectangle"
            shortcut="R"
            isActive={mode === 'draw' && activeTool === 'rectangle'}
            onClick={() => handleToolSelect('draw', 'rectangle')}
          />
          <ToolButton
            icon={<Circle className="w-4 h-4" />}
            label="Ellipse"
            shortcut="E"
            isActive={mode === 'draw' && activeTool === 'ellipse'}
            onClick={() => handleToolSelect('draw', 'ellipse')}
          />
          <ToolButton
            icon={<Diamond className="w-4 h-4" />}
            label="Diamond"
            shortcut="D"
            isActive={mode === 'draw' && activeTool === 'diamond'}
            onClick={() => handleToolSelect('draw', 'diamond')}
          />
          
          <div className="w-[1px] h-5 bg-border mx-1" />

          <ToolButton
            icon={<Minus className="w-4 h-4" />}
            label="Line"
            shortcut="L"
            isActive={mode === 'draw' && activeTool === 'line'}
            onClick={() => handleToolSelect('draw', 'line')}
          />
          <ToolButton
            icon={<Spline className="w-4 h-4" />}
            label="Connector"
            shortcut="C"
            isActive={mode === 'connect'}
            onClick={() => handleToolSelect('connect')}
          />

          <div className="w-[1px] h-5 bg-border mx-1" />

          <ToolButton
            icon={<Type className="w-4 h-4" />}
            label="Text"
            shortcut="T"
            isActive={mode === 'text'}
            onClick={() => handleToolSelect('text')}
          />
        </div>
      </div>

      {/* Right section: Presentation / Export / Profile */}
      <div className="flex items-center justify-end gap-2 w-1/3">
        <span className="text-xs text-text-tertiary font-medium mr-2">
          {getZoomPercentage()}%
        </span>
        <button
          onClick={() => useExportStore.getState().openDialog()}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold text-text bg-surface-raised border border-border hover:bg-surface-overlay hover:border-border-strong transition-colors"
        >
          Export
        </button>
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold text-white bg-accent hover:bg-accent-hover transition-colors shadow-sm"
        >
          <MonitorPlay className="w-3.5 h-3.5" />
          Present
        </button>
        <button
          onClick={() => useSettingsStore.getState().openSettings()}
          className="p-1.5 text-text-tertiary hover:text-text hover:bg-surface-overlay rounded-md transition-colors ml-2"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
