/**
 * POST /api/admin/orders/[id]/notes
 *
 * Add an internal note to an order WITHOUT a status transition. Stored as a
 * row in `order_history` with `event_type='note_added'`, so the timeline
 * shows it alongside real workflow events but the "Note Echipă" card in the
 * UI filters out `system-*` changed_by values to surface only human notes.
 *
 * Pairs with `PATCH /api/admin/orders/[id]` which also writes to
 * order_history when status changes (with a `note` field). Use the dedicated
 * endpoint here when you only want to attach text — no transition.
 *
 * Authentication: requires `orders.manage` permission.
 * Body: `{ note: string }` (required, min 1 char after trim, max 5000 chars).
 *
 * Mirror of `cazierjudiciaronline.com/api/admin/orders/[id]/notes`.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

const MAX_NOTE_LENGTH = 5000;

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }

  try {
    await requirePermission(user.id, 'orders.manage');
  } catch (error) {
    if (error instanceof Response) return error;
    throw error;
  }

  let body: { note?: string } = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_BODY', message: 'JSON body required' } },
      { status: 400 }
    );
  }

  const note = (body.note ?? '').trim();
  if (!note) {
    return NextResponse.json(
      { success: false, error: { code: 'EMPTY_NOTE', message: 'Nota nu poate fi goală' } },
      { status: 400 }
    );
  }
  if (note.length > MAX_NOTE_LENGTH) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NOTE_TOO_LONG',
          message: `Nota poate avea maxim ${MAX_NOTE_LENGTH} caractere`,
        },
      },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Resolve the admin's email for `changed_by` (used by the UI to filter
  // human notes from system-cron entries).
  const { data: profile } = await admin
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single();
  const changedBy = profile?.email ?? user.email ?? 'admin';

  const { data, error } = await admin
    .from('order_history')
    .insert({
      order_id: id,
      event_type: 'note_added',
      changed_by: changedBy,
      notes: note,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INSERT_FAILED', message: error.message } },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data });
}
