/**
 * CanvasArea — central canvas workspace with grid background.
 */

import React from 'react';
import { CanvasEngine } from '@/canvas/CanvasEngine';
import { useEditorStore } from '@/stores/editor.store';
import { useSelectionStore } from '@/stores/selection.store';
import { useContextMenuStore } from '@/components/ui/ContextMenu';
import { useClipboardStore } from '@/stores/clipboard.store';
import { EditorActions } from '@/editor/EditorActions';
import { useExportStore } from '@/stores/export.store';
import { Copy, Scissors, ClipboardPaste, Trash2, Download, BringToFront, SendToBack, MoveUp, MoveDown } from 'lucide-react';
import { Minimap } from '@/components/ui/Minimap';
import { InlineEditor } from '@/components/ui/InlineEditor';

export const CanvasArea: React.FC = () => {
  const { mode } = useEditorStore();
  const { selectedIds } = useSelectionStore();
  const clipboard = useClipboardStore();
  const openContextMenu = useContextMenuStore(s => s.open);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    
    const hasSelection = selectedIds.size > 0;
    
    openContextMenu(e.clientX, e.clientY, [
      {
        id: 'copy',
        label: 'Copy',
        icon: <Copy className="w-3.5 h-3.5" />,
        shortcut: 'Ctrl+C',
        disabled: !hasSelection,
        onClick: () => EditorActions.copySelected()
      },
      {
        id: 'cut',
        label: 'Cut',
        icon: <Scissors className="w-3.5 h-3.5" />,
        shortcut: 'Ctrl+X',
        disabled: !hasSelection,
        onClick: () => EditorActions.cutSelected()
      },
      {
        id: 'paste',
        label: 'Paste',
        icon: <ClipboardPaste className="w-3.5 h-3.5" />,
        shortcut: 'Ctrl+V',
        disabled: clipboard.elements.length === 0 && clipboard.connectors.length === 0,
        onClick: () => EditorActions.paste()
      },
      { id: 'sep1', label: '', onClick: () => {}, separator: true },
      {
        id: 'bring-front',
        label: 'Bring to Front',
        icon: <BringToFront className="w-3.5 h-3.5" />,
        shortcut: ']',
        disabled: !hasSelection,
        onClick: () => EditorActions.bringToFront()
      },
      {
        id: 'bring-forward',
        label: 'Bring Forward',
        icon: <MoveUp className="w-3.5 h-3.5" />,
        disabled: !hasSelection,
        onClick: () => EditorActions.bringForward()
      },
      {
        id: 'send-backward',
        label: 'Send Backward',
        icon: <MoveDown className="w-3.5 h-3.5" />,
        disabled: !hasSelection,
        onClick: () => EditorActions.sendBackward()
      },
      {
        id: 'send-back',
        label: 'Send to Back',
        icon: <SendToBack className="w-3.5 h-3.5" />,
        shortcut: '[',
        disabled: !hasSelection,
        onClick: () => EditorActions.sendToBack()
      },
      { id: 'sep2', label: '', onClick: () => {}, separator: true },
      {
        id: 'delete',
        label: 'Delete',
        icon: <Trash2 className="w-3.5 h-3.5" />,
        shortcut: 'Del',
        disabled: !hasSelection,
        onClick: () => EditorActions.deleteSelected()
      },
      { id: 'sep3', label: '', onClick: () => {}, separator: true },
      {
        id: 'export',
        label: 'Export Diagram...',
        icon: <Download className="w-3.5 h-3.5" />,
        shortcut: 'Ctrl+E',
        onClick: () => useExportStore.getState().openDialog()
      }
    ]);
  };

  const cursorStyle = mode === 'pan' ? 'cursor-grab active:cursor-grabbing' : mode === 'draw' || mode === 'connect' ? 'cursor-crosshair' : mode === 'text' ? 'cursor-text' : 'cursor-default';

  return (
    <main 
      id="canvas-area" 
      className={`flex-1 relative overflow-hidden bg-[var(--color-canvas-bg)] ${cursorStyle}`}
      onContextMenu={handleContextMenu}
    >
      <CanvasEngine />
      <Minimap />
      <InlineEditor />
    </main>
  );
};
