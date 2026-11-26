/** POST { kind, fields } → the unsigned document as PDF. */
import { NextRequest } from 'next/server';
import { handlePreview } from '@/lib/signature-requests/handlers';
import { collaboratorActor } from '@/lib/signature-requests/auth';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = await collaboratorActor(request, id, false);
  if ('error' in auth) return auth.error;
  return handlePreview(id, await request.json().catch(() => ({})));
}
