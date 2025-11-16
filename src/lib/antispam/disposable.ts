// src/lib/antispam/disposable.ts
// Simple helper to detect disposable email domains

const disposableDomains = new Set<string>([
  "10minutemail.com",
  "20minutemail.com",
  "guerrillamail.com",
  "guerrillamailblock.com",
  "mailinator.com",
  "maildrop.cc",
  "yopmail.com",
  "yopmail.net",
  "yopmail.fr",
  "fakeinbox.com",
  "getnada.com",
  "inboxbear.com",
  "inboxkitten.com",
  "spamgourmet.com",
  "sharklasers.com",
  "trashmail.com",
  "trashmail.de",
  "temp-mail.org",
  "tempmail.net",
  "tempmailo.com",
  "throwawaymail.com",
  "mintemail.com",
]);

/**
 * Checks if a domain is in the disposable list.
 * @param domain - The domain part of the email address.
 * @returns true if disposable, false otherwise.
 */
export function isDisposableDomain(domain: string): boolean {
  return disposableDomains.has(domain.toLowerCase());
}
