/**
 * Rewrites orders.delivery_tracking_url from the retired Poșta Română
 * awb.html tracker (soft-404 since ~July 2026, reported by the team on
 * RN7556879850RO / E-260713-T5BVW) to the current official tracker
 * track-trace.html?awb=. Only the host page changes — the AWB query param
 * carries over unchanged.
 *
 *   npx tsx scripts/backfill-posta-tracking-url-2026-07-30.ts            → dry run
 *   npx tsx scripts/backfill-posta-tracking-url-2026-07-30.ts --apply    → writes
 */
import { readFileSync } from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env: Record<string, string> = {};
for (const l of readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const i = l.indexOf('=');
  if (i < 1 || l.trim().startsWith('#')) continue;
  env[l.slice(0, i).trim()] = l.slice(i + 1).trim().replace(/^["']|["']$/g, '');
}

const APPLY = process.argv.includes('--apply');

async function main() {
  const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: orders, error } = await sb
    .from('orders')
    .select('id,friendly_order_id,status,delivery_tracking_url')
    .like('delivery_tracking_url', '%posta-romana.ro/awb.html%');
  if (error) throw new Error(error.message);

  for (const o of orders ?? []) {
    const next = String(o.delivery_tracking_url).replace(
      'posta-romana.ro/awb.html',
      'posta-romana.ro/track-trace.html'
    );
    console.log(`${o.friendly_order_id}  ${o.status}  -> ${next}`);
    if (APPLY) {
      const { error: upErr } = await sb
        .from('orders')
        .update({ delivery_tracking_url: next })
        .eq('id', o.id);
      if (upErr) console.error(`  FAILED: ${upErr.message}`);
    }
  }
  console.log(`\n${APPLY ? 'UPDATED' : 'DRY RUN'}: ${orders?.length ?? 0} orders`);
}

main().catch((e) => { console.error(e); process.exit(1); });
