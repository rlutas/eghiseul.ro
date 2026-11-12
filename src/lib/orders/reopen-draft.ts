/**
 * Reopen a SUBMITTED, UNPAID order as a draft, so the customer (or the
 * operator, through the continuation link) can go back through the wizard —
 * typically to add an option they skipped.
 *
 * Why it exists: /submit moves the order to `pending`, and from then on the
 * wizard, the draft API and the continuation link all refuse it (they only
 * serve `draft`), while "Modifică comandă" only works after payment. A
 * customer who reached the payment page without an option had no way back
 * (E-261111-EMRB4, 12.11.2026).
 *
 * What it does: status → draft, the previous signature moment is cleared (the
 * customer signs again at the next submit, which also recomputes the price and
 * regenerates the contract), the open Stripe session is expired, the
 * submit-time contract row is dropped, and a 48h continuation token is issued.
 *
 * NOT closed here: `/comanda/checkout/<id>` mints a new Stripe session for any
 * unpaid order, drafts included. A customer who opens that old link can still
 * pay the old total; the order then arrives paid without the new options.
 */

import { randomBytes } from 'crypto';
import { appBaseForOrder } from '@/lib/brand/for-order';

export const REOPENABLE_STATUSES = ['pending', 'abandoned'] as const;
const TOKEN_TTL_HOURS = 48;
/** Documents `/submit` auto-generates; regenerated at the next submit. */
const SUBMIT_DOCUMENT_TYPES = ['contract_prestari', 'conventie'] as const;

export interface ReopenCandidate {
  status: string | null;
  payment_status: string | null;
  paid_at?: string | null;
  channel?: string | null;
}

/** Null when the order may be reopened; otherwise the reason, for the operator. */
export function reopenRefusal(order: ReopenCandidate): string | null {
  if (order.status === 'draft') return 'Comanda este deja ciornă — folosește „Copiază link continuare”.';
  if (order.payment_status === 'paid' || order.paid_at) {
    return 'Comanda este plătită — folosește „Modifică comandă”.';
  }
  if (order.payment_status === 'awaiting_verification' || order.status === 'awaiting_payment') {
    return 'Clientul a ales transfer bancar — comanda așteaptă confirmarea plății și nu se redeschide.';
  }
  if (!REOPENABLE_STATUSES.includes(order.status as (typeof REOPENABLE_STATUSES)[number])) {
    return `Comanda nu poate fi redeschisă din statusul „${order.status}”.`;
  }
  // Phone orders skip /submit on purpose (documents come after payment); the
  // public wizard would ask the customer for everything again.
  if (order.channel === 'phone') {
    return 'Comandă telefonică — se modifică din fluxul telefonic, nu din formularul public.';
  }
  return null;
}

export interface ReopenDeps {
  /** Expire an open Stripe Checkout session. Best-effort; may throw. */
  expireCheckoutSession?: (sessionId: string) => Promise<unknown>;
  now?: () => Date;
}

export type ReopenResult =
  | { ok: true; resumeUrl: string; expiresAt: string; previousStatus: string }
  | { ok: false; status: 404 | 409 | 500; error: string };

export async function reopenOrderAsDraft(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adminClient: any,
  orderId: string,
  actor: string,
  deps: ReopenDeps = {}
): Promise<ReopenResult> {
  const { data: order } = await adminClient
    .from('orders')
    .select('id, friendly_order_id, status, payment_status, paid_at, channel, platform, stripe_checkout_session_id, services(slug)')
    .eq('id', orderId)
    .maybeSingle();
  if (!order) return { ok: false, status: 404, error: 'Comanda nu a fost găsită' };

  const refusal = reopenRefusal(order);
  if (refusal) return { ok: false, status: 409, error: refusal };

  const slug = Array.isArray(order.services) ? order.services[0]?.slug : order.services?.slug;
  if (!slug) return { ok: false, status: 409, error: 'Comanda nu are un serviciu asociat.' };

  // The old session carries the old total; a customer with that tab still open
  // must not pay it while the order is being changed.
  const sessionId = order.stripe_checkout_session_id as string | null;
  if (sessionId?.startsWith('cs_') && deps.expireCheckoutSession) {
    try {
      await deps.expireCheckoutSession(sessionId);
    } catch {
      /* already expired or completed — nothing to do */
    }
  }

  const now = (deps.now ?? (() => new Date()))();
  const token = randomBytes(24).toString('base64url');
  const expiresAt = new Date(now.getTime() + TOKEN_TTL_HOURS * 60 * 60 * 1000).toISOString();

  // Guarded on status + payment: a payment landing between the read and this
  // write must win, not be overwritten by a draft.
  const { data: updated, error } = await adminClient
    .from('orders')
    .update({
      status: 'draft',
      submitted_at: null,
      contract_signed_at: null,
      stripe_checkout_session_id: null,
      resume_token: token,
      resume_token_expires_at: expiresAt,
      updated_at: now.toISOString(),
    })
    .eq('id', orderId)
    .in('status', [...REOPENABLE_STATUSES])
    .neq('payment_status', 'paid')
    .is('paid_at', null)
    .select('id');
  if (error) {
    console.error('[reopen-draft] update failed:', error);
    return { ok: false, status: 500, error: 'Nu am putut redeschide comanda' };
  }
  if (!updated || updated.length === 0) {
    return { ok: false, status: 409, error: 'Comanda s-a schimbat între timp (posibil plătită). Reîncarcă pagina.' };
  }

  // The contract generated at the first submit describes an order that no
  // longer exists; the next submit generates a fresh one. Leaving the row
  // would show two contracts on the order.
  const { error: docsError } = await adminClient
    .from('order_documents')
    .delete()
    .eq('order_id', orderId)
    .in('type', [...SUBMIT_DOCUMENT_TYPES]);
  if (docsError) console.error('[reopen-draft] could not drop the submit-time documents:', docsError.message);

  await adminClient.from('order_history').insert({
    order_id: orderId,
    changed_by: actor,
    event_type: 'admin_action',
    old_value: { status: order.status },
    new_value: { status: 'draft' },
    notes: `Comandă redeschisă ca ciornă (era „${order.status}”) — clientul poate reveni în formular; link de continuare valabil ${TOKEN_TTL_HOURS}h`,
  });

  return {
    ok: true,
    resumeUrl: `${appBaseForOrder(order)}/comanda/${slug}?resume=${token}`,
    expiresAt,
    previousStatus: order.status,
  };
}
