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
    // Preview-ul de admin e STRICT READ-ONLY: costul și istoricul s-ar semna
    // fals pe numele colaboratorului.
    if (preview) {
      return NextResponse.json(
        { success: false, error: 'Previzualizarea e doar pentru citire' },
        { status: 403 }
      );
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
      .select('id, friendly_order_id, status, customer_data, services:service_id(name)')
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
      const svc = Array.isArray(order.services) ? order.services[0] : order.services;
      const description = `Taxă OCPI ${svc?.name ?? ''} ${order.friendly_order_id ?? ''}`
        .replace(/\s+/g, ' ')
        .trim();
      // Doar rândul înregistrat de EL, nu tot ce e pe comandă: echipa poate
      // adăuga din admin taxe separate (o comandă cu două imobile are două
      // rânduri de 20 lei), iar `maybeSingle()` peste toate ar da eroare pe
      // „multiple rows" și i-ar refuza salvarea.
      const recordedBy = profile?.email ?? who;
      const { data: existingRows } = await admin
        .from('order_supplier_costs')
        .select('id')
        .eq('order_id', orderId)
        .eq('supplier', SUPPLIER_ANCPI)
        .eq('category', 'taxa_institutie')
        .eq('recorded_by', recordedBy)
        .order('created_at', { ascending: true })
        .limit(1);
      let existing = existingRows?.[0] ?? null;

      // Rândul auto de la livrarea directă (upload-pdf/autoBookAncpiCost) e
      // tot „al lui", dar recorded_by poate diferi (fallback la fetch de
      // profil eșuat) — fără verificarea asta, un post ulterior de depunere
      // ar insera AL DOILEA rând și ar dubla costul pe marjă.
      if (!existing) {
        const { data: autoRows } = await admin
          .from('order_supplier_costs')
          .select('id')
          .eq('order_id', orderId)
          .eq('supplier', SUPPLIER_ANCPI)
          .eq('category', 'taxa_institutie')
          .like('description', '%(auto, livrare directă)%')
          .order('created_at', { ascending: true })
          .limit(1);
        existing = autoRows?.[0] ?? null;
      }

      const { error: costError } = existing
        ? await admin
            .from('order_supplier_costs')
            .update({ amount_ron: costRon, description, recorded_by: recordedBy })
            .eq('id', existing.id)
        : await admin.from('order_supplier_costs').insert({
            order_id: orderId,
            supplier: SUPPLIER_ANCPI,
            category: 'taxa_institutie',
            description,
            amount_ron: costRon,
            recorded_by: recordedBy,
          });

      if (costError) {
        console.error('[collaborator] depunere cost error:', costError.message);
        return NextResponse.json({ success: false, error: 'Costul nu a putut fi salvat' }, { status: 500 });
      }
    }

    // Numărul de depunere OCPI se salvează PE COMANDĂ, nu doar în istoric:
    // după el caută topograful comanda peste 2 zile, când OCPI îi eliberează
    // documentul și tot ce are în mână e numărul de înregistrare.
    if (registrationNumber) {
      // Re-citim customer_data chiar înainte de scriere: de la SELECT-ul de
      // sus au trecut mai multe drumuri la DB, iar spread-ul peste o citire
      // veche ar suprascrie ce a intrat între timp (ex. identified_property).
      const { data: fresh } = await admin
        .from('orders')
        .select('customer_data')
        .eq('id', orderId)
        .single();
      const { error: regErr } = await admin
        .from('orders')
        .update({
          customer_data: {
            ...((fresh?.customer_data ?? order.customer_data) ?? {}),
            ocpi_submission: {
              registration_number: registrationNumber,
              submitted_at: new Date().toISOString(),
              by: who,
            },
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);
      if (regErr) {
        // Numărul e exact ce caută el peste 2 zile — o pierdere tăcută aici
        // ar însemna comandă negăsibilă. Costul (dacă a fost trimis) e deja
        // salvat; re-postarea e corecție, nu dublare.
        console.error('[collaborator] depunere reg-number save error:', regErr.message);
        return NextResponse.json(
          { success: false, error: 'Numărul de înregistrare nu a putut fi salvat — reîncearcă' },
          { status: 500 }
        );
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
