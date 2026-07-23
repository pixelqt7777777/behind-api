'use client';

import { useEffect, useCallback } from 'react';
import type { Theme } from '@/types';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEY_THEME } from '@/lib/constants';

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>(STORAGE_KEY_THEME, 'system');

  const applyTheme = useCallback((t: Theme) => {
    const root = document.documentElement;
    const isDark =
      t === 'dark' ||
      (t === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);
    root.classList.toggle('dark', isDark);
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme, applyTheme]);

  const cycleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light'));
  }, [setTheme]);

  return { theme, setTheme, cycleTheme };
}
