/**
 * Fiscalul unei anulări (refund 70%): stornarea facturii inițiale + factura
 * taxei de anulare (30% reținut). Idempotent — poate fi rulat oricând după
 * refund (din butonul „Reconciliază" din admin) și face DOAR ce lipsește:
 *
 *   factură inițială există și nu e stornată  →  storno (Oblio, refund=1)
 *   factura taxei de anulare lipsește           →  o emite (30% din total)
 *
 * Nicio excepție nu scapă: fiecare pas raportează ok / eroare, iar apelantul
 * decide ce arată echipei. Refundul Stripe NU se face aici.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { getOblioConfig } from '@/lib/oblio/client';
import { buildOblioClient, createInvoice, formatInvoiceNumber } from '@/lib/oblio/invoice';
import { parseInvoiceNumber } from '@/lib/oblio/parse-number';
import { createStornoInvoice, getInvoiceFlags } from '@/lib/oblio/storno';
import { isInvoicingEnabled } from '@/lib/oblio/invoicing-enabled';
import { buildCancelFeeInvoiceInput, computeCancelFeeAmount } from './cancel-fee-invoice';

export interface CancellationFiscalResult {
  /** Factura inițială (dacă a existat). */
  originalInvoice: string | null;
  storno: { number: string | null; status: 'issued' | 'already' | 'none' | 'error'; error?: string };
  feeInvoice: { number: string | null; url: string | null; status: 'issued' | 'already' | 'disabled' | 'error'; error?: string };
  feeRon: number;
}

interface OrderRowForFiscal {
  id: string;
  friendly_order_id: string | null;
  order_number: string | null;
  total_price: number | string | null;
  stripe_payment_intent_id: string | null;
  invoice_number: string | null;
  storno_invoice_number: string | null;
  cancel_fee_invoice_number: string | null;
  cancel_fee_invoice_url: string | null;
  customer_data: Record<string, unknown> | null;
  services: { name?: string | null } | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, any, any>;

export async function settleCancellationInvoicing(
  admin: AnyClient,
  orderId: string,
  changedBy: string
): Promise<CancellationFiscalResult> {
  const { data, error } = await admin
    .from('orders')
    .select(
      'id, friendly_order_id, order_number, total_price, stripe_payment_intent_id, invoice_number, storno_invoice_number, cancel_fee_invoice_number, cancel_fee_invoice_url, customer_data, services(name)'
    )
    .eq('id', orderId)
    .single();
  if (error || !data) {
    throw new Error(error?.message || 'Order not found');
  }
  const o = data as unknown as OrderRowForFiscal;
  const orderNumber = o.friendly_order_id || o.order_number || o.id;
  const totalRon = Number(o.total_price ?? 0);
  const feeRon = computeCancelFeeAmount(totalRon);

  const result: CancellationFiscalResult = {
    originalInvoice: o.invoice_number,
    storno: { number: o.storno_invoice_number, status: 'none' },
    feeInvoice: { number: o.cancel_fee_invoice_number, url: o.cancel_fee_invoice_url, status: 'already' },
    feeRon,
  };

  const note = async (text: string, value?: Record<string, unknown>) => {
    await admin.from('order_history').insert({
      order_id: orderId,
      event_type: 'admin_action',
      changed_by: changedBy,
      notes: text,
      new_value: value ?? null,
    });
  };

  // ── 1. Storno pe factura inițială ────────────────────────────────────────
  if (o.invoice_number && o.storno_invoice_number) {
    result.storno = { number: o.storno_invoice_number, status: 'already' };
  } else if (o.invoice_number) {
    const parsed = parseInvoiceNumber(o.invoice_number);
    if (!parsed) {
      result.storno = { number: null, status: 'error', error: `Număr de factură neparsabil: ${o.invoice_number}` };
    } else {
      try {
        const flags = await getInvoiceFlags(parsed.seriesName, parsed.number);
        if (flags.found && flags.stornoed) {
          // Stornată deja manual din Oblio (nu știm numărul stornoului).
          result.storno = { number: null, status: 'already' };
          await note(`Factura ${o.invoice_number} era deja stornată în Oblio (manual) — nu s-a emis alt storno.`);
        } else if (flags.found && flags.canceled) {
          result.storno = { number: null, status: 'already' };
          await note(`Factura ${o.invoice_number} este ANULATĂ în Oblio (nu stornată) — verifică dacă a plecat în SPV.`);
        } else {
          const storno = await createStornoInvoice(parsed.seriesName, parsed.number);
          const stornoNumber = formatInvoiceNumber(storno.seriesName, storno.number);
          await admin.from('orders').update({ storno_invoice_number: stornoNumber }).eq('id', orderId);
          result.storno = { number: stornoNumber, status: 'issued' };
          await note(`Storno emis pentru factura ${o.invoice_number}: ${stornoNumber} (anulare comandă, refund ${100 - Math.round((feeRon / (totalRon || 1)) * 100)}%).`, {
            storno_invoice: stornoNumber,
            storno_url: storno.link ?? null,
          });
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        result.storno = { number: null, status: 'error', error: msg };
        await note(`⚠️ Stornarea facturii ${o.invoice_number} a EȘUAT: ${msg.slice(0, 400)}. Stornează manual din Oblio, apoi apasă „Reconciliază".`);
      }
    }
  }

  // ── 2. Factura taxei de anulare (30%) ────────────────────────────────────
  if (o.cancel_fee_invoice_number) {
    result.feeInvoice = { number: o.cancel_fee_invoice_number, url: o.cancel_fee_invoice_url, status: 'already' };
  } else if (!(await isInvoicingEnabled())) {
    result.feeInvoice = { number: null, url: null, status: 'disabled' };
  } else if (feeRon <= 0) {
    result.feeInvoice = { number: null, url: null, status: 'error', error: 'Taxa de anulare este 0' };
  } else {
    try {
      const config = getOblioConfig();
      const client = buildOblioClient((o.customer_data ?? {}) as Parameters<typeof buildOblioClient>[0]);
      const input = buildCancelFeeInvoiceInput({
        cif: config.companyCif,
        seriesName: config.seriesName,
        client,
        orderNumber,
        serviceName: o.services?.name || 'Serviciu eGhiseul',
        feeRon,
        paymentReference: o.stripe_payment_intent_id || orderNumber,
      });
      const inv = await createInvoice(input);
      const feeNumber = formatInvoiceNumber(inv.seriesName, inv.number);
      await admin
        .from('orders')
        .update({ cancel_fee_invoice_number: feeNumber, cancel_fee_invoice_url: inv.link ?? null })
        .eq('id', orderId);
      result.feeInvoice = { number: feeNumber, url: inv.link ?? null, status: 'issued' };
      await note(`Factură taxă de anulare (${feeRon.toFixed(2)} RON, 30% reținut) emisă: ${feeNumber}.`, {
        cancel_fee_invoice: feeNumber,
        cancel_fee_invoice_url: inv.link ?? null,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      result.feeInvoice = { number: null, url: null, status: 'error', error: msg };
      await note(`⚠️ Factura taxei de anulare (${feeRon.toFixed(2)} RON) NU s-a emis: ${msg.slice(0, 400)}. Apasă „Reconciliază" după ce Oblio răspunde.`);
    }
  }

  return result;
}
