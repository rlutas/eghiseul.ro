/**
 * Factura taxei de anulare (30% reținut la anularea în 30 de minute).
 *
 * Pur, testat: primește comanda + suma reținută și construiește input-ul
 * Oblio cu O SINGURĂ linie. Emiterea propriu-zisă e în cancellation-fiscal.ts.
 */

import type { OblioClient, OblioInvoiceInput } from '@/lib/oblio/types';
import { RO_VAT_NAME, RO_VAT_RATE } from '@/lib/oblio/vat';
import { CANCEL_REFUND_PERCENT, computeCancelRefundAmount } from './self-cancel';

export const CANCEL_FEE_PERCENT = 100 - CANCEL_REFUND_PERCENT;

/** Suma reținută (RON, 2 zecimale) = total − refund; complementară refundului
 *  ca să nu piardă/creeze un ban din rotunjiri separate. */
export function computeCancelFeeAmount(totalRon: number): number {
  return Math.round((totalRon - computeCancelRefundAmount(totalRon)) * 100) / 100;
}

export interface CancelFeeInvoiceParams {
  cif: string;
  seriesName: string;
  client: OblioClient;
  orderNumber: string;
  serviceName: string;
  feeRon: number;
  /** Id-ul PaymentIntent (Oblio cere `documentNumber` la încasările cu cardul). */
  paymentReference: string;
  /** Data emiterii, YYYY-MM-DD (injectabilă pentru teste). */
  issueDate?: string;
}

export function cancelFeeLineName(orderNumber: string): string {
  return `Taxă anulare comandă ${orderNumber} (${CANCEL_FEE_PERCENT}% reținut conform Termeni și condiții)`;
}

export function buildCancelFeeInvoiceInput(p: CancelFeeInvoiceParams): OblioInvoiceInput {
  if (!(p.feeRon > 0)) {
    throw new Error('Taxa de anulare trebuie să fie pozitivă');
  }
  const issueDate = p.issueDate ?? new Date().toISOString().slice(0, 10);
  return {
    cif: p.cif,
    seriesName: p.seriesName,
    client: p.client,
    issueDate,
    dueDate: issueDate,
    language: 'RO',
    currency: 'RON',
    products: [
      {
        name: cancelFeeLineName(p.orderNumber),
        description: `Serviciu: ${p.serviceName}. Comanda a fost anulată de client în termenul de 30 de minute; ${CANCEL_REFUND_PERCENT}% din valoare a fost rambursat.`,
        price: p.feeRon,
        measuringUnit: 'buc',
        currency: 'RON',
        vatName: RO_VAT_NAME,
        vatPercentage: RO_VAT_RATE,
        vatIncluded: true,
        quantity: 1,
        productType: 'Serviciu',
      },
    ],
    collect: {
      type: 'Card',
      documentDate: issueDate,
      documentNumber: p.paymentReference,
      value: p.feeRon,
    },
  };
}
