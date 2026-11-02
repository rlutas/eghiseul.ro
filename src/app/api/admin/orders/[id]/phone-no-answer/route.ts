/**
 * POST /api/admin/orders/[id]/phone-no-answer
 *
 * Bifele „Nu a răspuns (1)/(2)" din Recuperare telefonică (cerere echipă
 * 07.10.2026). `add` adaugă o încercare `{ at, caller }` în
 * `orders.phone_no_answer_attempts`; `undo` o scoate pe ULTIMA (bifă greșită).
 * După a doua încercare clientul iese din „De sunat" (vezi priority-calls).
 * NU atinge `phone_contacted_at`: un „nu a răspuns" nu e un apel, deci nu
 * intră în KPI-uri și nu poate „recupera" un client.
 *
 * Authentication: requires `orders.manage` permission.
 * Body: `{ action: 'add' | 'undo', caller: 'Maria' | 'Carla' }`.
 * Response: `{ success, data: { id, attempts: [{ at, caller }] } }`.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { isPhoneCaller, PHONE_CALLERS } from '@/lib/orders/phone-recovery-wins';
import {
  applyNoAnswer,
  isNoAnswerAction,
  NO_ANSWER_LIMIT,
  parseNoAnswerAttempts,
} from '@/lib/orders/phone-no-answer';

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

  let body: { action?: unknown; caller?: unknown } = {};
  try {
    body = await request.json();
  } catch {
    // validated below
  }

  if (!isNoAnswerAction(body.action)) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID', message: 'Acțiune invalidă' } },
      { status: 400 }
    );
  }
  if (!isPhoneCaller(body.caller)) {
    return NextResponse.json(
      { success: false, error: { code: 'INVALID', message: `Alege cine a sunat: ${PHONE_CALLERS.join(' sau ')}` } },
      { status: 400 }
    );
  }
  const action = body.action;
  const caller = body.caller;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;

  const { data: current, error: readError } = await admin
    .from('orders')
    .select('id, phone_no_answer_attempts')
    .eq('id', id)
    .maybeSingle();
  if (readError) {
    console.error('[phone-no-answer] read failed:', readError);
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_FAILED', message: 'Eroare la citirea comenzii' } },
      { status: 500 }
    );
  }
  if (!current) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Comanda nu există' } },
      { status: 404 }
    );
  }

  const before = parseNoAnswerAttempts(current.phone_no_answer_attempts);
  const result = applyNoAnswer(before, action, caller);
  if (!result.ok) {
    return NextResponse.json(
      { success: false, error: { code: 'CONFLICT', message: result.error } },
      { status: 409 }
    );
  }

  const { error: updateError } = await admin
    .from('orders')
    .update({ phone_no_answer_attempts: result.attempts })
    .eq('id', id);
  if (updateError) {
    console.error('[phone-no-answer] update failed:', updateError);
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_FAILED', message: 'Eroare la salvare' } },
      { status: 500 }
    );
  }

  const { data: profile } = await admin.from('profiles').select('email').eq('id', user.id).maybeSingle();
  const changedBy = profile?.email ?? user.email ?? 'admin';
  const historyNotes =
    action === 'add'
      ? `Nu a răspuns la telefon (încercarea ${result.attempts.length}/${NO_ANSWER_LIMIT}) — ${caller}`
      : `Anulată bifa „nu a răspuns" (încercarea ${before.length}/${NO_ANSWER_LIMIT}) — ${caller}`;
  // event_type must be in order_history_event_type_check (migration 194):
  // reuse the phone-contact value, a new one would make the insert fail silently.
  const { error: historyError } = await admin.from('order_history').insert({
    order_id: id,
    event_type: 'phone_contact_logged',
    changed_by: changedBy,
    new_value: { no_answer_attempts: result.attempts.length, action },
    notes: historyNotes,
  });
  if (historyError) {
    console.error('[phone-no-answer] order_history insert failed:', historyError);
  }

  return NextResponse.json({ success: true, data: { id, attempts: result.attempts } });
}
