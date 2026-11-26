/**
 * GET /api/orders/[id]/signature-requests?token= — what the CLIENT has to
 * sign on this order (status page card „Documente de semnat") and what he
 * already signed. Access: the order-client token or the owner's session
 * (same gate as the message thread).
 */
import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { authorizeOrderClient } from '@/lib/orders/message-access';
import { listSignatureRequests } from '@/lib/signature-requests/service';
import { SIGNABLE_DOCUMENTS, IDENTITY_KEYS } from '@/lib/signature-requests/documents';

export const runtime = 'nodejs';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await authorizeOrderClient(id, request.nextUrl.searchParams.get('token'));
  if ('error' in auth) return auth.error;

  const requests = await listSignatureRequests(createAdminClient(), id);
  return NextResponse.json({
    success: true,
    data: {
      requests: requests
        .filter((r) => r.status !== 'cancelled')
        .map((r) => ({
          id: r.id,
          status: r.status,
          documents: r.kinds.map((k) => ({
            kind: k,
            label: SIGNABLE_DOCUMENTS[k].label,
            description: SIGNABLE_DOCUMENTS[k].description,
          })),
          askIdentity: r.ask_identity,
          // Only the identity values travel back: the client completes them.
          identity: r.ask_identity ? Object.fromEntries(IDENTITY_KEYS.map((k) => [k, r.fields[k] ?? ''])) : null,
          note: r.note,
          createdAt: r.created_at,
          signedAt: r.signed_at,
        })),
    },
  });
}
