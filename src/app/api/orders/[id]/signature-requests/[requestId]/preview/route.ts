/**
 * POST /api/orders/[id]/signature-requests/[requestId]/preview
 * Body: { token?, kind, identity? } → the document as PDF, exactly as it will
 * be signed (with the identity the client typed, when the request asks for it).
 */
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { authorizeOrderClient } from '@/lib/orders/message-access';
import { getSignatureRequest, effectiveFields } from '@/lib/signature-requests/service';
import { renderPreview } from '@/lib/signature-requests/handlers';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; requestId: string }> }
) {
  const { id, requestId } = await params;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const auth = await authorizeOrderClient(id, body.token);
  if ('error' in auth) return auth.error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const req = await getSignatureRequest(admin, id, requestId);
  if (!req || req.status === 'cancelled') {
    return NextResponse.json({ success: false, error: 'Cererea nu mai există' }, { status: 404 });
  }
  const kind = req.kinds.find((k) => k === body.kind);
  if (!kind) return NextResponse.json({ success: false, error: 'Document necunoscut' }, { status: 400 });

  const { data: order } = await admin
    .from('orders')
    .select('id, friendly_order_id, order_number, platform')
    .eq('id', id)
    .single();
  return renderPreview(order, kind, effectiveFields(req, body.identity));
}
