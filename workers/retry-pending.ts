// workers/retry-pending.ts
// This script retries sending pending emails stored in Cloudflare KV.
// It reads the queue from KV, attempts to send each email,
// and removes successfully sent items from the queue. Remaining items are saved back.
// It can be run manually or scheduled as a cron job.

import { sendFormNotificationMail, sendAutoReplyMail } from "../src/lib/mail";

// Cloudflare KV namespace binding
declare const PENDING_MAILS_KV: KVNamespace;

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete(key: string): Promise<void>;
}

interface QueuedNotification {
  type: "notification";
  queuedAt: string;
  payload: {
    firstName: string;
    lastName: string;
    email: string;
    message: string;
    lang?: string;
    ip: string;
    text?: string;
    html?: string;
    subject?: string;
  };
}

interface QueuedAutoResponder {
  type: "autoresponder";
  queuedAt: string;
  payload: {
    toEmail: string;
    subject: string;
    text: string;
    html: string;
    firstName?: string;
    lastName?: string;
    lang?: string;
  };
}

type QueueItem =
  | QueuedNotification
  | QueuedAutoResponder
  | Record<string, unknown>;

async function getPendingMails(): Promise<QueueItem[]> {
  const data = await PENDING_MAILS_KV.get("pending-mails");
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function setPendingMails(queue: QueueItem[]): Promise<void> {
  const data = JSON.stringify(queue, null, 2);
  await PENDING_MAILS_KV.put("pending-mails", data);
}

async function retryPendingMails() {
  let queue: QueueItem[] = [];

  try {
    queue = await getPendingMails();
  } catch (err: unknown) {
    console.error("Failed to read pending mails:", err);
    return;
  }

  if (!Array.isArray(queue) || queue.length === 0) {
    console.log("No pending mails to retry.");
    return;
  }

  const remaining: QueueItem[] = [];

  for (const item of queue) {
    if (item && (item as QueuedNotification).type === "notification") {
      const q = item as QueuedNotification;
      const { firstName, lastName, email, message, lang, subject } = q.payload;
      const langSafe: "en" | "de" = lang === "de" ? "de" : "en";

      const text =
        q.payload.text ??
        `From: ${firstName} ${lastName} <${email}>\n\n${message}`;
      const html =
        q.payload.html ??
        `
        <p><strong>From:</strong> ${firstName} ${lastName} &lt;${email}&gt;</p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `;

      let sent = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await sendFormNotificationMail(
            {
              firstName,
              lastName,
              email,
              message,
              lang: langSafe,
              text,
              html,
              subject: subject ?? "",
            },
            {},
          );
          console.log(
            `✓ Notification to ${email} relayed successfully on attempt ${attempt}`,
          );
          sent = true;
          break;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn(
            `✗ Retry attempt ${attempt} failed for ${email}: ${msg}`,
          );
        }
      }

      if (!sent) {
        remaining.push(item);
        console.warn(`✗ Giving up after 3 attempts for ${email}`);
      }
    } else if (item && (item as QueuedAutoResponder).type === "autoresponder") {
      const q = item as QueuedAutoResponder;
      const { toEmail, subject, text, html } = q.payload;

      let sent = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await sendAutoReplyMail({ toEmail, subject, text, html }, {});
          console.log(
            `✓ Auto-reply to ${toEmail} sent successfully on attempt ${attempt}`,
          );
          sent = true;
          break;
        } catch (err: unknown) {
          const msg2 = err instanceof Error ? err.message : String(err);
          console.warn(
            `✗ Auto-reply retry attempt ${attempt} failed for ${toEmail}: ${msg2}`,
          );
        }
      }

      if (!sent) {
        remaining.push(item);
        console.warn(
          `✗ Giving up after 3 attempts for auto-reply to ${toEmail}`,
        );
      }
    } else {
      // Unknown item type — keep it to avoid data loss
      remaining.push(item);
      console.warn("Skipping unknown queue item type, leaving in queue.");
    }
  }

  try {
    await setPendingMails(remaining);
    console.log(`Queue updated. Remaining items: ${remaining.length}`);
  } catch (err: unknown) {
    console.error("Failed to update pending mails:", err);
  }
}

// Run retry logic
retryPendingMails().catch((err) => {
  console.error("Unexpected error during retry:", err);
});
