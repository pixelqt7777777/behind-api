'use client';

import { cn } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  id?: string;
}

export function Toggle({ checked, onChange, label, id }: ToggleProps) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-center justify-between gap-3 select-none"
    >
      {label && (
        <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
      )}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
          checked ? 'bg-accent-600' : 'bg-slate-300 dark:bg-slate-600'
        )}
      >
        <span
          className={cn(
            'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform',
            checked ? 'translate-x-4.5' : 'translate-x-1'
          )}
          style={{ transform: checked ? 'translateX(18px)' : 'translateX(3px)' }}
        />
      </button>
    </label>
  );
}
