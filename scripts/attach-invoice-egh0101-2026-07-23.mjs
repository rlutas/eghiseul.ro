// One-off: attach Oblio invoice EGH-0101 to the payout transaction row for
// the Oblio-proforma card payment (Eduard Popescu, 527.50 RON, payout
// po_1Tvo1eHGb8JBHhclhYWsTkWR). The payment went through Oblio's own
// Stripe checkout (proforma EGIP 0319 payment link), so payout-sync had no
// order metadata to match; the invoice DOES exist in Oblio (EGH 0101,
// 18.07.2026). Manual attachments are preserved by the sync.
//
// Run: node scripts/attach-invoice-egh0101-2026-07-23.mjs
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
  `update stripe_payout_transactions
   set invoice_number = 'EGH-0101',
       invoice_url = 'https://www.oblio.eu/utils/show_file/?ic=731864&id=123598099&it=009012c58efc8f96648b42077b66c70c&preload=1',
       service_name = 'Proformă Oblio EGIP 0319 (plată card Oblio)'
   where id = 'txn_3TuYEZHGb8JBHhcl16VmGRE1'
   returning id, invoice_number, client_name`
);
console.log('UPDATED:', JSON.stringify(r.rows));
await c.end();
