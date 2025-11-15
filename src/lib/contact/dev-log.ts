// src/lib/contact/dev-log.ts

function maskToken(s: string | undefined): string {
  if (!s) return '';
  if (s.length <= 2) return s.charAt(0) ?? '';
  const first = s.charAt(0);
  const last = s.charAt(s.length - 1);
  return first + '*'.repeat(s.length - 2) + last;
}

function maskEmail(email: unknown): string {
  if (typeof email !== 'string') return '';
  const [userRaw, domainFull] = email.split('@');
  const user = userRaw ?? '';
  if (!domainFull) return email;
  const parts = domainFull.split('.');
  const domain = parts.shift() ?? '';
  const tld = parts.join('.') || '';
  const u = maskToken(user);
  const d = maskToken(domain);
  return `${u}@${d}${tld ? '.' + tld : ''}`;
}

function summarizeMessage(msg: unknown, maxPreview = 0): string {
  if (typeof msg !== 'string') return '';
  const len = msg.length;
  if (maxPreview <= 0) return `(message: ${len} chars)`;
  const preview = msg.slice(0, maxPreview).replace(/\s+/g, ' ').trim();
  return `${preview}${len > maxPreview ? `… (${len} chars)` : ''}`;
}

function maybeMask(data: Record<string, unknown>, mask: boolean): Record<string, unknown> {
  if (!mask) return data;
  return {
    ...data,
    email: maskEmail(data.email),
    message: summarizeMessage(data.message, 0)
  };
}

export function logDev(
  message: string,
  data?: Record<string, unknown>,
  duration?: number
): void {
  const ts = `[${new Date().toLocaleTimeString()}]`;
  const isSlow = duration !== undefined && duration > 1000;
  const payload = data ? maybeMask(data, isSlow) : undefined;

  if (isSlow) {
    console.warn(
      `${ts} ⚠️ ${message}${duration ? ` (${duration} ms)` : ''}`,
      payload ?? ''
    );
  } else {
    console.log(
      `${ts} ${message}${duration ? ` (${duration} ms)` : ''}`,
      payload ?? ''
    );
  }
}