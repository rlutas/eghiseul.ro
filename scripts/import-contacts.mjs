/**
 * One-off import into `contacts`:
 *  1. the 8 WPForms exports (docs/archive/exporturi-wpforms/entries/) — leads
 *     (is_customer=false; payment can't be confirmed from these CSVs)
 *  2. paid orders from the new platform — customers (is_customer=true,
 *     orders_count + total_spent aggregated)
 *
 * Dedup by lowercased email; sources/services accumulate. Idempotent —
 * re-running upserts the same rows. Run locally:
 *   NODE_PATH=./node_modules node scripts/import-contacts.mjs
 */
import { Client } from 'pg';
import { readFileSync, readdirSync } from 'node:fs';
import { parse } from 'csv-parse/sync';

const pass = readFileSync('.env.local', 'utf8').match(/SUPABASE_DB_PASSWORD=(.*)/)[1].trim();
const db = new Client({
  host: 'aws-1-eu-west-2.pooler.supabase.com', port: 6543,
  user: 'postgres.llbwmitdrppomeptqlue', password: pass,
  database: 'postgres', ssl: { rejectUnauthorized: false },
});

const DIR = 'docs/archive/exporturi-wpforms/entries';
const SERVICE_FROM_FILE = [
  [/Certificat-De-Nastere/i, 'certificat-nastere'],
  [/Certificat-De-Casatorie/i, 'certificat-casatorie'],
  [/Certificat-Constatator/i, 'certificat-constatator'],
  [/Extras-De-Carte-Funciara/i, 'extras-carte-funciara'],
  [/Cazier-Judiciar/i, 'cazier-judiciar'],
  [/Cazier-Fiscal/i, 'cazier-fiscal'],
];

const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
const clean = (s) => (s ?? '').toString().trim().replace(/^'+/, '') || null;

function pickCol(headers, ...cands) {
  const low = headers.map((h) => h.toLowerCase());
  for (const c of cands) {
    const i = low.findIndex((h) => h === c);
    if (i >= 0) return i;
  }
  for (const c of cands) {
    const i = low.findIndex((h) => h.includes(c));
    if (i >= 0) return i;
  }
  return -1;
}

// email -> contact accumulator
const contacts = new Map();
function acc(email, patch) {
  const key = email.toLowerCase();
  const c = contacts.get(key) ?? {
    email: key, first_name: null, last_name: null, phone: null,
    sources: new Set(), services: new Set(),
    is_customer: false, orders_count: 0, total_spent_ron: 0,
    first_seen_at: null, last_activity_at: null,
  };
  if (patch.first_name && !c.first_name) c.first_name = patch.first_name;
  if (patch.last_name && !c.last_name) c.last_name = patch.last_name;
  if (patch.phone && !c.phone) c.phone = patch.phone;
  patch.sources?.forEach((s) => c.sources.add(s));
  patch.services?.forEach((s) => c.services.add(s));
  if (patch.is_customer) c.is_customer = true;
  c.orders_count += patch.orders_count ?? 0;
  c.total_spent_ron += patch.total_spent_ron ?? 0;
  if (patch.seen_at) {
    if (!c.first_seen_at || patch.seen_at < c.first_seen_at) c.first_seen_at = patch.seen_at;
    if (!c.last_activity_at || patch.seen_at > c.last_activity_at) c.last_activity_at = patch.seen_at;
  }
  contacts.set(key, c);
}

// ── 1. WPForms CSVs ──
for (const file of readdirSync(DIR).filter((f) => f.endsWith('.csv'))) {
  const service = SERVICE_FROM_FILE.find(([re]) => re.test(file))?.[1] ?? 'necunoscut';
  const raw = readFileSync(`${DIR}/${file}`, 'utf8');
  const rows = parse(raw, { relax_column_count: true, relax_quotes: true, skip_records_with_error: true });
  const hdr = rows[0];
  const ei = pickCol(hdr, 'email');
  const fi = pickCol(hdr, 'nume: first', 'nume complet: first', 'first');
  const li = pickCol(hdr, 'nume: last', 'nume complet: last', 'last');
  const pi = pickCol(hdr, 'telefon', 'numar telefon', 'phone');
  const di = pickCol(hdr, 'date', 'data');
  let n = 0;
  for (const r of rows.slice(1)) {
    const email = clean(r[ei])?.toLowerCase();
    if (!email || !validEmail(email)) continue;
    let seen = null;
    if (di >= 0 && r[di]) { const d = new Date(r[di]); if (!isNaN(d)) seen = d.toISOString(); }
    acc(email, {
      first_name: fi >= 0 ? clean(r[fi]) : null,
      last_name: li >= 0 ? clean(r[li]) : null,
      phone: pi >= 0 ? clean(r[pi]) : null,
      sources: [`wpforms:${service}`],
      services: [service],
      seen_at: seen,
    });
    n++;
  }
  console.log(`${file} → ${n} rânduri valide (serviciu: ${service})`);
}

// ── 2. Paid orders from the new platform ──
await db.connect();
const { rows: orders } = await db.query(`
  SELECT o.paid_at, o.total_price,
         o.customer_data->'contact'->>'email' AS email,
         o.customer_data->'contact'->>'phone' AS phone,
         o.customer_data->'billing'->>'firstName' AS fn,
         o.customer_data->'billing'->>'lastName' AS ln,
         s.slug
  FROM orders o LEFT JOIN services s ON s.id = o.service_id
  WHERE o.payment_status = 'paid' AND o.is_test = false
`);
for (const o of orders) {
  const email = (o.email ?? '').trim().toLowerCase();
  if (!validEmail(email)) continue;
  acc(email, {
    first_name: clean(o.fn), last_name: clean(o.ln), phone: clean(o.phone),
    sources: [`platforma:${o.slug ?? 'necunoscut'}`],
    services: [o.slug ?? 'necunoscut'],
    is_customer: true, orders_count: 1,
    total_spent_ron: Number(o.total_price) || 0,
    seen_at: o.paid_at ? new Date(o.paid_at).toISOString() : null,
  });
}
console.log(`platforma → ${orders.length} comenzi plătite`);
console.log(`TOTAL contacte unice: ${contacts.size}`);

// ── 3. Bulk upsert (batched) ──
const all = [...contacts.values()];
const BATCH = 500;
let done = 0;
for (let i = 0; i < all.length; i += BATCH) {
  const chunk = all.slice(i, i + BATCH);
  const values = [];
  const params = [];
  chunk.forEach((c, j) => {
    const b = j * 11;
    values.push(`($${b+1},$${b+2},$${b+3},$${b+4},$${b+5},$${b+6},$${b+7},$${b+8},$${b+9},$${b+10},$${b+11})`);
    params.push(c.email, c.first_name, c.last_name, c.phone, [...c.sources], [...c.services],
      c.is_customer, c.orders_count, Math.round(c.total_spent_ron * 100) / 100,
      c.first_seen_at, c.last_activity_at);
  });
  await db.query(`
    INSERT INTO contacts (email, first_name, last_name, phone, sources, services,
                          is_customer, orders_count, total_spent_ron, first_seen_at, last_activity_at)
    VALUES ${values.join(',')}
    ON CONFLICT (email) DO UPDATE SET
      first_name = COALESCE(contacts.first_name, EXCLUDED.first_name),
      last_name  = COALESCE(contacts.last_name, EXCLUDED.last_name),
      phone      = COALESCE(contacts.phone, EXCLUDED.phone),
      sources    = ARRAY(SELECT DISTINCT unnest(contacts.sources || EXCLUDED.sources)),
      services   = ARRAY(SELECT DISTINCT unnest(contacts.services || EXCLUDED.services)),
      is_customer = contacts.is_customer OR EXCLUDED.is_customer,
      orders_count = GREATEST(contacts.orders_count, EXCLUDED.orders_count),
      total_spent_ron = GREATEST(contacts.total_spent_ron, EXCLUDED.total_spent_ron),
      first_seen_at = LEAST(contacts.first_seen_at, EXCLUDED.first_seen_at),
      last_activity_at = GREATEST(contacts.last_activity_at, EXCLUDED.last_activity_at),
      updated_at = now()
  `, params);
  done += chunk.length;
  if (done % 5000 < BATCH) console.log(`  upsert ${done}/${all.length}`);
}
const { rows: [stats] } = await db.query(
  `SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE is_customer) AS customers FROM contacts`
);
console.log(`GATA: ${stats.total} contacte în DB (${stats.customers} clienți confirmați)`);
await db.end();
