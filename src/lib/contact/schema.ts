// src/lib/contact/schema.ts
// Validation & guards for the contact API: zod schema, rate limit, email domain checks.

import { z } from 'zod';
import { isDisposableDomain } from '@/lib/antispam/disposable';
import type { Reason } from '@/lib/mail/types';

/** Read env from Vite (import.meta.env) or Node (process.env) safely */
function env(key: string): string | undefined {
  const metaEnv = (typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined) as
    | Record<string, string | undefined>
    | undefined;
  if (metaEnv && Object.prototype.hasOwnProperty.call(metaEnv, key)) return metaEnv[key];
    // '@ts-expect-error' process may not exist in Workers during type time
  return typeof process !== 'undefined' ? (process.env as Record<string, string | undefined>)[key] : undefined;
}

/** Extract domain from an email address; returns null if not parseable */
export function parseDomain(addr: string): string | null {
  const m = String(addr).trim().match(/@([^@>\s]+)$/);
  return m?.[1]?.toLowerCase() ?? null;
}

/** Allow list / block list logic can be extended later. For now: reject disposable domains. */
export function isDisposableDomainWithEnv(domain: string): boolean {
  if (!domain) return false;
  // Base disposable list
  if (isDisposableDomain(domain)) return true;
  // Optional extra comma-separated list from env (e.g., "yopmail.com,trashmail.com")
  const extra = env('DISPOSABLE_EXTRA');
  if (extra) {
    const set = new Set(
      extra
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    );
    if (set.has(domain.toLowerCase())) return true;
  }
  return false;
}

/** Simple check: currently just ensures domain is not disposable */
export function isAllowedEmail(email: string): boolean {
  const domain = parseDomain(email);
  if (!domain) return false;
  if (isDisposableDomainWithEnv(domain)) return false;
  return true;
}

// ---------------- Rate limiting ----------------
// Lightweight in-memory window counter (good enough for dev / single-node).
// In serverless prod, prefer a durable store (KV/Redis) — we already have a Worker setup for queues.

const WINDOW_MS = 60_000; // 1 minute
const MAX_PER_WINDOW = 5; // max submissions per IP per WINDOW_MS

const rl = new Map<string, { count: number; windowStart: number }>();

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const e = rl.get(ip);
  if (!e) {
    rl.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (now - e.windowStart > WINDOW_MS) {
    rl.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (e.count >= MAX_PER_WINDOW) return false;
  e.count += 1;
  return true;
}

// ---------------- Zod schema ----------------

export const ContactSchema = z
  .object({
    firstName: z.string().min(1, 'firstName required'),
    lastName: z.string().min(1, 'lastName required'),
    email: z.string().email('invalid email'),
    phone: z.string().optional(),
    company: z.string().optional(),
    website: z.string().optional(),
    message: z.string().min(1, 'message required'),
    reason: z.enum(['recruitment', 'collaboration', 'speaking', 'interview', 'other'] as [Reason, ...Reason[]]),
    subjectOther: z.string().optional(),
    lang: z.enum(['en', 'de']),
    // Honeypot — must be blank
    middleName: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    // Honeypot trigger
    if (data.middleName && data.middleName.trim() !== '') {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Bot detected (honeypot).' });
    }

    // Disposable / disallowed email domains
    if (!isAllowedEmail(data.email)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Email domain not allowed.' });
    }

    // If reason is 'other', subjectOther should be present (short but non-empty)
    if (data.reason === 'other') {
      const s = (data.subjectOther || '').trim();
      if (!s) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Subject required for "Other".' });
      }
    }
  });

export type ContactData = z.infer<typeof ContactSchema>;

// Wrap parsing from FormData → typed ContactData.
export function parseAndValidate(form: FormData): { data: ContactData; lang: 'en' | 'de' } {
  // Convert FormData to a plain object
  const obj: Record<string, any> = {};
  for (const [k, v] of form.entries()) obj[k] = typeof v === 'string' ? v : String(v);

  // Compatibility: form sends `subject` only when reason === 'other'. Map it to `subjectOther`.
  const reasonVal = typeof obj.reason === 'string' ? obj.reason : '';
  if (reasonVal === 'other' && !obj.subjectOther && typeof obj.subject === 'string' && obj.subject.trim()) {
    obj.subjectOther = obj.subject;
  }
  // If reason is not 'other', drop stray `subject` field so it doesn't interfere downstream.
  if (reasonVal !== 'other' && 'subject' in obj) {
    delete obj.subject;
  }

  const parsed = ContactSchema.safeParse(obj);
  if (!parsed.success) {
    throw parsed.error;
  }
  const data = parsed.data;
  return { data, lang: data.lang };
}