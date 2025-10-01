// src/emails/contact-autoreply.ts
// Builds the auto-reply email content (to the sender) from i18n + form data.
// Returns { subject, text, html }.
import { escapeHtml } from '@/lib/contact/transform';

export interface AutoReplyI18n {
  subject: string;
  greeting: string;
  lead: string;
  yourMessage: string;
  closing: string;
  regards: string;
  separator: string;
  followMe: string;
}

export interface AutoReplyParams {
  t: AutoReplyI18n;      // contact.autoreply i18n object
  firstName: string;
  message: string;
}


export function buildAutoReply(p: AutoReplyParams) {
  const { t, firstName, message } = p;

  const subject = `${t.subject} ${firstName}!`;

  const text = [
    `${t.greeting} ${firstName},`,
    '',
    t.lead,
    '',
    t.yourMessage,
    t.separator,
    message,
    t.separator,
    '',
    t.closing,
    '',
    t.regards,
    '',
    'Amanullah Manssur',
    'IT & Web Solutions Consultant',
    '',
    '📧 hi@amanssur.com',
    '🌐 amanssur.com',
    '',
    t.followMe,
    'LinkedIn: linkedin.com/in/amanssur',
    'GitHub: github.com/amanssur-tech'
  ].join('\n');

  const html = `
  <style>
  /* Tell clients we support dark mode */
  :root { color-scheme: light dark; supported-color-schemes: light dark; }

  /* Only fix contrast. No layout/margins touched. */
  @media (prefers-color-scheme: dark) {
    /* Let client pick background; we only fix text/accents */
    .dm-body { color: #ddd !important; }                /* overrides container's inline #333 */
    .dm-body strong { color: #eee !important; }         /* headings/bold */
    .dm-body .dm-muted { color: #aaa !important; }      /* your muted spans */
    .dm-body a { color: #4E93FF !important; }           /* readable links on dark */
    .dm-body blockquote { border-left: 3px solid #666 !important; } /* avoid low-contrast #ccc */
  }
</style>

  <div class="dm-body" style="max-width:660px; margin:0 auto; padding:30px 40px; font-family: Arial, Helvetica, sans-serif; font-size:16px; line-height:1.5; color:#333;">
    <p style="margin:0 0 16px 0;"><strong>${t.greeting} ${escapeHtml(firstName)},</strong></p>
    <p style="margin:0 0 16px 0;">${t.lead}</p>
    <p style="margin:0 0 16px 0;">${t.yourMessage}<br>
      <blockquote style="margin:0; padding:10px 0 10px 10px; border-left:3px solid #ccc;">
        <em class="dm-muted" style="color:#555;">“${escapeHtml(message).replace(/\n/g, '<br>')}”</em>
      </blockquote>
    </p>
    <p style="margin:0 0 16px 0;">${t.closing}</p>
    <p style="margin:0 0 16px 0;">${t.regards}</p>

    <table cellpadding="0" cellspacing="0" border="0" style="padding-bottom:16px;">
      <tr>
        <td valign="middle" style="padding-right:10px;">
          <img src="https://amanssur.com/favicons/AM-Logo-180.png" width="40" height="40" alt="Amanullah Manssur Logo" style="display:block;">
        </td>
        <td valign="middle" style="line-height:1.4; font-size:16px;">
          <strong style="font-size:16px;">Amanullah Manssur</strong><br>
          <span class="dm-muted" style="color:#555; font-size:16px;">IT &amp; Web Solutions Consultant</span>
        </td>
      </tr>
    </table>

    <p style="margin:10px 0 16px 0;">
      📧 hi@amanssur.com<br>
      🌐 amanssur.com
    </p>
    <p style="margin:0;">
      🤝 ${t.followMe}<br>
      LinkedIn: <a href="https://linkedin.com/in/amanssur">linkedin.com/in/amanssur</a><br>
      GitHub: <a href="https://github.com/amanssur-tech">github.com/amanssur-tech</a>
    </p>
  </div>
`;

  return { subject, text, html };
}