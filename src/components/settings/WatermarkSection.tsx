'use client';

import type { PDFSettings, WatermarkPosition } from '@/types';
import { Toggle } from '@/components/ui/Toggle';
import { Input } from '@/components/ui/Input';
import { Field } from '@/components/ui/Field';
import { Slider } from '@/components/ui/Slider';
import { Select } from '@/components/ui/Select';

interface Props {
  settings: PDFSettings;
  update: <K extends keyof PDFSettings>(key: K, value: PDFSettings[K]) => void;
}

const POSITION_OPTIONS: { value: WatermarkPosition; label: string }[] = [
  { value: 'center', label: 'Center' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
];

export function WatermarkSection({ settings, update }: Props) {
  return (
    <div className="space-y-4">
      <Toggle
        id="watermark-enabled"
        label="Enable Watermark"
        checked={settings.watermarkEnabled}
        onChange={(v) => update('watermarkEnabled', v)}
      />

      {settings.watermarkEnabled && (
        <div className="space-y-4 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
          <Field label="Watermark Text">
            <Input
              value={settings.watermarkText}
              placeholder="e.g. DRAFT, CONFIDENTIAL"
              onChange={(e) => update('watermarkText', e.target.value)}
            />
          </Field>

          <Field label="Position">
            <Select
              options={POSITION_OPTIONS}
              value={settings.watermarkPosition}
              onChange={(e) =>
                update('watermarkPosition', e.target.value as WatermarkPosition)
              }
            />
          </Field>

          <Slider
            label="Opacity"
            min={0.05}
            max={1}
            step={0.05}
            value={settings.watermarkOpacity}
            displayValue={`${Math.round(settings.watermarkOpacity * 100)}%`}
            onChange={(e) => update('watermarkOpacity', Number(e.target.value))}
          />

          <Slider
            label="Rotation"
            min={-90}
            max={90}
            step={5}
            value={settings.watermarkRotation}
            displayValue={`${settings.watermarkRotation}°`}
            onChange={(e) => update('watermarkRotation', Number(e.target.value))}
          />

          <Slider
            label="Size"
            min={20}
            max={160}
            step={4}
            value={settings.watermarkSize}
            displayValue={`${settings.watermarkSize} pt`}
            onChange={(e) => update('watermarkSize', Number(e.target.value))}
          />
        </div>
      )}
    </div>
  );
}
