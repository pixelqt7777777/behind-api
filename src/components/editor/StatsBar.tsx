'use client';

import { useMemo } from 'react';
import { computeStats } from '@/lib/utils';

interface StatsBarProps {
  text: string;
  saved: boolean;
}

export function StatsBar({ text, saved }: StatsBarProps) {
  const stats = useMemo(() => computeStats(text), [text]);

  const items = [
    { label: 'Words', value: stats.words.toLocaleString() },
    { label: 'Characters', value: stats.characters.toLocaleString() },
    { label: 'Paragraphs', value: stats.paragraphs.toLocaleString() },
    {
      label: 'Reading',
      value: stats.readingTime > 0 ? `${stats.readingTime} min` : '—',
    },
  ];

  return (
    <div className="flex items-center justify-between gap-4 border-t border-slate-100 bg-white/70 px-4 py-2 text-xs backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">
              {item.value}
            </span>
            <span className="text-slate-400 dark:text-slate-500">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            saved ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
        />
        {saved ? 'Saved' : 'Saving…'}
      </div>
    </div>
  );
}
