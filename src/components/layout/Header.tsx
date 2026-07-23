'use client';

import {
  FileType2,
  Download,
  Printer,
  Sun,
  Moon,
  Monitor,
  Settings2,
  Loader2,
} from 'lucide-react';
import type { Theme } from '@/types';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  theme: Theme;
  onCycleTheme: () => void;
  onDownload: () => void;
  onPrint: () => void;
  onToggleSettings: () => void;
  generating: boolean;
}

const themeIcons: Record<Theme, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

export function Header({
  theme,
  onCycleTheme,
  onDownload,
  onPrint,
  onToggleSettings,
  generating,
}: HeaderProps) {
  const ThemeIcon = themeIcons[theme];

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-500 to-accent-700 shadow-sm">
          <FileType2 className="h-4.5 w-4.5 text-white" style={{ width: 18, height: 18 }} />
        </div>
        <div>
          <h1 className="text-sm font-bold leading-tight text-slate-900 dark:text-white">
            Text to PDF
          </h1>
          <p className="hidden text-[10px] leading-tight text-slate-400 sm:block">
            Fast · Private · Beautiful
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSettings}
          aria-label="Toggle settings"
          className="lg:hidden"
        >
          <Settings2 className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onCycleTheme}
          aria-label={`Theme: ${theme}`}
          title={`Theme: ${theme}`}
        >
          <ThemeIcon className="h-4 w-4" />
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={onPrint}
          className="hidden sm:inline-flex"
        >
          <Printer className="h-4 w-4" />
          Print
        </Button>

        <Button size="sm" onClick={onDownload} disabled={generating}>
          {generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          <span className={cn(generating && 'opacity-70')}>Download</span>
        </Button>
      </div>
    </header>
  );
}
