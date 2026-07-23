'use client';

import type { PDFSettings } from '@/types';
import { Toggle } from '@/components/ui/Toggle';
import { Input } from '@/components/ui/Input';
import { Field } from '@/components/ui/Field';

interface Props {
  settings: PDFSettings;
  update: <K extends keyof PDFSettings>(key: K, value: PDFSettings[K]) => void;
}

export function HeaderFooterSection({ settings, update }: Props) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="space-y-3">
        <Toggle
          id="header-enabled"
          label="Enable Header"
          checked={settings.headerEnabled}
          onChange={(v) => update('headerEnabled', v)}
        />
        {settings.headerEnabled && (
          <div className="space-y-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
            <Field label="Header Title">
              <Input
                value={settings.headerTitle}
                placeholder="Document title"
                onChange={(e) => update('headerTitle', e.target.value)}
              />
            </Field>
            <Field label="Custom Text">
              <Input
                value={settings.headerCustomText}
                placeholder="e.g. author name"
                onChange={(e) => update('headerCustomText', e.target.value)}
              />
            </Field>
            <Toggle
              label="Show Date"
              checked={settings.headerDate}
              onChange={(v) => update('headerDate', v)}
            />
            <Toggle
              label="Page Numbers"
              checked={settings.headerPageNumbers}
              onChange={(v) => update('headerPageNumbers', v)}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="space-y-3">
        <Toggle
          id="footer-enabled"
          label="Enable Footer"
          checked={settings.footerEnabled}
          onChange={(v) => update('footerEnabled', v)}
        />
        {settings.footerEnabled && (
          <div className="space-y-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
            <Field label="Footer Title">
              <Input
                value={settings.footerTitle}
                placeholder="Footer text"
                onChange={(e) => update('footerTitle', e.target.value)}
              />
            </Field>
            <Field label="Custom Text">
              <Input
                value={settings.footerCustomText}
                placeholder="e.g. confidential"
                onChange={(e) => update('footerCustomText', e.target.value)}
              />
            </Field>
            <Toggle
              label="Show Date"
              checked={settings.footerDate}
              onChange={(v) => update('footerDate', v)}
            />
            <Toggle
              label="Page Numbers"
              checked={settings.footerPageNumbers}
              onChange={(v) => update('footerPageNumbers', v)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
