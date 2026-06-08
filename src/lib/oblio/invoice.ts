/**
 * Oblio Invoice Helper
 *
 * Creates invoices from order data.
 * Handles both PF (individual) and PJ (company) clients.
 */

import { oblioRequest, getOblioConfig } from './client';
import { normalizeOrderOptions } from '@/lib/orders/normalize';
import type {
  OblioInvoiceInput,
  OblioInvoiceResponse,
  OblioClient,
  OblioProduct,
  OblioCollect,
  StoredInvoice,
} from './types';

// Romanian VAT rate (changed from 19% to 21% in 2026).
const RO_VAT_RATE = 21;

// ============================================================================
// Invoice Creation
// ============================================================================

/**
 * Create invoice via Oblio API
 */
export async function createInvoice(
  input: OblioInvoiceInput
): Promise<OblioInvoiceResponse['data']> {
  return oblioRequest<OblioInvoiceResponse['data']>({
    endpoint: '/docs/invoice',
    method: 'POST',
    body: input,
  });
}

/**
 * Carve a fixed lawyer fee out of a service's base price for a separate
 * "Onorariu Avocat" invoice line. Returns the reduced service price and the
 * fee actually applied. No split when the fee is 0/missing or the base price
 * isn't strictly larger than the fee (can't reduce the service to ≤ 0).
 */
export function computeLawyerFee(
  basePrice: number,
  lawyerFeeRon: number | null | undefined,
): { servicePrice: number; lawyerFee: number } {
  const fee = lawyerFeeRon && lawyerFeeRon > 0 ? lawyerFeeRon : 0;
  if (fee <= 0 || basePrice <= fee) {
    return { servicePrice: basePrice, lawyerFee: 0 };
  }
  return {
    servicePrice: Math.round((basePrice - fee) * 100) / 100,
    lawyerFee: fee,
  };
}

// ============================================================================
// Order to Invoice
// ============================================================================

interface OrderForInvoice {
  id: string;
  order_number?: string;
  friendly_order_id?: string;
  service_name: string;
  base_price?: number;
  total_price: number;
  /** Lawyer fee (RON) to carve out of the main service line as a separate
   *  "Onorariu Avocat" line. Per-service config (services.lawyer_fee_ron);
   *  0/undefined → no split. */
  lawyer_fee_ron?: number | null;
  // Accepts any of the historical/current shapes — normalizeOrderOptions
  // handles wizard camelCase, DB snake_case, and legacy {name, price}.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selected_options?: any[];
  // delivery_method may be a string (legacy) or an object `{method,methodName,price,...}`
  // (current shape stored as JSONB) — the renderer handles both.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delivery_method?: any;
  delivery_price?: number;
  /** Coupon code applied at checkout — used as the discount line item name. */
  coupon_code?: string | null;
  /** Discount amount in RON. Rendered as a negative-price line so the
   *  invoice total matches the charged amount. */
  discount_amount?: number | null;
  customer_data?: {
    contact?: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
    };
    billing?: {
      type: 'individual' | 'company';
      // Individual fields
      firstName?: string;
      lastName?: string;
      cnp?: string;
      // Company fields
      companyName?: string;
      cui?: string;
      regCom?: string;
      // Address
      address?: string;
      county?: string;
      city?: string;
      country?: string;
    };
    address?: {
      street?: string;
      city?: string;
      county?: string;
      country?: string;
    };
  };
}

type PaymentMethodType = 'Card' | 'Transfer bancar' | 'Cash';

/**
 * Create invoice from order data
 *
 * @param order - Order data with customer info
 * @param paymentMethod - Payment method used
 * @returns Invoice response with series, number, and PDF link
 */
export async function createInvoiceFromOrder(
  order: OrderForInvoice,
  paymentMethod: PaymentMethodType = 'Card'
): Promise<StoredInvoice> {
  const config = getOblioConfig();
  const billing = order.customer_data?.billing;
  const contact = order.customer_data?.contact;
  const address = order.customer_data?.address;

  const isPJ = billing?.type === 'company';

  // Build client object
  const client: OblioClient = isPJ
    ? {
        // Company client
        name: billing?.companyName || 'N/A',
        cif: billing?.cui || '',
        rc: billing?.regCom,
        address: billing?.address || address?.street || '',
        city: billing?.city || address?.city || '',
        state: billing?.county || address?.county || '',
        country: billing?.country || address?.country || 'Romania',
        email: contact?.email,
        phone: contact?.phone,
        vatPayer: billing?.cui?.startsWith('RO') || false,
        save: true,
      }
    : {
        // Individual client (PF)
        name: `${billing?.firstName || contact?.firstName || ''} ${billing?.lastName || contact?.lastName || ''}`.trim() || 'N/A',
        cif: billing?.cnp || '', // CNP for individuals
        address: billing?.address || address?.street || '',
        city: billing?.city || address?.city || '',
        state: billing?.county || address?.county || '',
        country: billing?.country || address?.country || 'Romania',
        email: contact?.email,
        phone: contact?.phone,
        vatPayer: false,
        save: false, // Don't save individual clients
      };

  // Build products array
  const products: OblioProduct[] = [];

  // Main service — for services configured with a lawyer fee, carve a fixed
  // "Onorariu Avocat" amount out of the service price so it shows as its own
  // line (total unchanged). VAT identical to the service line.
  const baseServicePrice = order.base_price || order.total_price;
  const { servicePrice, lawyerFee } = computeLawyerFee(
    baseServicePrice,
    order.lawyer_fee_ron,
  );

  products.push({
    name: order.service_name,
    code: order.friendly_order_id || order.order_number,
    price: servicePrice,
    measuringUnit: 'buc',
    currency: 'RON',
    vatPercentage: RO_VAT_RATE,
    vatIncluded: true,
    quantity: 1,
    productType: 'Serviciu',
  });

  if (lawyerFee > 0) {
    products.push({
      name: 'Onorariu Avocat',
      description: 'Asistență juridică și reprezentare în fața autorităților',
      price: lawyerFee,
      measuringUnit: 'buc',
      currency: 'RON',
      vatPercentage: RO_VAT_RATE,
      vatIncluded: true,
      quantity: 1,
      productType: 'Serviciu',
    });
  }

  // Add options as separate line items (canonical normalization handles all shapes)
  const normalizedOptions = normalizeOrderOptions(order.selected_options);
  for (const option of normalizedOptions) {
    products.push({
      name: option.name,
      code: option.code,
      price: option.unitPrice,
      measuringUnit: 'buc',
      currency: 'RON',
      vatPercentage: RO_VAT_RATE,
      vatIncluded: true,
      quantity: option.quantity,
      productType: 'Serviciu',
    });
  }

  // Add delivery as separate line item if applicable.
  // `delivery_method` is a JSONB blob in the DB (often `{method, methodName,
  // price, ...}`); we normalize both shapes here for a clean line.
  const deliveryLabel = (() => {
    const dm = order.delivery_method;
    if (!dm) return 'Standard';
    if (typeof dm === 'string') return dm;
    if (typeof dm === 'object' && dm !== null) {
      const obj = dm as Record<string, unknown>;
      return String(obj.methodName ?? obj.method ?? 'Standard');
    }
    return 'Standard';
  })();
  if (order.delivery_price && order.delivery_price > 0) {
    products.push({
      name: `Livrare: ${deliveryLabel}`,
      price: order.delivery_price,
      measuringUnit: 'buc',
      currency: 'RON',
      vatPercentage: RO_VAT_RATE,
      vatIncluded: true,
      quantity: 1,
      productType: 'Serviciu',
    });
  }

  // Add coupon discount as a negative-price line item so the invoice shows
  // the reduction transparently (Oblio displays it as "Reducere cupon" with
  // a minus). The total still matches `order.total_price` (post-discount).
  if (
    typeof order.discount_amount === 'number' &&
    order.discount_amount > 0
  ) {
    products.push({
      name: order.coupon_code
        ? `Reducere cupon ${order.coupon_code}`
        : 'Reducere aplicată',
      code: order.coupon_code || undefined,
      price: -Math.abs(order.discount_amount),
      measuringUnit: 'buc',
      currency: 'RON',
      vatPercentage: RO_VAT_RATE,
      vatIncluded: true,
      quantity: 1,
      productType: 'Serviciu',
    });
  }

  // Payment collection info.
  // `documentNumber` is REQUIRED by Oblio when a `collect` block is present —
  // omitting it returns 400 "Parametrul `documentNumber` lipseste" and the
  // whole invoice fails to issue. We use the order number as the payment
  // reference so the receipt ties back to the order.
  const collect: OblioCollect = {
    type: paymentMethod,
    documentNumber: order.friendly_order_id || order.order_number || order.id,
    documentDate: new Date().toISOString().split('T')[0],
    value: order.total_price,
  };

  // Build invoice input
  const invoiceInput: OblioInvoiceInput = {
    cif: config.companyCif,
    client,
    products,
    seriesName: config.seriesName,
    collect,
    language: 'RO',
    currency: 'RON',
    useStock: 0,
  };

  // Create invoice via API
  const response = await createInvoice(invoiceInput);

  // Format stored invoice reference
  const invoiceNumber = `${response.seriesName}-${response.number}`;

  return {
    orderId: order.id,
    seriesName: response.seriesName,
    number: response.number,
    invoiceNumber,
    createdAt: new Date().toISOString(),
    pdfUrl: response.link,
  };
}

// ============================================================================
// Invoice Retrieval
// ============================================================================

interface GetInvoiceOptions {
  seriesName: string;
  number: string;
}

/**
 * Get invoice details from Oblio
 */
export async function getInvoice(options: GetInvoiceOptions) {
  const config = getOblioConfig();

  return oblioRequest({
    endpoint: `/docs/invoice?cif=${config.companyCif}&seriesName=${options.seriesName}&number=${options.number}`,
    method: 'GET',
  });
}

/**
 * Get PDF download link for invoice
 * Note: Oblio PDF links expire, so we should store PDFs in S3
 */
export async function getInvoicePdfUrl(
  seriesName: string,
  number: string
): Promise<string> {
  const config = getOblioConfig();

  const response = await oblioRequest<{ link: string }>({
    endpoint: `/docs/invoice?cif=${config.companyCif}&seriesName=${seriesName}&number=${number}`,
    method: 'GET',
  });

  return response.link;
}

// ============================================================================
// Invoice Cancellation
// ============================================================================

/**
 * Cancel (storno) an invoice
 * Creates a cancellation invoice
 */
export async function cancelInvoice(
  seriesName: string,
  number: string
): Promise<OblioInvoiceResponse['data']> {
  const config = getOblioConfig();

  return oblioRequest<OblioInvoiceResponse['data']>({
    endpoint: '/docs/cancel',
    method: 'POST',
    body: {
      cif: config.companyCif,
      seriesName,
      number,
    },
  });
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Format invoice number for display
 */
export function formatInvoiceNumber(seriesName: string, number: string): string {
  return `${seriesName}-${number.padStart(4, '0')}`;
}
