import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireCollaboratorForOrder } from '@/lib/admin/permissions';
import { resolveCollaboratorContext } from '@/lib/admin/collaborator-context';
import { cereriForOrder, type OrderForCereri } from '@/lib/ancpi/cereri-for-order';
import { cerereDateRo } from '@/lib/ancpi/cerere-date';
import { CERERE_CF_SLUG } from '@/lib/ancpi/cerere-scope';

/**
 * Single order detail for the collaborator: customer + property data needed to
 * do the work, plus any documents already attached. Scope is enforced by
 * requireCollaboratorForOrder (order's service must be assigned to this user).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: orderId } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
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

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: order, error } = await (admin as any)
      .from('orders')
      .select('id, friendly_order_id, status, payment_status, created_at, service_id, customer_data, selected_options, services:service_id(name, slug, processing_config)')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ success: false, error: 'Comanda nu a fost găsită' }, { status: 404 });
    }

    // Coșurile neplătite (draft/pending/abandonate) nu sunt lucrări: nici prin
    // link direct nu trebuie să ajungă la colaborator.
    if (order.payment_status !== 'paid') {
      return NextResponse.json({ success: false, error: 'Comanda nu a fost găsită' }, { status: 404 });
    }

    const deliverable = order.services?.processing_config?.deliverable || null;

    // Only the collaborator's own uploads — the rest of the order's documents
    // (contract, cerere) carry client personal data and aren't his work.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: documents } = await (admin as any)
      .from('order_documents')
      .select('id, type, file_name, file_size, mime_type, visible_to_client, metadata, created_at')
      .eq('order_id', orderId)
      .eq('metadata->>source', 'collaborator')
      .order('created_at', { ascending: false });

    // Convenția („angajament de execuție documentație") face excepție de la
    // regula de mai sus: e contractul dintre CLIENT și EXECUTANT, deci
    // colaboratorul e parte în ea și are nevoie de exemplarul lui semnat —
    // fără el nu poate cere date din arhiva BCPI și nu poate depune
    // documentația în numele proprietarului.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: conventii } = await (admin as any)
      .from('order_documents')
      .select('id, type, file_name, file_size, mime_type, visible_to_client, metadata, created_at')
      .eq('order_id', orderId)
      .eq('type', 'conventie')
      .order('created_at', { ascending: false });

    // Privacy: only the work data (property) reaches the collaborator —
    // contact/billing/personal client data stays server-side. ownerName/address
    // inside property ARE the object of the work on identificare services.
    const sanitizedOrder = {
      ...order,
      customer_data: { property: order.customer_data?.property ?? null },
    };

    // Cererile de depus la OCPI (Anexa 6), una per imobil. Doar numele +
    // indexul — PDF-ul se generează la descărcare, din aceleași date, ca
    // denumirea și conținutul să nu poată diverge.
    const cereri = order.services?.slug === CERERE_CF_SLUG
      ? cereriForOrder(
          {
            friendly_order_id: order.friendly_order_id ?? orderId,
            customer_data: order.customer_data as OrderForCereri['customer_data'],
          },
          cerereDateRo()
        ).map(({ index, name }) => ({ index, name }))
      : [];

    return NextResponse.json({
      success: true,
      data: {
        ...sanitizedOrder,
        deliverable,
        documents: documents ?? [],
        conventii: conventii ?? [],
        cereri,
      },
    });
  } catch (error) {
    console.error('[collaborator] order detail error:', error);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}
