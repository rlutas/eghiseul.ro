/**
 * Pune înapoi în circulație numerele de Barou alocate greșit pe servicii FĂRĂ
 * avocat (bugul reparat 2026-08-12 — vezi scripts/cleanup-wrong-lawyer-docs.ts).
 *
 * Fără asta, `void_number` le lăsa consumate → goluri nejustificate în registrul
 * fizic al cabinetului. `release_number` (migrarea registry/002) scoate intrarea
 * din jurnal și o pune în `released_numbers`, de unde `allocate_number` o
 * reconsumă la următoarele comenzi plătite prin avocat.
 *
 * Rulare:
 *   node scripts/release-wrong-lawyer-numbers.mjs           # dry-run
 *   node scripts/release-wrong-lawyer-numbers.mjs --apply
 */
import fs from 'fs';
import path from 'path';
import pg from 'pg';

const APPLY = process.argv.includes('--apply');
const REASON =
  'Alocat greșit pe serviciu fără avocat (bug listă NO_LAWYER, reparat 2026-08-12) — pus înapoi în circulație';

const ORDER_REFS = [
  'E-260722-M58C5',
  'E-260804-YEYBF',
  'E-260804-9K23B',
  'E-260810-EP896',
  'E-260811-U2AWZ',
];

const root = path.resolve(import.meta.dirname, '..');
const env = fs.readFileSync(path.join(root, '.env.local'), 'utf8');
const get = (k) => (env.match(new RegExp('^' + k + '=(.*)$', 'm')) || [])[1]?.trim().replace(/^['"]|['"]$/g, '');

const ref = get('REGISTRY_SUPABASE_URL').match(/https:\/\/([a-z0-9]+)\.supabase\.co/)[1];
const client = new pg.Client({
  host: 'aws-1-eu-west-2.pooler.supabase.com',
  port: 6543,
  user: `postgres.${ref}`,
  password: get('REGISTRY_DB_PASSWORD'),
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const { rows } = await client.query(
  `select id, number, type, year, order_ref, client_name, voided_at
     from number_registry
    where platform = 'eghiseul' and order_ref = any($1)
    order by number`,
  [ORDER_REFS]
);

console.log(`${APPLY ? 'APPLY' : 'DRY-RUN'} — ${rows.length} intrări de eliberat:`);
for (const r of rows) {
  console.log(`  ${String(r.number).padStart(6, '0')}  ${r.type}  ${r.order_ref}  ${r.client_name}  ${r.voided_at ? 'anulat' : 'ACTIV'}`);
}

if (APPLY) {
  for (const r of rows) {
    const res = await client.query('select release_number($1, $2, $3) as ok', [
      r.id,
      'cleanup-no-lawyer-2026-08-12',
      REASON,
    ]);
    console.log(`  ${String(r.number).padStart(6, '0')} → ${res.rows[0].ok ? 'eliberat' : 'era deja eliberat'}`);
  }
}

const free = await client.query(
  `select type, year, number, reason from released_numbers
    where consumed_at is null order by type, number`
);
console.log(`\nNumere libere pentru reutilizare: ${free.rows.length}`);
for (const f of free.rows) console.log(`  ${f.type} ${f.year} — ${String(f.number).padStart(6, '0')}`);

if (!APPLY) console.log('\nDry-run. Rulează cu --apply.');
await client.end();
