/**
 * Storno + starea unei facturi în Oblio.
 *
 * La anularea unei comenzi (refund 70%) factura inițială — deja transmisă în
 * SPV de Oblio — nu se „anulează", se STORNEAZĂ: o factură nouă, cu liniile
 * negative, care ajunge și ea în SPV. Apoi se emite factura taxei de anulare
 * (30% reținut) — vezi src/lib/orders/cancellation-fiscal.ts.
 */

import { getOblioConfig, oblioRequest } from './client';
import type { OblioInvoiceResponse } from './types';

export interface OblioInvoiceFlags {
  found: boolean;
  /** `canceled=1` — factura a fost anulată (nu stornată). */
  canceled: boolean;
  /** `stornoed=1` — factura are deja o factură de stornare. */
  stornoed: boolean;
  /** `storno=1` — documentul ESTE el însuși o factură de stornare. */
  isStorno: boolean;
  /** `collected=1` — are încasare atașată. */
  collected: boolean;
  total: number | null;
}

interface OblioListRow {
  canceled?: string | number;
  stornoed?: string | number;
  storno?: string | number;
  collected?: string | number;
  total?: string | number;
  number?: string;
}

const flag = (v: string | number | undefined): boolean => String(v ?? '0') === '1';

/**
 * Citește flag-urile facturii din listarea Oblio (GET-ul simplu nu le
 * întoarce — doar link + încasări).
 */
export async function getInvoiceFlags(seriesName: string, number: string): Promise<OblioInvoiceFlags> {
  const config = getOblioConfig();
  const qs = new URLSearchParams({ cif: config.companyCif, seriesName, number });
  const rows = await oblioRequest<OblioListRow[]>({
    endpoint: `/docs/invoice/list?${qs.toString()}`,
    method: 'GET',
  });
  const row = (Array.isArray(rows) ? rows : []).find((r) => String(r.number ?? '') === number) ?? (Array.isArray(rows) ? rows[0] : undefined);
  if (!row) {
    return { found: false, canceled: false, stornoed: false, isStorno: false, collected: false, total: null };
  }
  const total = row.total != null ? Number(row.total) : null;
  return {
    found: true,
    canceled: flag(row.canceled),
    stornoed: flag(row.stornoed),
    isStorno: flag(row.storno),
    collected: flag(row.collected),
    total: Number.isFinite(total as number) ? total : null,
  };
}

/**
 * Emite factura de STORNARE pentru `seriesName-number` (toate liniile, cu
 * minus). `refund: 1` îi spune lui Oblio să șteargă și încasarea atașată
 * facturii inițiale — altfel încasarea rămânea pe fișa clientului ca
 * „credit nefolosit" deși banii plecaseră prin Stripe (cazul Tamaduianu,
 * 03.08.2026).
 */
export async function createStornoInvoice(
  seriesName: string,
  number: string
): Promise<OblioInvoiceResponse['data']> {
  const config = getOblioConfig();
  return oblioRequest<OblioInvoiceResponse['data']>({
    endpoint: '/docs/invoice',
    method: 'POST',
    body: {
      cif: config.companyCif,
      seriesName: config.seriesName,
      referenceDocument: {
        type: 'Factura',
        seriesName,
        number,
        refund: 1,
      },
    },
  });
}
