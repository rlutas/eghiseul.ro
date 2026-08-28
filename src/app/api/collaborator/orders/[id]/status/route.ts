/**
 * POST /api/collaborator/orders/[id]/status
 *
 * The collaborator (topograph) moves the order himself: back to "în lucru",
 * on hold because the client must clarify something, or finalized. He picks
 * from OUR admin statuses — the team sees in admin exactly the status he set,
 * plus a history entry signed "colaborator: <name>" with his note.
 *
 * Deliberately a SUBSET of the admin list: payment/shipping states stay with
 * the team, and terminal money states (cancelled/refunded) are untouchable.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireCollaboratorForOrder } from '@/lib/admin/permissions';
import { resolveCollaboratorContext } from '@/lib/admin/collaborator-context';
import { enterStandby, exitStandby } from '@/lib/orders/standby';

/** Statuses the collaborator may set, with the reason each exists for him. */
// NOT exported: route files may only export HTTP handlers (Next.js constraint);
// the UI keeps its own labeled copy in colaborator/orders/[id]/page.tsx.
const COLLABORATOR_STATUSES = [
  'processing', // o ia (înapoi) în lucru
  'submitted_to_institution', // depusă la OCPI (fără cost/nr — pentru corecții)
  'standby', // lipsesc informații de la client — SLA pauzat, echipa contactează
  'on_hold_institution', // blocat de ANCPI/registru — SLA pauzat, nu e vina clientului
  'document_ready', // documentul e eliberat (ex. încărcat pe altă cale)
  'completed', // lucrare închisă
] as const;

// Ambele pauzează SLA pe aceleași coloane standby_* (vezi ruta de admin).
const PAUSED_STATUSES = ['standby', 'on_hold_institution'];

/**
 * He can never touch an order whose money side is settled or in dispute, nor
 * pull one back once it's physically with the courier / at the client —
 * shipping transitions stay with the team (enforced in admin /process).
 */
const LOCKED_STATUSES = ['cancelled', 'refunded', 'cancellation_requested', 'shipped', 'delivered'];

const MAX_NOTE_LENGTH = 1000;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Autentificare necesară' }, { status: 401 });
    }

    let collaboratorId: string;
    let preview: boolean;
    try {
      ({ collaboratorId, preview } = await resolveCollaboratorContext(
        user.id,
        request.nextUrl.searchParams.get('as')
      ));
      await requireCollaboratorForOrder(collaboratorId, orderId);
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }
    // Preview-ul de admin e STRICT READ-ONLY: altfel istoricul ar semna fals
    // „colaborator: <nume>" pentru o schimbare făcută de admin.
    if (preview) {
      return NextResponse.json(
        { success: false, error: 'Previzualizarea e doar pentru citire' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const status = String(body?.status ?? '');
    const note = ((body?.note as string) ?? '').trim();

    if (!(COLLABORATOR_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json({ success: false, error: 'Status invalid' }, { status: 400 });
    }
    if (note.length > MAX_NOTE_LENGTH) {
      return NextResponse.json(
        { success: false, error: `Nota are maxim ${MAX_NOTE_LENGTH} caractere` },
        { status: 400 }
      );
    }
    // Standby fără explicație e inutilizabil: echipa trebuie să știe CE să
    // ceară clientului, altfel comanda doar stă.
    if (status === 'standby' && !note) {
      return NextResponse.json(
        { success: false, error: 'Scrie ce informații lipsesc de la client' },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;

    const { data: order } = await admin
      .from('orders')
      .select('id, status, standby_started_at, standby_total_seconds, estimated_completion_date')
      .eq('id', orderId)
      .single();
    if (!order) {
      return NextResponse.json({ success: false, error: 'Comanda nu există' }, { status: 404 });
    }
    if (LOCKED_STATUSES.includes(order.status)) {
      return NextResponse.json(
        { success: false, error: 'Comanda e anulată/rambursată — contactează echipa' },
        { status: 400 }
      );
    }
    if (order.status === status && !note) {
      return NextResponse.json({ success: true });
    }

    const { data: profile } = await admin
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', collaboratorId)
      .single();
    const who = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')
      || profile?.email
      || 'colaborator';

    if (order.status !== status) {
      // Pauza de SLA (aceeași mecanică precum în ruta de admin): intrarea
      // într-un status de pauză pornește ceasul, ieșirea îl adună și decalează
      // termenul cu zilele lucrătoare pauzate. Înainte (26-28.08) statusul se
      // scria direct și pauza NU se înregistra — SLA curgea pe comenzi blocate.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updates: Record<string, any> = { status, updated_at: new Date().toISOString() };
      const wasPaused = PAUSED_STATUSES.includes(order.status);
      const isPaused = PAUSED_STATUSES.includes(status);
      if (isPaused && !wasPaused) {
        updates.standby_started_at = enterStandby().standby_started_at;
      } else if (wasPaused && !isPaused && order.standby_started_at) {
        const result = exitStandby({
          standby_started_at: order.standby_started_at,
          standby_total_seconds: order.standby_total_seconds || 0,
          estimated_completion_date: order.estimated_completion_date || null,
        });
        updates.standby_started_at = null;
        updates.standby_total_seconds = result.standby_total_seconds;
        if (result.estimated_completion_date !== order.estimated_completion_date) {
          updates.estimated_completion_date = result.estimated_completion_date;
        }
      }
      const { error: updErr } = await admin
        .from('orders')
        .update(updates)
        .eq('id', orderId);
      if (updErr) {
        console.error('[collaborator] status update error:', updErr.message);
        return NextResponse.json({ success: false, error: 'Statusul nu a putut fi salvat' }, { status: 500 });
      }
    }

    // event_type e CHECK-constrained — 'status_changed' e în listă (vezi
    // depunere/route.ts); o valoare nouă ar eșua TĂCUT fără migrare.
    const { error: histErr } = await admin.from('order_history').insert({
      order_id: orderId,
      event_type: 'status_changed',
      changed_by: `colaborator: ${who}`,
      notes: note || 'Status schimbat de colaborator',
      old_value: { status: order.status },
      new_value: { status },
    });
    if (histErr) console.error('[collaborator] status history insert error:', histErr.message);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[collaborator] status error:', error);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}
