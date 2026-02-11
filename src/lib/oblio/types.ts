/**
 * Oblio API Types
 *
 * TypeScript interfaces for Oblio invoicing API.
 * Based on https://www.oblio.eu/api documentation.
 */

// ============================================================================
// Company & Client
// ============================================================================

export interface OblioCompany {
  cif: string;
  name: string;
  country?: string;
}

export interface OblioClient {
  cif: string;
  name: string;
  rc?: string; // Registrul Comertului (for companies)
  code?: string;
  address?: string;
  state?: string; // Judet
  city?: string;
  country?: string;
  iban?: string;
  bank?: string;
  email?: string;
  phone?: string;
  contact?: string;
  vatPayer?: boolean; // Is client VAT payer
  save?: boolean; // Save client in Oblio database
}

// ============================================================================
// Products
// ============================================================================

export interface OblioProduct {
  name: string;
  code?: string;
  description?: string;
  price: number;
  measuringUnit: string;
  currency: string;
  vatPercentage?: number;
  vatIncluded?: boolean;
  quantity: number;
  productType?: 'Marfa' | 'Serviciu';
  discount?: number;
  discountType?: 'valoric' | 'procentual';
  save?: boolean; // Save product in Oblio database
}

// ============================================================================
// Invoice
// ============================================================================

export interface OblioInvoiceInput {
  // Required fields
  cif: string; // Company CIF (eGhiseul)
  client: OblioClient;
  products: OblioProduct[];

  // Invoice details
  issueDate?: string; // YYYY-MM-DD, default today
  dueDate?: string; // YYYY-MM-DD
  seriesName?: string; // Invoice series (e.g., "EGH")
  deliveryDate?: string;

  // Payment
  collect?: OblioCollect;

  // Other
  useStock?: 0 | 1;
  language?: 'RO' | 'EN' | 'FR' | 'DE' | 'ES' | 'IT' | 'HU';
  precision?: number; // Decimal precision
  currency?: string;
  issuerName?: string;
  issuerId?: string;
  noticeNumber?: string;
  internalNote?: string;
  deputyName?: string;
  deputyIdentityCard?: string;
  deputyAuto?: string;
  seniorityPayment?: string; // Payment priority
  soldTo?: string; // Alternate delivery address

  // Discounts
  discountValue?: number;
  discountType?: 'valoric' | 'procentual';
}

export interface OblioCollect {
  type: 'Card' | 'Cash' | 'Transfer bancar' | 'Ordin de plata' | 'Chitanta' | string;
  documentDate?: string;
  documentNumber?: string;
  value?: number;
}

export interface OblioInvoiceResponse {
  status: number;
  statusMessage: string;
  data: {
    seriesName: string;
    number: string;
    link: string; // PDF download URL (temporary)
  };
}

// ============================================================================
// Stored Invoice Reference
// ============================================================================

export interface StoredInvoice {
  orderId: string;
  seriesName: string;
  number: string;
  invoiceNumber: string; // Combined: "EGH-0001"
  createdAt: string;
  pdfUrl?: string; // Stored PDF URL (in S3)
}

// ============================================================================
// API Response Types
// ============================================================================

export interface OblioApiResponse<T = unknown> {
  status: number;
  statusMessage: string;
  data: T;
}

export interface OblioTokenResponse {
  request_time: number;
  access_token: string;
  token_type: string;
  expires_in: number; // seconds (3600 = 1 hour)
}

export interface OblioErrorResponse {
  status: number;
  statusMessage: string;
}

// ============================================================================
// Configuration
// ============================================================================

export interface OblioConfig {
  clientId: string; // Email used for Oblio account
  clientSecret: string; // API key from Oblio settings
  companyCif: string; // CIF of the company issuing invoices
  seriesName: string; // Invoice series name (e.g., "EGH")
}
