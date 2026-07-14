/**
 * Oblio proforma helpers — used ONLY for extra charges (admin order
 * modifications that need an additional payment). Flow:
 *
 *   1. admin creates the extra charge → proforma issued (this file) and its
 *      PDF link goes in the payment email
 *   2. customer pays → the Stripe webhook issues the FISCAL invoice with
 *      referenceDocument pointing at the proforma (Oblio links them)
 *   3. extra never paid / cancelled → cancelProforma (best-effort)
 *
 * Regular orders are NOT affected — they keep the direct
 * invoice-after-payment flow (ensure-invoice.ts).
 *
 * Prerequisite: the proforma series must exist in Oblio (Setări → Serii
 * documente). Env: OBLIO_PROFORMA_SERIES (e.g. 'PEGH').
 */
import { oblioRequest, getOblioConfig } from './client';
import { buildOblioClient } from './invoice';
import type { OblioClient, OblioProduct } from './types';

const RO_VAT_RATE = 21;

export interface ProformaRef {
  seriesName: string;
  number: string;
  link: string | null;
}

export function getProformaSeries(): string | null {
  return process.env.OBLIO_PROFORMA_SERIES?.trim() || null;
}

interface ExtraDocInput {
  /** Order's human ref (E-260713-XXXX) — goes into mentions. */
  orderNumber: string;
  /** Extra amount in RON, VAT included. */
  amountRon: number;
  /** Human description of what is being charged (changes summary). */
  description: string;
  /** Raw order customer_data (same shape the invoice builder uses). */
  customerData: Parameters<typeof buildOblioClient>[0];
}

function buildProducts(input: ExtraDocInput): OblioProduct[] {
  return [
    {
      name: `Servicii suplimentare comanda ${input.orderNumber}`.slice(0, 200),
      description: input.description.slice(0, 500),
      price: input.amountRon,
      measuringUnit: 'buc',
      currency: 'RON',
      vatPercentage: RO_VAT_RATE,
      vatIncluded: true,
      quantity: 1,
      productType: 'Serviciu',
    },
  ];
}

interface OblioDocResponse {
  seriesName: string;
  number: string;
  link?: string;
}

/** Issue a proforma for an extra charge. Throws when the series is missing. */
export async function createProformaForExtra(input: ExtraDocInput): Promise<ProformaRef> {
  const series = getProformaSeries();
  if (!series) {
    throw new Error('OBLIO_PROFORMA_SERIES nu e configurat — creează seria în Oblio și setează env-ul');
  }
  const config = getOblioConfig();
  const client: OblioClient = buildOblioClient(input.customerData);
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 10);

  const data = await oblioRequest<OblioDocResponse>({
    endpoint: '/docs/proforma',
    method: 'POST',
    body: {
      cif: config.companyCif,
      client,
      seriesName: series,
      issueDate: today,
      dueDate: due,
      language: 'RO',
      currency: 'RON',
      mentions: `Plată suplimentară comanda ${input.orderNumber}`,
      products: buildProducts(input),
    },
  });
  return { seriesName: data.seriesName, number: String(data.number), link: data.link ?? null };
}

/**
 * Issue the fiscal invoice for a PAID extra charge, referencing its proforma
 * so Oblio links the two documents.
 */
export async function createInvoiceFromProforma(
  input: ExtraDocInput & { proforma: ProformaRef; paymentIntentId?: string | null }
): Promise<ProformaRef> {
  const config = getOblioConfig();
  const client: OblioClient = buildOblioClient(input.customerData);
  const today = new Date().toISOString().slice(0, 10);

  const data = await oblioRequest<OblioDocResponse>({
    endpoint: '/docs/invoice',
    method: 'POST',
    body: {
      cif: config.companyCif,
      client,
      seriesName: config.seriesName,
      issueDate: today,
      deliveryDate: today,
      collectDate: today,
      language: 'RO',
      currency: 'RON',
      mentions: `Plată suplimentară comanda ${input.orderNumber}${input.paymentIntentId ? ` · ${input.paymentIntentId}` : ''}`,
      referenceDocument: {
        type: 'Proforma',
        seriesName: input.proforma.seriesName,
        number: input.proforma.number,
      },
      collect: {
        type: 'Card',
        documentNumber: input.paymentIntentId ?? input.orderNumber,
      },
      products: buildProducts(input),
    },
  });
  return { seriesName: data.seriesName, number: String(data.number), link: data.link ?? null };
}

/** Cancel a proforma (extra charge abandoned/cancelled). Best-effort. */
export async function cancelProforma(ref: ProformaRef): Promise<boolean> {
  try {
    const config = getOblioConfig();
    await oblioRequest({
      endpoint: '/docs/proforma/cancel',
      method: 'PUT',
      body: { cif: config.companyCif, seriesName: ref.seriesName, number: ref.number },
    });
    return true;
  } catch (err) {
    console.warn('[oblio/proforma] cancel failed (non-blocking):', err instanceof Error ? err.message : err);
    return false;
  }
}
