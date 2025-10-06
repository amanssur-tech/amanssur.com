// scripts/digest-slack.ts
// Posts a daily (or custom range) digest of form submissions to Slack.
//
// Usage examples:
//   npm run digest:slack                      # last 24h, loads .env.production by default
//   ENV_FILE=.env npm run digest:slack        # use .env instead
//   ENV_FILE=.env.production npm run digest:slack -- --hours=48
//   ENV_FILE=.env.production npm run digest:slack -- --since=2025-08-10T00:00:00Z
//   ENV_FILE=.env.production npm run digest:slack -- --dry

import { sendSlackMessage } from '../src/lib/slack.ts';

// In Cloudflare Workers, we don't have access to Node's 'fs' or 'path' modules,
// nor 'process' global. Environment variables are injected via the 'env' object passed
// to the Worker. For dotenv support, environment variables should be set in the
// Worker environment or via Wrangler configuration.

// We expect the following KV namespace binding to be passed as 'env.SUBMISSIONS'
// which stores the submissions JSON string.

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

// In Workers, we cannot access process.argv.
// Instead, we accept options as an object parameter or via URLSearchParams.
// Here, we define a helper to parse options from a URLSearchParams or a plain object.
function parseArgsFromParams(params: URLSearchParams | Record<string, string | undefined>) {
  const out: { hours?: number; since?: Date; dry?: boolean } = {};
  if (params instanceof URLSearchParams) {
    if (params.has('hours')) out.hours = Number(params.get('hours'));
    if (params.has('since')) out.since = new Date(params.get('since')!);
    if (params.has('dry') || params.has('dry-run')) out.dry = true;
  } else {
    if (params['hours']) out.hours = Number(params['hours']);
    if (params['since']) out.since = new Date(params['since']!);
    if (params['dry'] === 'true' || params['dry-run'] === 'true') out.dry = true;
  }
  return out;
}

// Load submissions from KV namespace.
// Expects env.SUBMISSIONS KV namespace binding.
async function loadSubmissions(env: any): Promise<Submission[]> {
  try {
    const raw = await env.SUBMISSIONS.get('submissions.json');
    if (!raw) {
      console.warn('[digest-slack] No submissions data found in KV.');
      return [];
    }
    const data = JSON.parse(raw);
    if (Array.isArray(data)) return data as Submission[];
    console.warn('[digest-slack] submissions.json is not an array; ignoring.');
    return [];
  } catch (e) {
    console.error('[digest-slack] Failed to read submissions from KV:', e);
    return [];
  }
}

// Save submissions array back to KV.
// This is used to clear the submissions after posting.
async function saveSubmissions(env: any, subs: Submission[]) {
  try {
    await env.SUBMISSIONS.put('submissions.json', JSON.stringify(subs));
  } catch (e) {
    console.warn('[digest-slack] Failed to save submissions to KV:', e);
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

// The main function adapted for Cloudflare Workers environment.
// Accepts 'env' which includes KV namespace bindings and optionally 'params' for args.
export async function main(env: any, params?: URLSearchParams | Record<string, string | undefined>) {
  const args = parseArgsFromParams(params || {});
  const since =
    args.since ?? new Date(Date.now() - (args.hours && args.hours > 0 ? args.hours : 24) * 60 * 60 * 1000);

  const all = await loadSubmissions(env);
  const recent = all.filter(s => withinRange(s, since));

  const msg = summarize(recent, since);
  console.log('\n[digest-slack] Preview:\n' + msg + '\n');

  if (args.dry) {
    console.log('[digest-slack] Dry-run mode: not posting to Slack.');
    return;
  }

  await sendSlackMessage(msg, env);

  // After successful post, clear the submissions so it doesn't grow forever
  await saveSubmissions(env, []);
  console.log('[digest-slack] Posted to Slack successfully.');
}

// For compatibility with Node.js for local testing, we can export a wrapper.
// But in Cloudflare Worker, main() should be called with env and params from the request context.