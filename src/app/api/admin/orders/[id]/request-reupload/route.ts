/**
 * POST /api/admin/orders/[id]/request-reupload
 *
 * "Solicită documente": creates a single-use, expiring link through which the
 * customer uploads one or more documents (selfie, CI, pașaport, certificat
 * firmă...) after the order was placed, and emails it to them. Triggered from
 * the admin order page. The link points at /reincarca-poza/<token>.
 *
 * Side effects:
 *   - any previous still-pending request for the order is cancelled (one
 *     active link per order keeps the customer flow unambiguous);
 *   - the order is parked in status='standby' (SLA paused via
 *     standby_started_at) when its current status allows it; the pre-standby
 *     status is stored on the request (`return_status`) and restored
 *     automatically when the customer finishes uploading.
 *
 * Body: { documentTypes?: string[]; documentType?: string; reason?: string }
 *       (documentTypes preferred; single documentType kept for backward compat;
 *        defaults to ['selfie'])
 * Auth: `orders.manage` permission required.
 *
 * Returns the link + expiry so the admin UI can also copy it / share it on
 * WhatsApp (we don't have a WhatsApp API — the operator sends it manually).
 */

import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/admin/permissions';
import { sendEmail } from '@/lib/email/resend';
import {
  buildReuploadSubject,
  buildReuploadHtml,
  buildReuploadText,
} from '@/lib/email/templates/reupload-request';
import {
  isKnownReuploadDocType,
  reuploadDocLabel,
  STANDBY_ELIGIBLE_STATUSES,
} from '@/lib/reupload/doc-types';
import { enterStandby } from '@/lib/orders/standby';

export const runtime = 'nodejs';

const TOKEN_TTL_DAYS = 7;

export async function POST(
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
    try {
      await requirePermission(user.id, 'orders.manage');
    } catch (error) {
      if (error instanceof Response) return error;
      throw error;
    }

    const body = await request.json().catch(() => ({}));
    const reason = typeof body?.reason === 'string' ? body.reason.trim() || null : null;

    let documentTypes: string[] = Array.isArray(body?.documentTypes)
      ? body.documentTypes.filter((t: unknown): t is string => typeof t === 'string')
      : [];
    if (documentTypes.length === 0 && typeof body?.documentType === 'string') {
      documentTypes = [body.documentType];
    }
    if (documentTypes.length === 0) documentTypes = ['selfie'];
    documentTypes = [...new Set(documentTypes)];

    const unknown = documentTypes.filter((t) => !isKnownReuploadDocType(t));
    if (unknown.length > 0) {
      return NextResponse.json(
        { success: false, error: `Tip de document necunoscut: ${unknown.join(', ')}` },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data: order, error: fetchErr } = await admin
      .from('orders')
      .select('id, friendly_order_id, order_number, status, customer_data')
      .eq('id', orderId)
      .single();
    if (fetchErr || !order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const customerData = (order.customer_data as any) ?? {};
    const email: string | undefined = customerData?.contact?.email;
    const firstName: string | null =
      customerData?.personal?.first_name ??
      customerData?.personalData?.firstName ??
      customerData?.personalData?.first_name ??
      null;

    // One active link per order: cancel any previous still-pending request so
    // an older emailed link can't race the new one. Keep its return_status —
    // if the order is ALREADY in standby (because of that previous request),
    // the new request must remember the original pre-standby status, or the
    // order would stay parked forever after completion.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: cancelledPrev } = await (admin as any)
      .from('reupload_requests')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('order_id', orderId)
      .eq('status', 'pending')
      .select('return_status');

    // Park the order in standby (SLA paused) while we wait on the customer.
    // Remember where it was so completion can restore it automatically.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentStatus = (order as any).status as string;
    const inheritedReturnStatus: string | null =
      currentStatus === 'standby'
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ((cancelledPrev as any[])?.find((r) => r.return_status)?.return_status ?? null)
        : null;
    const shouldStandby = STANDBY_ELIGIBLE_STATUSES.has(currentStatus);
    const returnStatus = shouldStandby ? currentStatus : inheritedReturnStatus;

    // Opaque, URL-safe token. 32 random bytes → ~43 base64url chars.
    const token = randomBytes(32).toString('base64url');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: inserted, error: insertErr } = await (admin as any)
      .from('reupload_requests')
      .insert({
        order_id: orderId,
        document_type: documentTypes[0],
        document_types: documentTypes,
        token,
        token_expires_at: expiresAt.toISOString(),
        status: 'pending',
        reason,
        requested_by: user.id,
        return_status: returnStatus,
      })
      .select('id')
      .single();
    if (insertErr) {
      console.error('[request-reupload] insert failed:', insertErr);
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
    const reuploadUrl = `${base}/reincarca-poza/${token}`;
    const expiresLabel = expiresAt.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const documentLabels = documentTypes.map((t) => reuploadDocLabel(t));

    let emailSent = false;
    if (email) {
      const emailInput = {
        customerFirstName: firstName,
        orderNumber: order.friendly_order_id || order.order_number || orderId,
        documentLabels,
        reason,
        reuploadUrl,
        expiresLabel,
      };
      const res = await sendEmail({
        to: email,
        subject: buildReuploadSubject(emailInput),
        html: buildReuploadHtml(emailInput),
        text: buildReuploadText(emailInput),
        idempotencyKey: `reupload-${inserted.id}`,
      });
      emailSent = !res.skipped;
    }

    // Audit
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('order_history').insert({
      order_id: orderId,
      event_type: 'reupload_requested',
      changed_by: user.id,
      new_value: {
        documentTypes,
        reuploadRequestId: inserted.id,
        emailSent,
        reason,
        standby: shouldStandby,
        returnStatus,
      },
      notes: `Solicitare documente: ${documentLabels.join(', ')}${emailSent ? ' (email trimis)' : ''}${shouldStandby ? ' — comandă în așteptare client (SLA pauzat)' : ''}`,
    });

    return NextResponse.json({
      success: true,
      data: {
        reuploadRequestId: inserted.id,
        token,
        reuploadUrl,
        expiresAt: expiresAt.toISOString(),
        emailSent,
        documentTypes,
        standby: shouldStandby,
      },
    });
  } catch (error) {
    console.error('[request-reupload] error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
