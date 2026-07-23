export interface ImportResult {
  text: string;
  filename: string;
}

const TEXT_EXTENSIONS = ['.txt', '.md', '.markdown', '.text'];

export async function importTextFile(file: File): Promise<ImportResult> {
  const name = file.name.toLowerCase();
  const isDocx = name.endsWith('.docx');
  const isText = TEXT_EXTENSIONS.some((ext) => name.endsWith(ext));

  if (isDocx) {
    // Lazy-load mammoth only when needed to keep bundle light
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return { text: result.value, filename: file.name };
  }

  if (isText || file.type.startsWith('text/')) {
    const text = await file.text();
    return { text, filename: file.name };
  }

  throw new Error('Unsupported file type. Please use TXT, MD, or DOCX.');
}

export function isSupportedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    name.endsWith('.docx') ||
    TEXT_EXTENSIONS.some((ext) => name.endsWith(ext)) ||
    file.type.startsWith('text/')
  );
}
