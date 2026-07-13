/**
 * POST /api/ancpi/result
 *
 * The ANCPI worker reports the outcome of a job.
 * Body: { jobId, status: 'CHECKPOINT'|'AWAITING_DOCUMENT'|'DONE'|'FAILED'|'NEEDS_OPERATOR',
 *         ancpiCartRegId?, ancpiOrderId?, registrationNumber?,
 *         documentUrl?, chitantaUrl?, errorMessage? }
 *
 * Auth: `Authorization: Bearer ${ANCPI_WORKER_SECRET}`. Mirrors /api/onrc/result.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { deliverAncpiResult } from '@/lib/ancpi/deliver';
import { sendEmail } from '@/lib/email/resend';
import { brandedEmailHtml, infoRows } from '@/lib/email/templates/branded-layout';
import { logAncpiEvent } from '@/lib/ancpi/log-event';

export const dynamic = 'force-dynamic';

const ALL_STATUSES = ['DONE', 'FAILED', 'NEEDS_OPERATOR', 'AWAITING_DOCUMENT', 'CHECKPOINT'] as const;
type ResultStatus = (typeof ALL_STATUSES)[number];

function authorized(req: NextRequest): boolean {
  const secret = process.env.ANCPI_WORKER_SECRET;
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
    ancpiCartRegId?: string;
    ancpiOrderId?: string;
    registrationNumber?: string;
    documentUrl?: string;
    documentUrls?: string[];
    chitantaUrl?: string;
    errorMessage?: string;
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

  // CHECKPOINT — the worker placed the ePay order (and/or created the cart line)
  // but the document isn't confirmed yet. Persist the ePay ids IMMEDIATELY so any
  // later failure leaves the job carrying an ancpi_order_id → it takes the
  // retrieve path and is never re-submitted/re-paid (anti-double-pay guard).
  if (status === 'CHECKPOINT') {
    const patch: Record<string, unknown> = { updated_at: now };
    if (body.ancpiCartRegId) patch.ancpi_cart_reg_id = body.ancpiCartRegId;
    if (body.ancpiOrderId) patch.ancpi_order_id = body.ancpiOrderId;
    if (body.registrationNumber) patch.registration_number = body.registrationNumber;
    const { error } = await supabase.from('ancpi_jobs').update(patch).eq('id', jobId);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  // AWAITING_DOCUMENT — order placed, document not issued yet. Persist the ePay
  // ids and park the job so the retrieve phase can poll it later (throttled by
  // last_attempt_at — see /api/ancpi/pending). ANCPI is normally ~1 min, so if it
  // isn't out in 2h something is wrong → escalate to a human.
  if (status === 'AWAITING_DOCUMENT') {
    const { data: job } = await supabase
      .from('ancpi_jobs')
      .select('awaiting_since, order_id')
      .eq('id', jobId)
      .maybeSingle();

    const MAX_AWAIT_MS = 2 * 60 * 60 * 1000;
    const awaitingSince = job?.awaiting_since ? new Date(job.awaiting_since).getTime() : Date.now();

    if (Date.now() - awaitingSince > MAX_AWAIT_MS) {
      await supabase
        .from('ancpi_jobs')
        .update({
          status: 'NEEDS_OPERATOR',
          error_message: `Documentul nu a fost emis de ANCPI în 2h (comanda ePay ${body.ancpiOrderId ?? ''}). Verificare manuală.`,
          updated_at: now,
        })
        .eq('id', jobId);
      await logAncpiEvent(supabase, jobId, 'stuck', 'Documentul nu a fost emis de ANCPI în 2h — necesită operator.', job?.order_id);
      if (job?.order_id) await notifyClientDelay(supabase, job.order_id).catch(() => {});
      return NextResponse.json({ success: true });
    }

    const firstTime = !job?.awaiting_since;
    const patch: Record<string, unknown> = {
      status: 'AWAITING_DOCUMENT',
      last_attempt_at: now,
      locked_at: null,
      updated_at: now,
    };
    if (firstTime) patch.awaiting_since = now;
    if (body.ancpiCartRegId) patch.ancpi_cart_reg_id = body.ancpiCartRegId;
    if (body.ancpiOrderId) patch.ancpi_order_id = body.ancpiOrderId;
    if (body.registrationNumber) patch.registration_number = body.registrationNumber;
    const { error } = await supabase.from('ancpi_jobs').update(patch).eq('id', jobId);
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    if (firstTime) {
      await logAncpiEvent(
        supabase,
        jobId,
        'placed',
        `Comandă plasată + plătită la ANCPI${body.ancpiOrderId ? ` (comanda ${body.ancpiOrderId})` : ''}. Se așteaptă documentul.`,
        job?.order_id
      );
    }
    return NextResponse.json({ success: true });
  }

  if (status === 'DONE') {
    const documentUrls = body.documentUrls ?? (body.documentUrl ? [body.documentUrl] : []);
    const { data: updated, error } = await supabase
      .from('ancpi_jobs')
      .update({
        status: 'DONE',
        document_url: documentUrls[0] ?? null,
        chitanta_url: body.chitantaUrl ?? null,
        registration_number: body.registrationNumber ?? null,
        ...(body.ancpiOrderId ? { ancpi_order_id: body.ancpiOrderId } : {}),
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
    if (updated?.order_id) {
      await deliverAncpiResult(updated.order_id, documentUrls, body.registrationNumber, body.chitantaUrl);
    }
    await logAncpiEvent(
      supabase,
      jobId,
      'done',
      `Document descărcat din ANCPI, atașat comenzii + email trimis${body.registrationNumber ? ` (${body.registrationNumber})` : ''}.`,
      updated?.order_id
    );
    return NextResponse.json({ success: true });
  }

  // FAILED / NEEDS_OPERATOR — record the error and bump retry count.
  const { data: job } = await supabase
    .from('ancpi_jobs')
    .select('retry_count, order_id')
    .eq('id', jobId)
    .maybeSingle();

  const { error } = await supabase
    .from('ancpi_jobs')
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
  await logAncpiEvent(
    supabase,
    jobId,
    status === 'NEEDS_OPERATOR' ? 'needs_operator' : 'failed',
    body.errorMessage ?? undefined,
    job?.order_id
  );
  if (status === 'NEEDS_OPERATOR' && job?.order_id) {
    await notifyClientDelay(supabase, job.order_id).catch(() => {});
  }
  return NextResponse.json({ success: true });
}

/**
 * Best-effort "we're processing your request" reassurance email when a job needs
 * a human (paid but not yet delivered) or is taking longer than expected.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function notifyClientDelay(supabase: any, orderId: string): Promise<void> {
  const { data: order } = await supabase
    .from('orders')
    .select('friendly_order_id, customer_data')
    .eq('id', orderId)
    .maybeSingle();
  const email = order?.customer_data?.contact?.email;
  if (!email) return;
  const oid = order.friendly_order_id ?? '';
  await sendEmail({
    to: email,
    subject: `Comanda ${oid} — în procesare`,
    html: brandedEmailHtml({
      preheader: `Comanda ${oid} este în procesare la ANCPI`,
      content: `
        <h1 style="margin:0 0 6px;color:#0B1B33;font-size:20px;">Comanda ta este în procesare</h1>
        <p style="margin:0 0 18px;color:#475569;font-size:14px;line-height:1.6;">Bună ziua! Cererea ta de extras de carte funciară este în curs de procesare la ANCPI. Revenim cu documentul pe email în cel mai scurt timp.</p>
        ${infoRows([{ label: 'Comandă', value: oid, mono: true }])}`,
    }),
    text: `Bună ziua! Cererea ta de extras de carte funciară (${oid}) este în curs de procesare la ANCPI. Revenim cu documentul pe email în cel mai scurt timp.`,
  });
}
