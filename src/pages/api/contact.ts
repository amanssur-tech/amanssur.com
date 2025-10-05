// src/pages/api/contactForm.ts
// force rebuild 2025-10-05
export const prerender = false;

import type { APIRoute } from 'astro';
import { sendSlackMessage } from '../../lib/slack';
import { getProps, type Lang } from '../../lib/i18n';
import { normalizeWebsite, normalizePhone, langFullName, mapReasonToLabel, buildSubmissionRecord, sanitize } from '@/lib/contact/transform';
import { appendSubmission, enqueuePending } from '@/lib/data/store';
import { buildAutoReply, buildContactNotif } from '@/emails';
import { sendFormNotificationMail, sendAutoReplyMail } from '@/lib/mail';
import type { Reason, ContactFormSubmission, QueuedNotification, QueuedAutoResponder } from '@/lib/mail/types';
import { parseAndValidate, checkRateLimit, parseDomain, isDisposableDomainWithEnv } from '@/lib/contact/schema';

const isProd = ((import.meta as any)?.env?.MODE === 'production') || process.env.NODE_ENV === 'production';
console.log('[ENV DEBUG]', {
  MODE_meta: (import.meta as any)?.env?.MODE,
  NODE_ENV: process.env.NODE_ENV,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_SECURE: process.env.SMTP_SECURE,
  SMTP_TLS_REJECT_UNAUTHORIZED: process.env.SMTP_TLS_REJECT_UNAUTHORIZED,
});

export const POST: APIRoute = async ({ request, clientAddress }) => {
  try {
    const ip = clientAddress || 'unknown';
    const t0 = Date.now();

    // Validate data early to determine language for i18n errors
    const formData = await request.formData();
    const data = Object.fromEntries(formData) as Record<string, string>;
    const parsedLang = data.lang === 'de' ? 'de' : 'en';
    const formI18n = getProps(parsedLang as Lang, 'contact').form;

    // Rate limit check
    if (!checkRateLimit(ip)) {
      return new Response(formI18n.rateLimit, { status: 429 });
    }

    // Validate & parse using centralized schema
    let parsedData: ContactFormSubmission;
    try {
      ({ data: parsedData } = parseAndValidate(formData));
    } catch {
      return new Response(formI18n.invalid, { status: 400 });
    }
    const t1 = Date.now();
    let t2 = t1; // will be updated right after notification send succeeds

    // Allowlist bypass: if EMAIL_ALLOWLIST contains this exact email, skip disposable checks
    const allowCsv = (typeof (import.meta as any).env?.EMAIL_ALLOWLIST !== 'undefined')
      ? String((import.meta as any).env.EMAIL_ALLOWLIST)
      : String(process.env.EMAIL_ALLOWLIST || '');
    const allow = allowCsv.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const isAllowlisted = allow.length > 0 && allow.includes(parsedData.email.toLowerCase());

    if (!isAllowlisted) {
      const domain = parseDomain(parsedData.email);
      if (!domain || isDisposableDomainWithEnv(domain)) {
        if (String((import.meta as any).env?.MODE) !== 'production') {
          console.warn(`[DISPOSABLE-EMAIL] Blocked submission from ${parsedData.email} (domain: ${domain || 'n/a'}, ip: ${ip})`);
        }
        return new Response(formI18n.invalid, { status: 400 });
      }
    }

    const { firstName, lastName, email, message, lang: submittedLang, company, website, phone, reason, subjectOther } = parsedData;
    const lang = submittedLang === 'de' ? 'de' : 'en';

    const langFull = langFullName(lang as Lang);

    const reasonLabel = mapReasonToLabel(lang as Lang, reason as Reason | undefined) || '';

    const websiteNorm = normalizeWebsite(website);
    const phoneNorm = normalizePhone(phone);
    const subjectEsc = sanitize(subjectOther) || '';

    const msgPreview = message.replace(/\s+/g, ' ').slice(0, 300);
    const slackCtx = `From: ${firstName} ${lastName} <${email}>\nReason: ${reason || '-'}${subjectEsc ? ` (${subjectEsc})` : ''}\nLang: ${lang} | IP: ${ip}\nMsg: ${msgPreview}`;

    // Log submission for daily digest (non-blocking)
    try {
      appendSubmission(
        buildSubmissionRecord({
          firstName,
          lastName,
          email,
          message,
          lang,
          reason,
          subjectOther,
          company,
          website,
          phone,
          ip,
        })
      );
    } catch (_) {
      // ignore logging errors
    }

    // Build notif email with the extracted template
    const {subject: notifSubject, text: notifText, html: notifHtml } = buildContactNotif({
      firstName,
      lastName,
      email,
      message,
      langFull,
      reasonLabel,
      reason,
      subjectEsc,
      company: company || undefined,
      phoneNorm: phoneNorm || undefined,
      websiteNorm: websiteNorm || undefined,
    });
    // Prebuild auto‑reply so we can enqueue it even if notif send fails in DEV
    const ar = buildAutoReply({ t: getProps(lang as Lang, 'contact').autoreply, firstName, message, reason, reasonLabel, subjectEsc, });

    if (!isProd) {
      try {
        await sendFormNotificationMail({
          firstName,
          lastName,
          email,
          message,
          lang,
          subject: notifSubject,
          html: notifHtml,
          text: notifText,
        });
        t2 = Date.now();
      } catch (err) {
        console.error('[MAIL-ERROR] DEV notification failed:', err);
        try {
          await sendSlackMessage(`[MAIL-FAIL][DEV] notif: ${err instanceof Error ? err.message : String(err)}\n${slackCtx}`);
        } catch {}
        // DEV: also enqueue so you can test retry flow
        try {
          await enqueuePending({
            type: 'notification',
            queuedAt: new Date().toISOString(),
            payload: { firstName, lastName, email, message, lang, ip, text: notifText, html: notifHtml },
          } as QueuedNotification);
        } catch {}
        try {
          await enqueuePending({
            type: 'autoresponder',
            queuedAt: new Date().toISOString(),
            payload: { toEmail: email, subject: ar.subject, text: ar.text, html: ar.html, firstName, lastName, lang },
          } as QueuedAutoResponder);
        } catch {}
        // Since we queued the work, tell the client it succeeded to avoid duplicate submissions
        return new Response(JSON.stringify({ ok: true, queued: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    } else {
      try {
        await sendFormNotificationMail({
          firstName,
          lastName,
          email,
          message,
          lang,
          subject: notifSubject,
          html: notifHtml,
          text: notifText,
        });
        t2 = Date.now();
      } catch (err) {
        console.error('[MAIL-ERROR] PROD notification failed:', err);
        try {
          await sendSlackMessage(`[MAIL-FAIL][PROD] notif: ${err instanceof Error ? err.message : String(err)}\n${slackCtx}`);
        } catch {}
        try {
          await enqueuePending({
            type: 'notification',
            queuedAt: new Date().toISOString(),
            payload: { firstName, lastName, email, message, lang, ip, text: notifText, html: notifHtml },
          } as QueuedNotification);
        } catch {}
        try {
          await enqueuePending({
            type: 'autoresponder',
            queuedAt: new Date().toISOString(),
            payload: { toEmail: email, subject: ar.subject, text: ar.text, html: ar.html, firstName, lastName, lang },
          } as QueuedAutoResponder);
        } catch {}
        return new Response(JSON.stringify({ ok: true, queued: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // --- Best-effort auto-reply (background) ---
    if (!isProd) {
      await sendAutoReplyMail({
        toEmail: email,
        subject: ar.subject,
        text: ar.text,
        html: ar.html,
      }).catch(async (e) => {
        console.warn('[MAIL-FAIL][DEV] autoresponder:', e);
        try { await sendSlackMessage(`[MAIL-FAIL][DEV] autoresponder: ${e instanceof Error ? e.message : String(e)}\n${slackCtx}`); } catch {}
        try {
          await enqueuePending({
            type: 'autoresponder',
            queuedAt: new Date().toISOString(),
            payload: { toEmail: email, subject: ar.subject, text: ar.text, html: ar.html, firstName, lastName, lang },
          } as QueuedAutoResponder);
        } catch {}
      });
    } else {
      await sendAutoReplyMail({
        toEmail: email,
        subject: ar.subject,
        text: ar.text,
        html: ar.html,
      }).catch(async (e) => {
        console.warn('[MAIL-FAIL][PROD] autoresponder:', e);
        try {
          await sendSlackMessage(`[MAIL-FAIL][PROD] autoresponder: ${e instanceof Error ? e.message : String(e)}\n${slackCtx}`);
        } catch {}
      });
    }

    // --- Notion push (background) ---
    /*
    void (async () => {
      try {
        const notionConfigured = Boolean((process.env.NOTION_API_KEY || (import.meta as any).env?.NOTION_API_KEY) && (process.env.NOTION_DATABASE_ID || (import.meta as any).env?.NOTION_DATABASE_ID));
        if (!notionConfigured) return;
        await pushLeadToNotion({
          firstName,
          lastName,
          email,
          message,
          reason,
          subjectOther: subjectOther || undefined,
          company: company || undefined,
          website: websiteNorm || undefined,
          phone: phoneNorm || undefined,
          lang,
          ts: new Date().toISOString(),
        });
      } catch (e) {
        try {
          await sendSlackMessage(`[NOTION-FAIL] bg push failed\n${slackCtx}`);
        } catch {}
      }
    })();
    */

    const t3 = Date.now();
    if (!isProd) {
      console.log(`[contact] validate=${t1 - t0}ms notif=${t2 - t1}ms bg=${t3 - t2}ms total=${t3 - t0}ms`);
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const formI18n = getProps('en', 'contact').form; // fallback to English
    console.error('Contact form error:', err);
    return new Response(formI18n.error, { status: 500 });
  }
};