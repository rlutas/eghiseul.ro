// One-off: clear estimated_completion_date on ACTIVE orders of instant
// auto-issued services (extras CF / plan cadastral / constatator). These
// deliver in minutes — the calendar date only produced false "expirat" noise
// in admin during the ANCPI outage. Display is now driven by the on-hold
// logic (platform_outages) instead.
//
// Run: node scripts/backfill-instant-null-2026-07-22.mjs
import { readFileSync } from 'node:fs';
import pg from 'pg';

const env = {};
for (const l of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const i = l.indexOf('=');
  if (i < 1 || l.trim().startsWith('#')) continue;
  env[l.slice(0, i).trim()] = l.slice(i + 1).trim().replace(/^["']|["']$/g, '');
}

const c = new pg.Client({
  host: 'aws-1-eu-west-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.llbwmitdrppomeptqlue',
  password: env.SUPABASE_DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

await c.connect();
const r = await c.query(`
  update orders o set estimated_completion_date = null
  from services s where s.id = o.service_id
  and s.slug in ('extras-carte-funciara','extras-plan-cadastral','certificat-constatator')
  and o.status in ('paid','processing','documents_generated','submitted_to_institution','document_received','extras_in_progress','document_ready','la_tradus','standby')
  and o.estimated_completion_date is not null
  returning o.order_number, s.slug`);
console.log('NULLED:', r.rowCount);
console.table(r.rows);
await c.end();
