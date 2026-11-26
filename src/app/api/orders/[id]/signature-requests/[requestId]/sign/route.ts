/**
 * POST /api/orders/[id]/signature-requests/[requestId]/sign
 * Body: { token?, signatureBase64, identity?, identityFiles?, consent: { documentsRead, signatureConsent } }
 *
 * The client signs once on screen; the signature goes into every document of
 * the request. Audit: IP, user agent, timestamp, consent and the SHA-256 of
 * each signed file (src/lib/signature-requests/service.ts).
 */
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { authorizeOrderClient } from '@/lib/orders/message-access';
import { signSignatureRequest } from '@/lib/signature-requests/service';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; requestId: string }> }
) {
  const { id, requestId } = await params;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const auth = await authorizeOrderClient(id, body.token);
  if ('error' in auth) return auth.error;

  const consent = (body.consent ?? {}) as Record<string, unknown>;
  const result = await signSignatureRequest(createAdminClient(), {
    orderId: id,
    requestId,
    signatureBase64: typeof body.signatureBase64 === 'string' ? body.signatureBase64 : '',
    identity: body.identity,
    identityFiles: body.identityFiles,
    consent: { documentsRead: consent.documentsRead === true, signatureConsent: consent.signatureConsent === true },
    ip:
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
  });
  if (!result.ok) return NextResponse.json({ success: false, error: result.error }, { status: result.status });
  return NextResponse.json({ success: true, data: result.data });
}
