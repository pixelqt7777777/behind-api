export type PageSize = 'A4' | 'LETTER' | 'LEGAL' | 'A3' | 'A5' | 'CUSTOM';
export type Orientation = 'portrait' | 'landscape';
export type MarginPreset = 'narrow' | 'normal' | 'wide' | 'custom';
export type FontFamily =
  | 'helvetica'
  | 'arial'
  | 'times'
  | 'georgia'
  | 'courier'
  | 'roboto'
  | 'opensans';
export type TextAlignment = 'left' | 'center' | 'right' | 'justify';
export type WatermarkPosition =
  | 'center'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';
export type Theme = 'light' | 'dark' | 'system';

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PDFSettings {
  pageSize: PageSize;
  orientation: Orientation;
  customWidth: number;
  customHeight: number;

  marginPreset: MarginPreset;
  margins: Margins;

  fontFamily: FontFamily;
  fontSize: number;
  bold: boolean;
  italic: boolean;
  underline: boolean;

  lineSpacing: number;
  letterSpacing: number;
  paragraphSpacing: number;
  textAlignment: TextAlignment;

  headerEnabled: boolean;
  headerTitle: string;
  headerDate: boolean;
  headerPageNumbers: boolean;
  headerCustomText: string;

  footerEnabled: boolean;
  footerTitle: string;
  footerDate: boolean;
  footerPageNumbers: boolean;
  footerCustomText: string;

  watermarkEnabled: boolean;
  watermarkText: string;
  watermarkOpacity: number;
  watermarkRotation: number;
  watermarkSize: number;
  watermarkPosition: WatermarkPosition;
}

export interface TextStats {
  words: number;
  characters: number;
  paragraphs: number;
  readingTime: number;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export interface FindReplaceState {
  isOpen: boolean;
  find: string;
  replace: string;
  caseSensitive: boolean;
  useRegex: boolean;
  currentMatch: number;
  totalMatches: number;
}
