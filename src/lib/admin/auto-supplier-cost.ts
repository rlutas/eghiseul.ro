/**
 * Auto-recorded institution fees (ONRC / ANCPI) — the workers pay these taxes
 * on every automated order, so the team should never have to type them into
 * the finalize dialog by hand (Raul, 30.07.2026).
 *
 * Called from the worker result callbacks (/api/onrc/result, /api/ancpi/result)
 * when a job lands on DONE. Amount resolution, in order:
 *   1. `amountRon` passed by the caller — the fee the worker actually paid
 *      (ONRC taxes are fixed per variant: de bază/PF 30 lei, istoric 250 lei —
 *      see onrcFeeRon(), mirroring worker-onrc/src/onrc/api-submit.ts).
 *   2. The ANCPI receipt PDF the worker already saves (chitanta_url) — read the
 *      real total with Gemini.
 *   3. The flat tariff from Setări → Furnizori (admin_settings.supplier_tariffs,
 *      category `taxa_institutie` + serviceSlug) × quantity (nr. imobile).
 *   4. None → record nothing; the fee row stays in the manual finalize
 *      dialog exactly as before.
 *
 * Idempotent: one `taxa_institutie` line per order — reruns and retries skip.
 * Never throws: a cost-recording failure must not break document delivery.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { downloadFile } from '@/lib/aws/s3';
import {
  findTariff,
  tariffAmount,
  type SupplierTariff,
} from '@/lib/admin/supplier-costs';

export interface AutoFeeParams {
  orderId: string;
  supplier: 'ONRC' | 'ANCPI';
  /** Exact fee PER UNIT the worker paid, when the caller knows it (fixed
   *  portal taxes) — multiplied by `quantity`. */
  amountRon?: number | null;
  /** Nr. of billed units (ANCPI: imobile in the job). Defaults to 1. */
  quantity?: number;
  /** S3 key of the ANCPI receipt PDF, when the worker saved one. */
  chitantaKey?: string | null;
  /** Registration number — goes into the description for reconciliation. */
  reference?: string | null;
}

/**
 * The tax the ONRC worker pays per job, by `onrc_jobs.detail.documentType`.
 * Fixed amounts captured live from the RECOM portal's voucher calculation —
 * source of truth: worker-onrc/src/onrc/api-submit.ts (AMOUNT_DE_BAZA 30,
 * AMOUNT_ISTORIC 250). Null for unknown variants → tariff fallback.
 */
export function onrcFeeRon(documentType: string | null | undefined): number | null {
  const dt = (documentType ?? '').trim().toLowerCase();
  if (dt === 'firma' || dt === 'pf') return 30;
  if (dt === 'istoric') return 250;
  return null;
}

/**
 * The tax the ANCPI worker pays per unit, by `ancpi_jobs.service_type`.
 * Extras CF pentru informare online = 20 lei/imobil (prodId 1420; preplătitul
 * 14200 consumă 1 punct = 1 extras din pachete cumpărate în avans, deci
 * chitanța ePay arată 0,00 lei — the receipt can NOT be used for the amount).
 * Source: docs/technical/specs/ancpi-automation-plan.md. Null for the other
 * service types (not yet automated) → tariff fallback.
 */
export function ancpiFeeRon(serviceType: string | null | undefined): number | null {
  const st = (serviceType ?? '').trim().toUpperCase();
  if (st === 'EXTRAS_CF') return 20;
  return null;
}

export type AutoFeeOutcome =
  | 'inserted'
  | 'already_recorded'
  | 'no_amount'
  | 'error';

/** Parse the total (RON) from an ANCPI receipt PDF via Gemini. Null on any miss. */
async function amountFromReceipt(chitantaKey: string): Promise<number | null> {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const buf = await downloadFile(chitantaKey);
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: buf.toString('base64'),
        },
      },
      'Aceasta este o chitanță/dovadă de plată ANCPI (ePay). Extrage suma TOTALĂ plătită, în RON. Răspunde DOAR cu JSON: {"totalRon": <număr>} — fără alt text. Dacă nu găsești o sumă, răspunde {"totalRon": null}.',
    ]);
    const text = result.response.text();
    const match = text.match(/\{[^}]*\}/);
    if (!match) return null;
    const parsed = JSON.parse(match[0]) as { totalRon?: unknown };
    const amount = Number(parsed.totalRon);
    // Sanity bounds: an ANCPI fee is lei, not thousands — a mis-read (CF
    // number, order id) must not land in accounting.
    if (!Number.isFinite(amount) || amount <= 0 || amount > 2000) return null;
    return Math.round(amount * 100) / 100;
  } catch (error) {
    console.error('[auto-supplier-cost] receipt parse failed:', error);
    return null;
  }
}

/**
 * Record the institution fee for an order, if it isn't already recorded and an
 * amount can be determined. See module docblock for the resolution order.
 */
export async function recordInstitutionFeeAuto(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>,
  params: AutoFeeParams
): Promise<{ outcome: AutoFeeOutcome; amountRon?: number; source?: 'fix' | 'chitanta' | 'tarif' }> {
  try {
    const { data: existing } = await supabase
      .from('order_supplier_costs')
      .select('id')
      .eq('order_id', params.orderId)
      .eq('category', 'taxa_institutie')
      .limit(1);
    if (existing && existing.length > 0) return { outcome: 'already_recorded' };

    const quantity = Math.max(1, Math.floor(Number(params.quantity) || 1));

    // 1. Exact per-unit amount known by the caller (fixed portal taxes).
    let amount: number | null = null;
    let source: 'fix' | 'chitanta' | 'tarif' = 'fix';
    if (params.amountRon != null && Number.isFinite(Number(params.amountRon)) && Number(params.amountRon) > 0) {
      amount = Math.round(Number(params.amountRon) * quantity * 100) / 100;
    }

    // 2. Real amount from the saved receipt (ANCPI).
    if (amount == null && params.chitantaKey) {
      source = 'chitanta';
      amount = await amountFromReceipt(params.chitantaKey);
    }

    // 3. Configured flat tariff × quantity.
    if (amount == null) {
      source = 'tarif';
      const { data: order } = await supabase
        .from('orders')
        .select('service_slug')
        .eq('id', params.orderId)
        .single();
      const { data: settings } = await supabase
        .from('admin_settings')
        .select('value')
        .eq('key', 'supplier_tariffs')
        .single();
      const tariffs = (settings?.value ?? []) as SupplierTariff[];
      const tariff = findTariff(tariffs, {
        category: 'taxa_institutie',
        serviceSlug: order?.service_slug ?? null,
      });
      const flat = tariffAmount(tariff, 1);
      amount = flat != null ? Math.round(flat * quantity * 100) / 100 : null;
    }

    if (amount == null) return { outcome: 'no_amount' };

    const details: string[] = [`Auto — worker ${params.supplier}`];
    if (params.reference) details.push(`nr. înreg. ${params.reference}`);
    if (source === 'fix') details.push(quantity > 1 ? `taxă fixă portal × ${quantity}` : 'taxă fixă portal');
    else if (source === 'chitanta') details.push('sumă din chitanță');
    else details.push(quantity > 1 ? `tarif × ${quantity}` : 'tarif din Setări');

    const { error } = await supabase.from('order_supplier_costs').insert({
      order_id: params.orderId,
      supplier: params.supplier,
      category: 'taxa_institutie',
      description: details.join(' · '),
      amount_ron: amount,
    });
    if (error) {
      console.error('[auto-supplier-cost] insert failed:', error.message);
      return { outcome: 'error' };
    }
    return { outcome: 'inserted', amountRon: amount, source };
  } catch (error) {
    console.error('[auto-supplier-cost] failed:', error);
    return { outcome: 'error' };
  }
}
