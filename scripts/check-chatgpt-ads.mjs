/**
 * Verificarea zilnică a campaniilor ChatGPT Ads.
 *
 *   node scripts/check-chatgpt-ads.mjs
 *
 * Citește `orders.attribution` și arată, pentru fiecare campanie:
 *   - drafturi și comenzi plătite atribuite, pe zi și pe anunț (`utm_term`);
 *   - dacă a ajuns vreodată `oppref` / `oai_ref` (diagnostic de atribuire);
 *   - CPA-ul, dacă îi dai cheltuiala din Ads Manager.
 *
 * Cheltuiala și clicurile NU se pot citi din API-ul lor cu ce avem configurat,
 * deci se dau ca argumente:
 *
 *   node scripts/check-chatgpt-ads.mjs --spend-eur 12.40 --clicks 31
 *
 * Contextul, pragurile și criteriile de oprire sunt în
 * `docs/ads/chatgpt/09-campanie-extras-carte-funciara.md`.
 */

import fs from 'fs';
import path from 'path';
import pg from 'pg';

const ROOT = path.resolve(import.meta.dirname, '..');
const EUR_RON = 5.1;
/** Ținta stabilită de Raul, 17.09.2026. Peste asta, reclama nu ne lasă profit. */
const TARGET_CPA_RON = 20;
/** Pragul de rentabilitate: 89 lei − TVA 21% − taxă ANCPI 20,67 − procesare. */
const BREAKEVEN_CPA_RON = 50;

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function env() {
  const raw = fs.readFileSync(path.join(ROOT, '.env.local'), 'utf8');
  return Object.fromEntries(
    raw
      .split('\n')
      .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
      .map((l) => {
        const i = l.indexOf('=');
        return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
      })
  );
}

const spendEur = arg('spend-eur') ? Number(arg('spend-eur')) : null;
const clicks = arg('clicks') ? Number(arg('clicks')) : null;
const days = Number(arg('days', '14'));

const e = env();
const client = new pg.Client({
  host: 'aws-1-eu-west-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.llbwmitdrppomeptqlue',
  password: e.SUPABASE_DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

await client.connect();

const attributed = await client.query(
  `select
     coalesce(o.attribution->'last'->>'utm_campaign', o.attribution->'first'->>'utm_campaign') as campanie,
     coalesce(o.attribution->'last'->>'utm_term', o.attribution->'first'->>'utm_term', '(fara)') as anunt,
     count(*) as drafturi,
     count(*) filter (where o.payment_status = 'paid') as platite,
     round(coalesce(sum(o.total_price) filter (where o.payment_status = 'paid'), 0), 2) as venit,
     count(*) filter (where coalesce(o.attribution->'last'->>'oppref', o.attribution->'first'->>'oppref') is not null) as cu_oppref
   from orders o
   where o.created_at > now() - ($1 || ' days')::interval
     and coalesce(o.is_test, false) = false
     and (o.attribution->'last'->>'utm_source' = 'chatgpt' or o.attribution->'first'->>'utm_source' = 'chatgpt')
   group by 1, 2
   order by 1, platite desc`,
  [days]
);

console.log(`\n=== Comenzi atribuite ChatGPT Ads, ultimele ${days} zile ===`);
if (attributed.rows.length === 0) {
  console.log('Nicio comandă și niciun draft cu utm_source=chatgpt.');
  console.log('Dacă platforma raportează clicuri, verifică întâi Vercel Analytics:');
  console.log('sesiuni cu referrer chatgpt.com. Peste 30% diferență = oprește (vezi doc 09, secțiunea K).');
} else {
  console.table(attributed.rows);
}

const opprefEver = await client.query(
  `select count(*) as n
   from orders
   where attribution::text ilike '%oppref%'
     and coalesce(attribution->'last'->>'oppref', attribution->'first'->>'oppref') is not null`
);
console.log(
  `\noppref/oai_ref ajuns vreodată în atribuire: ${opprefEver.rows[0].n}` +
    (Number(opprefEver.rows[0].n) === 0
      ? '  ← încă niciodată; un draft cu oai_ref dar fără oppref = adăugarea automată nu ajunge la noi'
      : '')
);

if (spendEur !== null) {
  const paid = attributed.rows.reduce((s, r) => s + Number(r.platite), 0);
  const spendRon = spendEur * EUR_RON;
  console.log(`\n=== Economia, la ${spendEur.toFixed(2)} € cheltuiți (${spendRon.toFixed(2)} lei) ===`);
  if (clicks !== null) {
    console.log(`CPC efectiv: ${(spendEur / clicks).toFixed(2)} € pe ${clicks} clicuri`);
    if (paid > 0) console.log(`Conversie clic → comandă plătită: ${((100 * paid) / clicks).toFixed(1)}%`);
  }
  if (paid === 0) {
    console.log('Comenzi plătite: 0 → încă nu există CPA.');
    if (clicks !== null && clicks >= 100) {
      console.log('🔴 100+ clicuri fără nicio comandă: criteriul de oprire din doc 09 e atins.');
    }
  } else {
    const cpa = spendRon / paid;
    const verdict =
      cpa <= TARGET_CPA_RON
        ? '🟢 sub ținta de 20 lei — se scalează'
        : cpa <= BREAKEVEN_CPA_RON
          ? '🟡 rentabil dar peste țintă'
          : '🔴 peste pragul de rentabilitate — oprește';
    console.log(`Comenzi plătite: ${paid} → CPA ${cpa.toFixed(2)} lei  ${verdict}`);
  }
} else {
  console.log('\n(Dă --spend-eur și --clicks din Ads Manager ca să calculeze CPC și CPA.)');
}

console.log('');
await client.end();
