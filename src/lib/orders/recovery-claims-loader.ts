/**
 * Loads the clients that belong to „Recuperare telefonică" (see
 * recovery-claims.ts for the rule). Used by the unpaid orders list
 * („Abandonuri" / „Neplătite"): clients waiting in „De sunat" or with a
 * „Nu a răspuns" are kept out of it, clients already called stay marked.
 */

import type { createAdminClient } from '@/lib/supabase/admin';
import { buildPaidIndex, type PaidOrderRef } from '@/lib/orders/phone-recovery-wins';
import { parseNoAnswerAttempts } from '@/lib/orders/phone-no-answer';
import {
  buildClaimIndex,
  CLAIM_DAYS,
  isRecoveryQueueCandidate,
  type ClaimReason,
  type ClaimSource,
} from '@/lib/orders/recovery-claims';

/** Same window as the queue (GET /api/admin/orders/priority-calls). */
const QUEUE_DAYS = 30;
const DAY_MS = 86_400_000;

type AdminClient = ReturnType<typeof createAdminClient>;
interface Contact {
  email?: string | null;
  phone?: string | null;
}

export async function loadRecoveryClaimIndex(admin: AdminClient): Promise<Map<string, ClaimReason>> {
  const now = Date.now();
  const queueSince = new Date(now - QUEUE_DAYS * DAY_MS).toISOString();
  // Paid orders only matter after a queue order was started (≥ queueSince),
  // or after a call minus one day of grace.
  const paidSince = new Date(now - (QUEUE_DAYS + 1) * DAY_MS).toISOString();
  const claimSince = new Date(now - CLAIM_DAYS * DAY_MS).toISOString();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orders = admin.from('orders') as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paidTable = admin.from('orders') as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calledTable = admin.from('orders') as any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const noAnswerTable = admin.from('orders') as any;

  const [queueRes, paidRes, calledRes, noAnswerRes] = await Promise.all([
    orders
      .select('status, customer_data:customer_data_list, created_at, phone_contacted_at')
      .in('status', ['abandoned', 'draft'])
      .gte('created_at', queueSince)
      .limit(1000),
    paidTable
      .select('id, total_price, paid_at, email:customer_data->contact->>email')
      .eq('payment_status', 'paid')
      .gte('paid_at', paidSince)
      .limit(5000),
    calledTable
      .select('contact:customer_data->contact')
      .not('phone_contacted_at', 'is', null)
      .gte('phone_contacted_at', claimSince)
      .limit(2000),
    noAnswerTable
      .select('contact:customer_data->contact, phone_no_answer_attempts')
      .neq('phone_no_answer_attempts', '[]')
      .gte('created_at', new Date(now - (CLAIM_DAYS + QUEUE_DAYS) * DAY_MS).toISOString())
      .limit(2000),
  ]);
  for (const r of [queueRes, paidRes, calledRes, noAnswerRes]) {
    if (r.error) console.error('Recovery claims: fetch failed:', r.error.message);
  }

  const paidIndex = buildPaidIndex(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((paidRes.data ?? []) as any[]).map(
      (p): PaidOrderRef => ({
        email: p.email ?? '',
        paidAt: p.paid_at,
        totalRon: Number(p.total_price ?? 0),
        ref: '',
        orderId: p.id,
      })
    )
  );

  const sources: ClaimSource[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const o of (queueRes.data ?? []) as any[]) {
    if (!isRecoveryQueueCandidate(o, paidIndex)) continue;
    const contact = (o.customer_data?.contact ?? {}) as Contact;
    sources.push({ email: contact.email, phone: contact.phone, reason: 'queue' });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const o of (calledRes.data ?? []) as any[]) {
    const contact = (o.contact ?? {}) as Contact;
    sources.push({ email: contact.email, phone: contact.phone, reason: 'called' });
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const o of (noAnswerRes.data ?? []) as any[]) {
    const attempts = parseNoAnswerAttempts(o.phone_no_answer_attempts);
    const last = attempts[attempts.length - 1];
    if (!last || new Date(last.at).getTime() < now - CLAIM_DAYS * DAY_MS) continue;
    const contact = (o.contact ?? {}) as Contact;
    sources.push({ email: contact.email, phone: contact.phone, reason: 'no_answer' });
  }
  return buildClaimIndex(sources);
}
