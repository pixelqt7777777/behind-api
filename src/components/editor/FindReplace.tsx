'use client';

import { useState, useEffect } from 'react';
import { X, ChevronUp, ChevronDown, Replace, CaseSensitive } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { findAllMatches } from '@/lib/utils';

interface FindReplaceProps {
  text: string;
  isOpen: boolean;
  onClose: () => void;
  onReplace: (newText: string) => void;
  onHighlight: (index: number | null) => void;
}

export function FindReplace({
  text,
  isOpen,
  onClose,
  onReplace,
  onHighlight,
}: FindReplaceProps) {
  const [find, setFind] = useState('');
  const [replace, setReplace] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [matches, setMatches] = useState<number[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!find) {
      setMatches([]);
      setCurrent(0);
      onHighlight(null);
      return;
    }
    const found = findAllMatches(text, find, caseSensitive, false);
    setMatches(found);
    setCurrent((c) => (found.length ? Math.min(c, found.length - 1) : 0));
    onHighlight(found.length ? found[0] : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [find, text, caseSensitive]);

  useEffect(() => {
    if (matches.length && matches[current] !== undefined) {
      onHighlight(matches[current]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  if (!isOpen) return null;

  const goNext = () => matches.length && setCurrent((c) => (c + 1) % matches.length);
  const goPrev = () =>
    matches.length && setCurrent((c) => (c - 1 + matches.length) % matches.length);

  const doReplace = () => {
    if (!find || !matches.length) return;
    const idx = matches[current];
    const matchLen = find.length;
    const newText = text.slice(0, idx) + replace + text.slice(idx + matchLen);
    onReplace(newText);
  };

  const doReplaceAll = () => {
    if (!find) return;
    const flags = caseSensitive ? 'g' : 'gi';
    const pattern = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const newText = text.replace(new RegExp(pattern, flags), replace);
    onReplace(newText);
  };

  return (
    <div className="absolute right-3 top-3 z-20 w-80 animate-slide-up rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-md dark:border-slate-700 dark:bg-slate-800/95">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Find & Replace
        </span>
        <button
          onClick={onClose}
          aria-label="Close find and replace"
          className="rounded p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5">
          <Input
            autoFocus
            value={find}
            onChange={(e) => setFind(e.target.value)}
            placeholder="Find"
            className="h-8 text-xs"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.shiftKey ? goPrev() : goNext();
              }
            }}
          />
          <span className="min-w-[52px] text-center text-xs tabular-nums text-slate-400">
            {matches.length ? `${current + 1}/${matches.length}` : '0/0'}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Input
            value={replace}
            onChange={(e) => setReplace(e.target.value)}
            placeholder="Replace"
            className="h-8 text-xs"
          />
          <button
            onClick={() => setCaseSensitive((c) => !c)}
            aria-pressed={caseSensitive}
            aria-label="Match case"
            title="Match case"
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-colors',
              caseSensitive
                ? 'border-accent-500 bg-accent-50 text-accent-600 dark:bg-accent-950/50'
                : 'border-slate-200 text-slate-400 hover:text-slate-600 dark:border-slate-700 dark:hover:text-slate-200'
            )}
          >
            <CaseSensitive className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="secondary" onClick={goPrev} aria-label="Previous match" className="flex-1">
            <ChevronUp className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="secondary" onClick={goNext} aria-label="Next match" className="flex-1">
            <ChevronDown className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="secondary" onClick={doReplace} className="flex-1 text-xs">
            <Replace className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="primary" onClick={doReplaceAll} className="flex-1 text-xs">
            All
          </Button>
        </div>
      </div>
    </div>
  );
}
