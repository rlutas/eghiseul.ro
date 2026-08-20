/**
 * POST /api/collaborator/orders/[id]/depunere
 *
 * The topograph reports that he filed the cerere at OCPI: the registration
 * number he got back and what the eliberare cost us. Moves the order to
 * "Trimis instituție" so the client's status page stops saying nothing is
 * happening, and books the fee as a supplier cost (ANCPI / taxă instituție) so
 * the margin per order stays real.
 *
 * Re-postable: the number and the cost are corrections, not new events — a
 * second call updates the cost row instead of double-booking the fee.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireCollaboratorForOrder } from '@/lib/admin/permissions';
import { resolveCollaboratorContext } from '@/lib/admin/collaborator-context';
import { SUPPLIER_ANCPI } from '@/lib/admin/supplier-costs';

const MAX_REG_LENGTH = 60;
const MAX_COST_RON = 5000;

/** Statuses from which filing at OCPI is the next step forward. */
const BEFORE_SUBMISSION = ['paid', 'processing', 'documents_generated', 'standby'];

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
    try {
      ({ collaboratorId } = await resolveCollaboratorContext(
        user.id,
        request.nextUrl.searchParams.get('as')
      ));
      await requireCollaboratorForOrder(collaboratorId, orderId);
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const body = await request.json().catch(() => ({}));
    const registrationNumber = ((body?.registrationNumber as string) ?? '').trim();
    const rawCost = body?.costRon;
    const costRon = rawCost === '' || rawCost === null || rawCost === undefined ? null : Number(rawCost);

    if (registrationNumber.length > MAX_REG_LENGTH) {
      return NextResponse.json(
        { success: false, error: `Numărul de înregistrare are maxim ${MAX_REG_LENGTH} caractere` },
        { status: 400 }
      );
    }
    if (costRon !== null && (!Number.isFinite(costRon) || costRon < 0 || costRon > MAX_COST_RON)) {
      return NextResponse.json(
        { success: false, error: `Costul trebuie să fie între 0 și ${MAX_COST_RON} lei` },
        { status: 400 }
      );
    }
    if (!registrationNumber && costRon === null) {
      return NextResponse.json(
        { success: false, error: 'Completează numărul de înregistrare sau costul' },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;

    const { data: order } = await admin
      .from('orders')
      .select('id, friendly_order_id, status')
      .eq('id', orderId)
      .single();
    if (!order) {
      return NextResponse.json({ success: false, error: 'Comanda nu există' }, { status: 404 });
    }

    const { data: profile } = await admin
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', collaboratorId)
      .single();
    const who = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')
      || profile?.email
      || 'colaborator';

    if (costRon !== null) {
      const description = `Taxă OCPI extras CF ${order.friendly_order_id ?? ''}`.trim();
      const { data: existing } = await admin
        .from('order_supplier_costs')
        .select('id')
        .eq('order_id', orderId)
        .eq('supplier', SUPPLIER_ANCPI)
        .eq('category', 'taxa_institutie')
        .maybeSingle();

      const { error: costError } = existing
        ? await admin
            .from('order_supplier_costs')
            .update({ amount_ron: costRon, description, recorded_by: profile?.email ?? who })
            .eq('id', existing.id)
        : await admin.from('order_supplier_costs').insert({
            order_id: orderId,
            supplier: SUPPLIER_ANCPI,
            category: 'taxa_institutie',
            description,
            amount_ron: costRon,
            recorded_by: profile?.email ?? who,
          });

      if (costError) {
        console.error('[collaborator] depunere cost error:', costError.message);
        return NextResponse.json({ success: false, error: 'Costul nu a putut fi salvat' }, { status: 500 });
      }
    }

    const noteParts = [
      registrationNumber
        ? `Cerere depusă la OCPI — nr. înregistrare ${registrationNumber}.`
        : 'Cerere depusă la OCPI.',
      costRon !== null ? `Cost eliberare: ${costRon.toFixed(2)} lei.` : null,
    ].filter(Boolean);

    // event_type values are CHECK-constrained — 'note_added' is in the list, a
    // new one would need a migration and would fail silently without it.
    // changed_by is a human-readable author string (migration 094).
    await admin.from('order_history').insert({
      order_id: orderId,
      event_type: 'note_added',
      changed_by: `colaborator: ${who}`,
      notes: noteParts.join(' '),
    });

    if (BEFORE_SUBMISSION.includes(order.status)) {
      await admin
        .from('orders')
        .update({ status: 'submitted_to_institution', updated_at: new Date().toISOString() })
        .eq('id', orderId);

      await admin.from('order_history').insert({
        order_id: orderId,
        event_type: 'status_changed',
        changed_by: `colaborator: ${who}`,
        notes: 'Cerere depusă la OCPI',
        old_value: { status: order.status },
        new_value: { status: 'submitted_to_institution' },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[collaborator] depunere error:', error);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}
