/**
 * POST /api/onrc/result
 *
 * The ONRC worker reports the outcome of a job.
 * Body: { jobId, status: 'DONE'|'FAILED'|'NEEDS_OPERATOR',
 *         documentUrl?, registrationNumber?, errorMessage? }
 *
 * Auth: `Authorization: Bearer ${ONRC_WORKER_SECRET}`.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { deliverOnrcResult } from '@/lib/onrc/deliver';
import { sendEmail } from '@/lib/email/resend';
import { logOnrcEvent } from '@/lib/onrc/log-event';

export const dynamic = 'force-dynamic';

const TERMINAL = ['DONE', 'FAILED', 'NEEDS_OPERATOR'] as const;
const ALL_STATUSES = [...TERMINAL, 'AWAITING_DOCUMENT', 'CHECKPOINT'] as const;
type ResultStatus = (typeof ALL_STATUSES)[number];

function authorized(req: NextRequest): boolean {
  const secret = process.env.ONRC_WORKER_SECRET;
  if (!secret) return false;
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    jobId?: string;
    status?: ResultStatus;
    documentUrl?: string;
    registrationNumber?: string;
    errorMessage?: string;
    requestId?: string;
    draftId?: string;
    calculationNote?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { jobId, status } = body;
  if (!jobId || !status || !ALL_STATUSES.includes(status)) {
    return NextResponse.json({ success: false, error: 'jobId and a valid status are required' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const now = new Date().toISOString();

  // CHECKPOINT — the worker created the ONRC draft but has NOT paid yet. Persist
  // the draftId immediately so any later failure (crash, post-payment error,
  // manual reset) leaves the job carrying a draftId → it takes the retrieve path
  // and is never re-submitted/re-paid (anti-double-pay guard). Keep status
  // PROCESSING; the reaper reclaims it as retrieve if the worker dies here.
  if (status === 'CHECKPOINT') {
    const patch: Record<string, unknown> = { updated_at: now };
    if (body.draftId) patch.onrc_draft_id = body.draftId;
    if (body.calculationNote) patch.onrc_calc_note = body.calculationNote;
    const { error } = await supabase.from('onrc_jobs').update(patch).eq('id', jobId);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  // AWAITING_DOCUMENT — submit+pay done, PDF not generated yet. Persist the ONRC
  // ids and park the job so the retrieve phase can poll it later (throttled by
  // last_attempt_at — see /api/onrc/pending).
  if (status === 'AWAITING_DOCUMENT') {
    // How long has this request been waiting for ONRC to issue the document?
    const { data: job } = await supabase
      .from('onrc_jobs')
      .select('awaiting_since, order_id, detail')
      .eq('id', jobId)
      .maybeSingle();

    // Report type drives the expected wait. "De bază" (070) is issued INSTANTLY
    // (auto, 24/7) — if it's not out in 2h something is wrong → operator. But
    // "fonduri IMM" (072) and "insolvență" (071) go through the ONRC BACKOFFICE
    // (a human, in working hours) and routinely take until the next business
    // day — so we keep polling far longer before escalating, or we'd strand a
    // perfectly valid paid request overnight.
    const reportType = String((job?.detail as Record<string, unknown> | null)?.reportType ?? '');
    const isBackoffice = /imm|fond|insolven/i.test(reportType);
    const MAX_AWAIT_MS = (isBackoffice ? 48 : 2) * 60 * 60 * 1000;
    const awaitingSince = job?.awaiting_since ? new Date(job.awaiting_since).getTime() : Date.now();

    // Stuck too long → escalate to a human + tell the client we're on it.
    if (Date.now() - awaitingSince > MAX_AWAIT_MS) {
      await supabase
        .from('onrc_jobs')
        .update({
          status: 'NEEDS_OPERATOR',
          error_message: `Documentul nu a fost emis de ONRC în ${Math.round(MAX_AWAIT_MS / 3600000)}h (cerere ${body.requestId ?? ''}). Verificare manuală.`,
          updated_at: now,
        })
        .eq('id', jobId);
      await logOnrcEvent(supabase, jobId, 'stuck', `Documentul nu a fost emis de ONRC în ${Math.round(MAX_AWAIT_MS / 3600000)}h — necesită operator.`, job?.order_id);
      if (job?.order_id) await notifyClientDelay(supabase, job.order_id).catch(() => {});
      return NextResponse.json({ success: true });
    }

    const firstTime = !job?.awaiting_since;
    // Backoffice report types aren't instant — proactively tell the client at
    // submission that it'll be ready within ~1 business day (set expectations).
    if (firstTime && isBackoffice && job?.order_id) {
      await notifyClientDelay(supabase, job.order_id, true).catch(() => {});
    }
    const patch: Record<string, unknown> = {
      status: 'AWAITING_DOCUMENT',
      last_attempt_at: now,
      locked_at: null,
      updated_at: now,
    };
    if (firstTime) patch.awaiting_since = now; // mark first time it parks
    if (body.requestId) patch.onrc_request_id = body.requestId;
    if (body.draftId) patch.onrc_draft_id = body.draftId;
    if (body.registrationNumber) patch.registration_number = body.registrationNumber;
    if (body.calculationNote) patch.onrc_calc_note = body.calculationNote;
    const { error } = await supabase.from('onrc_jobs').update(patch).eq('id', jobId);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    if (firstTime) {
      await logOnrcEvent(
        supabase,
        jobId,
        'submitted',
        `Cerere depusă + plătită la ONRC${body.requestId ? ` (Id cerere ${body.requestId})` : ''}. Se așteaptă documentul.`,
        job?.order_id
      );
    }
    return NextResponse.json({ success: true });
  }

  if (status === 'DONE') {
    const { data: updated, error } = await supabase
      .from('onrc_jobs')
      .update({
        status: 'DONE',
        document_url: body.documentUrl ?? null,
        registration_number: body.registrationNumber ?? null,
        ...(body.calculationNote ? { onrc_calc_note: body.calculationNote } : {}),
        downloaded_at: now,
        error_message: null,
        updated_at: now,
      })
      .eq('id', jobId)
      .select('order_id')
      .maybeSingle();
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    // Deliver to the customer: attach the PDF to the order + email them.
    if (updated?.order_id) {
      await deliverOnrcResult(updated.order_id, body.documentUrl, body.registrationNumber);
    }
    await logOnrcEvent(
      supabase,
      jobId,
      'done',
      `Document descărcat din ONRC, atașat comenzii + email trimis${body.registrationNumber ? ` (${body.registrationNumber})` : ''}.`,
      updated?.order_id
    );
    return NextResponse.json({ success: true });
  }

  // FAILED / NEEDS_OPERATOR — record the error and bump retry count.
  const { data: job } = await supabase
    .from('onrc_jobs')
    .select('retry_count, order_id')
    .eq('id', jobId)
    .maybeSingle();

  const { error } = await supabase
    .from('onrc_jobs')
    .update({
      status,
      error_message: body.errorMessage ?? null,
      retry_count: (job?.retry_count ?? 0) + 1,
      updated_at: now,
    })
    .eq('id', jobId);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  await logOnrcEvent(
    supabase,
    jobId,
    status === 'NEEDS_OPERATOR' ? 'needs_operator' : 'failed',
    body.errorMessage ?? undefined,
    job?.order_id
  );
  // NEEDS_OPERATOR = a human will finish it manually → reassure the client so
  // they're not left in the dark (paid but not yet delivered).
  if (status === 'NEEDS_OPERATOR' && job?.order_id) {
    await notifyClientDelay(supabase, job.order_id).catch(() => {});
  }
  return NextResponse.json({ success: true });
}

/**
 * Best-effort "we're processing your request" email. `backoffice=true` is the
 * normal-path heads-up for IMM/insolvență certificates (which ONRC issues via
 * its backoffice, ~1 business day) so the client isn't surprised it's not
 * instant; otherwise it's the "taking longer than expected" reassurance.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function notifyClientDelay(supabase: any, orderId: string, backoffice = false): Promise<void> {
  const { data: order } = await supabase
    .from('orders')
    .select('friendly_order_id, customer_data')
    .eq('id', orderId)
    .maybeSingle();
  const email = order?.customer_data?.contact?.email;
  if (!email) return;
  const oid = order.friendly_order_id ?? '';
  const html = backoffice
    ? `<p>Bună ziua,</p><p>Am depus cererea ta de certificat constatator (<strong>${oid}</strong>) la Registrul Comerțului. Se eliberează în câteva minute dacă sistemul ONRC este operațional; dacă sistemul ONRC are mentenanță sau întârzieri, în <strong>maximum 24 de ore lucrătoare</strong> (de obicei în aceeași zi). Îți trimitem documentul pe email imediat ce e gata.</p><p>Mulțumim,<br/>Echipa eghiseul.ro</p>`
    : `<p>Bună ziua,</p><p>Cererea ta de certificat constatator (<strong>${oid}</strong>) este în curs de procesare la Registrul Comerțului. Revenim cu documentul în cel mai scurt timp.</p><p>Mulțumim,<br/>Echipa eghiseul.ro</p>`;
  await sendEmail({
    to: email,
    subject: `Comanda ${oid} — în procesare`,
    html,
  });
}
