/**
 * ContextMenu.tsx
 *
 * Professional HTML-based context menu system.
 */

import React, { useEffect, useState, useRef } from 'react';
import { create } from 'zustand';

export interface ContextMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  onClick: () => void;
  separator?: boolean;
}

interface ContextMenuState {
  isOpen: boolean;
  x: number;
  y: number;
  items: ContextMenuItem[];
  open: (x: number, y: number, items: ContextMenuItem[]) => void;
  close: () => void;
}

export const useContextMenuStore = create<ContextMenuState>((set) => ({
  isOpen: false,
  x: 0,
  y: 0,
  items: [],
  open: (x, y, items) => set({ isOpen: true, x, y, items }),
  close: () => set({ isOpen: false }),
}));

export const ContextMenu: React.FC = () => {
  const { isOpen, x, y, items, close } = useContextMenuStore();
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState({ x, y });

  useEffect(() => {
    if (isOpen && menuRef.current) {
      // Adjust if it goes off-screen
      const rect = menuRef.current.getBoundingClientRect();
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      
      let newX = x;
      let newY = y;
      
      if (x + rect.width > winW) newX = winW - rect.width - 5;
      if (y + rect.height > winH) newY = winH - rect.height - 5;
      
      setAdjustedPosition({ x: newX, y: newY });
    }
  }, [isOpen, x, y]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close();
      }
    };

    if (isOpen) {
      window.addEventListener('mousedown', handleOutsideClick);
      // Close on any wheel or resize
      window.addEventListener('wheel', close);
      window.addEventListener('resize', close);
    }

    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('wheel', close);
      window.removeEventListener('resize', close);
    };
  }, [isOpen, close]);

  if (!isOpen || items.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] min-w-[200px] bg-surface-raised border border-border rounded-lg shadow-elevated py-1 flex flex-col animate-fade-in"
      style={{ top: adjustedPosition.y, left: adjustedPosition.x }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, idx) => {
        if (item.separator) {
          return <div key={`sep-${idx}`} className="h-[1px] w-full bg-border my-1" />;
        }
        
        return (
          <button
            key={item.id}
            disabled={item.disabled}
            onClick={() => {
              if (!item.disabled) {
                item.onClick();
                close();
              }
            }}
            className={`
              w-full flex items-center justify-between px-3 py-1.5 text-xs text-left
              ${item.disabled ? 'opacity-50 cursor-not-allowed text-text-tertiary' : 'text-text hover:bg-accent hover:text-white cursor-pointer'}
            `}
          >
            <div className="flex items-center gap-2">
              {item.icon && <span className="w-4 h-4 flex items-center justify-center">{item.icon}</span>}
              <span>{item.label}</span>
            </div>
            {item.shortcut && <span className="text-2xs opacity-60 font-mono">{item.shortcut}</span>}
          </button>
        );
      })}
    </div>
  );
};
