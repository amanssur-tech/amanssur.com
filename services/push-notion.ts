// scripts/push-notion.ts
// Reads submissions.json and pushes them to Notion CRM

import { Client } from '@notionhq/client';
import fs from 'fs';
import path from 'path';
import { config as loadEnv } from 'dotenv';

loadEnv({ path: process.env.ENV_FILE || '.env.production' });

if (!process.env.NOTION_API_KEY) throw new Error('NOTION_API_KEY is missing');
if (!process.env.NOTION_DATABASE_ID) throw new Error('NOTION_DATABASE_ID is missing');

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId: string = process.env.NOTION_DATABASE_ID;
const USE_AI = true;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

// Shape of local submissions.json entries
export interface Submission {
  firstName?: string;
  lastName?: string;
  email?: string;
  reason?: string;     // maps to Subject
  message?: string;
  ts?: string;         // ISO submission time (we set Last Contact = ts initially)
  lang?: string;
  ip?: string;
  company?: string;
  website?: string;
  phone?: string;
  subjectOther?: string; // if you keep “Subject-other”
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

function loadSubmissions(): Submission[] {
  const file = path.resolve(process.cwd(), 'src/lib/mail/submissions.json');
  if (!fs.existsSync(file)) return [];
  const raw = fs.readFileSync(file, 'utf-8').trim();
  return raw ? JSON.parse(raw) : [];
}

function makeTitle(firstName?: string, lastName?: string) {
  return `${firstName || ''} ${lastName || ''}`.trim() || '(no name)';
}

// --- Optional AI helpers (OFF by default) ---
async function suggestNotesAndTags(message: string): Promise<{ notes?: string; tags?: string[] }> {
  if (!USE_AI || !OPENAI_API_KEY || !message) return {};
  // Using fetch to keep deps minimal. You can swap to official SDK if you prefer.
  const body = {
    model: 'gpt-5-nano', // cheap/fast; switch if you like
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
    // Try to parse JSON out of the model output (be tolerant)
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

// Build Notion property object with only present/desired fields
function buildProperties(sub: Submission, ai?: { notes?: string; tags?: string[] }) {
  const props: Record<string, any> = {
    // Title
    'Full Name': {
      title: [{ text: { content: makeTitle(sub.firstName, sub.lastName) } }],
    },

    // Subject (your form "reason" categories)
    'Subject': (() => { const opt = mapReasonToNotionSubject(sub.reason); return opt ? { select: { name: opt } } : undefined; })(),

    // Contact Source (fixed)
    'Contact Source': { select: { name: 'amanssur.com' } },

    // Last Contact (initially set to submission time, then you update manually later)
    'Last Contact': { date: { start: sub.ts || new Date().toISOString() } },

    // Identity breakdown (kept for automation/filtering)
    'First Name': sub.firstName ? { rich_text: [{ text: { content: sub.firstName } }] } : undefined,
    'Last Name': sub.lastName ? { rich_text: [{ text: { content: sub.lastName } }] } : undefined,

    // Contact methods (optional if present)
    'Email': sub.email ? { email: sub.email } : undefined,
    'Phone': sub.phone ? { phone: sub.phone } : undefined,
    'Website': sub.website ? { url: sub.website } : undefined,

    // Company (optional)
    'Company': sub.company ? { rich_text: [{ text: { content: sub.company } }] } : undefined,

    // Freeform message
    'Message': sub.message ? { rich_text: [{ text: { content: sub.message } }] } : undefined,

    // Subject-other (if you keep it)
    'Subject-other': sub.subjectOther
      ? { rich_text: [{ text: { content: sub.subjectOther } }] }
      : undefined,

    // Optional AI-prepopulated Notes / Tags
    'Notes': ai?.notes ? { rich_text: [{ text: { content: ai.notes } }] } : undefined,
    'Tags': ai?.tags?.length ? { multi_select: ai.tags.map((t) => ({ name: t })) } : undefined,
  };

  // Remove undefined to avoid Notion API validation errors
  Object.keys(props).forEach((k) => props[k] === undefined && delete props[k]);
  return props;
}

export async function pushLeadToNotion(sub: Submission) {
  const ai = await suggestNotesAndTags(sub.message || '');

  await notion.pages.create({
    parent: { database_id: databaseId },
    properties: buildProperties(sub, ai),
  });
}

// Guard: This file can be imported as a module, or run directly as CLI for backfill.
async function main() {
  const subs = loadSubmissions();
  let ok = 0, fail = 0;

  for (const sub of subs) {
    try {
      await pushLeadToNotion(sub);
      ok++;
    } catch (e) {
      fail++;
      console.error('[push-notion] Failed for:', sub.email || '(no email)', e);
    }
  }
  console.log(`[push-notion] Done. Pushed ${ok} succeeded, ${fail} failed (of ${subs.length}).`);
}

main().catch((err) => {
  console.error('[push-notion] Fatal:', err);
  process.exit(1);
});