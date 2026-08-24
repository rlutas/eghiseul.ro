/**
 * POST /api/collaborator/orders/[id]/identificare
 *
 * On identificare-imobil / identificare-imobile-proprietar orders the client
 * gives an address or an owner, not a CF — so there is nothing to file at OCPI
 * until the topograph identifies the property. He reports what he found here
 * (county, UAT, CF number, optionally the cadastral number), and from that
 * moment the order has an extras-CF cerere (Anexa 6) generated exactly like on
 * an extras-CF order: after identification he needs the CF extract to deliver.
 *
 * Stored under `customer_data.identified_property` — NEVER over the client's
 * own `property` fields: what the client typed stays the client's, what he
 * identified stays his, and the cerere reads only from his report.
 *
 * Re-postable: identification is a correction-friendly fact, a second call
 * overwrites the first (and the history keeps both).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireCollaboratorForOrder } from '@/lib/admin/permissions';
import { resolveCollaboratorContext } from '@/lib/admin/collaborator-context';
import { IDENTIFICARE_SLUGS } from '@/lib/ancpi/cerere-scope';
import { resolveJudetId } from '@/lib/ancpi/judete';

const MAX_FIELD = 80;

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
    const county = ((body?.county as string) ?? '').trim();
    const locality = ((body?.locality as string) ?? '').trim();
    const carteFunciara = ((body?.carteFunciara as string) ?? '').trim();
    const cadastral = ((body?.cadastral as string) ?? '').trim();

    for (const [label, value] of [['județul', county], ['UAT-ul', locality], ['nr. CF', carteFunciara], ['nr. cadastral', cadastral]] as const) {
      if (value.length > MAX_FIELD) {
        return NextResponse.json(
          { success: false, error: `${label} are maxim ${MAX_FIELD} caractere` },
          { status: 400 }
        );
      }
    }
    if (!county || !locality || (!carteFunciara && !cadastral)) {
      return NextResponse.json(
        { success: false, error: 'Completează județul, UAT-ul și nr. CF (sau nr. cadastral) identificat' },
        { status: 400 }
      );
    }
    // Antetul cererii (OCPI/BCPI) se construiește din județ — unul liber ar
    // produce un antet inexistent pe o cerere depusă.
    if (resolveJudetId(county) === null) {
      return NextResponse.json(
        { success: false, error: 'Județul nu e din nomenclatorul ANCPI' },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;

    const { data: order } = await admin
      .from('orders')
      .select('id, friendly_order_id, customer_data, services:service_id(slug)')
      .eq('id', orderId)
      .single();
    if (!order) {
      return NextResponse.json({ success: false, error: 'Comanda nu există' }, { status: 404 });
    }

    const svc = Array.isArray(order.services) ? order.services[0] : order.services;
    if (!(IDENTIFICARE_SLUGS as readonly string[]).includes(svc?.slug ?? '')) {
      return NextResponse.json(
        { success: false, error: 'Identificarea se raportează doar pe comenzile de identificare imobil' },
        { status: 400 }
      );
    }

    const { data: profile } = await admin
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', collaboratorId)
      .single();
    const who = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ')
      || profile?.email
      || 'colaborator';

    const identified = {
      county,
      locality,
      carteFunciara,
      cadastral,
      identifiedBy: profile?.email ?? who,
      identifiedAt: new Date().toISOString(),
    };

    const { error: updateError } = await admin
      .from('orders')
      .update({
        customer_data: { ...(order.customer_data ?? {}), identified_property: identified },
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);
    if (updateError) {
      console.error('[collaborator] identificare update error:', updateError.message);
      return NextResponse.json({ success: false, error: 'Identificarea nu a putut fi salvată' }, { status: 500 });
    }

    // event_type values are CHECK-constrained — 'note_added' is in the list.
    await admin.from('order_history').insert({
      order_id: orderId,
      event_type: 'note_added',
      changed_by: `colaborator: ${who}`,
      notes: `Imobil identificat: CF ${carteFunciara || '—'}${cadastral ? `, cad. ${cadastral}` : ''}, ${locality}, jud. ${county}. Cererea de extras CF se generează din aceste date.`,
    });

    return NextResponse.json({ success: true, data: { identified_property: identified } });
  } catch (error) {
    console.error('[collaborator] identificare error:', error);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}
