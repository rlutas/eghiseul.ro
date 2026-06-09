/**
 * POST /api/admin/orders/[id]/request-reupload
 *
 * Creates a single-use, expiring link that lets the customer re-upload a KYC
 * photo (currently the selfie) after the order was placed, and emails it to
 * them. The operator triggers this from the admin order page when a photo is
 * wrong/unclear. The link points at /reincarca-poza/<token>.
 *
 * Body: { documentType?: 'selfie'; reason?: string }  (documentType defaults to 'selfie')
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

export const runtime = 'nodejs';

const TOKEN_TTL_DAYS = 7;
const DOC_LABELS: Record<string, string> = {
  selfie: 'selfie cu actul de identitate',
};

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
    const documentType = (body?.documentType as string) || 'selfie';
    const reason = typeof body?.reason === 'string' ? body.reason.trim() || null : null;
    if (documentType !== 'selfie') {
      return NextResponse.json(
        { success: false, error: 'Doar reîncărcarea selfie-ului este suportată momentan' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data: order, error: fetchErr } = await admin
      .from('orders')
      .select('id, friendly_order_id, customer_data')
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

    // Opaque, URL-safe token. 32 random bytes → ~43 base64url chars.
    const token = randomBytes(32).toString('base64url');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: inserted, error: insertErr } = await (admin as any)
      .from('reupload_requests')
      .insert({
        order_id: orderId,
        document_type: documentType,
        token,
        token_expires_at: expiresAt.toISOString(),
        status: 'pending',
        reason,
        requested_by: user.id,
      })
      .select('id')
      .single();
    if (insertErr) {
      console.error('[request-reupload] insert failed:', insertErr);
      return NextResponse.json({ success: false, error: 'Nu am putut crea cererea' }, { status: 500 });
    }

    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://eghiseul.ro';
    const reuploadUrl = `${base}/reincarca-poza/${token}`;
    const expiresLabel = expiresAt.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    let emailSent = false;
    if (email) {
      const emailInput = {
        customerFirstName: firstName,
        orderNumber: order.friendly_order_id || orderId,
        documentLabel: DOC_LABELS[documentType] || documentType,
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
      new_value: { documentType, reuploadRequestId: inserted.id, emailSent, reason },
      notes: `Cerere reîncărcare ${DOC_LABELS[documentType] || documentType}${emailSent ? ' (email trimis)' : ''}`,
    });

    return NextResponse.json({
      success: true,
      data: { reuploadRequestId: inserted.id, token, reuploadUrl, expiresAt: expiresAt.toISOString(), emailSent },
    });
  } catch (error) {
    console.error('[request-reupload] error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
