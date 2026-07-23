import {
  PDFDocument,
  PDFPage,
  PDFFont,
  rgb,
  degrees,
  StandardFonts,
} from 'pdf-lib';
import type { PDFSettings } from '@/types';
import { PAGE_SIZES, MARGIN_PRESETS } from '../constants';
import { loadFont } from './fonts';
import { formatDate } from '../utils';

function getPageDimensions(settings: PDFSettings): [number, number] {
  if (settings.pageSize === 'CUSTOM') {
    const w = settings.customWidth || 595.28;
    const h = settings.customHeight || 841.89;
    return settings.orientation === 'landscape' ? [h, w] : [w, h];
  }
  const dims = PAGE_SIZES[settings.pageSize] || PAGE_SIZES.A4;
  return settings.orientation === 'landscape' ? [dims[1], dims[0]] : [dims[0], dims[1]];
}

function getMargins(settings: PDFSettings) {
  if (settings.marginPreset === 'custom') return settings.margins;
  return MARGIN_PRESETS[settings.marginPreset] || MARGIN_PRESETS.normal;
}

// Sanitise a string for standard PDF fonts (ASCII + common Latin)
function sanitizeText(text: string): string {
  return text
    .replace(/‘|’/g, "'")
    .replace(/“|”/g, '"')
    .replace(/–/g, '-')
    .replace(/—/g, '--')
    .replace(/…/g, '...')
    .replace(/[^\x00-\xFF]/g, '?');
}

// Width of a string including per-character letter spacing.
function measureWidth(
  text: string,
  font: PDFFont,
  fontSize: number,
  charSpacing: number
): number {
  const base = font.widthOfTextAtSize(text, fontSize);
  if (charSpacing <= 0 || text.length <= 1) return base;
  return base + charSpacing * (text.length - 1);
}

// Draws text with optional letter spacing. pdf-lib's drawText has no
// character-spacing option, so we position each glyph manually when needed.
function drawTextSpaced(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  fontSize: number,
  charSpacing: number
) {
  if (charSpacing <= 0) {
    page.drawText(text, { x, y, size: fontSize, font, color: rgb(0, 0, 0) });
    return;
  }
  let cx = x;
  for (const ch of text) {
    page.drawText(ch, { x: cx, y, size: fontSize, font, color: rgb(0, 0, 0) });
    cx += font.widthOfTextAtSize(ch, fontSize) + charSpacing;
  }
}

function wrapLine(
  text: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number,
  charSpacing: number
): string[] {
  if (!text) return [''];
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    const width = measureWidth(candidate, font, fontSize, charSpacing);
    if (width > maxWidth && current !== '') {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [''];
}

function drawLine(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  fontSize: number,
  alignment: string,
  textAreaX: number,
  textAreaWidth: number,
  underline: boolean,
  isLastJustifyLine: boolean,
  charSpacing: number
) {
  const textWidth = measureWidth(text, font, fontSize, charSpacing);
  let drawX = x;

  if (alignment === 'center') {
    drawX = textAreaX + (textAreaWidth - textWidth) / 2;
  } else if (alignment === 'right') {
    drawX = textAreaX + textAreaWidth - textWidth;
  } else if (alignment === 'justify' && !isLastJustifyLine && text.includes(' ')) {
    const words = text.split(' ');
    if (words.length > 1) {
      const wordsWidth = words.reduce(
        (sum, w) => sum + measureWidth(w, font, fontSize, charSpacing),
        0
      );
      const spaceWidth = (textAreaWidth - wordsWidth) / (words.length - 1);
      let wx = textAreaX;
      for (let i = 0; i < words.length; i++) {
        drawTextSpaced(page, words[i], wx, y, font, fontSize, charSpacing);
        if (i < words.length - 1) {
          wx += measureWidth(words[i], font, fontSize, charSpacing) + spaceWidth;
        }
      }
      if (underline) {
        page.drawLine({
          start: { x: textAreaX, y: y - 2 },
          end: { x: textAreaX + textAreaWidth, y: y - 2 },
          thickness: 0.8,
          color: rgb(0, 0, 0),
        });
      }
      return;
    }
  }

  drawTextSpaced(page, text, drawX, y, font, fontSize, charSpacing);
  if (underline && textWidth > 0) {
    page.drawLine({
      start: { x: drawX, y: y - 2 },
      end: { x: drawX + textWidth, y: y - 2 },
      thickness: 0.8,
      color: rgb(0, 0, 0),
    });
  }
}

function drawHeaderFooter(
  page: PDFPage,
  settings: PDFSettings,
  font: PDFFont,
  pageWidth: number,
  pageHeight: number,
  margins: ReturnType<typeof getMargins>,
  pageNum: number,
  totalPages: number,
  isHeader: boolean
) {
  const enabled = isHeader ? settings.headerEnabled : settings.footerEnabled;
  if (!enabled) return;

  const title = isHeader ? settings.headerTitle : settings.footerTitle;
  const showDate = isHeader ? settings.headerDate : settings.footerDate;
  const showPageNum = isHeader ? settings.headerPageNumbers : settings.footerPageNumbers;
  const customText = isHeader ? settings.headerCustomText : settings.footerCustomText;

  const parts: string[] = [];
  if (title) parts.push(title);
  if (showDate) parts.push(formatDate(new Date()));
  if (customText) parts.push(customText);
  if (showPageNum) parts.push(`Page ${pageNum} of ${totalPages}`);

  const text = sanitizeText(parts.join('  |  '));
  if (!text) return;

  const hfFontSize = 9;
  const y = isHeader
    ? pageHeight - margins.top + 14
    : margins.bottom - 16;

  const textWidth = font.widthOfTextAtSize(text, hfFontSize);
  const x = (pageWidth - textWidth) / 2;

  // Separator line
  const lineY = isHeader ? pageHeight - margins.top + 4 : margins.bottom - 4;
  page.drawLine({
    start: { x: margins.left, y: lineY },
    end: { x: pageWidth - margins.right, y: lineY },
    thickness: 0.5,
    color: rgb(0.7, 0.7, 0.7),
  });

  page.drawText(text, { x: Math.max(margins.left, x), y, size: hfFontSize, font, color: rgb(0.4, 0.4, 0.4) });
}

function drawWatermark(
  page: PDFPage,
  settings: PDFSettings,
  font: PDFFont,
  pageWidth: number,
  pageHeight: number
) {
  if (!settings.watermarkEnabled || !settings.watermarkText) return;
  const text = sanitizeText(settings.watermarkText);
  if (!text) return;

  const size = settings.watermarkSize;
  const opacity = Math.min(1, Math.max(0, settings.watermarkOpacity));
  const angle = settings.watermarkRotation;
  const textWidth = font.widthOfTextAtSize(text, size);

  let cx: number, cy: number;
  const pos = settings.watermarkPosition;
  const pad = 60;

  if (pos === 'center') { cx = pageWidth / 2 - textWidth / 2; cy = pageHeight / 2; }
  else if (pos === 'top-left') { cx = pad; cy = pageHeight - pad; }
  else if (pos === 'top-right') { cx = pageWidth - textWidth - pad; cy = pageHeight - pad; }
  else if (pos === 'bottom-left') { cx = pad; cy = pad + size; }
  else { cx = pageWidth - textWidth - pad; cy = pad + size; }

  page.drawText(text, {
    x: cx,
    y: cy,
    size,
    font,
    color: rgb(0.5, 0.5, 0.5),
    opacity,
    rotate: degrees(angle),
  });
}

export async function generatePDF(text: string, settings: PDFSettings): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle('Text to PDF');
  pdfDoc.setCreator('TextToPDF App');

  const [pageWidth, pageHeight] = getPageDimensions(settings);
  const margins = getMargins(settings);

  const font = await loadFont(pdfDoc, settings.fontFamily, settings.bold, settings.italic);
  const watermarkFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const fontSize = settings.fontSize;
  const lineHeight = fontSize * settings.lineSpacing;
  const parasSpacing = fontSize * settings.paragraphSpacing;
  const charSpacing = settings.letterSpacing;

  const hasHeader = settings.headerEnabled;
  const hasFooter = settings.footerEnabled;
  const headerReserve = hasHeader ? fontSize * 2.5 : 0;
  const footerReserve = hasFooter ? fontSize * 2.5 : 0;

  const textAreaX = margins.left;
  const textAreaWidth = pageWidth - margins.left - margins.right;
  const topY = pageHeight - margins.top - headerReserve - fontSize;
  const bottomY = margins.bottom + footerReserve;

  // First pass: collect all rendered lines (we need total page count for headers/footers)
  type RenderLine = { text: string; isParaEnd: boolean };
  const renderLines: RenderLine[] = [];

  const rawParagraphs = text.split(/\n{2,}/);

  for (const para of rawParagraphs) {
    const sublines = para.split('\n');
    for (let si = 0; si < sublines.length; si++) {
      const subline = sublines[si];
      const sanitized = sanitizeText(subline);
      const wrapped = wrapLine(sanitized || '', font, fontSize, textAreaWidth, charSpacing);
      for (let wi = 0; wi < wrapped.length; wi++) {
        const isLast = wi === wrapped.length - 1 && si === sublines.length - 1;
        renderLines.push({ text: wrapped[wi], isParaEnd: isLast });
      }
    }
    // Para separator
    renderLines.push({ text: '', isParaEnd: true });
  }

  // Simulate pagination to get total pages
  let simY = topY;
  let totalPages = 1;
  for (const rl of renderLines) {
    if (!rl.text && rl.isParaEnd) { simY -= parasSpacing; continue; }
    if (simY < bottomY) { totalPages++; simY = topY; }
    simY -= lineHeight;
  }

  // Second pass: actual rendering
  const pages: PDFPage[] = [];
  let currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
  pages.push(currentPage);
  let pageNum = 1;
  let y = topY;

  drawHeaderFooter(currentPage, settings, font, pageWidth, pageHeight, margins, pageNum, totalPages, true);
  drawHeaderFooter(currentPage, settings, font, pageWidth, pageHeight, margins, pageNum, totalPages, false);

  for (let i = 0; i < renderLines.length; i++) {
    const rl = renderLines[i];

    if (!rl.text && rl.isParaEnd) {
      y -= parasSpacing;
      continue;
    }

    if (y < bottomY) {
      currentPage = pdfDoc.addPage([pageWidth, pageHeight]);
      pages.push(currentPage);
      pageNum++;
      y = topY;
      drawHeaderFooter(currentPage, settings, font, pageWidth, pageHeight, margins, pageNum, totalPages, true);
      drawHeaderFooter(currentPage, settings, font, pageWidth, pageHeight, margins, pageNum, totalPages, false);
    }

    const nextRl = renderLines[i + 1];
    const isLastInPara = !nextRl || nextRl.isParaEnd;

    drawLine(
      currentPage,
      rl.text,
      textAreaX,
      y,
      font,
      fontSize,
      settings.textAlignment,
      textAreaX,
      textAreaWidth,
      settings.underline,
      isLastInPara || settings.textAlignment !== 'justify',
      charSpacing
    );

    y -= lineHeight;
  }

  // Draw watermarks on all pages
  for (const pg of pages) {
    drawWatermark(pg, settings, watermarkFont, pageWidth, pageHeight);
  }

  return await pdfDoc.save();
}
