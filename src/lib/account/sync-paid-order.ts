/**
 * What a paid order gives back to the account that placed it.
 *
 * Until 18.09.2026 the flow was one-way for an existing account: the account
 * filled the order (prefill), and `/submit` copied phone, name, CNP and birth
 * data into the profile only where the profile had none — but the delivery
 * address typed in the order, the billing data and the scanned identity
 * documents stayed inside `orders.customer_data`, where the account could not
 * see them. Only a NEW account, created from the success page, received them
 * (`register-from-order`). So a customer with an account ordered, paid, and
 * came back to a checklist that still asked for the address they had just
 * typed.
 *
 * This runs after every payment confirmation, on every path (Stripe webhook,
 * the hosted-checkout fallback, the admin's manual/bank-transfer confirmation,
 * the Stripe sync button) and again when the account page loads, for any paid
 * order it has not processed yet. Idempotent: a marker in
 * `customer_data.account_sync` says it ran, and every insert first checks for
 * an equivalent row. Never throws — a failure here must not touch the payment.
 *
 * Rules:
 * - the profile is only ever FILLED, never overwritten (the order may be for
 *   someone else, the name on the profile is the account holder's);
 * - an address is saved once: the same street + number + locality is not
 *   saved twice, however the customer spelled it;
 * - a billing profile is saved once per person (CNP) or company (CUI);
 * - documents are copied only when the account holds no active identity
 *   document yet — the wizard already skips the upload for an account that has
 *   one, so a second copy would only be a duplicate.
 */

import { createAdminClient } from '@/lib/supabase/admin';
import { copyOrderKycDocumentsToAccount } from '@/lib/account/copy-order-kyc';
import {
  isCompanyBilling,
  companyProfileFromOrder,
  personProfileFromOrder,
} from '@/lib/account/order-to-billing-profile';
import { hasCompleteKyc } from '@/lib/kyc/identity-documents';
import { normalizePhone } from '@/lib/format/normalize-phone';
import { sameAddress } from '@/lib/account/same-address';
import type { AddressData } from '@/components/shared/AddressForm';
import type { BillingData } from '@/components/shared/BillingProfileForm';

const LOG = '[account-sync]';

type Unknowns = Record<string, unknown>;
const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/**
 * The saved-address row an order's `delivery_address` becomes, or `null` when
 * the order carried no address worth saving (a locker delivery, an e-mail-only
 * document, a courier form left empty).
 */
export function savedAddressFromDelivery(delivery: Unknowns | null | undefined): AddressData | null {
  if (!delivery) return null;
  const street = str(delivery.street);
  const city = str(delivery.city);
  if (!street || !city) return null;
  const country = str(delivery.country) || 'RO';
  return {
    country,
    county: str(delivery.county) || undefined,
    city,
    street,
    number: str(delivery.number),
    building: str(delivery.building) || undefined,
    staircase: str(delivery.staircase) || undefined,
    floor: str(delivery.floor) || undefined,
    apartment: str(delivery.apartment) || undefined,
    postalCode: str(delivery.postalCode) || undefined,
  };
}

/** Same place, whatever the spelling — shared with the address API and the KYC save. */
export { sameAddress };

/** Same person (CNP) or the same company (CUI) already has a profile. */
export function sameBillingProfile(
  existing: { type?: string | null; cnp?: string | null; cui?: string | null } | null | undefined,
  candidate: BillingData
): boolean {
  if (!existing) return false;
  if (existing.type !== candidate.type) return false;
  const digits = (v: unknown) => str(v).replace(/\D/g, '');
  if (candidate.type === 'persoana_juridica') {
    return !!digits(candidate.cui) && digits(existing.cui) === digits(candidate.cui);
  }
  return !!digits(candidate.cnp) && digits(existing.cnp) === digits(candidate.cnp);
}

export interface SyncPaidOrderResult {
  ran: boolean;
  reason?: string;
  addressSaved?: boolean;
  billingSaved?: boolean;
  documentsCopied?: number;
}

export async function syncPaidOrderToAccount(orderId: string): Promise<SyncPaidOrderResult> {
  try {
    const admin = createAdminClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: order, error } = await (admin as any)
      .from('orders')
      .select('id, friendly_order_id, user_id, payment_status, customer_data, delivery_address')
      .eq('id', orderId)
      .maybeSingle();
    if (error || !order) return { ran: false, reason: error?.message ?? 'order not found' };
    if (!order.user_id) return { ran: false, reason: 'guest order' };
    if (order.payment_status !== 'paid') return { ran: false, reason: 'not paid' };

    const customerData = (order.customer_data ?? {}) as Unknowns;
    const marker = customerData.account_sync as { userId?: string } | undefined;
    if (marker?.userId === order.user_id) return { ran: false, reason: 'already synced' };

    const userId = order.user_id as string;
    // Any failed step leaves the marker unwritten, so the next payment path
    // or the account-page backlog retries it instead of treating it as done.
    let failed = false;
    const contact = (customerData.contact ?? {}) as Unknowns;
    const personal = (customerData.personal ?? customerData.personalKyc ?? {}) as Unknowns;
    const billing = (customerData.billing ?? {}) as Unknowns;

    // 1. Profile: fill what is empty, touch nothing that is set.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile, error: profileReadError } = await (admin as any)
      .from('profiles')
      .select('id, phone, first_name, last_name, cnp, birth_date, birth_place')
      .eq('id', userId)
      .maybeSingle();
    if (profileReadError) failed = true;
    if (profile) {
      const updates: Unknowns = {};
      const phone = normalizePhone(contact.phone);
      if (!str(profile.phone) && phone) updates.phone = phone;
      if (!str(profile.first_name) && str(personal.firstName)) updates.first_name = str(personal.firstName);
      if (!str(profile.last_name) && str(personal.lastName)) updates.last_name = str(personal.lastName);
      if (!str(profile.cnp) && str(personal.cnp)) updates.cnp = str(personal.cnp);
      if (!profile.birth_date && str(personal.birthDate)) updates.birth_date = str(personal.birthDate);
      if (!str(profile.birth_place) && str(personal.birthPlace)) updates.birth_place = str(personal.birthPlace);
      if (Object.keys(updates).length > 0) {
        updates.updated_at = new Date().toISOString();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: profileError } = await (admin as any).from('profiles').update(updates).eq('id', userId);
        if (profileError) {
          failed = true;
          console.error(`${LOG} ${order.friendly_order_id}: profile not filled:`, profileError.message);
        }
      }
    }

    // 2. Delivery address, once.
    let addressSaved = false;
    const address = savedAddressFromDelivery(order.delivery_address as Unknowns | null);
    if (address) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: saved, error: savedReadError } = await (admin as any)
        .from('user_saved_data')
        .select('id, data')
        .eq('user_id', userId)
        .eq('data_type', 'address');
      const rows = (saved ?? []) as Array<{ id: string; data: Unknowns }>;
      const exists = rows.some((row) => sameAddress(row.data, address));
      // A failed read must not look like „no address yet": skip and retry.
      if (savedReadError) failed = true;
      else if (!exists) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: addressError } = await (admin as any).from('user_saved_data').insert({
          user_id: userId,
          data_type: 'address',
          label: `Adresa din comanda ${order.friendly_order_id ?? ''}`.trim(),
          data: address,
          is_default: rows.length === 0,
        });
        if (addressError) {
          failed = true;
          console.error(`${LOG} ${order.friendly_order_id}: address not saved:`, addressError.message);
        } else addressSaved = true;
      }
    }

    // 3. Billing profile, once per person or company.
    let billingSaved = false;
    const candidate: BillingData | null = isCompanyBilling(billing)
      ? companyProfileFromOrder(billing)
      : personProfileFromOrder(billing, personal, {
          firstName: str(personal.firstName) || str(profile?.first_name),
          lastName: str(personal.lastName) || str(profile?.last_name),
        });
    if (candidate) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: profiles, error: billingReadError } = await (admin as any)
        .from('billing_profiles')
        .select('id, type, billing_data')
        .eq('user_id', userId);
      if (billingReadError) failed = true;
      const rows = (profiles ?? []) as Array<{ id: string; type: string; billing_data: Unknowns }>;
      const exists = rows.some((row) =>
        sameBillingProfile(
          { type: row.type, cnp: str(row.billing_data?.cnp), cui: str(row.billing_data?.cui) },
          candidate
        )
      );
      if (!billingReadError && !exists) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: billingError } = await (admin as any).from('billing_profiles').insert({
          user_id: userId,
          type: candidate.type,
          label: candidate.label,
          billing_data: candidate,
          is_default: rows.length === 0,
        });
        if (billingError) {
          failed = true;
          console.error(`${LOG} ${order.friendly_order_id}: billing profile not saved:`, billingError.message);
        } else billingSaved = true;
      }
    }

    // 4. Identity documents, only into an account that has none.
    let documentsCopied = 0;
    const uploadedDocuments = (personal.uploadedDocuments ?? []) as Array<{ type: string; s3Key?: string; base64?: string; mimeType?: string; fileSize?: number }>;
    if (uploadedDocuments.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: existingDocs, error: docsReadError } = await (admin as any)
        .from('kyc_verifications')
        .select('document_type')
        .eq('user_id', userId)
        .eq('is_active', true);
      if (docsReadError) failed = true;
      // Copy unless the account already holds the complete set (document AND
      // selfie): an account with only a front still needs the order's selfie.
      const complete = hasCompleteKyc(
        ((existingDocs ?? []) as Array<{ document_type: string }>).map((d) => d.document_type)
      );
      if (!docsReadError && !complete) {
        const result = await copyOrderKycDocumentsToAccount(admin, {
          userId,
          orderId,
          uploadedDocuments,
          ocrResults: (personal.ocrResults ?? []) as Array<{ documentType: string; extractedData: Record<string, unknown>; confidence: number }>,
          logPrefix: `${LOG} ${order.friendly_order_id}`,
        });
        documentsCopied = result.copied;
        if (result.copied < uploadedDocuments.length) failed = true;
      }
    }

    // 5. Marker, so this never runs twice for the same account — written
    // through `mark_account_sync` (migration 176), which merges the one key
    // into `customer_data` in the database instead of replacing the whole
    // JSON with the copy read at the top (a concurrent writer's changes would
    // have been erased). Not written when a step failed: the retry is the fix.
    if (failed) {
      console.warn(`${LOG} ${order.friendly_order_id}: a step failed, marker not written — will retry`);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: markError } = await (admin as any).rpc('mark_account_sync', {
        p_order_id: orderId,
        p_payload: { userId, at: new Date().toISOString(), addressSaved, billingSaved, documentsCopied },
      });
      if (markError) console.error(`${LOG} ${order.friendly_order_id}: marker not written:`, markError.message);
    }

    console.log(`${LOG} ${order.friendly_order_id}: address=${addressSaved} billing=${billingSaved} documents=${documentsCopied}`);
    return { ran: !failed, reason: failed ? 'a step failed; will retry' : undefined, addressSaved, billingSaved, documentsCopied };
  } catch (err) {
    console.error(`${LOG} ${orderId}: failed (non-fatal):`, err instanceof Error ? err.message : err);
    return { ran: false, reason: err instanceof Error ? err.message : 'unknown' };
  }
}

/**
 * The paid orders of one account that this has not processed yet — run on the
 * account page, so a payment path that missed the hook still heals on the next
 * visit. Bounded, because the page must not wait on a long backlog.
 */
export async function syncUnsyncedPaidOrdersForUser(userId: string, limit = 5): Promise<number> {
  try {
    const admin = createAdminClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (admin as any)
      .from('orders')
      .select('id, customer_data')
      .eq('user_id', userId)
      .eq('payment_status', 'paid')
      .order('paid_at', { ascending: false, nullsFirst: false })
      .limit(limit * 4);
    const pending = ((data ?? []) as Array<{ id: string; customer_data: Unknowns | null }>)
      .filter((row) => (row.customer_data?.account_sync as { userId?: string } | undefined)?.userId !== userId)
      .slice(0, limit);
    let ran = 0;
    for (const row of pending) {
      const result = await syncPaidOrderToAccount(row.id);
      if (result.ran) ran += 1;
    }
    return ran;
  } catch (err) {
    console.error(`${LOG} backlog for ${userId} failed (non-fatal):`, err instanceof Error ? err.message : err);
    return 0;
  }
}
