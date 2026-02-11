/**
 * Oblio Invoice Helper
 *
 * Creates invoices from order data.
 * Handles both PF (individual) and PJ (company) clients.
 */

import { oblioRequest, getOblioConfig } from './client';
import type {
  OblioInvoiceInput,
  OblioInvoiceResponse,
  OblioClient,
  OblioProduct,
  OblioCollect,
  StoredInvoice,
} from './types';

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
  selected_options?: Array<{
    code?: string;
    name: string;
    price: number;
  }>;
  delivery_method?: string;
  delivery_price?: number;
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

  // Main service
  products.push({
    name: order.service_name,
    code: order.friendly_order_id || order.order_number,
    price: order.base_price || order.total_price,
    measuringUnit: 'buc',
    currency: 'RON',
    vatPercentage: 19,
    vatIncluded: true,
    quantity: 1,
    productType: 'Serviciu',
  });

  // Add options as separate line items
  if (order.selected_options?.length) {
    for (const option of order.selected_options) {
      products.push({
        name: option.name,
        code: option.code,
        price: option.price,
        measuringUnit: 'buc',
        currency: 'RON',
        vatPercentage: 19,
        vatIncluded: true,
        quantity: 1,
        productType: 'Serviciu',
      });
    }
  }

  // Add delivery as separate line item if applicable
  if (order.delivery_price && order.delivery_price > 0) {
    products.push({
      name: `Livrare: ${order.delivery_method || 'Standard'}`,
      price: order.delivery_price,
      measuringUnit: 'buc',
      currency: 'RON',
      vatPercentage: 19,
      vatIncluded: true,
      quantity: 1,
      productType: 'Serviciu',
    });
  }

  // Payment collection info
  const collect: OblioCollect = {
    type: paymentMethod,
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
