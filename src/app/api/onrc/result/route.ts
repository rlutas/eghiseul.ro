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

export const dynamic = 'force-dynamic';

const TERMINAL = ['DONE', 'FAILED', 'NEEDS_OPERATOR'] as const;
const ALL_STATUSES = [...TERMINAL, 'AWAITING_DOCUMENT'] as const;
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

  // AWAITING_DOCUMENT — submit+pay done, PDF not generated yet. Persist the ONRC
  // ids and park the job so the retrieve phase can poll it later (throttled by
  // last_attempt_at — see /api/onrc/pending).
  if (status === 'AWAITING_DOCUMENT') {
    // How long has this request been waiting for ONRC to issue the document?
    const { data: job } = await supabase
      .from('onrc_jobs')
      .select('awaiting_since, order_id')
      .eq('id', jobId)
      .maybeSingle();
    const MAX_AWAIT_MS = 2 * 60 * 60 * 1000; // 2h — ONRC should issue well before this
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
      if (job?.order_id) await notifyClientDelay(supabase, job.order_id).catch(() => {});
      return NextResponse.json({ success: true });
    }

    const patch: Record<string, unknown> = {
      status: 'AWAITING_DOCUMENT',
      last_attempt_at: now,
      locked_at: null,
      updated_at: now,
    };
    if (!job?.awaiting_since) patch.awaiting_since = now; // mark first time it parks
    if (body.requestId) patch.onrc_request_id = body.requestId;
    if (body.draftId) patch.onrc_draft_id = body.draftId;
    if (body.registrationNumber) patch.registration_number = body.registrationNumber;
    const { error } = await supabase.from('onrc_jobs').update(patch).eq('id', jobId);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
  // NEEDS_OPERATOR = a human will finish it manually → reassure the client so
  // they're not left in the dark (paid but not yet delivered).
  if (status === 'NEEDS_OPERATOR' && job?.order_id) {
    await notifyClientDelay(supabase, job.order_id).catch(() => {});
  }
  return NextResponse.json({ success: true });
}

/** Best-effort "we're processing your request" email when a job needs a human. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function notifyClientDelay(supabase: any, orderId: string): Promise<void> {
  const { data: order } = await supabase
    .from('orders')
    .select('friendly_order_id, customer_data')
    .eq('id', orderId)
    .maybeSingle();
  const email = order?.customer_data?.contact?.email;
  if (!email) return;
  await sendEmail({
    to: email,
    subject: `Comanda ${order.friendly_order_id ?? ''} — în procesare`,
    html: `<p>Bună ziua,</p><p>Cererea ta de certificat constatator (<strong>${order.friendly_order_id ?? ''}</strong>) este în curs de procesare la Registrul Comerțului. Revenim cu documentul în cel mai scurt timp.</p><p>Mulțumim,<br/>Echipa eghiseul.ro</p>`,
  });
}
