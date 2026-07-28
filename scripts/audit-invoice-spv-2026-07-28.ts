/**
 * Audit facturi emise vs. cerințele e-Factura/SPV.
 *
 * Rulează buildOblioClient REAL (același cod care a trimis factura) pe fiecare
 * comandă cu factură emisă și raportează ce anume va fi respins la „Trimite în
 * SPV": județ lipsă/invalid, localitate lipsă, București fără sector în
 * Localitate, țară lipsă, plus amestecul de adrese (județ din billing +
 * localitate din adresa KYC a altui județ).
 *
 * Context: raport echipă 27.07.2026 — 5 facturi blocate în SPV
 * (EGH-0013/0028/0048/0172 + EGI2024-24312 pe CJO).
 *
 * Run din rădăcina repo-ului (tsx rezolvă alias-ul @/ din tsconfig):
 *   npx tsx scripts/audit-invoice-spv-2026-07-28.ts
 */
import { readFileSync } from 'node:fs';
import { Client } from 'pg';
import {
  buildOblioClient,
  isPJBillingData,
  getMissingInvoiceClientFields,
} from '@/lib/oblio/invoice';
import { RO_COUNTIES, normalizeCounty, isBucharestCounty, hasBucharestSector } from '@/lib/oblio/address';

const env: Record<string, string> = {};
for (const l of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const i = l.indexOf('=');
  if (i < 1 || l.trim().startsWith('#')) continue;
  env[l.slice(0, i).trim()] = l.slice(i + 1).trim().replace(/^["']|["']$/g, '');
}

const isForeign = (country: string) => {
  const n = normalizeCounty(country);
  return !!n && n !== 'romania' && n !== 'ro';
};

const c = new Client({
  host: 'aws-1-eu-west-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.llbwmitdrppomeptqlue',
  password: env.SUPABASE_DB_PASSWORD,
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

const COUNTY_SET = new Set(RO_COUNTIES.map(normalizeCounty));

async function main() {
  await c.connect();
  const { rows } = await c.query(
    `select friendly_order_id, invoice_number, invoice_issued_at::date as d, customer_data
     from orders where invoice_number is not null order by invoice_issued_at`
  );

  const problems: Record<string, string>[] = [];

  for (const r of rows) {
    const cd = r.customer_data ?? {};
    const client = buildOblioClient(cd);
    if (isPJBillingData(cd)) continue; // Oblio completează PJ din ANAF pe CUI

    const state = (client.state || '').trim();
    const city = (client.city || '').trim();
    const country = (client.country || '').trim();
    const push = (problema: string, detaliu: string) =>
      problems.push({ factura: r.invoice_number, comanda: r.friendly_order_id, problema, detaliu });

    if (!country) push('ȚARĂ lipsă', '(gol)');

    if (isForeign(country)) {
      if (!city) push('LOCALITATE lipsă (client străin)', `country="${country}"`);
      push('ȚARĂ nume RO — de verificat acceptarea în Oblio', `"${country}" / ${city} / ${state}`);
      continue;
    }

    if (!state) push('JUDEȚ lipsă', `city="${city}"`);
    else if (!COUNTY_SET.has(normalizeCounty(state))) push('JUDEȚ invalid', `state="${state}"`);
    if (!city) push('LOCALITATE lipsă', `state="${state}"`);
    else if (isBucharestCounty(state) && !hasBucharestSector(city))
      push('BUCUREȘTI fără sector în Localitate', `city="${city}"`);

    const bCounty = (cd.billing?.county || '').trim();
    const bCity = (cd.billing?.city || '').trim();
    const kCounty = (cd.personal?.address?.county || cd.address?.county || '').trim();
    if (bCounty && !bCity && kCounty && normalizeCounty(bCounty) !== normalizeCounty(kCounty))
      push(
        'AMESTEC adrese (județ billing + localitate din KYC, alt județ)',
        `billing.county="${bCounty}" + city="${city}" (KYC ${kCounty})`
      );

    const missing = getMissingInvoiceClientFields(cd);
    if (missing.length) push('guard-ul de azi ar fi respins comanda', missing.join(', '));
  }

  console.log(`Facturi analizate (PF): ${rows.length} rânduri totale`);
  console.log(`Probleme găsite: ${problems.length}\n`);
  console.table(problems);
  await c.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
