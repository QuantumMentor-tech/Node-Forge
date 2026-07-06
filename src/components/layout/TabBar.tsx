import React, { useRef, useState, useEffect } from 'react';
import { X, Plus, ChevronLeft, ChevronRight, FileJson, Copy, EyeOff, Trash2 } from 'lucide-react';
import { useWorkspaceStore } from '@/stores/workspace.store';

export const TabBar: React.FC = () => {
  const {
    tabs,
    activeTabId,
    openTab,
    closeTab,
    closeOthers,
    closeAll,
    selectTab,
    reorderTabs,
    duplicateTab,
  } = useWorkspaceStore();

  const tabContainerRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    tabId: string;
  } | null>(null);

  // Close context menu on click elsewhere
  useEffect(() => {
    const handleCloseMenu = () => setContextMenu(null);
    window.addEventListener('click', handleCloseMenu);
    return () => window.removeEventListener('click', handleCloseMenu);
  }, []);

  // Handle horizontal scrolling buttons if container overflows
  const handleScroll = (direction: 'left' | 'right') => {
    if (tabContainerRef.current) {
      const scrollAmount = 200;
      tabContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const handleContextMenu = (e: React.MouseEvent, tabId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      tabId,
    });
  };

  if (tabs.length === 0) return null;

  return (
    <div className="w-full h-10 bg-surface-sunken border-b border-border flex items-center justify-between px-2 select-none shrink-0 z-10 relative font-sans">
      {/* Scroll Left Button */}
      <button
        onClick={() => handleScroll('left')}
        className="p-1 hover:bg-surface-overlay text-text-tertiary hover:text-text rounded transition-colors mr-1 md:block hidden"
        title="Scroll Left"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      {/* Tabs Container */}
      <div
        ref={tabContainerRef}
        className="flex-1 flex items-end h-full overflow-x-auto scrollbar-none gap-0.5"
      >
        {tabs.map((tab, idx) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('tab_index', idx.toString());
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const fromIdx = parseInt(e.dataTransfer.getData('tab_index'), 10);
                if (!isNaN(fromIdx) && fromIdx !== idx) {
                  reorderTabs(fromIdx, idx);
                }
              }}
              onClick={() => selectTab(tab.id)}
              onAuxClick={(e) => {
                if (e.button === 1) {
                  e.preventDefault();
                  closeTab(tab.id);
                }
              }}
              onContextMenu={(e) => handleContextMenu(e, tab.id)}
              className={`group flex items-center gap-2 h-8 px-3.5 rounded-t-lg text-xs font-semibold cursor-pointer border-t border-x border-transparent transition-all duration-150 shrink-0 relative ${
                isActive
                  ? 'bg-surface border-t-accent border-x-border text-text shadow-sm'
                  : 'text-text-secondary hover:text-text hover:bg-surface/50 border-t-transparent'
              }`}
              style={{
                borderTopWidth: isActive ? '2px' : '1px',
              }}
            >
              {/* Document Icon */}
              <FileJson className={`w-3.5 h-3.5 ${isActive ? 'text-accent' : 'text-text-tertiary'}`} />
              
              {/* File Title */}
              <span className="max-w-[120px] truncate">{tab.fileName}</span>

              {/* Close Button / Unsaved Indicator */}
              <div className="w-4 h-4 flex items-center justify-center relative">
                {/* Default state when dirty: show bullet indicator */}
                {tab.isDirty && (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent group-hover:opacity-0 transition-opacity absolute" />
                )}
                {/* Hover state: show close X */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className={`w-3.5 h-3.5 rounded-full hover:bg-surface-sunken flex items-center justify-center text-text-tertiary hover:text-text transition-all ${
                    tab.isDirty ? 'opacity-0 group-hover:opacity-100' : 'opacity-60 group-hover:opacity-100'
                  }`}
                  title="Close Tab (Middle-Click)"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Plus Button to open tab */}
        <button
          onClick={() => openTab(null, 'Untitled')}
          className="p-1 mb-1 text-text-tertiary hover:text-text hover:bg-surface-overlay rounded-md transition-colors ml-2 shrink-0 self-center"
          title="New Tab (Ctrl+T)"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={() => handleScroll('right')}
        className="p-1 hover:bg-surface-overlay text-text-tertiary hover:text-text rounded transition-colors ml-1 md:block hidden"
        title="Scroll Right"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>

      {/* Right-click Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-surface border border-border shadow-2xl rounded-xl p-1.5 z-[1000] flex flex-col gap-0.5 min-w-[160px] font-sans"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              closeTab(contextMenu.tabId);
              setContextMenu(null);
            }}
            className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-left text-xs font-semibold text-text-secondary hover:text-accent hover:bg-accent/10 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-text-tertiary" />
            <span>Close Tab</span>
          </button>
          <button
            onClick={() => {
              closeOthers(contextMenu.tabId);
              setContextMenu(null);
            }}
            className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-left text-xs font-semibold text-text-secondary hover:text-accent hover:bg-accent/10 transition-colors"
          >
            <EyeOff className="w-3.5 h-3.5 text-text-tertiary" />
            <span>Close Others</span>
          </button>
          <button
            onClick={() => {
              closeAll();
              setContextMenu(null);
            }}
            className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-left text-xs font-semibold text-text-secondary hover:text-status-error hover:bg-status-error/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-status-error/70" />
            <span>Close All</span>
          </button>
          <div className="h-[1px] bg-border my-1" />
          <button
            onClick={() => {
              duplicateTab(contextMenu.tabId);
              setContextMenu(null);
            }}
            className="flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-left text-xs font-semibold text-text-secondary hover:text-accent hover:bg-accent/10 transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-text-tertiary" />
            <span>Duplicate Tab</span>
          </button>
        </div>
      )}
    </div>
  );
};
