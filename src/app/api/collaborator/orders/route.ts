import { NextRequest, NextResponse } from 'next/server';
import { unreadClientMessageCounts } from '@/lib/orders/messages';
import { COLLAB_HIDDEN_STATUSES } from '@/lib/collaborator/hidden-statuses';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getCollaboratorServices } from '@/lib/admin/permissions';
import { resolveCollaboratorContext } from '@/lib/admin/collaborator-context';

/**
 * Lists orders for the services assigned to the authenticated collaborator.
 * Scoping is by service_id via collaborator_service_assignments. Only PAID
 * orders are relevant for fulfilment — drafts, coșuri abandonate și comenzile
 * neplătite nu-l privesc pe colaborator (nu are ce lucra la ele).
 *
 * `?as=<collaboratorId>` = preview de admin (vezi collaborator-context.ts).
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    let collaboratorId: string;
    try {
      ({ collaboratorId } = await resolveCollaboratorContext(user.id, searchParams.get('as')));
    } catch (e) {
      if (e instanceof Response) return e;
      throw e;
    }

    const serviceIds = await getCollaboratorServices(collaboratorId);

    const status = searchParams.get('status');

    // Scope: orders of the collaborator's services OR orders sent to them
    // explicitly from admin (assigned_collaborator_id — e.g. identificare
    // orders the internal team couldn't solve).
    const scopeFilter = serviceIds.length > 0
      ? `service_id.in.(${serviceIds.join(',')}),assigned_collaborator_id.eq.${collaboratorId}`
      : `assigned_collaborator_id.eq.${collaboratorId}`;

    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (admin as any)
      .from('orders')
      .select('id, friendly_order_id, status, created_at, priority, service_id, customer_data, services:service_id(name, slug)')
      .or(scopeFilter)
      // Doar comenzi plătite: draft/pending/abandoned = coșuri neplătite, nu lucrări.
      .eq('payment_status', 'paid')
      // Anulările nu sunt lucrări: E-260915-M4A4V a apărut la topograf DUPĂ ce
      // clientul ceruse anularea (payment_status rămâne 'paid' până la refund),
      // iar el a lucrat-o degeaba. Scoase din listă și din pagina de detaliu.
      .not('status', 'in', `(${COLLAB_HIDDEN_STATUSES.join(',')})`)
      // Marcate urgent întâi (client nemulțumit), apoi cea mai veche: clientul
      // care așteaptă de o lună are prioritate, iar colaboratorul lucrează de
      // sus în jos fără să caute prin listă.
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(200);

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) {
      console.error('[collaborator] list orders error:', error.message);
      return NextResponse.json({ success: false, error: 'Eroare la încărcarea comenzilor' }, { status: 500 });
    }

    // Privacy: the collaborator gets ONLY the work data (property). Client
    // contact/billing/personal never leave the server on this endpoint.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sanitized = (data ?? []).map((o: any) => ({
      ...o,
      customer_data: {
        property: o.customer_data?.property ?? null,
        // Identificarea raportată de colaborator — din ea se numără cererile
        // de depus pe comenzile de identificare imobil.
        identified_property: o.customer_data?.identified_property ?? null,
        // Nr. de depunere OCPI raportat de el — după el caută comanda când
        // ridică documentul de la ghișeu.
        ocpi_submission: o.customer_data?.ocpi_submission ?? null,
      },
    }));

    // Răspunsuri necitite de la clienți — badge „mesaj nou” în listă.
    const unread = await unreadClientMessageCounts(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      sanitized.map((o: any) => o.id)
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const withUnread = sanitized.map((o: any) => ({ ...o, unread_messages: unread[o.id] ?? 0 }));

    return NextResponse.json({ success: true, data: withUnread });
  } catch (error) {
    console.error('[collaborator] list orders error:', error);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}
