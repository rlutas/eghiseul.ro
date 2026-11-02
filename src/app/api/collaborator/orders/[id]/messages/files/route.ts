/**
 * POST /api/collaborator/orders/[id]/messages/files — presigned upload for a
 * file the topograph attaches to a message for the client (PDF/JPG/PNG/WebP,
 * ≤ 10 MB). Only for an order that is theirs; admin preview is read-only.
 *
 * Body: { contentType, fileSize, filename? }
 * Returns: { uploadUrl, key, name, mimeType, size }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireCollaboratorForOrder } from '@/lib/admin/permissions';
import { resolveCollaboratorContext } from '@/lib/admin/collaborator-context';
import { presignStaffMessageFile } from '@/lib/orders/message-files-presign';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ success: false, error: 'Autentificare necesară' }, { status: 401 });
  }
  try {
    const ctx = await resolveCollaboratorContext(user.id, request.nextUrl.searchParams.get('as'));
    await requireCollaboratorForOrder(ctx.collaboratorId, id);
    if (ctx.preview) {
      return NextResponse.json({ success: false, error: 'Previzualizarea e doar pentru citire' }, { status: 403 });
    }
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }
  const payload = await request.json().catch(() => ({}));
  return presignStaffMessageFile(id, payload);
}
