import { type ClassValue, clsx } from 'clsx';
import { NextRequest } from 'next/server';
import { twMerge } from 'tailwind-merge';
import * as crypto from 'crypto';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ə/gi, 'e')
    .replace(/ğ/gi, 'gh')
    .replace(/ş/gi, 'sh')
    .replace(/ı/gi, 'i')
    .replace(/ö/gi, 'o')
    .replace(/ü/gi, 'u')
    .replace(/ç/gi, 'ch')
    .replace(/İ/g, 'i')
    .replace(/[^\u0000-\u007F]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// slugify with unique ending with date
export function slugifyWithDate(text: string): string {
  return `${slugify(text)}-${Date.now()}`;
}

export function getWordCount(input: string, isHtml = true): number {
  if (isHtml) {
    const text = input.replace(/<[^>]*>?/g, '');
    return getWordCount(text, false);
  }

  if (!input || typeof input !== 'string') return 0;

  // Normalize and clean the input
  const cleaned = input.normalize('NFD').trim();

  if (!cleaned) return 0;

  // Split by whitespace and punctuation, but preserve internal connectors
  // This approach is closer to how most word processors work
  const potentialWords = cleaned.split(/[\s\p{P}\p{S}]+/u).filter((word) => {
    // Must contain at least one letter
    if (!/[\p{L}]/u.test(word)) return false;

    // Must not be just punctuation or symbols
    if (/^[\p{P}\p{S}\p{M}]+$/u.test(word)) return false;

    // Accept words with internal apostrophes, hyphens, underscores
    return true;
  });

  return potentialWords.length;
}

export function calculateReadingTime(text: string, wpm?: number, isHtml?: boolean): number;
export function calculateReadingTime(wordCount: number, wpm?: number): number;
export function calculateReadingTime(wordCountOrText: number | string, wpm = 238, isHtml = true) {
  const wordCount = typeof wordCountOrText === 'string' ? getWordCount(wordCountOrText, isHtml) : wordCountOrText;
  const minutes = Math.ceil(wordCount / wpm);
  return minutes;
}

export function generateFingerprint(req: NextRequest) {
  // get ip, user-agent, and timestamp
  const ip = req.headers.get('x-forwarded-for') || '';
  const ua = req.headers.get('user-agent') || '';
  const ts = Date.now();

  // hash the ip, ua, and ts
  return crypto.createHash('sha256').update(`${ip}-${ua}-${ts}`).digest('hex');
}
