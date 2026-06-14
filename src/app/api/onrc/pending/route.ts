/**
 * GET /api/onrc/pending
 *
 * The ONRC worker (separate Playwright project) polls this to claim the next
 * job. The claim is atomic: only the request that flips PENDING -> PROCESSING
 * wins (no `.or()` on the UPDATE — see .claude/rules/database.md).
 *
 * Auth: `Authorization: Bearer ${ONRC_WORKER_SECRET}`.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { logOnrcEvent } from '@/lib/onrc/log-event';

export const dynamic = 'force-dynamic';

function authorized(req: NextRequest): boolean {
  const secret = process.env.ONRC_WORKER_SECRET;
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
    .upsert({ name: 'onrc_worker', last_seen: now }, { onConflict: 'name' })
    .then(() => {}, () => {});
  // Don't re-poll a request that's still generating more often than this.
  const RETRIEVE_THROTTLE_MIN = 3;
  const STALE_PROCESSING_MIN = 10; // a PROCESSING job locked longer than this = crashed worker
  const MAX_RETRIES = 4; // auto-retry a FAILED (unpaid) submit up to this many times
  const throttleBefore = new Date(Date.now() - RETRIEVE_THROTTLE_MIN * 60_000).toISOString();
  const SELECT_COLS = 'id, order_id, document_type, cui, company_name, detail, status, onrc_draft_id, onrc_request_id';

  // Atomic claim helper — flips a specific row from `fromStatus` -> PROCESSING.
  // Only the request that wins the conditional UPDATE gets the row (no `.or()`
  // on mutations — see .claude/rules/database.md).
  async function claim(id: string, fromStatus: string) {
    const { data } = await supabase
      .from('onrc_jobs')
      .update({ status: 'PROCESSING', locked_at: now, last_attempt_at: now, updated_at: now })
      .eq('id', id)
      .eq('status', fromStatus)
      .select(SELECT_COLS)
      .maybeSingle();
    return data;
  }

  // 1) Prefer the oldest PENDING job (submit phase — new orders). Guard: only a
  //    job with NO draft yet may be submitted. A PENDING job that already has a
  //    draftId was already submitted+paid (e.g. reset by an operator) — never
  //    re-submit it (that double-pays); it's handled by the retrieve/reaper path.
  const { data: pendingCand } = await supabase
    .from('onrc_jobs')
    .select('id')
    .eq('status', 'PENDING')
    .is('onrc_draft_id', null)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  let claimed = pendingCand ? await claim(pendingCand.id, 'PENDING') : null;

  // 2) Otherwise pick up an AWAITING_DOCUMENT job whose last poll was long
  //    enough ago (retrieve phase — already paid, waiting on the PDF).
  if (!claimed) {
    const { data: awaitingCand } = await supabase
      .from('onrc_jobs')
      .select('id')
      .eq('status', 'AWAITING_DOCUMENT')
      .lt('last_attempt_at', throttleBefore)
      .order('last_attempt_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (awaitingCand) claimed = await claim(awaitingCand.id, 'AWAITING_DOCUMENT');
  }

  // 3) Reaper — a job stuck in PROCESSING (worker crashed). With a draft it was
  //    already paid (retrieve phase) → safe to reclaim. Without a draft it
  //    crashed mid-submit → escalate to operator (avoid a double payment).
  if (!claimed) {
    const staleBefore = new Date(Date.now() - STALE_PROCESSING_MIN * 60_000).toISOString();
    const { data: staleCand } = await supabase
      .from('onrc_jobs')
      .select('id, onrc_draft_id')
      .eq('status', 'PROCESSING')
      .lt('locked_at', staleBefore)
      .order('locked_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (staleCand?.onrc_draft_id) {
      claimed = await claim(staleCand.id, 'PROCESSING');
    } else if (staleCand) {
      await supabase
        .from('onrc_jobs')
        .update({
          status: 'NEEDS_OPERATOR',
          error_message: 'Blocat în PROCESSING (worker crash la submit) — verifică pe ONRC dacă s-a plătit înainte de a relua.',
          updated_at: now,
        })
        .eq('id', staleCand.id)
        .eq('status', 'PROCESSING');
    }
  }

  // 4) Auto-retry a FAILED submit that NEVER paid (onrc_draft_id IS NULL → no
  //    double-payment risk), with exponential backoff, up to MAX_RETRIES.
  if (!claimed) {
    const { data: failedCand } = await supabase
      .from('onrc_jobs')
      .select('id, retry_count, last_attempt_at')
      .eq('status', 'FAILED')
      .is('onrc_draft_id', null)
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
    // Nothing to do (or lost a race) — tell the worker to try again.
    return NextResponse.json({ success: true, data: null });
  }

  await logOnrcEvent(
    supabase,
    claimed.id,
    claimed.onrc_draft_id ? 'claimed_retrieve' : 'claimed_submit',
    claimed.onrc_draft_id ? 'Verificare document la ONRC.' : 'Preluat de worker pentru depunere la ONRC.',
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
      documentType: claimed.document_type,
      cui: claimed.cui,
      companyName: claimed.company_name,
      detail: claimed.detail,
      clientEmail,
      clientPhone,
      // Phase discriminator: a draftId means the request was already submitted
      // + paid → the worker runs the retrieve phase instead of submitting again.
      status: claimed.status,
      draftId: claimed.onrc_draft_id ?? null,
    },
  });
}
