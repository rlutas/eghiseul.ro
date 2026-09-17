/**
 * Push the Supabase Auth email templates from source to the project config.
 *
 *   npx tsx scripts/sync-supabase-auth-templates.ts          # push + verify
 *   npx tsx scripts/sync-supabase-auth-templates.ts --check  # verify only
 *
 * Needs SUPABASE_ACCESS_TOKEN in .env.local (a personal access token from
 * https://supabase.com/dashboard/account/tokens — they expire, so a 401 here
 * usually means "generate a new one", not "wrong project").
 *
 * GoTrue does not pick the change up instantly; allow a few minutes before
 * judging a send by the old template.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { SUPABASE_AUTH_TEMPLATES } from '../src/lib/email/templates/supabase-auth';

const PROJECT_REF = 'llbwmitdrppomeptqlue';
const CONFIG_URL = `https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`;

function accessToken(): string {
  const fromEnv = process.env.SUPABASE_ACCESS_TOKEN;
  if (fromEnv) return fromEnv;
  // .env.local may carry more than one assignment; the last one wins, the same
  // way a shell sourcing the file would resolve it.
  const raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
  const matches = [...raw.matchAll(/^SUPABASE_ACCESS_TOKEN=(.*)$/gm)];
  const value = matches.at(-1)?.[1]?.trim().replace(/^["']|["']$/g, '');
  if (!value) throw new Error('SUPABASE_ACCESS_TOKEN not found in env or .env.local');
  return value;
}

async function readConfig(token: string): Promise<Record<string, unknown>> {
  const res = await fetch(CONFIG_URL, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`GET config/auth -> ${res.status} ${await res.text()}`);
  return res.json();
}

async function main() {
  const checkOnly = process.argv.includes('--check');
  const token = accessToken();

  if (!checkOnly) {
    const res = await fetch(CONFIG_URL, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(SUPABASE_AUTH_TEMPLATES),
    });
    if (!res.ok) throw new Error(`PATCH config/auth -> ${res.status} ${await res.text()}`);
    console.log('PATCH config/auth -> 200');
  }

  const config = await readConfig(token);
  let drift = 0;
  for (const [field, expected] of Object.entries(SUPABASE_AUTH_TEMPLATES)) {
    const actual = config[field];
    const same = actual === expected;
    if (!same) drift += 1;
    const label = field.replace('mailer_', '').padEnd(34);
    console.log(`${same ? 'OK  ' : 'DIFF'} ${label} ${String(actual ?? '').length} chars`);
  }

  console.log(
    drift === 0
      ? '\nAll templates match source.'
      : `\n${drift} field(s) differ from source — re-run without --check to push.`
  );
  if (drift > 0 && checkOnly) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
