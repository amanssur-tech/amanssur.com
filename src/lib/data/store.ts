// src/lib/data/store.ts
// Cloudflare-safe version: no filesystem access, just remote queue or logging.

import type { ContactFormSubmission, QueueItem } from '@/lib/mail/types'

/** Append a single submission record for digests/CRMs (no local persistence). */
export async function appendSubmission(_: Partial<ContactFormSubmission> & { ts: string; ip?: string }) {
  console.log('[store] appendSubmission called — no local storage on CF.');
}

/** Enqueue a mail job (uses remote queue if MAIL_QUEUE_URL is set, otherwise logs). */
export async function enqueuePending(item: QueueItem, env: Record<string, string>): Promise<void> {
  const remote = env.MAIL_QUEUE_URL

  if (remote) {
    try {
      await fetch(remote, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: (item as any).type, payload: (item as any).payload }),
      })
      return
    } catch (e) {
      console.warn('[store] Remote enqueue failed:', e)
    }
  }

  console.log('[store] enqueuePending skipped — no remote queue configured.')
}