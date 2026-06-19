/**
 * GET /api/ancpi/pending
 *
 * The ANCPI worker (separate project) polls this to claim the next job. The claim
 * is atomic: only the request that flips PENDING -> PROCESSING wins (no `.or()` on
 * the UPDATE — see .claude/rules/database.md). Mirrors /api/onrc/pending.
 *
 * Anti-double-pay: a job that already placed an ePay order carries an
 * ancpi_order_id → it takes the RETRIEVE path, never re-submits/re-pays.
 *
 * Auth: `Authorization: Bearer ${ANCPI_WORKER_SECRET}`.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logAncpiEvent } from '@/lib/ancpi/log-event';
import { recordPortalStatus, parsePortalStatus } from '@/lib/status/record-outage';

export const dynamic = 'force-dynamic';

function authorized(req: NextRequest): boolean {
  const secret = process.env.ANCPI_WORKER_SECRET;
  if (!secret) return false;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const now = new Date().toISOString();

  // Worker liveness heartbeat (best-effort) — powers the "Stare sistem" page.
  supabase
    .from('system_heartbeats')
    .upsert({ name: 'ancpi_worker', last_seen: now }, { onConflict: 'name' })
    .then(() => {}, () => {});

  // Portal status reported by the worker probe (?portal=up|down|maintenance) —
  // logs ANCPI downtime windows into platform_outages on each transition.
  const portalStatus = parsePortalStatus(req.nextUrl.searchParams.get('portal'));
  if (portalStatus) void recordPortalStatus(supabase, 'ancpi', portalStatus);

  const RETRIEVE_THROTTLE_MIN = 2; // ANCPI is fast (~1 min); poll a bit more eagerly than ONRC
  const STALE_PROCESSING_MIN = 10; // a PROCESSING job locked longer than this = crashed worker
  const MAX_RETRIES = 4;
  const throttleBefore = new Date(Date.now() - RETRIEVE_THROTTLE_MIN * 60_000).toISOString();
  const SELECT_COLS =
    'id, order_id, service_type, prod_id, detail, status, ancpi_cart_reg_id, ancpi_order_id, registration_number';

  // Atomic claim — flips a specific row from `fromStatus` -> PROCESSING.
  async function claim(id: string, fromStatus: string) {
    const { data } = await supabase
      .from('ancpi_jobs')
      .update({ status: 'PROCESSING', locked_at: now, last_attempt_at: now, updated_at: now })
      .eq('id', id)
      .eq('status', fromStatus)
      .select(SELECT_COLS)
      .maybeSingle();
    return data;
  }

  // 1) Oldest PENDING job (submit phase). Guard: only a job with NO ePay order
  //    yet may be submitted — one that already placed an order is RETRIEVE-only.
  const { data: pendingCand } = await supabase
    .from('ancpi_jobs')
    .select('id')
    .eq('status', 'PENDING')
    .is('ancpi_order_id', null)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  let claimed = pendingCand ? await claim(pendingCand.id, 'PENDING') : null;

  // 2) AWAITING_DOCUMENT whose last poll was long enough ago (retrieve phase).
  if (!claimed) {
    const { data: awaitingCand } = await supabase
      .from('ancpi_jobs')
      .select('id')
      .eq('status', 'AWAITING_DOCUMENT')
      .lt('last_attempt_at', throttleBefore)
      .order('last_attempt_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (awaitingCand) claimed = await claim(awaitingCand.id, 'AWAITING_DOCUMENT');
  }

  // 3) Reaper — a job stuck in PROCESSING (worker crashed). With an ePay order it
  //    was already placed (retrieve phase) → safe to reclaim. Without one it
  //    crashed mid-submit → escalate to operator (avoid a double placement).
  if (!claimed) {
    const staleBefore = new Date(Date.now() - STALE_PROCESSING_MIN * 60_000).toISOString();
    const { data: staleCand } = await supabase
      .from('ancpi_jobs')
      .select('id, ancpi_order_id')
      .eq('status', 'PROCESSING')
      .lt('locked_at', staleBefore)
      .order('locked_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (staleCand?.ancpi_order_id) {
      claimed = await claim(staleCand.id, 'PROCESSING');
    } else if (staleCand) {
      await supabase
        .from('ancpi_jobs')
        .update({
          status: 'NEEDS_OPERATOR',
          error_message:
            'Blocat în PROCESSING (worker crash la submit) — verifică pe ePay ANCPI dacă s-a plasat comanda înainte de a relua.',
          updated_at: now,
        })
        .eq('id', staleCand.id)
        .eq('status', 'PROCESSING');
    }
  }

  // 4) Auto-retry a FAILED submit that NEVER placed an order (ancpi_order_id IS
  //    NULL → no double-pay risk), with exponential backoff, up to MAX_RETRIES.
  if (!claimed) {
    const { data: failedCand } = await supabase
      .from('ancpi_jobs')
      .select('id, retry_count, last_attempt_at')
      .eq('status', 'FAILED')
      .is('ancpi_order_id', null)
      .lt('retry_count', MAX_RETRIES)
      .order('last_attempt_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (failedCand) {
      const backoffMin = Math.pow(2, failedCand.retry_count ?? 0); // 1, 2, 4, 8 min
      const backoffBefore = new Date(Date.now() - backoffMin * 60_000).toISOString();
      if (!failedCand.last_attempt_at || failedCand.last_attempt_at < backoffBefore) {
        claimed = await claim(failedCand.id, 'FAILED');
      }
    }
  }

  if (!claimed) {
    return NextResponse.json({ success: true, data: null });
  }

  const isRetrieve = !!claimed.ancpi_order_id;
  await logAncpiEvent(
    supabase,
    claimed.id,
    isRetrieve ? 'claimed_retrieve' : 'claimed_submit',
    isRetrieve ? 'Verificare document la ANCPI.' : 'Preluat de worker pentru plasare comandă la ANCPI.',
    claimed.order_id
  );

  // Client contact for delivery (lives in customer_data.contact).
  const { data: order } = await supabase
    .from('orders')
    .select('customer_data, friendly_order_id')
    .eq('id', claimed.order_id)
    .single();
  const cd = order?.customer_data ?? {};
  const clientEmail = cd?.contact?.email ?? null;
  const clientPhone = cd?.contact?.phone ?? null;

  return NextResponse.json({
    success: true,
    data: {
      jobId: claimed.id,
      orderId: claimed.order_id,
      friendlyOrderId: order?.friendly_order_id ?? null,
      serviceType: claimed.service_type,
      prodId: claimed.prod_id,
      detail: claimed.detail,
      clientEmail,
      clientPhone,
      // Phase discriminator: an ePay orderId means the order was already placed
      // + paid → the worker runs the retrieve phase instead of submitting again.
      status: claimed.status,
      ancpiCartRegId: claimed.ancpi_cart_reg_id ?? null,
      ancpiOrderId: claimed.ancpi_order_id ?? null,
    },
  });
}
