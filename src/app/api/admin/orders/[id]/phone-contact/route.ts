/**
 * POST /api/admin/orders/[id]/phone-contact
 *
 * Marchează o comandă abandonată/draft ca "sunată de echipă". Bifa e
 * suprascrisă la fiecare apel (fără istoric de încercări — decizie
 * 2026-09-14): `phone_contacted_at`/`_by`/`_notes` țin doar ultimul apel.
 * Log complet rămâne în `order_history` (`event_type='phone_contact_logged'`)
 * pentru audit, chiar dacă UI-ul arată doar ultima stare.
 *
 * Authentication: requires `orders.manage` permission.
 * Body: `{ notes?: string }` (opțional, max 2000 caractere).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';

const MAX_NOTES_LENGTH = 2000;

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

  let body: { notes?: string } = {};
  try {
    body = await request.json();
  } catch {
    // body optional — bifă fără notă e validă
  }

  const rawNotes = typeof body.notes === 'string' ? body.notes : '';
  const notes = rawNotes.trim().slice(0, MAX_NOTES_LENGTH) || null;

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single();
  const changedBy = profile?.email ?? user.email ?? 'admin';
  const now = new Date().toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: order, error: updateError } = await (admin.from('orders') as any)
    .update({
      phone_contacted_at: now,
      phone_contacted_by: changedBy,
      phone_contact_notes: notes,
    })
    .eq('id', id)
    .select('id, friendly_order_id')
    .single();

  if (updateError) {
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_FAILED', message: updateError.message } },
      { status: 500 }
    );
  }

  const { error: historyError } = await admin.from('order_history').insert({
    order_id: id,
    event_type: 'phone_contact_logged',
    changed_by: changedBy,
    notes: notes ? `Contactat telefonic: ${notes}` : 'Contactat telefonic',
  });
  if (historyError) {
    console.error('[phone-contact] order_history insert failed:', historyError);
  }

  return NextResponse.json({ success: true, data: order });
}
