import { ReactNode } from 'react';

interface FieldProps {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-xs font-medium text-slate-500 dark:text-slate-400"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
