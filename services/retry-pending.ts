// services/retry-pending.ts
// This script retries sending pending emails stored in a local JSON file.
// It reads the queue from 'pending-mails.json', attempts to send each email,
// and removes successfully sent items from the queue. Remaining items are saved back to the file.
// It can be run manually or scheduled as a cron job.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendFormNotificationMail, sendAutoReplyMail } from '../src/lib/mail';
// Smart dotenv loader: ENV_FILE > NODE_ENV=production -> .env.production > fallback .env
import { config as loadEnv } from 'dotenv';
const envPath = process.env.ENV_FILE || '.env.production';
loadEnv({ path: envPath });
console.log(`[retry-pending] Loaded env from ${envPath}`);

// Resolve path to the same queue file used by the API
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pendingMailsPath = path.resolve(__dirname, '../src/data/tmp/pending-mails.json');

interface QueuedNotification {
  type: 'notification';
  queuedAt: string;
  payload: {
    firstName: string;
    lastName: string;
    email: string;
    message: string;
    lang?: string;
    ip?: string;
    text?: string;
    html?: string;
  };
}

interface QueuedAutoResponder {
  type: 'autoresponder';
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

type QueueItem = QueuedNotification | QueuedAutoResponder | Record<string, any>;

async function retryPendingMails() {
  let queue: QueueItem[] = [];

  try {
    const data = fs.readFileSync(pendingMailsPath, 'utf-8');
    queue = JSON.parse(data);
  } catch (err: any) {
    if (err?.code === 'ENOENT') {
      console.log('No pending mails file found. Nothing to retry.');
      return;
    }
    console.error('Failed to read pending mails:', err);
    return;
  }

  if (!Array.isArray(queue) || queue.length === 0) {
    console.log('No pending mails to retry.');
    return;
  }

  const remaining: QueueItem[] = [];

  for (const item of queue) {
    if (item && (item as QueuedNotification).type === 'notification') {
      const q = item as QueuedNotification;
      const { firstName, lastName, email, message, lang } = q.payload;
      const langSafe: 'en' | 'de' = lang === 'de' ? 'de' : 'en';

      const text = q.payload.text ?? `From: ${firstName} ${lastName} <${email}>\n\n${message}`;
      const html = q.payload.html ?? `
        <p><strong>From:</strong> ${firstName} ${lastName} &lt;${email}&gt;</p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `;

      let sent = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await sendFormNotificationMail({
            firstName,
            lastName,
            email,
            message,
            lang: langSafe,
            text,
            html,
          });
          console.log(`✓ Notification to ${email} relayed successfully on attempt ${attempt}`);
          sent = true;
          break;
        } catch (err: any) {
          console.warn(`✗ Retry attempt ${attempt} failed for ${email}: ${err?.message || err}`);
        }
      }

      if (!sent) {
        remaining.push(item);
        console.warn(`✗ Giving up after 3 attempts for ${email}`);
      }
    } else if (item && (item as QueuedAutoResponder).type === 'autoresponder') {
      const q = item as QueuedAutoResponder;
      const { toEmail, subject, text, html } = q.payload;

      let sent = false;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          await sendAutoReplyMail({ toEmail, subject, text, html });
          console.log(`✓ Auto-reply to ${toEmail} sent successfully on attempt ${attempt}`);
          sent = true;
          break;
        } catch (err: any) {
          console.warn(`✗ Auto-reply retry attempt ${attempt} failed for ${toEmail}: ${err?.message || err}`);
        }
      }

      if (!sent) {
        remaining.push(item);
        console.warn(`✗ Giving up after 3 attempts for auto-reply to ${toEmail}`);
      }
    } else {
      // Unknown item type — keep it to avoid data loss
      remaining.push(item);
      console.warn('Skipping unknown queue item type, leaving in queue.');
    }
  }

  try {
    fs.writeFileSync(pendingMailsPath, JSON.stringify(remaining, null, 2), 'utf-8');
    console.log(`Queue updated. Remaining items: ${remaining.length}`);
  } catch (err) {
    console.error('Failed to update pending mails file:', err);
  }
}

// Allow running directly via: node/tsx scripts/retry-pending.ts
retryPendingMails().catch(err => {
  console.error('Unexpected error during retry:', err);
  process.exit(1);
});
