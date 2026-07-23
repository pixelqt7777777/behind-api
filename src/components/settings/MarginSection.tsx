'use client';

import type { PDFSettings, MarginPreset } from '@/types';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MARGIN_PRESETS } from '@/lib/constants';

interface Props {
  settings: PDFSettings;
  update: <K extends keyof PDFSettings>(key: K, value: PDFSettings[K]) => void;
}

const MM = 2.83465;
const PRESETS: MarginPreset[] = ['narrow', 'normal', 'wide', 'custom'];

export function MarginSection({ settings, update }: Props) {
  const handlePreset = (preset: MarginPreset) => {
    update('marginPreset', preset);
    if (preset !== 'custom') {
      update('margins', { ...MARGIN_PRESETS[preset] });
    }
  };

  const setMargin = (side: keyof PDFSettings['margins'], mm: number) => {
    update('margins', { ...settings.margins, [side]: mm * MM });
  };

  return (
    <>
      <Field label="Preset">
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((p) => (
            <Button
              key={p}
              variant={settings.marginPreset === p ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handlePreset(p)}
              className="capitalize"
            >
              {p}
            </Button>
          ))}
        </div>
      </Field>

      {settings.marginPreset === 'custom' && (
        <div className="grid grid-cols-2 gap-2">
          {(['top', 'right', 'bottom', 'left'] as const).map((side) => (
            <Field key={side} label={`${side} (mm)`}>
              <Input
                type="number"
                min={0}
                max={100}
                value={Math.round(settings.margins[side] / MM)}
                onChange={(e) => setMargin(side, Number(e.target.value))}
              />
            </Field>
          ))}
        </div>
      )}
    </>
  );
}
