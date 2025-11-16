// src/lib/data/store.ts
// Cloudflare-safe version: no filesystem access, just remote queue or logging.

import type { QueueItem } from "@/lib/mail/types";

/** Append a single submission record for digests/CRMs (no local persistence). */
export async function appendSubmission(submission: Record<string, unknown>) {
  console.log("[store] appendSubmission received:", submission);
}

/** Enqueue a mail job (uses remote queue if MAIL_QUEUE_URL is set, otherwise logs). */
export async function enqueuePending(
  item: QueueItem,
  env: Record<string, string>,
): Promise<void> {
  const remote = env.MAIL_QUEUE_URL;

  if (remote) {
    try {
      await fetch(remote, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: (item as Record<string, unknown>).type as string,
          payload: (item as Record<string, unknown>).payload,
        }),
      });
      return;
    } catch (e) {
      console.warn("[store] Remote enqueue failed:", e);
    }
  }

  console.log("[store] enqueuePending skipped — no remote queue configured.");
}
