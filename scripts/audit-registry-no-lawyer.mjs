/**
 * Audit: numere de Barou (contract + delegație) alocate pe comenzi eghiseul ale
 * unor servicii care NU trec prin avocat.
 *
 * Registrul e într-un proiect Supabase separat, deci join-ul se face în două
 * pași: scot order_ref-urile din registru, apoi le mapez la servicii în baza
 * platformei.
 *
 * Rulare: node scripts/audit-registry-no-lawyer.mjs
 */
import fs from 'fs';
import path from 'path';
import pg from 'pg';

const LAWYER_SERVICE_SLUGS = [
  'cazier-judiciar',
  'cazier-judiciar-persoana-fizica',
  'cazier-judiciar-persoana-juridica',
  'cazier-auto',
  'cazier-fiscal',
  'certificat-nastere',
  'certificat-casatorie',
  'certificat-celibat',
  'certificat-integritate',
  'extras-multilingv-certificat-nastere',
  'extras-multilingv-certificat-casatorie',
];

const root = path.resolve(import.meta.dirname, '..');
const env = fs.readFileSync(path.join(root, '.env.local'), 'utf8');
const get = (k) => (env.match(new RegExp('^' + k + '=(.*)$', 'm')) || [])[1]?.trim().replace(/^['"]|['"]$/g, '');

const ref = get('REGISTRY_SUPABASE_URL').match(/https:\/\/([a-z0-9]+)\.supabase\.co/)[1];
const registry = new pg.Client({
  host: 'aws-1-eu-west-2.pooler.supabase.com', port: 6543,
  user: `postgres.${ref}`, password: get('REGISTRY_DB_PASSWORD'),
  database: 'postgres', ssl: { rejectUnauthorized: false },
});
const platform = new pg.Client({
  host: 'aws-1-eu-west-2.pooler.supabase.com', port: 6543,
  user: 'postgres.llbwmitdrppomeptqlue', password: get('SUPABASE_DB_PASSWORD'),
  database: 'postgres', ssl: { rejectUnauthorized: false },
});
await registry.connect();
await platform.connect();

const { rows: entries } = await registry.query(
  `select id, number, type, series, order_ref, client_name, voided_at
     from number_registry
    where platform = 'eghiseul' and order_ref is not null
    order by type, number`
);

const refs = [...new Set(entries.map((e) => e.order_ref))];
const { rows: orders } = await platform.query(
  `select o.friendly_order_id, s.slug
     from orders o join services s on s.id = o.service_id
    where o.friendly_order_id = any($1)`,
  [refs]
);
const slugByRef = Object.fromEntries(orders.map((o) => [o.friendly_order_id, o.slug]));

const bad = entries.filter((e) => {
  const slug = slugByRef[e.order_ref];
  return slug && !LAWYER_SERVICE_SLUGS.includes(slug);
});

console.log(`${entries.length} numere eghiseul în registru, ${bad.length} pe servicii FĂRĂ avocat:\n`);
for (const e of bad) {
  console.log(
    `  ${e.type.padEnd(10)} ${(e.series ?? '') + String(e.number).padStart(6, '0')}  ${e.order_ref}  ${slugByRef[e.order_ref]}  ${e.voided_at ? 'anulat' : 'ACTIV'}`
  );
}
console.log(`\nIDs: ${bad.map((e) => e.id).join(',')}`);

await registry.end();
await platform.end();
