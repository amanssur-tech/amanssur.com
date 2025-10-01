// src/lib/contact/transform.ts
// Normalization & mapping helpers used by the contact API route.

import type { Reason, ContactFormSubmission } from '@/lib/mail/types';
import { getProps, type Lang } from '@/lib/i18n';

/** Basic trimming utility (keeps empty string as undefined if input is blank). */
export function sanitize(input?: string | null): string | undefined {
  if (input == null) return undefined;
  const s = String(input).trim();
  return s.length ? s : undefined;
}

/** Escape minimal HTML entities for safe embedding in emails (if needed). */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case '\'':
        return '&#39;';
      default:
        return ch;
    }
  });
}

/** Normalize a website/url string: add https:// when missing, trim spaces. */
export function normalizeWebsite(url?: string | null): string | undefined {
  const s = sanitize(url);
  if (!s) return undefined;
  // If it already looks like a URL with a scheme, keep it.
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) return s;
  // Add https:// by default.
  return `https://${s}`;
}

/**
 * Normalize a phone string: keep digits, spaces, and one leading "+".
 * This is intentionally light-touch and locale-agnostic.
 */
export function normalizePhone(phone?: string | null): string | undefined {
  const s = sanitize(phone);
  if (!s) return undefined;
  // Remove everything except digits, spaces, and plus.
  let cleaned = s.replace(/[^0-9+\s]/g, ' ').replace(/\s+/g, ' ').trim();
  // Collapse multiple leading plus signs to one.
  cleaned = cleaned.replace(/^\++/, '+');
  return cleaned || undefined;
}

/** Map a short lang code to a friendly name (for emails or logs). */
export function langFullName(lang: Lang): string {
  return lang === 'de' ? 'German' : 'English';
}

/**
 * Map an internal Reason enum to a localized label using i18n files.
 * Falls back to the raw reason if a label cannot be found.
 */
export function mapReasonToLabel(lang: Lang, reason?: Reason): string | undefined {
  if (!reason) return undefined;
  const contact = getProps(lang, 'contact');
  const form = (contact as any).form as Record<string, string>;
  const reasonKeyMap: Record<Reason, keyof typeof form> = {
    recruitment: 'reasonRecruitment',
    collaboration: 'reasonCollaboration',
    speaking: 'reasonEvent',
    interview: 'reasonInterview',
    other: 'reasonOther',
  } as const;
  const key = reasonKeyMap[reason];
  const label = form?.[key];
  return typeof label === 'string' && label ? label : reason;
}

/** Build a record suitable for submissions.json logging. */
export function buildSubmissionRecord(input: {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  lang: Lang;
  reason?: Reason;
  subjectOther?: string;
  company?: string;
  phone?: string;
  website?: string;
  ip?: string;
}): Partial<ContactFormSubmission> & { ts: string; ip?: string } {
  const ts = new Date().toISOString();
  const phoneNorm = normalizePhone(input.phone);
  const websiteNorm = normalizeWebsite(input.website);

  return {
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    message: input.message,
    lang: input.lang,
    reason: input.reason,
    subjectOther: sanitize(input.subjectOther),
    company: sanitize(input.company),
    phone: phoneNorm,
    website: websiteNorm,
    ip: sanitize(input.ip),
    ts,
  };
}