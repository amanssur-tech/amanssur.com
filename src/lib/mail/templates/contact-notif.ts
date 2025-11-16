// src/lib/mail/templates/contact-notif.ts
// Builds the notification email (to you) for a new contact submission.
// Returns { subject, text, html }.

import { escapeHtml } from "@/lib/contact/transform";

export interface ContactNotifParams {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  langFull: string; // e.g., 'English' | 'German'
  reasonLabel?: string | undefined; // localized label from i18n (e.g., 'Job Opportunity')
  company?: string | undefined;
  phoneNorm?: string | undefined;
  websiteNorm?: string | undefined;
  receivedAt?: string | undefined; // optional; if missing, computed here
  reason?: string | undefined; // internal enum key (e.g., 'recruitment' | 'collaboration' | 'speaking' | 'interview' | 'other')
  subjectEsc?: string | undefined; // if reason === 'other', include this
}

export function buildContactNotif(p: ContactNotifParams) {
  const fullNameEscaped =
    `${escapeHtml(p.firstName)} ${escapeHtml(p.lastName)}`.trim();
  const receivedAt =
    p.receivedAt ??
    new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Optional rows for HTML
  let optionalRowsHtml = "";
  if (p.company) {
    optionalRowsHtml += `<p style="margin:0 0 16px 0;"><strong>Company:</strong> ${escapeHtml(p.company)}</p>\n`;
  }
  if (p.phoneNorm) {
    optionalRowsHtml += `<p style="margin:0 0 16px 0;"><strong>Phone:</strong> ${escapeHtml(p.phoneNorm)}</p>\n`;
  }
  if (p.websiteNorm) {
    const safeUrl = escapeHtml(p.websiteNorm);
    optionalRowsHtml += `<p style="margin:0 0 16px 0;"><strong>Website:</strong> <a href="${safeUrl}">${safeUrl}</a></p>\n`;
  }
  if (p.reasonLabel) {
    optionalRowsHtml += `<p style="margin:0 0 16px 0;"><strong>Reason:</strong> ${escapeHtml(p.reasonLabel)}</p>\n`;
    if (p.reason === "other" && p.subjectEsc) {
      optionalRowsHtml += `<p style="margin:0 0 16px 0;"><strong>Subject:</strong> ${escapeHtml(p.subjectEsc)}</p>\n`;
    }
  }

  const html = `
    <div style="max-width:660px; margin:0 auto; padding:30px 40px; font-family: Arial, Helvetica, sans-serif; font-size:16px; line-height:1.5; color:#333;">
      <h2 style="margin:0 0 16px 0; font-size:20px; line-height:1.3;">New Contact Form Submission</h2>
      <div style="background-color:#f9f9f9; padding:15px; border-radius:4px;">
        <p style="margin:0 0 16px 0;"><strong>Name:</strong> ${fullNameEscaped}</p>
        <p style="margin:0 0 16px 0;"><strong>Email:</strong> ${escapeHtml(p.email)}</p>
        ${optionalRowsHtml}
        <p style="margin:0 0 8px 0;"><strong>Message:</strong></p>
        <blockquote style="margin:0 0 16px 0; padding:10px 0 10px 10px; border-left:3px solid #ccc;">
          <em style="color: #555;">“${escapeHtml(p.message).replace(/\n/g, "<br>")}”</em>
        </blockquote>
        <p style="margin:0 0 16px 0;"><strong>Received:</strong> ${receivedAt}</p>
        <p style="margin:0 0 16px 0;"><strong>Language:</strong> ${escapeHtml(p.langFull)}</p>
        <p style="margin:0;"><strong>Source:</strong> amanssur.com – Contact Form</p>
      </div>
    </div>
  `;

  // Build text body for notification email
  const textLines: string[] = [];
  textLines.push(`From: ${p.firstName} ${p.lastName}`);
  if (p.company) textLines.push(`Company: ${p.company}`);
  if (p.phoneNorm) textLines.push(`Phone: ${p.phoneNorm}`);
  if (p.websiteNorm) textLines.push(`Website: ${p.websiteNorm}`);
  if (p.reasonLabel) {
    textLines.push(`Reason: ${p.reasonLabel}`);
    if (p.reason === "other" && p.subjectEsc) {
      textLines.push(`Subject: ${p.subjectEsc}`);
    }
  }
  textLines.push("");
  textLines.push("Message:");
  textLines.push(p.message);
  textLines.push("");
  textLines.push(`Received: ${receivedAt}`);
  textLines.push(`Language: ${p.langFull}`);
  textLines.push("Source: amanssur.com – Contact Form");

  const text = textLines.join("\n");
  let subject = "";

  if (p.reasonLabel) {
    subject = `Contact Form: ${p.reasonLabel}`;
    if (p.reason === "other" && p.subjectEsc) {
      subject = `Contact Form: ${p.subjectEsc}`;
    }
  }

  return { subject, text, html };
}
