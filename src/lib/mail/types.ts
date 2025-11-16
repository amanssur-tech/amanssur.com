// src/lib/mail/types.ts
// Centralized, reusable types for the mail/queue pipeline.

// Form reasons used across email templates, API, and CRM mapping
export type Reason =
  | "recruitment"
  | "collaboration"
  | "speaking"
  | "interview"
  | "other";

// Minimal payload we accept from the contact form (API layer)
export interface ContactFormSubmission {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  lang: "en" | "de";
  reason?: Reason | undefined;
  subjectOther?: string | undefined; // free text if reason === 'other'
  company?: string | undefined;
  phone?: string | undefined;
  website?: string | undefined;
  ip?: string | undefined; // captured server-side
  ts?: string | undefined; // ISO timestamp at submission time
}

// Common return shape for any email template builder
export interface MailContent {
  subject: string;
  text: string;
  html: string;
}

// Queue item types for retry logic (file-based dev fallback or KV)
export interface QueuedNotification {
  type: "notification";
  queuedAt: string; // ISO timestamp when queued
  payload: {
    firstName: string;
    lastName: string;
    email: string; // sender’s email
    message: string;
    lang?: ("en" | "de") | undefined;
    ip?: string | undefined;
    // Optional prebuilt bodies so the retrier doesn’t need templates
    text?: string | undefined;
    html?: string | undefined;
  };
}

export interface QueuedAutoResponder {
  type: "autoresponder";
  queuedAt: string; // ISO timestamp when queued
  payload: {
    toEmail: string;
    subject: string;
    text: string;
    html: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
    lang?: ("en" | "de") | undefined;
  };
}

export type QueueItem =
  | QueuedNotification
  | QueuedAutoResponder
  | Record<string, unknown>;

// Lightweight helper type for mail sending fns

// Options for sending a notification email to the site owner/admin
export interface NotificationMailOptions {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  lang: "en" | "de";
  html: string;
  text: string;
  reason?: string | undefined;
  reasonLabel?: string | undefined;
  subjectEsc?: string | undefined;
  subject: string;
}

// Options for sending an auto-reply email to the user
export interface AutoReplyMailOptions {
  toEmail: string;
  subject: string;
  text: string;
  html: string;
  reason?: string | undefined;
  reasonLabel?: string | undefined; // same for consistency
  subjectEsc?: string | undefined; // same for consistency
}

export interface MailSendOptions {
  toEmail: string;
  subject: string;
  text: string;
  html: string;
}
