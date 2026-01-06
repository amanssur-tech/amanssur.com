// src/pages/api/contactForm.ts
// force rebuild 2025-10-05
export const prerender = false;

import type { APIRoute } from "astro";
import { getProps, type Lang } from "../../lib/i18n";
import {
  normalizeWebsite,
  normalizePhone,
  langFullName,
  mapReasonToLabel,
  buildSubmissionRecord,
  sanitize,
} from "@/lib/contact/transform";
import { appendSubmission } from "@/lib/data/store.ts";
import { buildAutoReply, buildContactNotif } from "@/lib/mail";
import type { ContactFormSubmission } from "@/lib/mail/types";
import {
  parseAndValidate,
  checkRateLimit,
  parseDomain,
  isDisposableDomainWithEnv,
} from "@/lib/contact/schema";
import { handleContactMailFlow } from "@/lib/mail/mailer";

export const POST: APIRoute = async ({ request, clientAddress, locals }) => {
  try {
    const readEnv = (source: unknown): Record<string, string> => {
      if (typeof source !== "object" || source === null) return {};
      const record = source as Record<string, unknown>;
      const out: Record<string, string> = {};
      for (const [key, val] of Object.entries(record)) {
        if (typeof val === "string") out[key] = val;
      }
      return out;
    };
    const localsEnv = locals as {
      runtime?: { env?: unknown };
      env?: unknown;
    };
    const env: Record<string, string> = {
      ...readEnv(localsEnv.runtime?.env),
      ...readEnv(localsEnv.env),
    };
    const isProd = env.MODE === "production";
    const ip = clientAddress || "unknown";
    const t0 = Date.now();

    // Validate data early to determine language for i18n errors
    const formData = await request.formData();
    const data = Object.fromEntries(formData) as Record<string, string>;
    const parsedLang: Lang = data.lang === "de" ? "de" : "en";
    const formI18n = getProps(parsedLang, "contact").form;

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
    const allowCsv = env.EMAIL_ALLOWLIST ?? "";
    const allow = allowCsv
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);
    const isAllowlisted =
      allow.length > 0 && allow.includes(parsedData.email.toLowerCase());

    if (!isAllowlisted) {
      const domain = parseDomain(parsedData.email);
      if (!domain || isDisposableDomainWithEnv(domain)) {
        if (env.MODE !== "production") {
          console.warn(
            `[DISPOSABLE-EMAIL] Blocked submission from ${parsedData.email} (domain: ${domain || "n/a"}, ip: ${ip})`,
          );
        }
        return new Response(formI18n.invalid, { status: 400 });
      }
    }

    const {
      firstName,
      lastName,
      email,
      message,
      lang: submittedLang,
      company,
      website,
      phone,
      reason,
      subjectOther,
    } = parsedData;
    const lang: Lang = submittedLang === "de" ? "de" : "en";

    const langFull = langFullName(lang);

    const reasonLabel = mapReasonToLabel(lang, reason) || "";

    const websiteNorm = normalizeWebsite(website);
    const phoneNorm = normalizePhone(phone);
    const subjectEsc = sanitize(subjectOther) || "";

    const msgPreview = message.replaceAll(/\s+/g, " ").slice(0, 300);
    const slackCtx = `From: ${firstName} ${lastName} <${email}>\nReason: ${reason || "-"}${subjectEsc ? ` (${subjectEsc})` : ""}\nLang: ${lang} | IP: ${ip}\nMsg: ${msgPreview}`;

    // Log submission for daily digest (non-blocking)
    try {
      appendSubmission(
        buildSubmissionRecord({
          firstName,
          lastName,
          email,
          message,
          lang,
          company: company || undefined,
          website: website || undefined,
          phone: phone || undefined,
          ip,
          ...(subjectOther ? { subjectOther } : {}),
          ...(reason ? { reason } : {}),
        }),
      );
    } catch {
      // ignore logging errors
    }

    // Build notif email with the extracted template
    const {
      subject: notifSubject,
      text: notifText,
      html: notifHtml,
    } = buildContactNotif({
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
    const ar = buildAutoReply({
      t: getProps(lang, "contact").autoreply,
      firstName,
      message,
      reasonLabel,
      subjectEsc,
      ...(subjectOther ? { subjectOther } : {}),
      ...(reason ? { reason } : {}),
    });

    const result = await handleContactMailFlow({
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
    });

    t2 = result.t2;

    if (result.queued) {
      return new Response(JSON.stringify({ ok: true, queued: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const t3 = Date.now();
    if (!isProd) {
      console.log(
        `[contact] validate=${t1 - t0}ms notif=${t2 - t1}ms bg=${t3 - t2}ms total=${t3 - t0}ms`,
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const formI18n = getProps("en", "contact").form; // fallback to English
    console.error("Contact form error:", err);
    return new Response(formI18n.error, { status: 500 });
  }
};
