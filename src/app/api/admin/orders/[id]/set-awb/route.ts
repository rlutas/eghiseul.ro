/**
 * POST /api/admin/orders/[id]/set-awb — manually record a courier AWB.
 *
 * For shipments the platform can't generate automatically (DHL / Poșta /
 * international, or email-orders upgraded to physical delivery via an extra
 * payment). Sets delivery_tracking_number (+ tracking URL, auto-built for
 * known couriers) and logs an `awb_created` history event — the client's
 * status page picks the tracking card up automatically.
 *
 * Body: { awb: string, courier?: 'dhl' | 'posta' | string, trackingUrl?: string }
 * Auth: orders.manage.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { shouldMarkShippedOnAwb } from '@/lib/orders/shipping-status';

interface RouteParams {
  params: Promise<{ id: string }>;
}

function defaultTrackingUrl(courier: string | null, awb: string): string | null {
  const c = (courier ?? '').toLowerCase();
  if (c.includes('dhl')) {
    return `https://www.dhl.com/ro-ro/home/tracking/tracking-express.html?submit=1&tracking-id=${encodeURIComponent(awb)}`;
  }
  if (c.includes('posta')) {
    // Internațional (format UPU S10, ex. RN755687985RO): trackerul Poștei
    // răspunde „nu a fost încă înregistrată în baza de date poștală" pe toată
    // durata tranzitului — evenimentele reale vin de la poșta de DESTINAȚIE,
    // prin UPU, pe care posta-romana.ro nu le afișează (raportat de echipă
    // 04.08.2026 pe RN755687985RO: parcelsapp arăta vamă + 2 încercări de
    // livrare în Elveția, Poșta nimic). parcelsapp agregă UPU + poșta de
    // destinație și are deep-link stabil per AWB.
    if (/^[A-Z]{2}\d{9}RO$/i.test(awb)) {
      return `https://parcelsapp.com/en/tracking/${encodeURIComponent(awb)}`;
    }
    // Intern: awb.html a fost retras (soft-404 cu status 200, 30.07.2026);
    // track-trace.html e trackerul oficial curent și citește ?awb= din URL.
    return `https://www.posta-romana.ro/track-trace.html?awb=${encodeURIComponent(awb)}`;
  }
  // Fan/Sameday au generare automată, dar AWB-ul poate ajunge aici când aceasta
  // eșuează (ex. locker fără ID) sau când echipa l-a emis din contul curierului.
  // Fără link, clientul ar vedea doar un număr pe pagina de status.
  if (c.includes('sameday') || c.includes('easybox')) {
    return `https://sameday.ro/#awb=${encodeURIComponent(awb)}`;
  }
  if (c.includes('fan')) {
    return `https://www.fancourier.ro/awb-tracking/?awb=${encodeURIComponent(awb)}`;
  }
  return null;
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

  let body: { awb?: unknown; courier?: unknown; trackingUrl?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_BODY', message: 'JSON body required' } },
      { status: 400 }
    );
  }
  const awb = typeof body.awb === 'string' ? body.awb.trim() : '';
  if (awb.length < 5 || awb.length > 60) {
    return NextResponse.json(
      { success: false, error: { code: 'BAD_AWB', message: 'AWB-ul trebuie să aibă între 5 și 60 de caractere' } },
      { status: 400 }
    );
  }
  const courier = typeof body.courier === 'string' ? body.courier.trim() : null;
  const trackingUrl =
    typeof body.trackingUrl === 'string' && /^https?:\/\//i.test(body.trackingUrl)
      ? body.trackingUrl.trim()
      : defaultTrackingUrl(courier, awb);

  const admin = createAdminClient();
  const { data: order, error: fetchErr } = await admin
    .from('orders')
    .select('id, order_number, friendly_order_id, delivery_tracking_number, status')
    .eq('id', id)
    .single();
  if (fetchErr || !order) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } },
      { status: 404 }
    );
  }

  // AWB salvat manual = colet plecat, exact ca la generarea automată Fan/Sameday
  // (care trece comanda pe `shipped`). Fără asta, comenzile DHL/Poșta rămâneau
  // în starea veche deși aveau AWB, iar echipa le muta de mână.
  const previousStatus = (order as { status?: string }).status ?? null;
  const shouldShip = shouldMarkShippedOnAwb(previousStatus);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateErr } = await (admin.from('orders') as any)
    .update({
      delivery_tracking_number: awb,
      delivery_tracking_url: trackingUrl,
      ...(courier ? { courier_provider: courier } : {}),
      ...(shouldShip ? { status: 'shipped', shipped_at: new Date().toISOString() } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (updateErr) {
    return NextResponse.json(
      { success: false, error: { code: 'DB_UPDATE_FAILED', message: updateErr.message } },
      { status: 500 }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (admin.from('order_history') as any).insert({
    order_id: id,
    event_type: 'awb_created',
    changed_by: user.email ?? 'admin',
    notes: `AWB introdus manual${courier ? ` (${courier.toUpperCase()})` : ''}: ${awb}${
      order.delivery_tracking_number ? ` · înlocuiește ${order.delivery_tracking_number}` : ''
    }`,
  });

  if (shouldShip) {
    // `status_changed` — NU `status_change`: constrângerea CHECK de pe
    // order_history.event_type respinge varianta la singular, iar inserarea ar
    // eșua tăcut (fără await pe eroare), lăsând timeline-ul fără tranziție.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin.from('order_history') as any).insert({
      order_id: id,
      event_type: 'status_changed',
      changed_by: user.email ?? 'admin',
      notes: 'Comanda a fost expediată (AWB introdus manual)',
      // obiecte, nu string-uri JSON — convenția coloanelor jsonb din
      // /process (timeline-ul citește `new_value.status`)
      old_value: { status: previousStatus },
      new_value: { status: 'shipped' },
    });
  }

  return NextResponse.json({
    success: true,
    data: { awb, trackingUrl, status: shouldShip ? 'shipped' : previousStatus },
  });
}
