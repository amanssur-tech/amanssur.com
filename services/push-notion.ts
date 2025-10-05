// scripts/push-notion.ts
// Reads submissions from Cloudflare KV and pushes them to Notion CRM

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
  delete?(key: string): Promise<void>;
  list?(options?: Record<string, any>): Promise<{ keys: Array<{ name: string }>; list_complete: boolean }>;
}

import { Client } from '@notionhq/client';

export interface Env {
  NOTION_API_KEY: string;
  NOTION_DATABASE_ID: string;
  OPENAI_API_KEY?: string;
  SUBMISSIONS: KVNamespace;
}

export interface Submission {
  firstName?: string;
  lastName?: string;
  email?: string;
  reason?: string;
  message?: string;
  ts?: string;
  lang?: string;
  ip?: string;
  company?: string;
  website?: string;
  phone?: string;
  subjectOther?: string;
}

function mapReasonToNotionSubject(reason?: string): string | undefined {
  if (!reason) return undefined;
  const key = String(reason).toLowerCase();
  const map: Record<string, string> = {
    recruitment: 'Job Opportunity',
    collaboration: 'Collaboration / Project Idea',
    speaking: 'Event or Speaking Invite',
    interview: 'Media / Interview Request',
    other: 'Other',
  };
  return map[key] || undefined;
}

async function loadSubmissions(env: Env): Promise<Submission[]> {
  const raw = await env.SUBMISSIONS.get('submissions');
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function makeTitle(firstName?: string, lastName?: string) {
  return `${firstName || ''} ${lastName || ''}`.trim() || '(no name)';
}

const USE_AI = true;

async function suggestNotesAndTags(message: string, OPENAI_API_KEY: string): Promise<{ notes?: string; tags?: string[] }> {
  if (!USE_AI || !OPENAI_API_KEY || !message) return {};
  const body = {
    model: 'gpt-5-nano',
    messages: [
      {
        role: 'system',
        content:
          'You extract concise CRM notes (2-4 bullet points) and 3-6 short one-word tags from messages.'
      },
      {
        role: 'user',
        content:
          `Message:\n"""${message}"""\n\nReturn JSON with keys: notes (string, short bullet list) and tags (array of 3-6 lowercase keywords).`
      }
    ],
    temperature: 0.3,
  };

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${OPENAI_API_KEY}` },
      body: JSON.stringify(body),
    });
    const json: any = await res.json();
    const content = json?.choices?.[0]?.message?.content?.trim() || '';
    const match = content.match(/\{[\s\S]*\}$/);
    const parsed = match ? JSON.parse(match[0]) : JSON.parse(content);
    const notes = typeof parsed?.notes === 'string' ? parsed.notes : undefined;
    const tags =
      Array.isArray(parsed?.tags) ? parsed.tags.map((t: any) => String(t)).slice(0, 6) : undefined;
    return { notes, tags };
  } catch {
    return {};
  }
}

function buildProperties(sub: Submission, ai?: { notes?: string; tags?: string[] }) {
  const props: Record<string, any> = {
    'Full Name': {
      title: [{ text: { content: makeTitle(sub.firstName, sub.lastName) } }],
    },
    'Subject': (() => { const opt = mapReasonToNotionSubject(sub.reason); return opt ? { select: { name: opt } } : undefined; })(),
    'Contact Source': { select: { name: 'amanssur.com' } },
    'Last Contact': { date: { start: sub.ts || new Date().toISOString() } },
    'First Name': sub.firstName ? { rich_text: [{ text: { content: sub.firstName } }] } : undefined,
    'Last Name': sub.lastName ? { rich_text: [{ text: { content: sub.lastName } }] } : undefined,
    'Email': sub.email ? { email: sub.email } : undefined,
    'Phone': sub.phone ? { phone: sub.phone } : undefined,
    'Website': sub.website ? { url: sub.website } : undefined,
    'Company': sub.company ? { rich_text: [{ text: { content: sub.company } }] } : undefined,
    'Message': sub.message ? { rich_text: [{ text: { content: sub.message } }] } : undefined,
    'Subject-other': sub.subjectOther ? { rich_text: [{ text: { content: sub.subjectOther } }] } : undefined,
    'Notes': ai?.notes ? { rich_text: [{ text: { content: ai.notes } }] } : undefined,
    'Tags': ai?.tags?.length ? { multi_select: ai.tags.map((t) => ({ name: t })) } : undefined,
  };
  Object.keys(props).forEach((k) => props[k] === undefined && delete props[k]);
  return props;
}

export default async function main(env: Env) {
  if (!env.NOTION_API_KEY) throw new Error('NOTION_API_KEY is missing');
  if (!env.NOTION_DATABASE_ID) throw new Error('NOTION_DATABASE_ID is missing');

  const notion = new Client({ auth: env.NOTION_API_KEY });
  const databaseId: string = env.NOTION_DATABASE_ID;
  const OPENAI_API_KEY = env.OPENAI_API_KEY || '';

  const subs = await loadSubmissions(env);
  let ok = 0, fail = 0;

  for (const sub of subs) {
    try {
      const ai = await suggestNotesAndTags(sub.message || '', OPENAI_API_KEY);

      await notion.pages.create({
        parent: { database_id: databaseId },
        properties: buildProperties(sub, ai),
      });
      ok++;
    } catch (e) {
      fail++;
      console.error('[push-notion] Failed for:', sub.email || '(no email)', e);
    }
  }
  console.log(`[push-notion] Done. Pushed ${ok} succeeded, ${fail} failed (of ${subs.length}).`);
}