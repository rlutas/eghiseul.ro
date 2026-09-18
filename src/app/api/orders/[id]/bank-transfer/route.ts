import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/resend';
import { attachPaymentProof } from '@/lib/orders/attach-payment-proof';
import { verifyPaymentProofToken } from '@/lib/orders/payment-proof-token';
import {
  buildBankTransferPendingSubject,
  buildBankTransferPendingHtml,
  buildBankTransferPendingText,
  buildBankTransferAdminSubject,
  buildBankTransferAdminHtml,
  buildBankTransferAdminText,
} from '@/lib/email/templates/bank-transfer-pending';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/orders/[id]/bank-transfer
 *
 * Clientul alege plata prin transfer bancar (IBAN). Dovada de plată e
 * OPȚIONALĂ — 10.09.2026: până acum ruta se apela doar dacă exista dovadă
 * încărcată, deci cine pleca să plătească din aplicația băncii nu era
 * înregistrat nicăieri. Comanda rămânea `pending`, cronul auto-abandon o
 * trecea pe `abandoned` după 30 de minute și clientul nu primea niciun email
 * (caz real: E-260905-DMUZA, bani încasați pe o comandă „abandonată").
 *
 * Rezultat: `status='awaiting_payment'` + `payment_status='awaiting_verification'`
 * (cronul auto-abandon filtrează pe `pending`, deci nu o mai atinge), email cu
 * datele contului către client și heads-up către echipă. Confirmarea încasării
 * o face un operator din admin („Confirmă plata"), care declanșează factura,
 * documentele și emailul de confirmare.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const rawProofKey: string | null = typeof body?.paymentProofKey === 'string' && body.paymentProofKey ? body.paymentProofKey : null;
    const proofOnly = body?.proofOnly === true;
    const proofToken: unknown = body?.proofToken;

    const supabase = await createClient();
    // Citirea și scrierea merg pe clientul de serviciu, ca la
    // GET /api/orders/[id]. Sub RLS ruta asta nu a funcționat NICIODATĂ:
    // politica de SELECT pentru vizitatori acoperă doar `status='draft'`, iar
    // cea de UPDATE la fel — o comandă de checkout e `pending`, deci ruta
    // răspundea „Order not found" chiar și când clientul încărca dovada.
    // De-aia `payment_method` era NULL pe toate comenzile din tabelă.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const adminClient = createAdminClient() as any;

    // Get current user (optional - guests can also submit)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Fetch order
    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .select('id, user_id, status, payment_status, payment_method')
      .eq('id', id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Authorization. A linked order belongs to its owner and nobody else. A
    // guest order: the checkout registration keeps today's rule (the UUID is
    // the bearer), but attaching a proof LATER needs the order-scoped token
    // issued by the status API / order API — a session alone must never let
    // a stranger mutate an unowned order (Codex REV2R2-SEC-002).
    if (order.user_id) {
      if (!user || order.user_id !== user.id) {
        return NextResponse.json({ success: false, error: 'You do not have access to this order' }, { status: 403 });
      }
    } else if (proofOnly && !verifyPaymentProofToken(proofToken, id)) {
      return NextResponse.json({ success: false, error: 'Linkul a expirat. Reîncarcă pagina comenzii și încearcă din nou.' }, { status: 403 });
    }

    if (order.payment_status === 'paid') {
      return NextResponse.json({ success: false, error: 'This order has already been paid' }, { status: 400 });
    }

    const alreadyRegistered = order.payment_status === 'awaiting_verification' && order.status === 'awaiting_payment';

    if (proofOnly) {
      if (!rawProofKey) {
        return NextResponse.json({ success: false, error: 'Lipsește dovada plății.' }, { status: 400 });
      }
      if (!alreadyRegistered) {
        return NextResponse.json({ success: false, error: 'Comanda nu așteaptă o plată prin transfer bancar.' }, { status: 400 });
      }
    } else if (!alreadyRegistered) {
      // Registration: the customer chose the bank transfer at checkout.
      const { error: updateError } = await adminClient
        .from('orders')
        .update({
          payment_method: 'bank_transfer',
          payment_status: 'awaiting_verification',
          // Status dedicat: comanda intră în lista de comenzi pe „Așteptare
          // plată", nu în coșurile abandonate.
          status: 'awaiting_payment',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (updateError) {
        console.error('Failed to update order:', updateError);
        return NextResponse.json({ success: false, error: 'Failed to update order' }, { status: 500 });
      }
      // The registration is its own event; a proof, when there is one, gets
      // `payment_proof_submitted` from the attach workflow below — the
      // timeline used to show „dovadă primită" for an order with no proof.
      await adminClient.from('order_history').insert({
        order_id: id,
        event_type: 'bank_transfer_submitted',
        notes: 'Client a ales plata prin transfer bancar — așteptăm încasarea',
        new_value: {
          payment_method: 'bank_transfer',
          payment_status: 'awaiting_verification',
          status: 'awaiting_payment',
        },
        changed_by: user?.id || null,
      });
      // Emailuri (client + echipă). Fail-soft: dacă Resend cade, comanda rămâne
      // corect înregistrată — nu întoarcem eroare clientului pentru asta.
      try {
        await sendBankTransferEmails(id, !!rawProofKey);
      } catch (e) {
        console.error(`[bank-transfer] emails failed for order ${id} (non-fatal):`, e instanceof Error ? e.message : e);
      }
    }

    // The proof — same workflow whether it came with the registration or later.
    let proofOutcome: string | null = null;
    if (rawProofKey) {
      const attached = await attachPaymentProof({ orderId: id, uploadKey: rawProofKey, changedBy: user?.id || null });
      proofOutcome = attached.outcome;
      const refused: Record<string, string> = {
        invalid_key: 'Dovada plății nu aparține acestei comenzi.',
        missing_object: 'Dovada plății nu a fost găsită. Încarcă fișierul din nou.',
        too_large: 'Fișierul depășește 10 MB. Încarcă o poză mai mică sau un PDF.',
        not_awaiting: 'Comanda nu așteaptă o plată prin transfer bancar.',
        error: 'Nu am putut salva dovada. Încearcă din nou în câteva secunde.',
      };
      if (attached.outcome !== 'attached' && attached.outcome !== 'unchanged') {
        return NextResponse.json({ success: false, error: refused[attached.outcome] ?? refused.error }, { status: attached.outcome === 'error' ? 500 : 400 });
      }
    }

    return NextResponse.json({
      success: true,
      message: proofOnly
        ? 'Am primit dovada plății. O verificăm și pornim lucrul.'
        : 'Comanda a fost înregistrată. Ți-am trimis pe email datele de plată.',
      data: { proof: proofOutcome },
    });
  } catch (error) {
    console.error('Bank transfer submission error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Emailul cu datele contului către client + heads-up către echipă. Datele
 * bancare vin din `admin_settings.bank_details`, aceeași sursă ca ecranul de
 * checkout — fără IBAN configurat nu trimitem un cont inventat.
 */
async function sendBankTransferEmails(orderId: string, hasProof: boolean): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;

  const { data: order } = await admin
    .from('orders')
    .select('id, friendly_order_id, order_number, total_price, customer_data, services(name)')
    .eq('id', orderId)
    .single();
  if (!order) return;

  const { data: bankRow } = await admin
    .from('admin_settings')
    .select('value')
    .eq('key', 'bank_details')
    .maybeSingle();
  const bank = (bankRow?.value || {}) as Record<string, string>;
  const ibanRon = (bank.iban || '').replace(/\s+/g, '');
  const ibanEur = (bank.iban_eur || '').replace(/\s+/g, '');

  const cd = (order.customer_data || {}) as Record<string, Record<string, string>>;
  const email = cd?.contact?.email;
  const phone = cd?.contact?.phone || null;
  const firstName = cd?.contact?.firstName || cd?.personal?.firstName || cd?.billing?.firstName || null;
  const service = Array.isArray(order.services) ? order.services[0] : order.services;
  const serviceName = service?.name || 'Serviciu eGhișeul.ro';
  const friendly = order.friendly_order_id || order.order_number || orderId;
  const amountRon = Number(order.total_price) || 0;
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://eghiseul.ro';

  if (email && (ibanRon || ibanEur)) {
    const input = {
      customerFirstName: firstName,
      orderNumber: friendly,
      serviceName,
      amountRon,
      accountHolder: bank.account_holder || 'EDIGITALIZARE SRL',
      bankName: bank.bank_name || '',
      ibanRon: ibanRon || ibanEur,
      ibanEur: ibanRon ? ibanEur || null : null,
      swift: bank.swift || null,
      statusUrl: `${base}/comanda/status/?order=${encodeURIComponent(friendly)}&email=${encodeURIComponent(email)}`,
      hasProof,
    };
    await sendEmail({
      to: email,
      subject: buildBankTransferPendingSubject(input),
      html: buildBankTransferPendingHtml(input),
      text: buildBankTransferPendingText(input),
      idempotencyKey: `bank-transfer-pending-${orderId}`,
    });
    console.log(`[bank-transfer] instructions sent for ${friendly} → ${email}`);
  } else if (!email) {
    console.error(`[bank-transfer] no contact email on order ${orderId} — customer email skipped`);
  } else {
    console.error('[bank-transfer] bank_details not configured — customer email skipped');
  }

  const adminTo = process.env.ADMIN_NOTIFY_EMAIL || 'contact@eghiseul.ro';
  const adminInput = {
    orderNumber: friendly,
    serviceName,
    amountRon,
    customerEmail: email || '(lipsă)',
    customerPhone: phone,
    hasProof,
    adminUrl: `${base}/admin/orders/${orderId}`,
  };
  await sendEmail({
    to: adminTo,
    subject: buildBankTransferAdminSubject(adminInput),
    html: buildBankTransferAdminHtml(adminInput),
    text: buildBankTransferAdminText(adminInput),
    idempotencyKey: `bank-transfer-admin-${orderId}`,
  });
}
