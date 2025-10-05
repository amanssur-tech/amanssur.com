// src/lib/mail/types.ts
// Centralized, reusable types for the mail/queue pipeline.

// Form reasons used across email templates, API, and CRM mapping
export type Reason =
  | 'recruitment'
  | 'collaboration'
  | 'speaking'
  | 'interview'
  | 'other';

// Minimal payload we accept from the contact form (API layer)
export interface ContactFormSubmission {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  lang: 'en' | 'de';
  reason?: Reason;
  subjectOther?: string; // free text if reason === 'other'
  company?: string;
  phone?: string;
  website?: string;
  ip?: string; // captured server-side
  ts?: string; // ISO timestamp at submission time
}

// Common return shape for any email template builder
export interface MailContent {
  subject: string;
  text: string;
  html: string;
}

// Queue item types for retry logic (file-based dev fallback or KV)
export interface QueuedNotification {
  type: 'notification';
  queuedAt: string; // ISO timestamp when queued
  payload: {
    firstName: string;
    lastName: string;
    email: string; // sender’s email
    message: string;
    lang?: 'en' | 'de';
    ip?: string;
    // Optional prebuilt bodies so the retrier doesn’t need templates
    text?: string;
    html?: string;
  };
}

export interface QueuedAutoResponder {
  type: 'autoresponder';
  queuedAt: string; // ISO timestamp when queued
  payload: {
    toEmail: string;
    subject: string;
    text: string;
    html: string;
    firstName?: string;
    lastName?: string;
    lang?: 'en' | 'de';
  };
}

export type QueueItem = QueuedNotification | QueuedAutoResponder | Record<string, any>;

// Lightweight helper type for mail sending fns

// Options for sending a notification email to the site owner/admin
export interface NotificationMailOptions {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  lang: 'en' | 'de';
  html: string;
  text: string;
  reason?: string;
  reasonLabel?: string;
  subjectEsc?: string;
  subject: string;
}

// Options for sending an auto-reply email to the user
export interface AutoReplyMailOptions {
  toEmail: string;
  subject: string;
  text: string;
  html: string;
  reason?: string;
  reasonLabel?: string; // same for consistency
  subjectEsc?: string;  // same for consistency
}

export interface MailSendOptions {
  toEmail: string;
  subject: string;
  text: string;
  html: string;
}