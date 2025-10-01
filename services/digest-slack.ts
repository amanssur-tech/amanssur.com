// scripts/digest-slack.ts
// Posts a daily (or custom range) digest of form submissions to Slack.
//
// Usage examples:
//   npm run digest:slack                      # last 24h, loads .env.production by default
//   ENV_FILE=.env npm run digest:slack        # use .env instead
//   ENV_FILE=.env.production npm run digest:slack -- --hours=48
//   ENV_FILE=.env.production npm run digest:slack -- --since=2025-08-10T00:00:00Z
//   ENV_FILE=.env.production npm run digest:slack -- --dry

import { config as loadEnv } from 'dotenv';
import fs from 'fs';
import path from 'path';
import { sendSlackMessage } from 'src/lib/slack.ts';

// Smart dotenv loader: default to .env.production unless ENV_FILE is set
const envPath = process.env.ENV_FILE || '.env.production';
loadEnv({ path: envPath });
console.log(`[digest-slack] Loaded env from ${envPath}`);

// Basic shape we expect to store for each submission
// (We keep it flexible to tolerate older entries.)
interface Submission {
  ts?: string;        // ISO timestamp when stored
  date?: string;      // alternative timestamp field
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  reason?: string;
  message?: string;
  lang?: string;
  ip?: string;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out: { hours?: number; since?: Date; dry?: boolean } = {};
  for (const a of args) {
    const [k, v] = a.split('=');
    if (k === '--hours') out.hours = Number(v);
    if (k === '--since') out.since = new Date(String(v));
    if (k === '--dry' || k === '--dry-run') out.dry = true;
  }
  return out;
}

function loadSubmissions(): Submission[] {
  const file = path.resolve(process.cwd(), 'src/data/tmp/submissions.json');
  if (!fs.existsSync(file)) {
    console.warn(`[digest-slack] No submissions file found at ${file}.`);
    return [];
  }
  try {
    const raw = fs.readFileSync(file, 'utf-8').trim();
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return data as Submission[];
    console.warn('[digest-slack] submissions.json is not an array; ignoring.');
    return [];
  } catch (e) {
    console.error('[digest-slack] Failed to read submissions.json:', e);
    return [];
  }
}

function getSubmissionTime(s: Submission): Date | null {
  const t = s.ts || s.date;
  if (!t) return null;
  const d = new Date(t);
  return isNaN(d.getTime()) ? null : d;
}

function withinRange(s: Submission, since: Date): boolean {
  const d = getSubmissionTime(s);
  if (!d) return false;
  return d >= since;
}

function truncate(str: string | undefined, n: number): string {
  if (!str) return '';
  return str.length <= n ? String(str) : String(str).slice(0, n - 1) + '…';
}

function formatName(s: Submission): string {
  if (s.name) return s.name;
  const f = s.firstName || '';
  const l = s.lastName || '';
  const n = `${f} ${l}`.trim();
  return n || '(no name)';
}

function summarize(subs: Submission[], since: Date) {
  const byReason: Record<string, number> = {};
  const emails = new Set<string>();
  for (const s of subs) {
    if (s.email) emails.add(s.email.toLowerCase());
    const r = (s.reason || 'unspecified').toLowerCase();
    byReason[r] = (byReason[r] || 0) + 1;
  }
  const reasonLines = Object.entries(byReason)
    .sort((a, b) => b[1] - a[1])
    .map(([r, c]) => `• ${r}: ${c}`)
    .join('\n');

  const items = subs
    .slice()
    .sort((a, b) => {
      const da = getSubmissionTime(a)?.getTime() ?? 0;
      const db = getSubmissionTime(b)?.getTime() ?? 0;
      return db - da;
    })
    .map(s => {
      const d = getSubmissionTime(s);
      const when = d ? d.toISOString().replace('T', ' ').replace('Z', ' UTC') : '(no time)';
      const name = formatName(s);
      const email = s.email || '(no email)';
      const preview = truncate((s.message || '').replace(/\s+/g, ' '), 160);
      return `• ${when} — ${name} <${email}> — ${preview}`;
    })
    .join('\n');

  const hours = Math.round((Date.now() - since.getTime()) / 36e5);
  const header = `*Daily Digest — last ${hours}h*`;
  const totals = `Total: *${subs.length}* • Unique emails: *${emails.size}*`;
  const range = `Since: ${since.toISOString()}`;

  let text = `${header}\n${totals}\n${range}`;
  if (reasonLines) text += `\n\n*By reason:*\n${reasonLines}`;
  if (items) text += `\n\n*Submissions:*\n${items}`;

  // Slack has high limits, but keep it short-ish
  if (text.length > 9500) text = text.slice(0, 9490) + '…';
  return text;
}

async function main() {
  const args = parseArgs();
  const since =
    args.since ?? new Date(Date.now() - (args.hours && args.hours > 0 ? args.hours : 24) * 60 * 60 * 1000);

  const all = loadSubmissions();
  const recent = all.filter(s => withinRange(s, since));

  const msg = summarize(recent, since);
  console.log('\n[digest-slack] Preview:\n' + msg + '\n');

  if (args.dry) {
    console.log('[digest-slack] Dry-run mode: not posting to Slack.');
    return;
  }

  await sendSlackMessage(msg);
  // After successful post, clear the submissions file so it doesn't grow forever
  try {
    const file = path.resolve(process.cwd(), 'src/data/tmp/submissions.json');
    if (fs.existsSync(file)) {
      fs.writeFileSync(file, '[]');
      console.log('[digest-slack] Cleared src/data/tmp/submissions.json');
    }
  } catch (e) {
    console.warn('[digest-slack] Failed to clear submissions.json:', e);
  }
  console.log('[digest-slack] Posted to Slack successfully.');
}

main().catch(err => {
  console.error('[digest-slack] Error:', err);
  process.exit(1);
});