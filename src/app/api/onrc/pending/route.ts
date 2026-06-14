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

  // Oldest PENDING job.
  const { data: candidate } = await supabase
    .from('onrc_jobs')
    .select('id')
    .eq('status', 'PENDING')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!candidate) {
    return NextResponse.json({ success: true, data: null });
  }

  // Atomic claim — only the winner of PENDING -> PROCESSING gets the row back.
  const { data: claimed } = await supabase
    .from('onrc_jobs')
    .update({ status: 'PROCESSING', locked_at: now, last_attempt_at: now, updated_at: now })
    .eq('id', candidate.id)
    .eq('status', 'PENDING')
    .select('id, order_id, document_type, cui, company_name, detail')
    .maybeSingle();

  if (!claimed) {
    // Lost the race to another poll — tell the worker to try again.
    return NextResponse.json({ success: true, data: null });
  }

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
    },
  });
}
