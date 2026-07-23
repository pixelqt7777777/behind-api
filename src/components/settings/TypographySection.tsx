'use client';

import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import type { PDFSettings, TextAlignment } from '@/types';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { LINE_SPACING_OPTIONS } from '@/lib/constants';

interface Props {
  settings: PDFSettings;
  update: <K extends keyof PDFSettings>(key: K, value: PDFSettings[K]) => void;
}

const ALIGN_OPTIONS: { value: TextAlignment; icon: typeof AlignLeft; label: string }[] = [
  { value: 'left', icon: AlignLeft, label: 'Align left' },
  { value: 'center', icon: AlignCenter, label: 'Align center' },
  { value: 'right', icon: AlignRight, label: 'Align right' },
  { value: 'justify', icon: AlignJustify, label: 'Justify' },
];

export function TypographySection({ settings, update }: Props) {
  return (
    <>
      <Field label="Alignment">
        <div className="grid grid-cols-4 gap-2">
          {ALIGN_OPTIONS.map(({ value, icon: Icon, label }) => (
            <Button
              key={value}
              variant={settings.textAlignment === value ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => update('textAlignment', value)}
              aria-pressed={settings.textAlignment === value}
              aria-label={label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}
        </div>
      </Field>

      <Field label="Line Spacing">
        <Select
          options={LINE_SPACING_OPTIONS}
          value={settings.lineSpacing}
          onChange={(e) => update('lineSpacing', Number(e.target.value))}
        />
      </Field>

      <Slider
        label="Paragraph Spacing"
        min={0}
        max={4}
        step={0.5}
        value={settings.paragraphSpacing}
        displayValue={`${settings.paragraphSpacing.toFixed(1)}×`}
        onChange={(e) => update('paragraphSpacing', Number(e.target.value))}
      />

      <Slider
        label="Letter Spacing"
        min={0}
        max={5}
        step={0.25}
        value={settings.letterSpacing}
        displayValue={`${settings.letterSpacing.toFixed(2)} pt`}
        onChange={(e) => update('letterSpacing', Number(e.target.value))}
      />
    </>
  );
}
