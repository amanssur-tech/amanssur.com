// src/lib/mail/index.ts
import dotenv from 'dotenv';
import type { NotificationMailOptions, AutoReplyMailOptions } from './types';

// Always load .env.production so we get real creds in dev too
dotenv.config({ path: '.env.production' });

function env(key: string): string | undefined {
  return process.env[key];
}

function bool(v: unknown): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return v === 'true' || v === '1' || v.toLowerCase() === 'yes';
  if (typeof v === 'number') return v !== 0;
  return false;
}

import crypto from 'crypto';

export const getEnv = env;

/** Send the notification email to you (MAIL_TO) using the form@ account. */
export async function sendFormNotificationMail(opts: NotificationMailOptions): Promise<void> {

  const { firstName, lastName, email, html, text } = opts;

  const relayUrl = env('STELLAR_RELAY_URL');
  const relayToken = env('STELLAR_RELAY_TOKEN');
  const hmacSecret = env('STELLAR_HMAC_SECRET');

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
    from: `${firstName} ${lastName} <${email}>`,
    replyTo: `${firstName} ${lastName} <${email}>`,
    subject: `Contact Form: ${firstName} ${lastName}`,
    text,
    html,
  };

  const bodyString = JSON.stringify(body);
  const signature = crypto.createHmac('sha256', hmacSecret).update(bodyString).digest('hex');

  await fetch(relayUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Relay-Token': relayToken,
      'X-Signature': signature,
    },
    body: bodyString,
  });
}

/** Send the auto‑reply to the client using the autoreply@ account. */
export async function sendAutoReplyMail(opts: AutoReplyMailOptions): Promise<void> {

  const relayUrl = env('STELLAR_RELAY_URL');
  const relayToken = env('STELLAR_RELAY_TOKEN');
  const hmacSecret = env('STELLAR_HMAC_SECRET');

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
  const signature = crypto.createHmac('sha256', hmacSecret).update(bodyString).digest('hex');

  await fetch(relayUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Relay-Token': relayToken,
      'X-Signature': signature,
    },
    body: bodyString,
  });
}