/**
 * Aplică o migrare pe baza de date a PLATFORMEI (proiectul Supabase din
 * NEXT_PUBLIC_SUPABASE_URL). Pentru registrul central de numere există
 * scripts/apply-registry-migration.mjs.
 *
 * Rulare:
 *   node scripts/apply-migration.mjs supabase/migrations/206_orders_search_text.sql
 *
 * Credențiale: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_DB_PASSWORD din .env.local.
 */
import fs from 'fs';
import path from 'path';
import pg from 'pg';

const file = process.argv[2];
if (!file) {
  console.error('Utilizare: node scripts/apply-migration.mjs <fisier.sql>');
  process.exit(1);
}

const root = path.resolve(import.meta.dirname, '..');
const env = fs.readFileSync(path.join(root, '.env.local'), 'utf8');
const get = (k) => (env.match(new RegExp('^' + k + '=(.*)$', 'm')) || [])[1]?.trim().replace(/^['"]|['"]$/g, '');

const ref = get('NEXT_PUBLIC_SUPABASE_URL').match(/https:\/\/([a-z0-9]+)\.supabase\.co/)[1];
const client = new pg.Client({
  host: 'aws-1-eu-west-2.pooler.supabase.com',
  port: 6543,
  user: `postgres.${ref}`,
  password: get('SUPABASE_DB_PASSWORD'),
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

await client.connect();
console.log(`Platformă (${ref}) — aplic ${file}`);
const started = Date.now();
await client.query(fs.readFileSync(path.resolve(root, file), 'utf8'));
console.log(`OK (${Date.now() - started} ms)`);
await client.end();
