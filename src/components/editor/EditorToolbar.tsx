'use client';

import {
  Undo2,
  Redo2,
  Search,
  Trash2,
  Upload,
  ClipboardPaste,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EditorToolbarProps {
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onFind: () => void;
  onClear: () => void;
  onImport: () => void;
  onPastePlain: () => void;
}

export function EditorToolbar({
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onFind,
  onClear,
  onImport,
  onPastePlain,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-1 border-b border-slate-100 bg-white/70 px-2 py-1.5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <Button
        variant="ghost"
        size="icon"
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="Undo"
        title="Undo (Ctrl+Z)"
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRedo}
        disabled={!canRedo}
        aria-label="Redo"
        title="Redo (Ctrl+Y)"
      >
        <Redo2 className="h-4 w-4" />
      </Button>

      <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />

      <Button
        variant="ghost"
        size="icon"
        onClick={onFind}
        aria-label="Find and replace"
        title="Find & Replace (Ctrl+F)"
      >
        <Search className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onPastePlain}
        aria-label="Paste without formatting"
        title="Paste as plain text"
      >
        <ClipboardPaste className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onImport}
        aria-label="Import file"
        title="Import TXT, MD, or DOCX"
      >
        <Upload className="h-4 w-4" />
      </Button>

      <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />

      <Button
        variant="ghost"
        size="icon"
        onClick={onClear}
        aria-label="Clear all text"
        title="Clear all"
        className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
