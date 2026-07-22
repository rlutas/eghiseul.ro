/**
 * Backfill orders.estimated_completion_date for ACTIVE eghiseul orders using
 * the fixed calculator (off-by-one + civil-status tier). Anchored to paid_at
 * (fallback created_at) — same anchor the webhook used.
 *
 * Run from the eghiseul.ro repo root (tsx resolves the @/ alias via tsconfig):
 *   npx tsx <this file>            → dry run (prints old vs new)
 *   npx tsx <this file> --apply    → writes changes
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { computeEstimatedCompletionISOForOrder } from '@/lib/orders/order-estimate';

const env: Record<string, string> = {};
for (const l of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const i = l.indexOf('=');
  if (i < 1 || l.trim().startsWith('#')) continue;
  env[l.slice(0, i).trim()] = l.slice(i + 1).trim().replace(/^["']|["']$/g, '');
}

const APPLY = process.argv.includes('--apply');
const ACTIVE_STATUSES = [
  'paid', 'processing', 'documents_generated', 'submitted_to_institution',
  'document_received', 'extras_in_progress', 'document_ready', 'la_tradus', 'standby',
];

async function main() {
  const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: orders, error } = await sb
    .from('orders')
    .select('id, order_number, status, paid_at, created_at, estimated_completion_date, customer_data, selected_options, delivery_method, services(slug, estimated_days, urgent_days, urgent_available)')
    .in('status', ACTIVE_STATUSES)
    .not('estimated_completion_date', 'is', null);
  if (error) throw new Error(error.message);

  let changed = 0;
  for (const o of orders ?? []) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const svc = (o as any).services ?? null;
    const anchor = o.paid_at ?? o.created_at;
    if (!anchor) continue;
    const newISO = await computeEstimatedCompletionISOForOrder(sb, o, svc, new Date(anchor));
    const oldDate = (o.estimated_completion_date as string).slice(0, 10);
    const newDate = newISO?.slice(0, 10) ?? null;
    if (!newDate || newDate === oldDate) continue;
    changed++;
    console.log(`${o.order_number}  ${String((svc?.slug ?? '')).padEnd(35)} ${o.status.padEnd(26)} ${oldDate} -> ${newDate}`);
    if (APPLY) {
      const { error: upErr } = await sb
        .from('orders')
        .update({ estimated_completion_date: newISO })
        .eq('id', o.id);
      if (upErr) console.error(`  FAILED: ${upErr.message}`);
    }
  }
  console.log(`\n${APPLY ? 'UPDATED' : 'DRY RUN'}: ${changed}/${orders?.length ?? 0} orders would change`);
}

main().catch((e) => { console.error(e); process.exit(1); });
