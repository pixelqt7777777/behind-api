'use client';

import { Bold, Italic, Underline } from 'lucide-react';
import type { PDFSettings, FontFamily } from '@/types';
import { Select } from '@/components/ui/Select';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { FONT_LABELS, FONT_SIZE_OPTIONS } from '@/lib/constants';

interface Props {
  settings: PDFSettings;
  update: <K extends keyof PDFSettings>(key: K, value: PDFSettings[K]) => void;
}

const FONT_OPTIONS = Object.entries(FONT_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const SIZE_OPTIONS = FONT_SIZE_OPTIONS.map((s) => ({ value: s, label: `${s} pt` }));

export function FontSection({ settings, update }: Props) {
  return (
    <>
      <Field label="Font Family">
        <Select
          options={FONT_OPTIONS}
          value={settings.fontFamily}
          onChange={(e) => update('fontFamily', e.target.value as FontFamily)}
        />
      </Field>

      <Field label="Font Size">
        <Select
          options={SIZE_OPTIONS}
          value={settings.fontSize}
          onChange={(e) => update('fontSize', Number(e.target.value))}
        />
      </Field>

      <Field label="Style">
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={settings.bold ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => update('bold', !settings.bold)}
            aria-pressed={settings.bold}
            aria-label="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={settings.italic ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => update('italic', !settings.italic)}
            aria-pressed={settings.italic}
            aria-label="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant={settings.underline ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => update('underline', !settings.underline)}
            aria-pressed={settings.underline}
            aria-label="Underline"
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>
      </Field>
    </>
  );
}
