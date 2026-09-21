/**
 * POST /api/collaborator/orders/[id]/identificare-nereusita
 *
 * The topograph could NOT find the property in e-Terra (by address, on the
 * map, by owner) and files the official ANCPI certificate at OCPI instead:
 * code 2.7.8 (by address, 100 lei) or 2.7.6 (by owner, 125 lei), ~10 working
 * days. From here the order is a normal filing: he records the registration
 * number + fee in the existing "Am depus cererea la OCPI" section, and when
 * the certificate comes back he uploads it. With a CF number he continues
 * with "Am identificat imobilul" (extras CF); negative, the certificate is
 * the deliverable — the complete service, no credit (Raul, 21.09.2026).
 *
 * Before this route the order died in `standby` with a note ("nu s-a putut
 * identifica, are credit"): the client saw "we are waiting on you", got no
 * document and no explanation (12 orders on 21.09.2026).
 *
 * Re-postable: a second call refreshes the report and does not re-email
 * (idempotency key on the order).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireCollaboratorForOrder } from '@/lib/admin/permissions';
import { resolveCollaboratorContext } from '@/lib/admin/collaborator-context';
import { IDENTIFICARE_SLUGS } from '@/lib/ancpi/cerere-scope';
import { addBusinessDays } from '@/lib/delivery-calculator';
import { sendEmail } from '@/lib/email/resend';
import { renderIdentificationPendingOcpiEmail } from '@/lib/email/templates/identification-pending-ocpi';
import { appBaseForOrder, brandForOrder } from '@/lib/brand/for-order';

const STATUS_IDENTIFICATION_PENDING_OCPI = 'identification_pending_ocpi';

/** ANCPI term for 2.7.8 / 2.7.6 (Ordin 16/2019): 10 working days, 3 urgent. */
const OCPI_CERTIFICATE_WORKING_DAYS = 10;
const MAX_NOTE = 500;

/** The order is finished or its money side is settled — nothing to file. */
const LOCKED_STATUSES = [
  'document_ready',
  'shipped',
  'delivered',
  'completed',
  'cancelled',
  'cancellation_requested',
  'refunded',
];

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
    if (preview) {
      return NextResponse.json(
        { success: false, error: 'Previzualizarea e doar pentru citire' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const note = ((body?.note as string) ?? '').trim();
    if (note.length > MAX_NOTE) {
      return NextResponse.json(
        { success: false, error: `Nota are maxim ${MAX_NOTE} caractere` },
        { status: 400 }
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = createAdminClient() as any;

    const { data: order } = await admin
      .from('orders')
      .select('id, friendly_order_id, status, customer_data, platform, services:service_id(name, slug)')
      .eq('id', orderId)
      .single();
    if (!order) {
      return NextResponse.json({ success: false, error: 'Comanda nu există' }, { status: 404 });
    }

    const svc = Array.isArray(order.services) ? order.services[0] : order.services;
    const slug: string = svc?.slug ?? '';
    if (!(IDENTIFICARE_SLUGS as readonly string[]).includes(slug)) {
      return NextResponse.json(
        { success: false, error: 'Se raportează doar pe comenzile de identificare imobil' },
        { status: 400 }
      );
    }
    if (LOCKED_STATUSES.includes(order.status)) {
      return NextResponse.json(
        { success: false, error: 'Comanda e finalizată sau anulată — nu se mai poate depune' },
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

    const byOwner = slug === 'identificare-imobile-proprietar';
    const property = order.customer_data?.property ?? {};
    const county: string = property.county ?? '';
    const searchedFor = byOwner
      ? [property.ownerName, property.locality, county ? `jud. ${county}` : null].filter(Boolean).join(', ')
      : [property.propertyAddress, property.locality, county ? `jud. ${county}` : null].filter(Boolean).join(', ');
    const ocpiLabel = county ? `OCPI ${county}` : 'OCPI';
    const now = new Date();

    const identificationResult = {
      outcome: 'not_found_eterra',
      ancpiServiceCode: byOwner ? '2.7.6' : '2.7.8',
      reportedBy: profile?.email ?? who,
      reportedAt: now.toISOString(),
      note: note || null,
    };

    // Termenul curge: e o depunere, nu o pauză. 10 zile lucrătoare de azi.
    const estimated = addBusinessDays(now, OCPI_CERTIFICATE_WORKING_DAYS).toISOString();

    const { error: updateError } = await admin
      .from('orders')
      .update({
        status: STATUS_IDENTIFICATION_PENDING_OCPI,
        estimated_completion_date: estimated,
        customer_data: { ...(order.customer_data ?? {}), identification_result: identificationResult },
        updated_at: now.toISOString(),
      })
      .eq('id', orderId);
    if (updateError) {
      console.error('[collaborator] identificare-nereusita update error:', updateError.message);
      return NextResponse.json({ success: false, error: 'Nu s-a putut salva' }, { status: 500 });
    }

    // event_type values are CHECK-constrained: 'status_changed' + 'note_added'.
    if (order.status !== STATUS_IDENTIFICATION_PENDING_OCPI) {
      await admin.from('order_history').insert({
        order_id: orderId,
        event_type: 'status_changed',
        changed_by: `colaborator: ${who}`,
        notes: `Imobilul nu apare în e-Terra — certificat ANCPI ${identificationResult.ancpiServiceCode} cerut la ${ocpiLabel}`,
        old_value: { status: order.status },
        new_value: { status: STATUS_IDENTIFICATION_PENDING_OCPI },
      });
    }
    await admin.from('order_history').insert({
      order_id: orderId,
      event_type: 'note_added',
      changed_by: `colaborator: ${who}`,
      notes: `Identificare nereușită în e-Terra (${searchedFor || 'fără date'}). Depus certificat ${identificationResult.ancpiServiceCode} la ${ocpiLabel}, răspuns în ~${OCPI_CERTIFICATE_WORKING_DAYS} zile lucrătoare.${note ? ` Notă: ${note}` : ''}`,
    });

    // Email the client — one per order (idempotency key), brand of the ORDER.
    const email: string | undefined = order.customer_data?.contact?.email;
    let emailSent = false;
    if (email) {
      const brand = brandForOrder(order);
      const appUrl = appBaseForOrder(order);
      const friendly: string = order.friendly_order_id ?? orderId;
      try {
        const mail = renderIdentificationPendingOcpiEmail({
          brand,
          friendlyOrderId: friendly,
          searchedFor: searchedFor || '—',
          ocpiLabel,
          viewUrl: `${appUrl}/comanda/status/?order=${encodeURIComponent(friendly)}&email=${encodeURIComponent(email)}`,
        });
        const result = await sendEmail({
          to: email,
          from: brand.emailFrom,
          subject: mail.subject,
          html: mail.html,
          text: mail.text,
          idempotencyKey: `identification-pending-ocpi-${orderId}`,
        });
        emailSent = !result.skipped;
      } catch (err) {
        // Email failure must not undo the status — the team can write manually.
        console.error('[collaborator] identificare-nereusita email error:', err instanceof Error ? err.message : err);
      }
    }

    return NextResponse.json({
      success: true,
      data: { identification_result: identificationResult, status: STATUS_IDENTIFICATION_PENDING_OCPI, emailSent },
    });
  } catch (error) {
    console.error('[collaborator] identificare-nereusita error:', error);
    return NextResponse.json({ success: false, error: 'Eroare internă' }, { status: 500 });
  }
}
