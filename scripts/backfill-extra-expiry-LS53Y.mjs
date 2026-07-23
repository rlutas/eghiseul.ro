// One-off: set pending_extra_payment_expires_at on E-260719-LS53Y — the link
// predates migration 133; Stripe confirmed the session expired at
// 2026-07-23T07:50:47Z (created 22.07 07:50 + 24h). Makes the red "LINK
// EXPIRAT" admin alert show for the real case that triggered this feature.
//
// Run: node scripts/backfill-extra-expiry-LS53Y.mjs
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
const r = await c.query(
  `update orders set pending_extra_payment_expires_at = '2026-07-23T07:50:47Z'
   where order_number = 'E-260719-LS53Y' and pending_extra_payment_url is not null
   returning order_number, pending_extra_payment_expires_at`
);
console.log('UPDATED:', JSON.stringify(r.rows));
await c.end();
