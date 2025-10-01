// src/lib/mail/index.ts
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';
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

export const getEnv = env;

/** Send the notification email to you (MAIL_TO) using the form@ account. */
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

  await transporter.sendMail({
    from: `${firstName} ${lastName} <${email}>`,
    sender: String(env('FORM_SMTP_USER')),
    envelope: {
      from: String(env('FORM_SMTP_USER')),
      to: String(env('MAIL_TO')),
    },
    to: String(env('MAIL_TO')),
    replyTo: `${firstName} ${lastName} <${email}>`,
    subject: `Contact Form: ${firstName} ${lastName}`,
    text,
    html,
  });
}

/** Send the auto‑reply to the client using the autoreply@ account. */
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

  await transporter.sendMail({
    from: String(env('MAIL_FROM_AUTOREPLY')),
    envelope: {
      from: String(env('AUTOREPLY_SMTP_USER')),
      to: opts.toEmail,
    },
    to: opts.toEmail,
    replyTo: String(env('MAIL_TO')),
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
    headers: {
      'Auto-Submitted': 'auto-replied',
    },
  });
}