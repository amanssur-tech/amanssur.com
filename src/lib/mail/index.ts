// src/lib/mail/index.ts
import type { NotificationMailOptions, AutoReplyMailOptions } from './types';

// Always load .env.production so we get real creds in dev too

function env(key: string): string | undefined {
  // Use only import.meta.env for Cloudflare compatibility
  return (import.meta as any)?.env?.[key];
}

function bool(v: unknown): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return v === 'true' || v === '1' || v.toLowerCase() === 'yes';
  if (typeof v === 'number') return v !== 0;
  return false;
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
export async function sendFormNotificationMail(opts: NotificationMailOptions): Promise<void> {

  const { firstName, lastName, email, html, text } = opts;

  const relayUrl = env('STELLAR_RELAY_URL');
  const relayToken = env('STELLAR_RELAY_TOKEN');
  const hmacSecret = env('STELLAR_HMAC_SECRET');

  console.log('[Mail] Using relay URL:', relayUrl);

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
    to: String(env('MAIL_TO')),
    from: `${firstName} ${lastName}`,
    replyTo: `${firstName} ${lastName} <${email}>`,
    subject: opts.subject,
    text,
    html,
  };

  const bodyString = JSON.stringify(body);
  const signature = await hmacSHA256(hmacSecret, bodyString);

  console.log('[Mail] Sending to relay:', relayUrl);

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
export async function sendAutoReplyMail(opts: AutoReplyMailOptions): Promise<void> {

  const relayUrl = env('STELLAR_RELAY_URL');
  const relayToken = env('STELLAR_RELAY_TOKEN');
  const hmacSecret = env('STELLAR_HMAC_SECRET');

  console.log('[Mail] Using relay URL:', relayUrl);

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
    from: String(env('MAIL_FROM_AUTOREPLY')),
    replyTo: String(env('MAIL_TO')),
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  };

  const bodyString = JSON.stringify(body);
  const signature = await hmacSHA256(hmacSecret, bodyString);

  console.log('[Mail] Sending to relay:', relayUrl);

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