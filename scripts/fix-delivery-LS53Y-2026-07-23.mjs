// One-off (E-260719-LS53Y): the admin Modify added DHL physical delivery via
// a custom extra (687.85 in the 824.50 RON extra-payment link), but
// delivery_method stayed "Email (PDF)" — the team and the client saw a
// digital-only order. Sets the delivery method to email + DHL international
// and logs a history note. NOTE: the extra payment is still PENDING (link
// sent 22.07, not paid yet) — additional_paid_amount stays 0 until the
// webhook confirms it.
//
// Run: node scripts/fix-delivery-LS53Y-2026-07-23.mjs
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
const method = {
  name: 'Email (PDF) + Livrare internațională · DHL Express International',
  type: 'courier',
  price: 0, // plătit prin plata extra (824.50 RON pending), nu prin delivery_price
  service: 'DHL Express International',
  provider: 'dhl_intl',
  estimated_days: 3,
};
const r = await c.query(
  `update orders set delivery_method = $1::jsonb, updated_at = now()
   where order_number = 'E-260719-LS53Y'
   returning id, order_number`,
  [JSON.stringify(method)]
);
console.log('UPDATED:', JSON.stringify(r.rows));
if (r.rows[0]) {
  await c.query(
    `insert into order_history (order_id, event_type, notes, changed_by)
     values ($1, 'note_added', $2, 'system')`,
    [
      r.rows[0].id,
      'Livrare actualizată: Email + DHL Express International (adăugată prin Modifică, 22.07 — inclusă în link-ul de plată extra de 824.50 RON, încă neplătit). Setat de script fix-delivery-LS53Y.',
    ]
  );
  console.log('history note added');
}
await c.end();
