// src/lib/mail/index.ts
<<<<<<< HEAD
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
=======
>>>>>>> c77fc29 (stable-for-now Cloudflare-compatible Astro config)
import type { NotificationMailOptions, AutoReplyMailOptions } from './types';

// Cloudflare-native env function reading from provided env object
function env(key: string, cfEnv: Record<string, string>): string | undefined {
  return cfEnv[key];
}

function bool(v: unknown): boolean {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return v === 'true' || v === '1' || v.toLowerCase() === 'yes';
  if (typeof v === 'number') return v !== 0;
  return false;
}

<<<<<<< HEAD
=======
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

>>>>>>> c77fc29 (stable-for-now Cloudflare-compatible Astro config)
export const getEnv = env;

/** Send the notification email to you (MAIL_TO) using the form@ account. */
<<<<<<< HEAD
export async function sendFormNotificationMail(opts: NotificationMailOptions): Promise<void> {
  const formUser = env('FORM_SMTP_USER');
  const formPass = env('FORM_SMTP_PASS');
  const formAuth = formUser && formPass ? { user: formUser, pass: formPass } : undefined;
  const smtpOptsForm: SMTPTransport.Options & { pool?: boolean; maxConnections?: number; maxMessages?: number } = {
    host: env('SMTP_HOST'),
    port: Number(env('SMTP_PORT')),
    secure: bool(env('SMTP_SECURE')),
    auth: formAuth,
    pool: String(env('SMTP_POOL')) === 'true',
    maxConnections: 1,
    maxMessages: 20,
    socketTimeout: 15000,
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    tls: {
      rejectUnauthorized: bool(env('SMTP_TLS_REJECT_UNAUTHORIZED')),
      minVersion: 'TLSv1.2',
    },
  };
  console.log('[FINAL MAIL CONFIG]', {
    host: smtpOptsForm.host,
    port: smtpOptsForm.port,
    secure: smtpOptsForm.secure,
    user: formUser,
    passSet: !!formPass,
  });
  const { auth, ...safeOpts } = smtpOptsForm;
  console.log('[TRANSPORTER OPTIONS]', {
    ...safeOpts,
    auth: auth ? { user: auth.user, pass: '***redacted***' } : undefined,
  });
  const transporter = nodemailer.createTransport(smtpOptsForm);

  const { firstName, lastName, email, html, text } = opts;

<<<<<<< HEAD
  await transporter.sendMail({
    from: `${firstName} ${lastName} <${email}>`,
    sender: String(env('FORM_SMTP_USER')),
    envelope: {
      from: String(env('FORM_SMTP_USER')),
      to: String(env('MAIL_TO')),
    },
    to: String(env('MAIL_TO')),
=======
  const relayUrl = env('STELLAR_RELAY_URL');
  const relayToken = env('STELLAR_RELAY_TOKEN');
  const hmacSecret = env('STELLAR_HMAC_SECRET');
=======
export async function sendFormNotificationMail(opts: NotificationMailOptions, cfEnv: Record<string, string>): Promise<void> {

  const { firstName, lastName, email, html, text } = opts;

  const relayUrl = env('STELLAR_RELAY_URL', cfEnv);
  const relayToken = env('STELLAR_RELAY_TOKEN', cfEnv);
  const hmacSecret = env('STELLAR_HMAC_SECRET', cfEnv);
>>>>>>> 2eec07f (🧹 Wiped old repo + added clean amanssurfix project)

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
>>>>>>> 2554570 (final: complete mail system & env updates for Stellar relay)
    replyTo: `${firstName} ${lastName} <${email}>`,
    subject: opts.subject,
    text,
    html,
<<<<<<< HEAD
=======
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
>>>>>>> 2554570 (final: complete mail system & env updates for Stellar relay)
  });

  console.log('[Mail] Relay response status:', response.status);
  const text = await response.text();
  console.log('[Mail] Relay response text:', text);
} catch (err) {
  console.error('[Mail] Relay fetch error:', err);
}
}

/** Send the auto‑reply to the client using the autoreply@ account. */
<<<<<<< HEAD
export async function sendAutoReplyMail(opts: AutoReplyMailOptions): Promise<void> {
  const arUser = env('AUTOREPLY_SMTP_USER');
  const arPass = env('AUTOREPLY_SMTP_PASS');
  const arAuth = arUser && arPass ? { user: arUser, pass: arPass } : undefined;
  const smtpOptsAR: SMTPTransport.Options & { pool?: boolean; maxConnections?: number; maxMessages?: number } = {
    host: env('SMTP_HOST'),
    port: Number(env('SMTP_PORT')),
    secure: bool(env('SMTP_SECURE')),
    auth: arAuth,
    pool: String(env('SMTP_POOL')) === 'true',
    maxConnections: 1,
    maxMessages: 20,
    socketTimeout: 15000,
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    tls: {
      rejectUnauthorized: bool(env('SMTP_TLS_REJECT_UNAUTHORIZED')),
      minVersion: 'TLSv1.2',
    },
  };
  const transporter = nodemailer.createTransport(smtpOptsAR);

<<<<<<< HEAD
  await transporter.sendMail({
=======
  const relayUrl = env('STELLAR_RELAY_URL');
  const relayToken = env('STELLAR_RELAY_TOKEN');
  const hmacSecret = env('STELLAR_HMAC_SECRET');
=======
export async function sendAutoReplyMail(opts: AutoReplyMailOptions, cfEnv: Record<string, string>): Promise<void> {

  const relayUrl = env('STELLAR_RELAY_URL', cfEnv);
  const relayToken = env('STELLAR_RELAY_TOKEN', cfEnv);
  const hmacSecret = env('STELLAR_HMAC_SECRET', cfEnv);
>>>>>>> 2eec07f (🧹 Wiped old repo + added clean amanssurfix project)

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
<<<<<<< HEAD
>>>>>>> 2554570 (final: complete mail system & env updates for Stellar relay)
    from: String(env('MAIL_FROM_AUTOREPLY')),
    envelope: {
      from: String(env('AUTOREPLY_SMTP_USER')),
      to: opts.toEmail,
    },
    to: opts.toEmail,
    replyTo: String(env('MAIL_TO')),
=======
    from: String(env('MAIL_FROM_AUTOREPLY', cfEnv)),
    replyTo: String(env('MAIL_TO', cfEnv)),
>>>>>>> 2eec07f (🧹 Wiped old repo + added clean amanssurfix project)
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
<<<<<<< HEAD
=======
  };

  const bodyString = JSON.stringify(body);
  const signature = await hmacSHA256(hmacSecret, bodyString);

  console.log('[Mail] Sending to relay: [REDACTED]');

try {
  const response = await fetch(relayUrl, {
    method: 'POST',
>>>>>>> 2554570 (final: complete mail system & env updates for Stellar relay)
    headers: {
      'Auto-Submitted': 'auto-replied',
    },
  });

  console.log('[Mail] Relay response status:', response.status);
  const text = await response.text();
  console.log('[Mail] Relay response text:', text);
} catch (err) {
  console.error('[Mail] Relay fetch error:', err);
}
}