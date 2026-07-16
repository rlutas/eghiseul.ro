/**
 * Stripe payout reconciliation sync (Decontări).
 *
 * Pulls payouts + their balance transactions from the SHARED Stripe account
 * (eghiseul.ro + cazierjudiciaronline.com), attributes each transaction to a
 * platform, enriches it with the order + Oblio invoice from the right
 * database, and mirrors everything into stripe_payouts /
 * stripe_payout_transactions (migration 113).
 *
 * Attribution order:
 *   1. charge metadata: app_id === 'cjo'  → cjo
 *   2. charge metadata: orderNumber / order number in description prefix
 *      E-/EJC- → eghiseul · CJO-/CAO-/CFO-/CIC-/EJC → per prefix
 *   3. otherwise 'necunoscut' (still listed — signal for manual action)
 *
 * Env prerequisites: CJO_SUPABASE_URL/KEY (CJO enrichment) — set in Vercel
 * production 2026-07-14 alongside OBLIO_PROFORMA_SERIES.
 *
 * Amount units: everything here is BANI (Stripe native). eghiseul orders
 * store RON numerics; CJO stores bani — conversion happens at enrichment.
 */
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { createCjoClient } from '@/lib/supabase/cjo';

/** Order-number regex: E-260710-F3AYS, EJC-..., CJO-20260710-86615, CAO-, CFO-, CIC- */
const ORDER_RE = /\b(E|EJC|CJO|CAO|CFO|CIC)-[A-Z0-9-]+\b/i;

const EGH_PREFIXES = new Set(['E', 'EJC']);
const CJO_PREFIXES = new Set(['CJO', 'CAO', 'CFO', 'CIC']);

export interface PayoutSyncResult {
  payoutsSynced: number;
  txSynced: number;
  errors: string[];
}

function platformFromOrderNumber(orderNumber: string | null): 'eghiseul' | 'cjo' | 'necunoscut' {
  if (!orderNumber) return 'necunoscut';
  const prefix = orderNumber.split('-')[0].toUpperCase();
  if (EGH_PREFIXES.has(prefix)) return 'eghiseul';
  if (CJO_PREFIXES.has(prefix)) return 'cjo';
  return 'necunoscut';
}

function extractOrderNumber(source: Stripe.Charge | null, description: string | null): string | null {
  const metaOrder =
    (source?.metadata?.orderNumber as string | undefined) ||
    (source?.metadata?.order_number as string | undefined);
  if (metaOrder) return metaOrder;
  const m = (description ?? '').match(ORDER_RE) || (source?.description ?? '').match(ORDER_RE);
  return m ? m[0].toUpperCase() : null;
}

interface TxRow {
  /** Transient: charge metadata.orderId (extra charges lack orderNumber). */
  _orderId?: string | null;
  id: string;
  payout_id: string;
  type: string;
  gross_bani: number;
  fee_bani: number;
  net_bani: number;
  charge_id: string | null;
  payment_intent_id: string | null;
  description: string | null;
  available_on: string | null;
  platform: string;
  order_number: string | null;
  service_name: string | null;
  client_name: string | null;
  client_email: string | null;
  invoice_number: string | null;
  invoice_url: string | null;
  raw: unknown;
}

/** Enrich eghiseul rows from our own DB (invoice + client + service).
 *  Matches by order number AND by order id (extra-charge PIs carry only
 *  metadata.orderId, no orderNumber/description → rows landed unmatched). */
async function enrichEghiseul(rows: TxRow[]) {
  const admin = createAdminClient();
  const orderNumbers = [...new Set(rows.map((r) => r.order_number).filter(Boolean))] as string[];
  const orderIds = [...new Set(rows.filter((r) => !r.order_number && r._orderId).map((r) => r._orderId))] as string[];
  if (!orderNumbers.length && !orderIds.length) return;
  const select = 'id, friendly_order_id, order_number, invoice_number, invoice_url, customer_data, services(name)';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const numberQuery = orderNumbers.length
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (admin as any)
        .from('orders')
        .select(select)
        .or(
          `friendly_order_id.in.(${orderNumbers.map((o) => `"${o}"`).join(',')}),order_number.in.(${orderNumbers.map((o) => `"${o}"`).join(',')})`
        )
    : Promise.resolve({ data: [] });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const idQuery = orderIds.length
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (admin as any).from('orders').select(select).in('id', orderIds)
    : Promise.resolve({ data: [] });
  const [{ data: byNum }, { data: byIdData }] = await Promise.all([numberQuery, idQuery]);
  const orders = [...(byNum ?? []), ...(byIdData ?? [])];
  const byNumber = new Map<string, Record<string, unknown>>();
  const byId = new Map<string, Record<string, unknown>>();
  for (const o of orders) {
    if (o.friendly_order_id) byNumber.set(String(o.friendly_order_id).toUpperCase(), o);
    if (o.order_number) byNumber.set(String(o.order_number).toUpperCase(), o);
    if (o.id) byId.set(String(o.id), o);
  }
  for (const r of rows) {
    const o =
      (r.order_number ? byNumber.get(r.order_number.toUpperCase()) : undefined) ??
      (r._orderId ? byId.get(r._orderId) : undefined);
    if (!o) continue;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!r.order_number) r.order_number = ((o as any).friendly_order_id ?? (o as any).order_number) as string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyO = o as any;
    r.invoice_number = anyO.invoice_number ?? r.invoice_number;
    r.invoice_url = anyO.invoice_url ?? r.invoice_url;
    r.service_name = anyO.services?.name ?? r.service_name;
    const contact = anyO.customer_data?.contact ?? {};
    const personal = anyO.customer_data?.personal ?? {};
    const billing = anyO.customer_data?.billing ?? {};
    const company = anyO.customer_data?.company ?? {};
    r.client_email = contact.email ?? r.client_email;
    // Name fallback chain: KYC scan → billing person → billing/company firm.
    // Property services (Extras CF etc.) have NO ID scan, so `personal` is
    // empty — the billing block is the only place the client's name exists
    // (rows showed email-only in /admin/decontari until 2026-07-16).
    const name =
      [personal.firstName, personal.lastName].filter(Boolean).join(' ') ||
      [billing.firstName, billing.lastName].filter(Boolean).join(' ') ||
      billing.companyName ||
      company.companyName ||
      '';
    r.client_name = name || r.client_name;
  }
}

/** Enrich CJO rows from the CJO database (read-only cross-project client). */
async function enrichCjo(rows: TxRow[], errors: string[]) {
  const cjo = createCjoClient();
  if (!cjo) {
    if (rows.length) errors.push('CJO enrichment sărit: CJO_SUPABASE_URL/KEY lipsesc din env');
    return;
  }
  const orderNumbers = [...new Set(rows.map((r) => r.order_number).filter(Boolean))] as string[];
  if (!orderNumbers.length) return;
  const { data: orders, error } = await cjo
    .from('orders')
    .select('order_number, prenume, nume, email, service_type, oblio_invoice_number, oblio_invoice_link, invoice_series, invoice_number, invoice_url')
    .in('order_number', orderNumbers);
  if (error) {
    errors.push(`CJO lookup: ${error.message}`);
    return;
  }
  const byNumber = new Map((orders ?? []).map((o) => [String(o.order_number).toUpperCase(), o]));
  for (const r of rows) {
    const o = r.order_number ? byNumber.get(r.order_number.toUpperCase()) : undefined;
    if (!o) continue;
    r.invoice_number =
      o.oblio_invoice_number ||
      (o.invoice_series && o.invoice_number ? `${o.invoice_series}-${o.invoice_number}` : o.invoice_number) ||
      r.invoice_number;
    r.invoice_url = o.oblio_invoice_link || o.invoice_url || r.invoice_url;
    r.service_name = o.service_type ?? r.service_name;
    r.client_name = [o.prenume, o.nume].filter(Boolean).join(' ') || r.client_name;
    r.client_email = o.email ?? r.client_email;
  }
}

/**
 * Sync payouts from Stripe. `sinceDays` bounds how far back we look for
 * payouts to (re)sync; recently-arrived payouts are re-synced so in_transit
 * → paid transitions and late invoice links get refreshed.
 */
export async function syncPayouts(opts: { sinceDays?: number } = {}): Promise<PayoutSyncResult> {
  const sinceDays = opts.sinceDays ?? 30;
  const admin = createAdminClient();
  const errors: string[] = [];
  let payoutsSynced = 0;
  let txSynced = 0;

  const since = Math.floor(Date.now() / 1000) - sinceDays * 24 * 3600;
  const payouts = await stripe.payouts.list({ created: { gte: since }, limit: 100 });

  for (const payout of payouts.data) {
    try {
      const rows: TxRow[] = [];
      let startingAfter: string | undefined;
      // paginate balance transactions of this payout
      for (;;) {
        const page = await stripe.balanceTransactions.list({
          payout: payout.id,
          expand: ['data.source'],
          limit: 100,
          ...(startingAfter ? { starting_after: startingAfter } : {}),
        });
        for (const tx of page.data) {
          if (tx.type === 'payout') continue; // the payout line itself
          const source = (typeof tx.source === 'object' ? tx.source : null) as Stripe.Charge | null;
          const isCharge = source && source.object === 'charge' ? source : null;
          const description = tx.description ?? isCharge?.description ?? null;
          const orderNumber = extractOrderNumber(isCharge, description);
          let platform: string =
            isCharge?.metadata?.app_id === 'cjo' ? 'cjo' : platformFromOrderNumber(orderNumber);
          if (platform === 'necunoscut' && isCharge?.metadata?.orderId) platform = 'eghiseul';
          rows.push({
            _orderId: (isCharge?.metadata?.orderId as string | undefined) ?? null,
            id: tx.id,
            payout_id: payout.id,
            type: tx.type,
            gross_bani: tx.amount,
            fee_bani: tx.fee,
            net_bani: tx.net,
            charge_id: isCharge?.id ?? null,
            payment_intent_id:
              typeof isCharge?.payment_intent === 'string'
                ? isCharge.payment_intent
                : isCharge?.payment_intent?.id ?? null,
            description,
            available_on: tx.available_on ? new Date(tx.available_on * 1000).toISOString().slice(0, 10) : null,
            platform,
            order_number: orderNumber,
            service_name: null,
            // Cardholder name from Stripe Checkout — baseline for orders where
            // enrichment finds no name (e.g. WP-era or unmatched charges).
            client_name: isCharge?.billing_details?.name ?? null,
            client_email: isCharge?.billing_details?.email ?? null,
            invoice_number: null,
            invoice_url: null,
            raw: { amount: tx.amount, fee: tx.fee, net: tx.net, reporting_category: tx.reporting_category },
          });
        }
        if (!page.has_more) break;
        startingAfter = page.data[page.data.length - 1]?.id;
      }

      // Unknown charges: extra-charge Checkout Sessions carry metadata on the
      // SESSION, not the charge — look the session up by payment intent.
      // WP-era charges have no session and stay 'necunoscut' (expected).
      for (const r of rows) {
        if (r.platform !== 'necunoscut' || r.type !== 'charge' || !r.payment_intent_id) continue;
        try {
          const sessions = await stripe.checkout.sessions.list({ payment_intent: r.payment_intent_id, limit: 1 });
          const sess = sessions.data[0];
          const meta = sess?.metadata ?? {};
          const ref = (meta.order_ref as string) || (meta.orderNumber as string) || null;
          if (ref) {
            r.order_number = ref.toUpperCase();
            r.platform = platformFromOrderNumber(r.order_number);
            if (meta.purpose === 'extra_charge' && !r.description) r.description = `Plată suplimentară comanda ${ref}`;
          } else if ((meta.orderId as string) || (meta.order_id as string)) {
            r._orderId = (meta.orderId as string) ?? null;
            r.platform = meta.app_id === 'cjo' || meta.order_id ? 'cjo' : 'eghiseul';
          }
        } catch {
          /* lookup is best-effort */
        }
      }

      await enrichEghiseul(rows.filter((r) => r.platform === 'eghiseul'));
      await enrichCjo(rows.filter((r) => r.platform === 'cjo'), errors);


      // Preserve manually-attached invoices (WP-era links added by the
      // matching scripts): when this sync computed no invoice for a row that
      // already has one in the DB, keep the existing values. MUST run before
      // matched_count is computed.
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existing } = await (admin as any)
          .from('stripe_payout_transactions')
          .select('id, invoice_number, invoice_url, client_name, client_email, platform, order_number')
          .eq('payout_id', payout.id)
          .not('invoice_number', 'is', null);
        const keep = new Map((existing ?? []).map((e: { id: string }) => [e.id, e]));
        for (const r of rows) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const prev = keep.get(r.id) as any;
          if (prev && !r.invoice_number) {
            r.invoice_number = prev.invoice_number;
            r.invoice_url = r.invoice_url ?? prev.invoice_url;
            r.client_name = r.client_name ?? prev.client_name;
            r.client_email = r.client_email ?? prev.client_email;
            if (r.platform === 'necunoscut' && prev.platform !== 'necunoscut') r.platform = prev.platform;
            r.order_number = r.order_number ?? prev.order_number;
          }
        }
      }

      const CHARGE_LIKE = new Set(['charge', 'payment']); // 'payment' = Payment Links (era WP)
      const matched = rows.filter((r) => CHARGE_LIKE.has(r.type) && r.invoice_number).length;
      const chargeCount = rows.filter((r) => CHARGE_LIKE.has(r.type)).length;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: pErr } = await (admin as any).from('stripe_payouts').upsert({
        id: payout.id,
        company: process.env.ACCOUNTING_COMPANY ?? 'EDIGITALIZARE',
        amount_bani: payout.amount,
        currency: payout.currency,
        status: payout.status,
        arrival_date: payout.arrival_date
          ? new Date(payout.arrival_date * 1000).toISOString().slice(0, 10)
          : null,
        created_at_stripe: new Date(payout.created * 1000).toISOString(),
        tx_count: chargeCount,
        matched_count: matched,
        raw: { automatic: payout.automatic, method: payout.method, statement_descriptor: payout.statement_descriptor },
        synced_at: new Date().toISOString(),
      });
      if (pErr) throw new Error(pErr.message);

      if (rows.length) {
        const persistable = rows.map(({ _orderId, ...rest }) => { void _orderId; return rest; });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: tErr } = await (admin as any).from('stripe_payout_transactions').upsert(persistable);
        if (tErr) throw new Error(tErr.message);
      }
      payoutsSynced++;
      txSynced += rows.length;
    } catch (err) {
      errors.push(`${payout.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return { payoutsSynced, txSynced, errors };
}
