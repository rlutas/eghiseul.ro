/**
 * Aplică o migrare pe proiectul Supabase DEDICAT al registrului central de
 * numere (Baroul Satu Mare) — proiect separat de baza platformei.
 *
 * Rulare:
 *   node scripts/apply-registry-migration.mjs supabase/registry/002_released_numbers.sql
 *
 * Credențiale: REGISTRY_SUPABASE_URL + REGISTRY_DB_PASSWORD din .env.local.
 */
import fs from 'fs';
import path from 'path';
import pg from 'pg';

const file = process.argv[2];
if (!file) {
  console.error('Utilizare: node scripts/apply-registry-migration.mjs <fisier.sql>');
  process.exit(1);
}

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
console.log(`Registru central (${ref}) — aplic ${file}`);
await client.query(fs.readFileSync(path.resolve(root, file), 'utf8'));
console.log('OK');
await client.end();
