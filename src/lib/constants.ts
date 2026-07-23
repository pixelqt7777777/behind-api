import type { PDFSettings } from '@/types';

// Points: 1pt = 1/72 inch, 1mm = 2.83465pt
const MM = 2.83465;

export const PAGE_SIZES: Record<string, [number, number]> = {
  A4: [595.28, 841.89],
  LETTER: [612, 792],
  LEGAL: [612, 1008],
  A3: [841.89, 1190.55],
  A5: [419.53, 595.28],
};

export const MARGIN_PRESETS: Record<string, { top: number; right: number; bottom: number; left: number }> = {
  narrow: { top: 12.7 * MM, right: 12.7 * MM, bottom: 12.7 * MM, left: 12.7 * MM },
  normal: { top: 25.4 * MM, right: 25.4 * MM, bottom: 25.4 * MM, left: 25.4 * MM },
  wide: { top: 25.4 * MM, right: 50.8 * MM, bottom: 25.4 * MM, left: 50.8 * MM },
};

export const FONT_LABELS: Record<string, string> = {
  helvetica: 'Helvetica',
  arial: 'Arial',
  times: 'Times New Roman',
  georgia: 'Georgia',
  courier: 'Courier New',
  roboto: 'Roboto',
  opensans: 'Open Sans',
};

export const FONT_SIZE_OPTIONS = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 28, 32, 36, 48, 72];

export const LINE_SPACING_OPTIONS = [
  { label: 'Single (1.0)', value: 1.0 },
  { label: '1.15', value: 1.15 },
  { label: '1.5', value: 1.5 },
  { label: 'Double (2.0)', value: 2.0 },
  { label: '2.5', value: 2.5 },
  { label: 'Triple (3.0)', value: 3.0 },
];

export const DEFAULT_SETTINGS: PDFSettings = {
  pageSize: 'A4',
  orientation: 'portrait',
  customWidth: 595.28,
  customHeight: 841.89,

  marginPreset: 'normal',
  margins: { ...MARGIN_PRESETS.normal },

  fontFamily: 'helvetica',
  fontSize: 12,
  bold: false,
  italic: false,
  underline: false,

  lineSpacing: 1.5,
  letterSpacing: 0,
  paragraphSpacing: 1.5,
  textAlignment: 'left',

  headerEnabled: false,
  headerTitle: '',
  headerDate: false,
  headerPageNumbers: false,
  headerCustomText: '',

  footerEnabled: false,
  footerTitle: '',
  footerDate: false,
  footerPageNumbers: true,
  footerCustomText: '',

  watermarkEnabled: false,
  watermarkText: 'DRAFT',
  watermarkOpacity: 0.15,
  watermarkRotation: -45,
  watermarkSize: 80,
  watermarkPosition: 'center',
};

export const STORAGE_KEY_CONTENT = 'textpdf_content';
export const STORAGE_KEY_SETTINGS = 'textpdf_settings';
export const STORAGE_KEY_THEME = 'textpdf_theme';

export const READING_WPM = 200;
