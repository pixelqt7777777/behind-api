'use client';

import { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  displayValue?: string;
}

export function Slider({ label, displayValue, className, ...props }: SliderProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
          {displayValue && (
            <span className="text-xs font-medium tabular-nums text-slate-500 dark:text-slate-400">
              {displayValue}
            </span>
          )}
        </div>
      )}
      <input
        type="range"
        className={cn(
          'h-1.5 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-accent-600 dark:bg-slate-700',
          className
        )}
        {...props}
      />
    </div>
  );
}
