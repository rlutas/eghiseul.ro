/**
 * Attach a payment proof to a bank-transfer order — the ONE path for a proof
 * that arrives with the checkout selection and for one uploaded later from
 * the status page (feedback 18.09.2026 #25, Codex rounds 1–5).
 *
 *   1. the upload key must be the order's own presigned namespace and the
 *      object must exist, be ≤ 10 MB (else deleted + refused);
 *   2. the object is COPIED to an immutable key named after its ETag — the
 *      presigned key can be overwritten until the presign expires, the copy
 *      cannot (never presigned);
 *   3. `attach_payment_proof()` (migration 180) records order + history +
 *      event atomically, keyed by content digest: a replay is 'unchanged';
 *   4. the team heads-up is sent once per proof (`team_notified_at`), and a
 *      crash between attach and send is healed on the next retry.
 */

import { createHash } from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';
import { copyFile, deleteFile, generateProofFinalKey, getFileInfo, isOrderUploadKey, isProofFinalKey } from '@/lib/aws/s3';
import { sendEmail } from '@/lib/email/resend';
import {
  buildBankTransferAdminSubject,
  buildBankTransferAdminHtml,
  buildBankTransferAdminText,
} from '@/lib/email/templates/bank-transfer-pending';

export const PAYMENT_PROOF_MAX_BYTES = 10 * 1024 * 1024;

export type AttachOutcome = 'attached' | 'unchanged' | 'not_awaiting' | 'invalid_key' | 'missing_object' | 'too_large' | 'error';

function extensionOf(key: string, contentType?: string): string {
  const fromKey = /\.([a-z0-9]+)$/i.exec(key)?.[1]?.toLowerCase();
  if (fromKey) return fromKey === 'jpeg' ? 'jpg' : fromKey;
  if (contentType?.includes('pdf')) return 'pdf';
  if (contentType?.includes('png')) return 'png';
  if (contentType?.includes('webp')) return 'webp';
  return 'jpg';
}

export async function attachPaymentProof(input: {
  orderId: string;
  uploadKey: string;
  changedBy: string | null;
}): Promise<{ outcome: AttachOutcome; eventId?: string; finalKey?: string }> {
  const { orderId, uploadKey, changedBy } = input;
  // A key we already attached (a retry with the final key) is accepted as-is.
  const isFinal = isProofFinalKey(uploadKey, orderId);
  if (!isFinal && !isOrderUploadKey(uploadKey, orderId)) return { outcome: 'invalid_key' };

  let finalKey = uploadKey;
  let digest: string;
  try {
    const info = await getFileInfo(uploadKey);
    if (!(info.size > 0)) return { outcome: 'missing_object' };
    if (info.size > PAYMENT_PROOF_MAX_BYTES) {
      try { await deleteFile(uploadKey); } catch { /* best effort */ }
      return { outcome: 'too_large' };
    }
    digest = info.etag || createHash('sha256').update(`${uploadKey}:${info.size}:${info.lastModified.toISOString()}`).digest('hex');
    if (!isFinal) {
      finalKey = generateProofFinalKey(orderId, digest.replace(/[^a-f0-9-]/gi, ''), extensionOf(uploadKey, info.contentType));
      await copyFile(uploadKey, finalKey);
    }
  } catch (err) {
    const code = (err as { name?: string })?.name;
    if (code === 'NotFound' || code === 'NoSuchKey') return { outcome: 'missing_object' };
    console.error(`[payment-proof] S3 step failed for ${orderId}:`, err instanceof Error ? err.message : err);
    return { outcome: 'error' };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { data, error } = await admin.rpc('attach_payment_proof', {
    p_order_id: orderId,
    p_key: finalKey,
    p_digest: digest,
    p_changed_by: changedBy,
  });
  if (error) {
    console.error(`[payment-proof] attach_payment_proof failed for ${orderId}:`, error.message);
    return { outcome: 'error' };
  }
  const result = (data ?? {}) as { outcome?: string; event_id?: string };
  const outcome = (result.outcome as AttachOutcome | undefined) ?? 'error';
  if (outcome !== 'attached' && outcome !== 'unchanged') return { outcome };

  // Team heads-up, once per proof; healed on retry when a previous send died.
  if (result.event_id) await notifyTeamOfProof(orderId, result.event_id, digest);
  return { outcome, eventId: result.event_id, finalKey };
}

async function notifyTeamOfProof(orderId: string, eventId: string, digest: string): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const admin = createAdminClient() as any;
  const { data: event } = await admin
    .from('payment_proof_events')
    .select('id, team_notified_at')
    .eq('id', eventId)
    .maybeSingle();
  if (!event || event.team_notified_at) return;

  const { data: order } = await admin
    .from('orders')
    .select('id, friendly_order_id, order_number, total_price, customer_data, services(name)')
    .eq('id', orderId)
    .single();
  if (!order) return;
  const cd = (order.customer_data || {}) as Record<string, Record<string, string>>;
  const service = Array.isArray(order.services) ? order.services[0] : order.services;
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://eghiseul.ro';
  const adminInput = {
    orderNumber: order.friendly_order_id || order.order_number || orderId,
    serviceName: service?.name || 'Serviciu eGhișeul.ro',
    amountRon: Number(order.total_price) || 0,
    customerEmail: cd?.contact?.email || '(lipsă)',
    customerPhone: cd?.contact?.phone || null,
    hasProof: true,
    adminUrl: `${base}/admin/orders/${orderId}`,
  };
  try {
    const sent = await sendEmail({
      to: process.env.ADMIN_NOTIFY_EMAIL || 'contact@eghiseul.ro',
      subject: buildBankTransferAdminSubject(adminInput),
      html: buildBankTransferAdminHtml(adminInput),
      text: buildBankTransferAdminText(adminInput),
      idempotencyKey: `bank-transfer-proof-${orderId}-${digest.slice(0, 16)}`,
    });
    // A skipped send (no RESEND_API_KEY) is not a send: leave the event
    // unmarked so the next retry delivers it (Codex REV2-CODE-006).
    if (sent.skipped) {
      console.warn(`[payment-proof] team email skipped for ${orderId}: ${sent.reason ?? 'unknown'}`);
      return;
    }
    await admin.rpc('mark_payment_proof_notified', { p_event_id: eventId });
  } catch (e) {
    // Not marked → the next retry (checkout or status page) sends it.
    console.error(`[payment-proof] team email failed for ${orderId} (will retry):`, e instanceof Error ? e.message : e);
  }
}
