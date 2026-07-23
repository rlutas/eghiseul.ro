// One-off: sync admin_settings.translation_price_list with the extended
// defaults — (1) our REAL current cost (45 RON/doc, the minimum invoiced by
// the translator) on the 9 active languages, (2) the 8 Kenna languages we
// were still missing (Albaneză/Hindi/Latină/Slovenă/Lituaniană/Macedoneană/
// Vietnameză/Urdu, inactive) for full coverage parity. Existing manual edits
// to other fields are preserved (merge by language, only fills gaps).
//
// Run: node scripts/update-translation-list-2026-07-23.mjs
import { readFileSync } from 'node:fs';
import pg from 'pg';

const env = {};
for (const l of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const i = l.indexOf('=');
  if (i < 1 || l.trim().startsWith('#')) continue;
  env[l.slice(0, i).trim()] = l.slice(i + 1).trim().replace(/^["']|["']$/g, '');
}

const NEW_LANGS = [
  ['Albaneză', 'V'], ['Hindi', 'V'], ['Latină', 'V'], ['Slovenă', 'V'],
  ['Lituaniană', 'VI'], ['Macedoneană', 'VI'], ['Vietnameză', 'VI'], ['Urdu', 'VI'],
];

const c = new pg.Client({
  host: 'aws-1-eu-west-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.llbwmitdrppomeptqlue',
  password: env.SUPABASE_DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

await c.connect();
const { rows } = await c.query(
  `select value from admin_settings where key='translation_price_list'`
);
const list = rows[0]?.value ?? [];
const byLang = new Map(list.map((r) => [r.language.toLowerCase(), r]));

let costSet = 0;
for (const r of list) {
  if (r.active && (r.ourCostDoc == null)) {
    r.ourCostDoc = 45;
    r.notes = r.notes || 'cost actual facturat — de renegociat (țintă 30-35)';
    costSet++;
  }
}
let added = 0;
for (const [language, group] of NEW_LANGS) {
  if (!byLang.has(language.toLowerCase())) {
    list.push({ language, group, active: false, ourCostDoc: null, ourCostPage: null, clientPriceDoc: null, notes: `Kenna gr. ${group}` });
    added++;
  }
}

await c.query(
  `update admin_settings set value=$1::jsonb, updated_at=now() where key='translation_price_list'`,
  [JSON.stringify(list)]
);
console.log(`cost 45 setat pe ${costSet} limbi active · ${added} limbi noi adăugate · total ${list.length}`);
await c.end();
