import {
  PDFDocument,
  PDFFont,
  StandardFonts,
} from 'pdf-lib';
import type { FontFamily } from '@/types';

// Maps font family + bold/italic to pdf-lib standard fonts
function getStandardFont(
  family: FontFamily,
  bold: boolean,
  italic: boolean
): StandardFonts {
  switch (family) {
    case 'courier':
      if (bold && italic) return StandardFonts.CourierBoldOblique;
      if (bold) return StandardFonts.CourierBold;
      if (italic) return StandardFonts.CourierOblique;
      return StandardFonts.Courier;
    case 'times':
    case 'georgia':
      if (bold && italic) return StandardFonts.TimesRomanBoldItalic;
      if (bold) return StandardFonts.TimesRomanBold;
      if (italic) return StandardFonts.TimesRomanItalic;
      return StandardFonts.TimesRoman;
    default:
      // helvetica, arial, roboto, opensans — all fall back to Helvetica for standard
      if (bold && italic) return StandardFonts.HelveticaBoldOblique;
      if (bold) return StandardFonts.HelveticaBold;
      if (italic) return StandardFonts.HelveticaOblique;
      return StandardFonts.Helvetica;
  }
}

const FONT_URLS: Partial<Record<FontFamily, string>> = {
  roboto: 'https://fonts.gstatic.com/s/roboto/v47/KFOMCnqEu92Fr1ME4mxKKTU1Kw.ttf',
  opensans: 'https://fonts.gstatic.com/s/opensans/v40/memSYaGs126MiZpBA-UvWbX2vVnXBbObj2OVZyOOSr4dVJWUgsjZ0B4gaVc.ttf',
};

// Cache loaded font bytes to avoid re-fetching
const fontBytesCache = new Map<string, Uint8Array>();

async function fetchFontBytes(url: string): Promise<Uint8Array | null> {
  if (fontBytesCache.has(url)) return fontBytesCache.get(url)!;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const bytes = new Uint8Array(buf);
    fontBytesCache.set(url, bytes);
    return bytes;
  } catch {
    return null;
  }
}

export async function loadFont(
  pdfDoc: PDFDocument,
  family: FontFamily,
  bold: boolean,
  italic: boolean
): Promise<PDFFont> {
  const url = FONT_URLS[family];

  if (url) {
    const bytes = await fetchFontBytes(url);
    if (bytes) {
      try {
        return await pdfDoc.embedFont(bytes);
      } catch {
        // Fall through to standard font
      }
    }
  }

  const standardFont = getStandardFont(family, bold, italic);
  return await pdfDoc.embedFont(standardFont);
}
