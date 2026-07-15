import { exitStandby } from '@/lib/orders/standby';
import { sendEmail } from '@/lib/email/resend';
import {
  buildReuploadCompletedSubject,
  buildReuploadCompletedHtml,
  buildReuploadCompletedText,
} from '@/lib/email/templates/reupload-completed';
import { reuploadDocLabel } from '@/lib/reupload/doc-types';
import { ORGANIZATION } from '@/lib/seo/constants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyObj = Record<string, any>;

export interface FinalizableRequest {
  id: string;
  order_id: string;
  return_status: string | null;
  flow?: string | null;
}

/**
 * On the last upload (and, for the completion flow, the signature): restore
 * the order from standby to its pre-request status (SLA shifted by the paused
 * business days) and notify the team inbox. For flow='completion' also
 * (re)generates the order documents so contracts now embed the signature —
 * the Barou contract generated at payment time was UNSIGNED for phone orders
 * (deterministic S3 keys overwrite; Barou allocation is idempotent).
 *
 * Everything best-effort — a failure here must never fail the client's call.
 */
export async function finalizeReuploadRequest(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  req: FinalizableRequest,
  order: AnyObj | null,
  types: string[],
  nowIso: string
) {
  let restoredStatus: string | null = null;
  try {
    if (req.return_status && order?.status === 'standby' && order?.standby_started_at) {
      const exit = exitStandby({
        standby_started_at: order.standby_started_at,
        standby_total_seconds: order.standby_total_seconds ?? 0,
        estimated_completion_date: order.estimated_completion_date ?? null,
      });
      await admin
        .from('orders')
        .update({
          status: req.return_status,
          standby_started_at: exit.standby_started_at,
          standby_total_seconds: exit.standby_total_seconds,
          estimated_completion_date: exit.estimated_completion_date,
          updated_at: nowIso,
        })
        .eq('id', req.order_id);
      restoredStatus = req.return_status;

      await admin.from('order_history').insert({
        order_id: req.order_id,
        event_type: 'status_changed',
        old_value: { status: 'standby' },
        new_value: { status: req.return_status, pausedBusinessDays: exit.pausedBusinessDays },
        notes: `Documente primite de la client — comanda a revenit din așteptare (SLA +${exit.pausedBusinessDays} zile lucrătoare)`,
      });
    }
  } catch (err) {
    console.error('[reupload] standby exit failed (continuing):', err);
  }

  // Completion flow: regenerate documents WITH the signature the client just
  // drew. Fail-soft — the hourly barou cron re-sweeps misses.
  if (req.flow === 'completion') {
    try {
      const { autoGenerateOrderDocuments } = await import('@/lib/documents/auto-generate');
      await autoGenerateOrderDocuments(req.order_id, null, 'post-payment');
    } catch (err) {
      console.error('[reupload] completion document regeneration failed (continuing):', err);
    }
  }

  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://eghiseul.ro';
    const orderNumber: string = order?.friendly_order_id || order?.order_number || req.order_id;
    const input = {
      orderNumber,
      adminOrderUrl: `${base}/admin/orders/${req.order_id}`,
      documentLabels: [
        ...types.map((t) => reuploadDocLabel(t)),
        ...(req.flow === 'completion' ? ['Semnătură'] : []),
      ],
      restoredStatus,
    };
    await sendEmail({
      to: ORGANIZATION.contactPoint.email,
      subject: buildReuploadCompletedSubject(input),
      html: buildReuploadCompletedHtml(input),
      text: buildReuploadCompletedText(input),
      idempotencyKey: `reupload-completed-${req.id}`,
    });
  } catch (err) {
    console.error('[reupload] team notification failed (continuing):', err);
  }
}
