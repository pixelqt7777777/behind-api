'use client';

import { RotateCcw, X, Sliders } from 'lucide-react';
import type { PDFSettings } from '@/types';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  settings: PDFSettings;
  update: <K extends keyof PDFSettings>(key: K, value: PDFSettings[K]) => void;
  onReset: () => void;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ settings, update, onReset, open, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'flex w-[300px] shrink-0 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
          'fixed inset-y-0 left-0 z-50 transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
          <span className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-200">
            <Sliders className="h-4 w-4 text-accent-600" />
            Settings
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onReset}
              aria-label="Reset to defaults"
              title="Reset to defaults"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close settings"
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          <SettingsPanel settings={settings} update={update} />
        </div>
      </aside>
    </>
  );
}
