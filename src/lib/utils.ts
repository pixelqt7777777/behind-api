import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { TextStats } from '@/types';
import { READING_WPM } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function computeStats(text: string): TextStats {
  const trimmed = text.trim();
  if (!trimmed) return { words: 0, characters: 0, paragraphs: 0, readingTime: 0 };

  const words = trimmed.split(/\s+/).filter(Boolean).length;
  const characters = text.length;
  const paragraphs = trimmed.split(/\n{2,}/).filter((p) => p.trim()).length;
  const readingTime = Math.ceil(words / READING_WPM);

  return { words, characters, paragraphs, readingTime };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function debounce<T extends (...args: Parameters<T>) => void>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 9);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function findAllMatches(
  text: string,
  query: string,
  caseSensitive: boolean,
  useRegex: boolean
): number[] {
  if (!query) return [];
  const indices: number[] = [];
  try {
    const flags = caseSensitive ? 'g' : 'gi';
    const pattern = useRegex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(pattern, flags);
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      indices.push(match.index);
      if (match[0].length === 0) regex.lastIndex++;
    }
  } catch {
    // Invalid regex — ignore
  }
  return indices;
}
