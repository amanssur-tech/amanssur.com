// src/lib/mail/index.ts

import type { NotificationMailOptions, AutoReplyMailOptions } from './types';

export {
  buildAutoReply,
  type AutoReplyParams,
  type AutoReplyI18n,
} from './templates/contact-autoreply';

export {
  buildContactNotif,
  type ContactNotifParams,
} from './templates/contact-notif';

// Cloudflare-native env function reading from provided env object
function env(key: string, cfEnv: Record<string, string>): string | undefined {
  return cfEnv[key];
}

async function hmacSHA256(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const keyData = await crypto.subtle.importKey(
    'raw',
    enc.encode(key),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', keyData, enc.encode(message));
  return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}

export const getEnv = env;

/** Send the notification email to you (MAIL_TO) using the form@ account. */
export async function sendFormNotificationMail(opts: NotificationMailOptions, cfEnv: Record<string, string>): Promise<void> {

  const { firstName, lastName, email, html, text } = opts;

  const relayUrl = env('STELLAR_RELAY_URL', cfEnv);
  const relayToken = env('STELLAR_RELAY_TOKEN', cfEnv);
  const hmacSecret = env('STELLAR_HMAC_SECRET', cfEnv);

  console.log('[Mail] Using relay URL:', relayUrl ? '[REDACTED]' : 'undefined');

  if (!relayUrl) {
    throw new Error('STELLAR_RELAY_URL is not defined');
  }
  if (!relayToken) {
    throw new Error('STELLAR_RELAY_TOKEN is not defined');
  }
  if (!hmacSecret) {
    throw new Error('STELLAR_HMAC_SECRET is not defined');
  }

  const body = {
    smtpAccount: 'form',
    to: String(env('MAIL_TO', cfEnv)),
    from: `${firstName} ${lastName}`,
    replyTo: `${firstName} ${lastName} <${email}>`,
    subject: opts.subject,
    text,
    html,
  };

  const bodyString = JSON.stringify(body);
  const signature = await hmacSHA256(hmacSecret, bodyString);

  console.log('[Mail] Sending to relay: [REDACTED]');

try {
  const response = await fetch(relayUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Relay-Token': relayToken,
      'X-Signature': signature,
    },
    body: bodyString,
  });

  console.log('[Mail] Relay response status:', response.status);
  const text = await response.text();
  console.log('[Mail] Relay response text:', text);
} catch (err) {
  console.error('[Mail] Relay fetch error:', err);
}
}

/** Send the auto‑reply to the client using the autoreply@ account. */
export async function sendAutoReplyMail(opts: AutoReplyMailOptions, cfEnv: Record<string, string>): Promise<void> {

  const relayUrl = env('STELLAR_RELAY_URL', cfEnv);
  const relayToken = env('STELLAR_RELAY_TOKEN', cfEnv);
  const hmacSecret = env('STELLAR_HMAC_SECRET', cfEnv);

  console.log('[Mail] Using relay URL:', relayUrl ? '[REDACTED]' : 'undefined');

  if (!relayUrl) {
    throw new Error('STELLAR_RELAY_URL is not defined');
  }
  if (!relayToken) {
    throw new Error('STELLAR_RELAY_TOKEN is not defined');
  }
  if (!hmacSecret) {
    throw new Error('STELLAR_HMAC_SECRET is not defined');
  }

  const body = {
    smtpAccount: 'autoreply',
    to: opts.toEmail,
    from: String(env('MAIL_FROM_AUTOREPLY', cfEnv)),
    replyTo: String(env('MAIL_TO', cfEnv)),
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  };

  const bodyString = JSON.stringify(body);
  const signature = await hmacSHA256(hmacSecret, bodyString);

  console.log('[Mail] Sending to relay: [REDACTED]');

try {
  const response = await fetch(relayUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Relay-Token': relayToken,
      'X-Signature': signature,
    },
    body: bodyString,
  });

  console.log('[Mail] Relay response status:', response.status);
  const text = await response.text();
  console.log('[Mail] Relay response text:', text);
} catch (err) {
  console.error('[Mail] Relay fetch error:', err);
}
}