'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { PDFSettings } from '@/types';
import { generatePDF } from '@/lib/pdf/generator';

interface PreviewState {
  url: string | null;
  loading: boolean;
  error: string | null;
  bytes: Uint8Array | null;
}

/**
 * Debounced PDF preview generator. Regenerates the PDF blob URL whenever
 * text or settings change, and cleans up object URLs to avoid leaks.
 */
export function usePdfPreview(text: string, settings: PDFSettings, delay = 600) {
  const [state, setState] = useState<PreviewState>({
    url: null,
    loading: false,
    error: null,
    bytes: null,
  });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const urlRef = useRef<string | null>(null);
  const runIdRef = useRef(0);

  const build = useCallback(async () => {
    const runId = ++runIdRef.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const bytes = await generatePDF(text, settings);
      if (runId !== runIdRef.current) return; // superseded
      const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = url;
      setState({ url, loading: false, error: null, bytes });
    } catch (err) {
      if (runId !== runIdRef.current) return;
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : 'Failed to generate preview',
      }));
    }
  }, [text, settings]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(build, delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [build, delay]);

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  return state;
}
