/**
 * Oblio Integration
 *
 * Exports all Oblio-related functionality for invoice creation.
 */

// Client
export {
  getOblioToken,
  oblioRequest,
  getOblioConfig,
  testOblioConnection,
  clearTokenCache,
} from './client';

// Invoice
export {
  createInvoice,
  createInvoiceFromOrder,
  getInvoice,
  getInvoicePdfUrl,
  cancelInvoice,
  formatInvoiceNumber,
} from './invoice';

// Ensure-invoice (single chokepoint for first-time invoice emission)
export { ensureInvoiceForPaidOrder } from './ensure-invoice';
export type { EnsureInvoiceResult } from './ensure-invoice';

// Types
export type {
  OblioCompany,
  OblioClient,
  OblioProduct,
  OblioInvoiceInput,
  OblioInvoiceResponse,
  OblioCollect,
  StoredInvoice,
  OblioConfig,
  OblioApiResponse,
  OblioTokenResponse,
  OblioErrorResponse,
} from './types';
