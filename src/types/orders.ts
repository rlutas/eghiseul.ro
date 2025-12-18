// Order Types for Wizard and API

import { DeliveryMethod, Service, ServiceOption } from './services';

// Contact Information (Step 1)
export interface ContactData {
  email: string;
  phone: string;
  preferred_contact: 'email' | 'phone' | 'whatsapp';
}

// Personal Data (Step 2)
export interface PersonalData {
  cnp: string;
  ci_series: string;  // CI series (e.g., "XV")
  ci_number: string;  // CI number (e.g., "517628")
  first_name: string;
  last_name: string;
  birth_date: string;
  birth_place: string;
  address: AddressData;
  // Dynamic fields from service config
  [key: string]: string | AddressData | undefined;
}

export interface AddressData {
  street: string;
  number: string;
  building?: string;
  staircase?: string; // Scara
  floor?: string; // Etaj
  apartment?: string;
  city: string;
  county: string;
  postal_code?: string; // Optional - not all addresses have postal codes
}

// Selected Options (Step 3)
export interface SelectedOption {
  option_id: string;
  option_name: string;
  quantity: number;
  price_modifier: number;
}

// KYC Documents (Step 4)
export interface KYCDocuments {
  ci_front?: DocumentUpload;
  ci_back?: DocumentUpload;
  selfie?: DocumentUpload;
}

export interface DocumentUpload {
  file_url: string;
  uploaded_at: string;
  file_size: number;
  mime_type: string;
  validation_result?: KYCValidationResult;
  // Base64 data for reference purposes (e.g., selfie face matching)
  // This is NOT stored in the database, only used in-memory during the wizard
  imageBase64?: string;
}

// KYC AI Validation Result
export interface KYCValidationResult {
  valid: boolean;
  confidence: number;
  documentType: 'ci_front' | 'ci_back' | 'selfie' | 'passport' | 'unknown';
  extractedData?: {
    // CI Front / Passport
    cnp?: string;
    lastName?: string;
    firstName?: string;
    birthDate?: string;
    birthPlace?: string;
    gender?: 'male' | 'female';
    nationality?: string;
    expiryDate?: string;
    series?: string;
    number?: string;
    // CI Back
    address?: ExtractedAddressData;
    issueDate?: string;
    issuedBy?: string;
    // Selfie
    faceMatch?: boolean;
    faceMatchConfidence?: number;
  };
  issues: string[];
  suggestions: string[];
}

// Address data extracted from OCR
export interface ExtractedAddressData {
  fullAddress?: string;
  county?: string;
  city?: string;
  sector?: string; // For București (1-6)
  street?: string;
  streetType?: string; // Strada/Bulevardul/Aleea/Calea
  number?: string;
  building?: string;
  staircase?: string; // Scara
  floor?: string; // Etaj
  apartment?: string;
  postalCode?: string;
}

// Signature (Step 5)
export interface SignatureData {
  signature_base64: string;
  accepted_terms: boolean;
  signed_at: string;
}

// Delivery Selection (Step 5)
export interface DeliverySelection {
  method: DeliveryMethod;
  address?: AddressData;
}

// Order Wizard Steps
export type WizardStep =
  | 'contact'    // Step 1
  | 'personal'   // Step 2
  | 'options'    // Step 3
  | 'kyc'        // Step 4
  | 'delivery'   // Step 5
  | 'review';    // Step 6

export const WIZARD_STEPS: { id: WizardStep; label: string; number: number }[] = [
  { id: 'contact', label: 'Contact', number: 1 },
  { id: 'personal', label: 'Date Personale', number: 2 },
  { id: 'options', label: 'Opțiuni', number: 3 },
  { id: 'kyc', label: 'Verificare KYC', number: 4 },
  { id: 'delivery', label: 'Livrare & Semnătură', number: 5 },
  { id: 'review', label: 'Finalizare', number: 6 },
];

// Complete Wizard State
export interface OrderWizardState {
  currentStep: WizardStep;
  stepNumber: number;
  serviceSlug: string | null;
  service: Service | null;
  serviceOptions: ServiceOption[];

  // Step Data
  contactData: Partial<ContactData>;
  personalData: Partial<PersonalData>;
  selectedOptions: SelectedOption[];
  kycDocuments: Partial<KYCDocuments>;
  signatureData: Partial<SignatureData>;
  deliverySelection: Partial<DeliverySelection>;

  // Order Metadata
  orderId: string | null;
  isDirty: boolean;
  lastSavedAt: string | null;
  isLoading: boolean;
  error: string | null;
}

// Wizard Actions
export type OrderWizardAction =
  | { type: 'SET_SERVICE'; payload: { service: Service; options: ServiceOption[] } }
  | { type: 'SET_STEP'; payload: WizardStep }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'UPDATE_CONTACT'; payload: Partial<ContactData> }
  | { type: 'UPDATE_PERSONAL'; payload: Partial<PersonalData> }
  | { type: 'UPDATE_OPTIONS'; payload: SelectedOption[] }
  | { type: 'UPDATE_KYC'; payload: Partial<KYCDocuments> }
  | { type: 'UPDATE_SIGNATURE'; payload: Partial<SignatureData> }
  | { type: 'UPDATE_DELIVERY'; payload: Partial<DeliverySelection> }
  | { type: 'SET_ORDER_ID'; payload: string }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS'; payload: string }
  | { type: 'SAVE_ERROR'; payload: string }
  | { type: 'MARK_DIRTY' }
  | { type: 'RESET' };

// Order Status from API
export type OrderStatus =
  | 'draft'
  | 'pending'
  | 'paid'
  | 'processing'
  | 'kyc_pending'
  | 'kyc_approved'
  | 'kyc_rejected'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'refunded';

// Order Entity (from database)
export interface Order {
  id: string;
  user_id: string;
  partner_id: string | null;
  service_id: string;
  status: OrderStatus;
  customer_data: {
    contact: ContactData;
    personal: PersonalData;
  };
  selected_options: SelectedOption[];
  kyc_documents: KYCDocuments | null;
  delivery_method: DeliveryMethod | null;
  delivery_address: AddressData | null;
  signature: string | null;
  base_price: number;
  options_price: number;
  delivery_price: number;
  discount_amount: number;
  total_price: number;
  currency: string;
  payment_intent_id: string | null;
  payment_status: 'pending' | 'processing' | 'succeeded' | 'failed' | null;
  submitted_at: string | null;
  estimated_completion: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  service?: Service;
}

// Price Calculation
export interface PriceBreakdown {
  basePrice: number;
  optionsPrice: number;
  deliveryPrice: number;
  discountAmount: number;
  totalPrice: number;
  currency: string;
}
