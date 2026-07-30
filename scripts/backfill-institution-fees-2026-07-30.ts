/**
 * Backfill order_supplier_costs (category `taxa_institutie`) for orders whose
 * ONRC/ANCPI worker job is DONE but no fee was ever recorded — the auto-record
 * hook (auto-supplier-cost.ts) only fires for jobs completed after 30.07.2026.
 *
 * Amounts: ANCPI from the saved receipt PDF (Gemini) with tariff fallback;
 * ONRC from the flat tariff in Setări → Furnizori. Orders where no amount can
 * be determined are listed as SKIPPED (fill the tariff, rerun).
 *
 *   npx tsx scripts/backfill-institution-fees-2026-07-30.ts            → dry run
 *   npx tsx scripts/backfill-institution-fees-2026-07-30.ts --apply    → writes
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { recordInstitutionFeeAuto, onrcFeeRon, ancpiFeeRon } from '@/lib/admin/auto-supplier-cost';

const env: Record<string, string> = {};
for (const l of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const i = l.indexOf('=');
  if (i < 1 || l.trim().startsWith('#')) continue;
  env[l.slice(0, i).trim()] = l.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  if (!process.env[l.slice(0, i).trim()]) process.env[l.slice(0, i).trim()] = env[l.slice(0, i).trim()];
}

const APPLY = process.argv.includes('--apply');

async function main() {
  const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!);

  const { data: ancpi } = await sb
    .from('ancpi_jobs')
    .select('order_id, detail, service_type, chitanta_url, registration_number, orders(friendly_order_id)')
    .eq('status', 'DONE');
  const { data: onrc } = await sb
    .from('onrc_jobs')
    .select('order_id, detail, registration_number, orders(friendly_order_id)')
    .eq('status', 'DONE');

  const jobs = [
    ...(ancpi ?? []).map((j) => ({
      supplier: 'ANCPI' as const,
      orderId: j.order_id as string,
      friendly: (j.orders as { friendly_order_id?: string } | null)?.friendly_order_id,
      quantity: Array.isArray((j.detail as { imobile?: unknown[] } | null)?.imobile)
        ? (j.detail as { imobile: unknown[] }).imobile.length
        : 1,
      amountRon: ancpiFeeRon(j.service_type as string),
      chitantaKey: (j.chitanta_url as string | null) ?? null,
      reference: (j.registration_number as string | null) ?? null,
    })),
    ...(onrc ?? []).map((j) => ({
      supplier: 'ONRC' as const,
      orderId: j.order_id as string,
      friendly: (j.orders as { friendly_order_id?: string } | null)?.friendly_order_id,
      quantity: 1,
      amountRon: onrcFeeRon((j.detail as { documentType?: string } | null)?.documentType),
      chitantaKey: null,
      reference: (j.registration_number as string | null) ?? null,
    })),
  ];

  let inserted = 0, skippedExisting = 0, skippedNoAmount = 0, errors = 0;
  for (const job of jobs) {
    if (!APPLY) {
      // Dry run: only report what exists / what's missing.
      const { data: existing } = await sb
        .from('order_supplier_costs')
        .select('id')
        .eq('order_id', job.orderId)
        .eq('category', 'taxa_institutie')
        .limit(1);
      if (existing && existing.length > 0) { skippedExisting++; continue; }
      const src = 'amountRon' in job && job.amountRon != null
        ? `(taxă fixă ${job.amountRon} RON)`
        : job.chitantaKey ? '(chitanță)' : '(tarif)';
      console.log(`WOULD RECORD  ${job.friendly ?? job.orderId}  ${job.supplier}  ${src}` +
        `${job.quantity > 1 ? `  ×${job.quantity}` : ''}`);
      inserted++;
      continue;
    }
    const result = await recordInstitutionFeeAuto(sb, job);
    if (result.outcome === 'inserted') {
      inserted++;
      console.log(`RECORDED  ${job.friendly ?? job.orderId}  ${job.supplier}  ${result.amountRon} RON  (${result.source})`);
    } else if (result.outcome === 'already_recorded') skippedExisting++;
    else if (result.outcome === 'no_amount') {
      skippedNoAmount++;
      console.log(`SKIPPED (fără sumă — completează tariful)  ${job.friendly ?? job.orderId}  ${job.supplier}`);
    } else errors++;
  }

  console.log(`\n${APPLY ? 'DONE' : 'DRY RUN'}: ${inserted} ${APPLY ? 'recorded' : 'would record'}, ` +
    `${skippedExisting} already recorded, ${skippedNoAmount} no amount, ${errors} errors (${jobs.length} DONE jobs total)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
