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

export const dynamic = 'force-dynamic';

const TERMINAL = ['DONE', 'FAILED', 'NEEDS_OPERATOR'] as const;
type ResultStatus = (typeof TERMINAL)[number];

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
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON' }, { status: 400 });
  }

  const { jobId, status } = body;
  if (!jobId || !status || !TERMINAL.includes(status)) {
    return NextResponse.json({ success: false, error: 'jobId and a valid status are required' }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createAdminClient() as any;
  const now = new Date().toISOString();

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
    .select('retry_count')
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
  return NextResponse.json({ success: true });
}
