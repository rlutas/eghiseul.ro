/**
 * POST /api/admin/orders/[id]/messages/files — presigned upload for a file the
 * team attaches to a message for the client (PDF/JPG/PNG/WebP, ≤ 10 MB).
 * Requires `orders.manage`, same as posting the message.
 *
 * Body: { contentType, fileSize, filename? }
 * Returns: { uploadUrl, key, name, mimeType, size }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requirePermission } from '@/lib/admin/permissions';
import { presignStaffMessageFile } from '@/lib/orders/message-files-presign';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ success: false, error: 'Autentificare necesară' }, { status: 401 });
  }
  try {
    await requirePermission(user.id, 'orders.manage');
  } catch (e) {
    if (e instanceof Response) return e;
    throw e;
  }
  const payload = await request.json().catch(() => ({}));
  return presignStaffMessageFile(id, payload);
}
