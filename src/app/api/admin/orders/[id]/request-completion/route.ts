/**
 * POST /api/admin/orders/[id]/request-completion
 *
 * Comenzi telefonice: după plată, trimite clientului link-ul personalizat de
 * COMPLETARE (/completare/[token]) — actele (CI + selfie, din
 * verification_config.personalKyc, cu override) + semnătura pe contract.
 *
 * Reuse integral al infrastructurii reupload_requests: token unic, TTL 7 zile,
 * un singur link activ per comandă, auto-standby cu return_status.
 * Diferențele față de "Solicită documente": flow='completion',
 * require_email_confirm=true (gate anti-forwarding), signature_required.
 *
 * Body: { documentTypes?: string[] }  — override; [] = doar semnătura.
 * Auth: orders.manage.
 */
import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { sendEmail } from '@/lib/email/resend';
import {
  buildCompletionRequestSubject,
  buildCompletionRequestHtml,
  buildCompletionRequestText,
} from '@/lib/email/templates/completion-request';
import {
  isKnownReuploadDocType,
  reuploadDocLabel,
  suggestedDocsForService,
  STANDBY_ELIGIBLE_STATUSES,
} from '@/lib/reupload/doc-types';
import { enterStandby } from '@/lib/orders/standby';

export const runtime = 'nodejs';

const TOKEN_TTL_DAYS = 7;

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient();
    const { id: orderId } = await params;
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }
    try {
      await requirePermission(user.id, 'orders.manage');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const body = await request.json().catch(() => ({}));

    const admin = createAdminClient();
    const { data: order, error: fetchErr } = await admin
      .from('orders')
      .select('id, friendly_order_id, order_number, status, payment_status, customer_data, services(name, verification_config)')
      .eq('id', orderId)
      .single();
    if (fetchErr || !order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const o = order as any;

    // Completarea vine DUPĂ plată — înainte, clientul are link-ul de plată.
    if (o.payment_status !== 'paid') {
      return NextResponse.json(
        { success: false, error: 'Comanda nu e plătită — trimite întâi link-ul de plată.' },
        { status: 409 }
      );
    }

    const customerData = o.customer_data ?? {};
    const email: string | undefined = customerData?.contact?.email;
    if (!email) {
      return NextResponse.json({ success: false, error: 'Comanda nu are email de contact.' }, { status: 400 });
    }
    const firstName: string | null =
      customerData?.contact?.firstName ?? customerData?.personal?.firstName ?? null;

    // Documentele cerute: override din body sau sugestia serviciului
    // (identity_card + selfie din personalKyc). [] explicit = doar semnătura.
    let documentTypes: string[];
    if (Array.isArray(body?.documentTypes)) {
      const provided = (body.documentTypes as unknown[]).filter((t): t is string => typeof t === 'string');
      documentTypes = [...new Set(provided)];
    } else {
      documentTypes = suggestedDocsForService(o.services?.verification_config);
    }
    const unknown = documentTypes.filter((t) => !isKnownReuploadDocType(t));
    if (unknown.length > 0) {
      return NextResponse.json(
        { success: false, error: `Tip de document necunoscut: ${unknown.join(', ')}` },
        { status: 400 }
      );
    }

    const signatureRequired = !customerData?.signature_s3_key && !customerData?.signature_base64;
    if (documentTypes.length === 0 && !signatureRequired) {
      return NextResponse.json(
        { success: false, error: 'Comanda are deja semnătura, iar niciun document nu a fost cerut — nimic de completat.' },
        { status: 400 }
      );
    }

    // Un singur link activ per comandă + moștenirea return_status dacă e deja
    // în standby de la o cerere anterioară (logica din request-reupload).
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: cancelledPrev } = await (admin as any)
      .from('reupload_requests')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .select('return_status');

    const currentStatus = o.status as string;
    const inheritedReturnStatus: string | null =
      currentStatus === 'standby'
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((cancelledPrev as any[])?.find((r) => r.return_status)?.return_status ?? null)
        : null;
    const shouldStandby = STANDBY_ELIGIBLE_STATUSES.has(currentStatus);
    const returnStatus = shouldStandby ? currentStatus : inheritedReturnStatus;

    const token = randomBytes(32).toString('base64url');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: inserted, error: insertErr } = await (admin as any)
      .from('reupload_requests')
      .insert({
        order_id: orderId,
        document_type: documentTypes[0] ?? 'selfie',
        document_types: documentTypes,
        token,
        token_expires_at: expiresAt.toISOString(),
        status: 'pending',
        reason: 'Completare comandă telefonică',
        requested_by: user.id,
        return_status: returnStatus,
        flow: 'completion',
        require_email_confirm: true,
        signature_required: signatureRequired,
      })
      .select('id')
      .single();
    if (insertErr) {
      console.error('[request-completion] insert failed:', insertErr);
      return NextResponse.json({ success: false, error: 'Nu am putut crea cererea' }, { status: 500 });
    }

    if (shouldStandby) {
      const standby = enterStandby(now);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (admin as any)
        .from('orders')
        .update({
          status: 'standby',
          standby_started_at: standby.standby_started_at,
          updated_at: now.toISOString(),
        })
        .eq('id', orderId);
    }

    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://eghiseul.ro';
    const completionUrl = `${base}/completare/${token}`;
    const expiresLabel = expiresAt.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' });
    const documentLabels = documentTypes.map((t) => reuploadDocLabel(t));

    const emailInput = {
      customerFirstName: firstName,
      orderNumber: o.friendly_order_id || o.order_number || orderId,
      serviceName: o.services?.name || 'Serviciu eGhișeul',
      documentLabels,
      signatureRequired,
      completionUrl,
      expiresLabel,
    };
    const res = await sendEmail({
      to: email,
      subject: buildCompletionRequestSubject(emailInput),
      html: buildCompletionRequestHtml(emailInput),
      text: buildCompletionRequestText(emailInput),
      idempotencyKey: `completion-${inserted.id}`,
    });
    const emailSent = !res.skipped;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('order_history').insert({
      order_id: orderId,
      event_type: 'reupload_requested',
      changed_by: user.id,
      new_value: {
        flow: 'completion',
        documentTypes,
        signatureRequired,
        reuploadRequestId: inserted.id,
        emailSent,
        standby: shouldStandby,
        returnStatus,
      },
      notes: `Link completare trimis clientului: ${[...documentLabels, ...(signatureRequired ? ['Semnătură'] : [])].join(', ')}${emailSent ? ' (email trimis)' : ''}${shouldStandby ? ' — comandă în așteptare client' : ''}`,
    });

    return NextResponse.json({
      success: true,
      data: {
        completionRequestId: inserted.id,
        completionUrl,
        expiresAt: expiresAt.toISOString(),
        emailSent,
        documentTypes,
        signatureRequired,
        standby: shouldStandby,
      },
    });
  } catch (error) {
    console.error('[request-completion] error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
