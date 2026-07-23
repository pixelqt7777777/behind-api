'use client';

import {
  FileText,
  Ruler,
  Type,
  AlignLeft,
  PanelTop,
  Droplets,
} from 'lucide-react';
import type { PDFSettings } from '@/types';
import { Section } from '@/components/ui/Section';
import { PageSettingsSection } from './PageSettingsSection';
import { MarginSection } from './MarginSection';
import { FontSection } from './FontSection';
import { TypographySection } from './TypographySection';
import { HeaderFooterSection } from './HeaderFooterSection';
import { WatermarkSection } from './WatermarkSection';

interface SettingsPanelProps {
  settings: PDFSettings;
  update: <K extends keyof PDFSettings>(key: K, value: PDFSettings[K]) => void;
}

export function SettingsPanel({ settings, update }: SettingsPanelProps) {
  return (
    <div className="flex flex-col">
      <Section title="Page" icon={<FileText className="h-4 w-4" />} defaultOpen>
        <PageSettingsSection settings={settings} update={update} />
      </Section>

      <Section title="Margins" icon={<Ruler className="h-4 w-4" />}>
        <MarginSection settings={settings} update={update} />
      </Section>

      <Section title="Font" icon={<Type className="h-4 w-4" />} defaultOpen>
        <FontSection settings={settings} update={update} />
      </Section>

      <Section title="Typography" icon={<AlignLeft className="h-4 w-4" />}>
        <TypographySection settings={settings} update={update} />
      </Section>

      <Section title="Header & Footer" icon={<PanelTop className="h-4 w-4" />}>
        <HeaderFooterSection settings={settings} update={update} />
      </Section>

      <Section title="Watermark" icon={<Droplets className="h-4 w-4" />}>
        <WatermarkSection settings={settings} update={update} />
      </Section>
    </div>
  );
}
