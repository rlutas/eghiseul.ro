/**
 * Documente de semnat — the team side.
 *   GET    → catalog + prefill from the order + the order's requests (orders.view)
 *   POST   → { kinds, fields, askIdentity, note } creates a request; the client
 *            gets a message + email (orders.manage)
 *   DELETE → ?requestId= cancels a pending request (orders.manage)
 * Logic: src/lib/signature-requests/handlers.ts (shared with the collaborator).
 */
import { NextRequest } from 'next/server';
import { staffActor } from '@/lib/signature-requests/auth';
import { handleCancel, handleCreate, handleList } from '@/lib/signature-requests/handlers';

export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{ id: string }>;
}


export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const auth = await staffActor('orders.view');
  if ('error' in auth) return auth.error;
  return handleList(id, auth.actor);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const auth = await staffActor('orders.manage');
  if ('error' in auth) return auth.error;
  return handleCreate(id, await request.json().catch(() => ({})), auth.actor);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const auth = await staffActor('orders.manage');
  if ('error' in auth) return auth.error;
  return handleCancel(id, request.nextUrl.searchParams.get('requestId'), auth.actor);
}
