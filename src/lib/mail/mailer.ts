// src/lib/mail/mailer.ts
// Central mail orchestration used by /api/contactForm.ts

import { sendSlackMessage } from "@/lib/slack";
import { enqueuePending } from "@/lib/data/store";
import type { QueuedNotification, QueuedAutoResponder } from "@/lib/mail/types";
import { sendFormNotificationMail, sendAutoReplyMail } from "@/lib/mail";

/**
 * Handles sending of form notification and autoresponder.
 * Falls back to Slack and queue if delivery fails.
 * Returns { ok, queued, t2 } where t2 = timestamp after notification send.
 */
export async function handleContactMailFlow(params: {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  lang: string;
  ip: string;
  notifText: string;
  notifHtml: string;
  notifSubject: string;
  ar: { subject: string; text: string; html: string };
  slackCtx: string;
  env: Record<string, string>;
  isProd: boolean;
}) {
  const {
    firstName,
    lastName,
    email,
    message,
    lang,
    ip,
    notifText,
    notifHtml,
    notifSubject,
    ar,
    slackCtx,
    env,
    isProd,
  } = params;

  let t2 = Date.now();
  const sendEnv = env;

  try {
    await sendFormNotificationMail(
      {
        firstName,
        lastName,
        email,
        message,
        lang: lang as "en" | "de",
        subject: notifSubject,
        html: notifHtml,
        text: notifText,
      },
      sendEnv,
    );
    t2 = Date.now();
  } catch (err) {
    const mode = isProd ? "PROD" : "DEV";
    console.error(`[MAIL-ERROR] ${mode} notification failed:`, err);
    try {
      await sendSlackMessage(
        `[MAIL-FAIL][${mode}] notif: ${
          err instanceof Error ? err.message : String(err)
        }\n${slackCtx}`,
        sendEnv,
      );
    } catch {
      // intentionally ignored
    }

    // Queue fallback for notification
    try {
      await enqueuePending(
        {
          type: "notification",
          queuedAt: new Date().toISOString(),
          payload: {
            firstName,
            lastName,
            email,
            message,
            lang: lang as "en" | "de",
            ip,
            text: notifText,
            html: notifHtml,
          },
        } as QueuedNotification,
        sendEnv,
      );
    } catch {
      // intentionally ignored
    }

    // Queue fallback for autoresponder
    try {
      await enqueuePending(
        {
          type: "autoresponder",
          queuedAt: new Date().toISOString(),
          payload: {
            toEmail: email,
            subject: ar.subject,
            text: ar.text,
            html: ar.html,
            firstName,
            lastName,
            lang: lang as "en" | "de",
          },
        } as QueuedAutoResponder,
        sendEnv,
      );
    } catch {
      // intentionally ignored
    }

    return { ok: true, queued: true, t2 };
  }

  // Auto‑reply (best effort)
  try {
    await sendAutoReplyMail(
      {
        toEmail: email,
        subject: ar.subject,
        text: ar.text,
        html: ar.html,
      },
      sendEnv,
    );
  } catch (e) {
    const mode = isProd ? "PROD" : "DEV";
    console.warn(`[MAIL-FAIL][${mode}] autoresponder:`, e);
    try {
      await sendSlackMessage(
        `[MAIL-FAIL][${mode}] autoresponder: ${
          e instanceof Error ? e.message : String(e)
        }\n${slackCtx}`,
        sendEnv,
      );
    } catch {
      // intentionally ignored
    }
    if (!isProd) {
      try {
        await enqueuePending(
          {
            type: "autoresponder",
            queuedAt: new Date().toISOString(),
            payload: {
              toEmail: email,
              subject: ar.subject,
              text: ar.text,
              html: ar.html,
              firstName,
              lastName,
              lang: lang as "en" | "de",
            },
          } as QueuedAutoResponder,
          sendEnv,
        );
      } catch {
        // intentionally ignored
      }
    }
  }

  return { ok: true, queued: false, t2 };
}
