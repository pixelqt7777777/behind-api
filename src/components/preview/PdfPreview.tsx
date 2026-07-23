'use client';

import { useState, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  Loader2,
  FileWarning,
  FileText,
} from 'lucide-react';
import type { PDFSettings } from '@/types';
import { usePdfPreview } from '@/hooks/usePdfPreview';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface PdfPreviewProps {
  text: string;
  settings: PDFSettings;
}

const ZOOM_LEVELS = [50, 75, 100, 125, 150, 200];

export function PdfPreview({ text, settings }: PdfPreviewProps) {
  const { url, loading, error } = usePdfPreview(text, settings);
  const [zoom, setZoom] = useState(100);
  const [fullscreen, setFullscreen] = useState(false);

  const zoomIn = useCallback(() => {
    setZoom((z) => {
      const next = ZOOM_LEVELS.find((l) => l > z);
      return next ?? z;
    });
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((z) => {
      const reversed = [...ZOOM_LEVELS].reverse();
      const next = reversed.find((l) => l < z);
      return next ?? z;
    });
  }, []);

  const hasContent = text.trim().length > 0;

  return (
    <div
      className={cn(
        'flex flex-col overflow-hidden bg-slate-100 dark:bg-slate-950',
        fullscreen
          ? 'fixed inset-0 z-50'
          : 'h-full'
      )}
    >
      {/* Preview toolbar */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white/80 px-3 py-2 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <FileText className="h-4 w-4 text-accent-600" />
          Preview
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-400" />}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomOut}
            disabled={zoom <= ZOOM_LEVELS[0]}
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="min-w-[3rem] text-center text-xs font-medium tabular-nums text-slate-500 dark:text-slate-400">
            {zoom}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomIn}
            disabled={zoom >= ZOOM_LEVELS[ZOOM_LEVELS.length - 1]}
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <div className="mx-1 h-5 w-px bg-slate-200 dark:bg-slate-700" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFullscreen((f) => !f)}
            aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {fullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Preview surface */}
      <div className="relative flex-1 overflow-auto p-4">
        {!hasContent ? (
          <EmptyState />
        ) : error ? (
          <ErrorState message={error} />
        ) : url ? (
          <div
            className="mx-auto transition-[width] duration-200"
            style={{ width: `${zoom}%`, maxWidth: zoom <= 100 ? '900px' : 'none' }}
          >
            <div className="overflow-hidden rounded-lg border border-slate-200 shadow-xl dark:border-slate-800">
              <iframe
                src={`${url}#toolbar=0&navpanes=0`}
                title="PDF preview"
                className="h-[70vh] w-full bg-white"
              />
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-4 rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
        <FileText className="h-10 w-10 text-slate-200 dark:text-slate-700" />
      </div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
        Your PDF preview appears here
      </p>
      <p className="mt-1 text-xs text-slate-400 dark:text-slate-600">
        Start writing to see a live preview
      </p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <FileWarning className="mb-3 h-10 w-10 text-red-400" />
      <p className="text-sm font-medium text-red-600 dark:text-red-400">
        Preview failed
      </p>
      <p className="mt-1 max-w-xs text-xs text-slate-400">{message}</p>
    </div>
  );
}
