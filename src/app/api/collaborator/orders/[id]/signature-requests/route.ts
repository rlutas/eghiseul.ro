/**
 * Documente de semnat — the topograph side (same contract as the admin route).
 * Only on orders assigned to him; the admin preview (`?as=`) reads, never writes.
 */
import { NextRequest } from 'next/server';
import { collaboratorActor } from '@/lib/signature-requests/auth';
import { handleCancel, handleCreate, handleList } from '@/lib/signature-requests/handlers';

export const runtime = 'nodejs';

interface RouteParams {
  params: Promise<{ id: string }>;
}


export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const auth = await collaboratorActor(request, id, false);
  if ('error' in auth) return auth.error;
  return handleList(id, auth.actor);
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const auth = await collaboratorActor(request, id, true);
  if ('error' in auth) return auth.error;
  return handleCreate(id, await request.json().catch(() => ({})), auth.actor);
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const auth = await collaboratorActor(request, id, true);
  if ('error' in auth) return auth.error;
  return handleCancel(id, request.nextUrl.searchParams.get('requestId'), auth.actor);
}
