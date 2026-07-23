'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { Editor } from '@/components/editor/Editor';
import { PdfPreview } from '@/components/preview/PdfPreview';
import { useSettings } from '@/hooks/useSettings';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { generatePDF } from '@/lib/pdf/generator';
import { downloadBlob } from '@/lib/utils';
import { STORAGE_KEY_CONTENT } from '@/lib/constants';

export default function Home() {
  const { settings, update, reset } = useSettings();
  const { theme, cycleTheme } = useTheme();
  const { toast } = useToast();

  const [storedContent, setStoredContent, contentHydrated] = useLocalStorage<string>(
    STORAGE_KEY_CONTENT,
    ''
  );

  const { value, setValue, undo, redo, canUndo, canRedo, reset: resetHistory } =
    useUndoRedo('');

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saved, setSaved] = useState(true);
  const [tab, setTab] = useState<'editor' | 'preview'>('editor');
  const initializedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate editor from localStorage once
  useEffect(() => {
    if (contentHydrated && !initializedRef.current) {
      initializedRef.current = true;
      if (storedContent) resetHistory(storedContent);
    }
  }, [contentHydrated, storedContent, resetHistory]);

  // Auto-save to localStorage (debounced)
  const handleChange = useCallback(
    (next: string) => {
      setValue(next);
      setSaved(false);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        setStoredContent(next);
        setSaved(true);
      }, 500);
    },
    [setValue, setStoredContent]
  );

  const handleDownload = useCallback(async () => {
    if (!value.trim()) {
      toast('warning', 'Nothing to export — write some text first');
      return;
    }
    setGenerating(true);
    try {
      const bytes = await generatePDF(value, settings);
      const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
      downloadBlob(blob, `document-${Date.now()}.pdf`);
      toast('success', 'PDF downloaded');
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Failed to generate PDF');
    } finally {
      setGenerating(false);
    }
  }, [value, settings, toast]);

  const handlePrint = useCallback(async () => {
    if (!value.trim()) {
      toast('warning', 'Nothing to print — write some text first');
      return;
    }
    try {
      const bytes = await generatePDF(value, settings);
      const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (win) {
        win.addEventListener('load', () => {
          win.print();
        });
      }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      toast('error', err instanceof Error ? err.message : 'Failed to prepare print');
    }
  }, [value, settings, toast]);

  const handleReset = useCallback(() => {
    reset();
    toast('info', 'Settings reset to defaults');
  }, [reset, toast]);

  // Ctrl+S → download
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleDownload();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleDownload]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Header
        theme={theme}
        onCycleTheme={cycleTheme}
        onDownload={handleDownload}
        onPrint={handlePrint}
        onToggleSettings={() => setSidebarOpen((o) => !o)}
        generating={generating}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          settings={settings}
          update={update}
          onReset={handleReset}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Mobile tab switcher */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex shrink-0 items-center gap-1 border-b border-slate-200 bg-white px-2 py-1.5 dark:border-slate-800 dark:bg-slate-900 md:hidden">
            {(['editor', 'preview'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 rounded-lg py-1.5 text-sm font-medium capitalize transition-colors ${
                  tab === t
                    ? 'bg-accent-600 text-white'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-2">
            <div
              className={`min-h-0 ${tab === 'editor' ? 'flex' : 'hidden'} md:flex md:border-r md:border-slate-200 md:dark:border-slate-800`}
            >
              <div className="w-full">
                <Editor
                  value={value}
                  onChange={handleChange}
                  onUndo={undo}
                  onRedo={redo}
                  canUndo={canUndo}
                  canRedo={canRedo}
                  saved={saved}
                />
              </div>
            </div>

            <div className={`min-h-0 ${tab === 'preview' ? 'block' : 'hidden'} md:block`}>
              <PdfPreview text={value} settings={settings} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
