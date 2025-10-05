// src/lib/data/store.ts
// File-backed persistence helpers for local/dev usage and a remote queue fallback for prod.

import fs from 'fs';
import path from 'path';
import type { ContactFormSubmission, QueueItem } from '@/lib/mail/types';

// -------- env helper (Vite or Node) --------
function env(key: string): string | undefined {
  const metaEnv = (typeof import.meta !== 'undefined' ? (import.meta as any).env : undefined) as
    | Record<string, string | undefined>
    | undefined;
  if (metaEnv && Object.prototype.hasOwnProperty.call(metaEnv, key)) return metaEnv[key];
  // '@ts-expect-error process' may be undefined in some runtimes
  return typeof process !== 'undefined' ? (process.env as Record<string, string | undefined>)[key] : undefined;
}

// -------- file paths (kept under src/data/tmp for dev) --------
const DATA_DIR = path.resolve(process.cwd(), 'src/data/tmp');
export const submissionsPath = path.join(DATA_DIR, 'submissions.json');
export const pendingMailsPath = path.join(DATA_DIR, 'pending-mails.json');

function ensureDirFor(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readJsonArray<T = any>(filePath: string): T[] {
  try {
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, 'utf-8').trim();
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeJsonArray<T = any>(filePath: string, arr: T[]) {
  try {
    ensureDirFor(filePath);
    fs.writeFileSync(filePath, JSON.stringify(arr, null, 2), 'utf-8');
  } catch (e) {
    console.warn(`[store] Failed to write ${path.basename(filePath)}:`, e);
  }
}

// -------- public API --------

/** Append a single submission record for digests/CRMs. */
export function appendSubmission(rec: Partial<ContactFormSubmission> & { ts: string; ip?: string }) {
  const list = readJsonArray<typeof rec>(submissionsPath);
  list.push(rec);
  writeJsonArray(submissionsPath, list);
}

/**
 * Enqueue a mail job. If MAIL_QUEUE_URL is set, POST to the remote queue (Cloudflare Worker);
 * otherwise store locally in pending-mails.json for `npm run retry-pending`.
 */
export async function enqueuePending(item: QueueItem): Promise<void> {
  const remote = env('MAIL_QUEUE_URL');
  if (remote) {
    try {
      await fetch(remote, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: (item as any).type, payload: (item as any).payload }),
      });
      return;
    } catch (e) {
      console.warn('[store] Remote enqueue failed, falling back to file queue:', e);
    }
  }
  const withTimestamp = { ...item, queuedAt: (item as any).queuedAt || new Date().toISOString() } as QueueItem;
  const q = readJsonArray<QueueItem>(pendingMailsPath);
  q.push(withTimestamp);
  writeJsonArray(pendingMailsPath, q);
}