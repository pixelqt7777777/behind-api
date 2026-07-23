'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { FileText, Upload } from 'lucide-react';
import { EditorToolbar } from './EditorToolbar';
import { StatsBar } from './StatsBar';
import { FindReplace } from './FindReplace';
import { useToast } from '@/hooks/useToast';
import { importTextFile, isSupportedFile } from '@/lib/fileImport';
import { cn } from '@/lib/utils';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  saved: boolean;
}

export function Editor({
  value,
  onChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  saved,
}: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [findOpen, setFindOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const { toast } = useToast();

  const focusRange = useCallback((index: number | null) => {
    if (index === null || !textareaRef.current) return;
    const ta = textareaRef.current;
    ta.focus();
    ta.setSelectionRange(index, index);
    // Scroll the caret roughly into view
    const before = value.slice(0, index);
    const line = before.split('\n').length;
    const lineHeight = 24;
    ta.scrollTop = Math.max(0, (line - 5) * lineHeight);
  }, [value]);

  const handleImportFile = useCallback(
    async (file: File) => {
      if (!isSupportedFile(file)) {
        toast('error', 'Unsupported file. Use TXT, MD, or DOCX.');
        return;
      }
      try {
        const result = await importTextFile(file);
        onChange(result.text);
        toast('success', `Imported "${result.filename}"`);
      } catch (err) {
        toast('error', err instanceof Error ? err.message : 'Failed to import file');
      }
    },
    [onChange, toast]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImportFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImportFile(file);
  };

  const handlePastePlain = useCallback(async () => {
    try {
      const clip = await navigator.clipboard.readText();
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = value.slice(0, start) + clip + value.slice(end);
      onChange(next);
      toast('success', 'Pasted as plain text');
    } catch {
      toast('error', 'Clipboard access denied');
    }
  }, [value, onChange, toast]);

  const handleClear = useCallback(() => {
    if (!value) return;
    onChange('');
    toast('info', 'Cleared all text');
  }, [value, onChange, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === 'f') {
        e.preventDefault();
        setFindOpen(true);
      } else if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        onUndo();
      } else if ((key === 'z' && e.shiftKey) || key === 'y') {
        e.preventDefault();
        onRedo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onUndo, onRedo]);

  // Native paste → strip formatting (plain text only; textarea already does this,
  // but we normalise line endings)
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const clip = e.clipboardData.getData('text/plain');
    if (clip && clip.includes('\r')) {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const normalized = clip.replace(/\r\n/g, '\n');
      onChange(value.slice(0, start) + normalized + value.slice(end));
    }
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white dark:bg-slate-900">
      <EditorToolbar
        onUndo={onUndo}
        onRedo={onRedo}
        canUndo={canUndo}
        canRedo={canRedo}
        onFind={() => setFindOpen(true)}
        onClear={handleClear}
        onImport={() => fileInputRef.current?.click()}
        onPastePlain={handlePastePlain}
      />

      <FindReplace
        text={value}
        isOpen={findOpen}
        onClose={() => setFindOpen(false)}
        onReplace={onChange}
        onHighlight={focusRange}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.markdown,.text,.docx"
        className="hidden"
        onChange={handleFileInput}
      />

      <div
        className="relative flex-1 overflow-hidden"
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
      >
        {!value && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-slate-200 dark:text-slate-700" />
              <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
                Start typing or drop a file
              </p>
              <p className="mt-1 text-xs text-slate-300 dark:text-slate-600">
                Supports TXT, MD, and DOCX
              </p>
            </div>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={handlePaste}
          spellCheck
          aria-label="Text editor"
          placeholder=""
          className="h-full w-full resize-none bg-transparent px-6 py-5 font-sans text-[15px] leading-relaxed text-slate-800 placeholder:text-slate-400 focus:outline-none dark:text-slate-200"
        />

        {dragging && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center border-2 border-dashed border-accent-500 bg-accent-50/80 backdrop-blur-sm dark:bg-accent-950/50">
            <div className="text-center">
              <Upload className="mx-auto mb-2 h-8 w-8 text-accent-600" />
              <p className="text-sm font-semibold text-accent-700 dark:text-accent-300">
                Drop file to import
              </p>
            </div>
          </div>
        )}
      </div>

      <StatsBar text={value} saved={saved} />
    </div>
  );
}
