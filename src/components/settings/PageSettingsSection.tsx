'use client';

import type { PDFSettings, PageSize, Orientation } from '@/types';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { PAGE_SIZES } from '@/lib/constants';

interface Props {
  settings: PDFSettings;
  update: <K extends keyof PDFSettings>(key: K, value: PDFSettings[K]) => void;
}

const PAGE_OPTIONS = [
  { label: 'A4 (210 × 297 mm)', value: 'A4' },
  { label: 'Letter (8.5 × 11 in)', value: 'LETTER' },
  { label: 'Legal (8.5 × 14 in)', value: 'LEGAL' },
  { label: 'A3 (297 × 420 mm)', value: 'A3' },
  { label: 'A5 (148 × 210 mm)', value: 'A5' },
  { label: 'Custom', value: 'CUSTOM' },
];

export function PageSettingsSection({ settings, update }: Props) {
  const handleSizeChange = (value: string) => {
    const size = value as PageSize;
    update('pageSize', size);
    if (size !== 'CUSTOM') {
      const dims = PAGE_SIZES[size];
      update('customWidth', dims[0]);
      update('customHeight', dims[1]);
    }
  };

  return (
    <>
      <Field label="Page Size">
        <Select
          options={PAGE_OPTIONS}
          value={settings.pageSize}
          onChange={(e) => handleSizeChange(e.target.value)}
        />
      </Field>

      <Field label="Orientation">
        <div className="grid grid-cols-2 gap-2">
          {(['portrait', 'landscape'] as Orientation[]).map((o) => (
            <Button
              key={o}
              variant={settings.orientation === o ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => update('orientation', o)}
              className="capitalize"
            >
              {o}
            </Button>
          ))}
        </div>
      </Field>

      {settings.pageSize === 'CUSTOM' && (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Width (pt)">
            <Input
              type="number"
              min={100}
              max={5000}
              value={Math.round(settings.customWidth)}
              onChange={(e) => update('customWidth', Number(e.target.value))}
            />
          </Field>
          <Field label="Height (pt)">
            <Input
              type="number"
              min={100}
              max={5000}
              value={Math.round(settings.customHeight)}
              onChange={(e) => update('customHeight', Number(e.target.value))}
            />
          </Field>
        </div>
      )}
    </>
  );
}
