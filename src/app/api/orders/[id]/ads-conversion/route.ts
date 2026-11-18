/**
 * POST /api/orders/[id]/ads-conversion
 *
 * The success page calls this right after it sent the Google Ads conversion
 * through the tag. It stamps `attribution.ads_tag_sent_at` on the order, so
 * the offline-conversion export knows this sale is already at Google and
 * does not upload it a second time.
 *
 * Public by design, like the success page itself: the order id is an
 * unguessable UUID, the order must already be paid, and the only effect is
 * one timestamp written once.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return NextResponse.json({ success: false, error: 'INVALID_ID' }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { data: order, error } = await admin.from('orders').select('id, paid_at, attribution').eq('id', id).maybeSingle();
  if (error || !order) return NextResponse.json({ success: false, error: 'NOT_FOUND' }, { status: 404 });
  if (!order.paid_at) return NextResponse.json({ success: false, error: 'NOT_PAID' }, { status: 409 });

  const attribution = (order.attribution && typeof order.attribution === 'object' ? order.attribution : {}) as Record<string, unknown>;
  if (attribution.ads_tag_sent_at) return NextResponse.json({ success: true, data: { already: true } });

  const { error: updateError } = await admin
    .from('orders')
    .update({ attribution: { ...attribution, ads_tag_sent_at: new Date().toISOString() } })
    .eq('id', id);
  if (updateError) {
    console.error('[ads-conversion] could not stamp the order:', updateError.message);
    return NextResponse.json({ success: false, error: 'UPDATE_FAILED' }, { status: 500 });
  }
  return NextResponse.json({ success: true, data: { already: false } });
}
