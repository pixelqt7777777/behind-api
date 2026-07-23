'use client';

import { useCallback } from 'react';
import type { PDFSettings } from '@/types';
import { useLocalStorage } from './useLocalStorage';
import { DEFAULT_SETTINGS, STORAGE_KEY_SETTINGS } from '@/lib/constants';

export function useSettings() {
  const [settings, setSettings, hydrated] = useLocalStorage<PDFSettings>(
    STORAGE_KEY_SETTINGS,
    DEFAULT_SETTINGS
  );

  const update = useCallback(
    <K extends keyof PDFSettings>(key: K, value: PDFSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [setSettings]
  );

  const reset = useCallback(() => {
    setSettings({ ...DEFAULT_SETTINGS });
  }, [setSettings]);

  return { settings, update, reset, hydrated };
}
