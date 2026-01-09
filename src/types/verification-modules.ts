/**
 * Verification Modules Type Definitions
 *
 * This file defines the types for the modular verification system.
 * Each service can enable/disable different verification modules.
 */

// ============================================================================
// DOCUMENT TYPES
// ============================================================================

export type DocumentType =
  | 'ci_vechi'             // Old Romanian ID (has address on front)
  | 'ci_nou_front'         // New Romanian ID front
  | 'ci_nou_back'          // New Romanian ID back
  | 'passport'             // Passport
  | 'certificat_domiciliu' // Certificate of domicile (for address)
  | 'residence_permit'     // Permis de rezidență
  | 'registration_cert'    // Certificat de înregistrare
  | 'selfie'               // Selfie for face matching
  | 'unknown';

export type CitizenshipType = 'romanian' | 'european' | 'foreign';

// ============================================================================
// MODULE CONFIGURATIONS
// ============================================================================

/**
 * Personal KYC Module Configuration
 * Used for identity verification with Romanian documents
 */
export interface PersonalKYCConfig {
  enabled: boolean;

  // Document requirements
  acceptedDocuments: DocumentType[];
  requireAddressCertificate: 'always' | 'ci_nou_passport' | 'never';

  // Verification requirements
  selfieRequired: boolean;
  signatureRequired: boolean;

  // Expiry rules
  expiredDocumentAllowed: boolean;
  expiredDocumentMessage?: string;

  // Citizenship-specific flows
  citizenshipFlows: {
    romanian: CitizenshipFlowConfig;
    european: CitizenshipFlowConfig;
    foreign: CitizenshipFlowConfig;
  };

  // Parent information
  parentDataRequired: boolean;  // Require parent names (tata, mama)
  parentDocuments: {
    enabled: boolean;
    condition?: string;  // e.g., "applicant_type == 'minor'"
  };
}

export interface CitizenshipFlowConfig {
  documents: string[];
  processingType?: 'standard' | 'extended';
  extraCost?: number;
  extraDays?: number;
}

/**
 * Company KYC Module Configuration
 * Used for company verification with CUI
 */
export interface CompanyKYCConfig {
  enabled: boolean;
  condition?: string;  // When to show, e.g., "client_type == 'PJ'"

  // CUI validation
  validation: 'infocui' | 'onrc' | 'manual';
  autoComplete: boolean;  // Auto-fill company data from CUI

  // Entity type rules
  allowedTypes: string[];
  blockedTypes: string[];
  blockMessage?: string;

  // Special handling for specific entity types
  specialRules: CompanySpecialRule[];
}

export interface CompanySpecialRule {
  entityTypes: string[];
  action: 'allow' | 'block' | 'warn' | 'redirect';
  message: string;
  redirectService?: string;
}

/**
 * Property Verification Module Configuration
 * Used for property/land data (Carte Funciară)
 */
export interface PropertyVerificationConfig {
  enabled: boolean;

  // Required fields
  fields: {
    county: { required: boolean };
    locality: { required: boolean };
    carteFunciara: { required: boolean };
    cadastral: { required: boolean };
    topografic: { required: boolean };
  };

  // Special identification services
  identificationService: {
    enabled: boolean;
    extraFields: string[];  // e.g., ['ownerName', 'address', 'cnpCui']
  };
}

/**
 * Vehicle Verification Module Configuration
 * Used for vehicle data (Cazier Auto, Rovinieta)
 */
export interface VehicleVerificationConfig {
  enabled: boolean;

  // Required fields
  fields: {
    plateNumber: { required: boolean };
    vin: { required: boolean };
    brand: { required: boolean };
    model: { required: boolean };
    year: { required: boolean };
    category: { required: boolean };  // For rovinieta
    period: { required: boolean };    // For rovinieta
  };

  // Validation
  plateFormat: 'romanian' | 'any';
  vinValidation: boolean;
}

/**
 * Signature Module Configuration
 */
export interface SignatureConfig {
  enabled: boolean;
  required: boolean;
  termsAcceptanceRequired: boolean;
}

// ============================================================================
// SERVICE VERIFICATION CONFIG
// ============================================================================

/**
 * Client Type Selection Configuration
 * Used when a service supports both PF (Persoana Fizică) and PJ (Persoana Juridică)
 */
export interface ClientTypeSelectionConfig {
  enabled: boolean;
  options: Array<{
    value: 'PF' | 'PJ';
    label: string;
    description?: string;
  }>;
  defaultValue?: 'PF' | 'PJ';
}

/**
 * Complete verification configuration for a service
 * This is stored in the services.verification_config JSONB column
 */
export interface ServiceVerificationConfig {
  // Client type selection (PF vs PJ)
  clientTypeSelection?: ClientTypeSelectionConfig;

  // Verification modules
  personalKyc: PersonalKYCConfig;
  companyKyc: CompanyKYCConfig;
  propertyVerification: PropertyVerificationConfig;
  vehicleVerification: VehicleVerificationConfig;
  signature: SignatureConfig;

  // External redirect (e.g., Rovinieta)
  externalRedirect?: {
    enabled: boolean;
    url: string;
    utmTracking: boolean;
  };
}

// ============================================================================
// WIZARD STEP TYPES
// ============================================================================

export type ModularStepId =
  | 'contact'           // Always present
  | 'client-type'       // Client type selection (PF/PJ)
  | 'personal-data'     // Personal KYC data entry
  | 'company-data'      // Company KYC data entry
  | 'property-data'     // Property data entry
  | 'vehicle-data'      // Vehicle data entry
  | 'options'           // Service options
  | 'kyc-documents'     // Document upload + OCR
  | 'signature'         // Signature canvas
  | 'delivery'          // Delivery selection
  | 'billing'           // Billing profile (PF/PJ)
  | 'review';           // Final review

export type ClientType = 'PF' | 'PJ' | null;

export interface ModularStep {
  id: ModularStepId;
  label: string;
  labelRo: string;  // Romanian label
  number: number;
  condition?: (state: ModularWizardState) => boolean;
  moduleType: 'core' | 'personalKyc' | 'companyKyc' | 'property' | 'vehicle' | 'signature' | 'billing';
}

// ============================================================================
// MODULE STATE TYPES
// ============================================================================

/**
 * Personal KYC Module State
 */
export interface PersonalKYCState {
  // Basic data
  firstName: string;
  lastName: string;
  cnp: string;
  birthDate: string;
  birthPlace: string;
  citizenship: CitizenshipType;

  // Document info
  documentType: DocumentType | null;
  documentSeries: string;
  documentNumber: string;
  documentExpiry: string;
  documentIssueDate: string;
  documentIssuedBy: string;

  // Address (from CI vechi or Certificat Domiciliu)
  address: AddressState;

  // Parent data
  fatherName?: string;
  motherName?: string;

  // Uploaded documents
  uploadedDocuments: UploadedDocumentState[];

  // OCR results
  ocrResults: OCRResultState[];

  // Validation
  isExpired: boolean;
  expiryAllowed: boolean;
  requiresAddressCertificate: boolean;
}

export interface AddressState {
  county: string;
  city: string;
  sector?: string;  // For București
  street: string;
  streetType?: string;
  number: string;
  building?: string;
  staircase?: string;
  floor?: string;
  apartment?: string;
  postalCode?: string;
}

export interface UploadedDocumentState {
  id: string;
  type: DocumentType;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  base64?: string;  // For OCR processing
  s3Key?: string;   // After upload to S3
}

export interface OCRResultState {
  documentType: DocumentType;
  success: boolean;
  confidence: number;
  extractedData: Record<string, unknown>;
  issues: string[];
  processedAt: string;
}

/**
 * Company KYC Module State
 */
export interface CompanyKYCState {
  cui: string;
  companyName: string;
  companyType: string;  // SRL, SA, PFA, etc.
  registrationNumber: string;
  address: AddressState;
  isActive: boolean;
  validationStatus: 'pending' | 'valid' | 'invalid' | 'blocked';
  validationMessage?: string;
  autoCompleteData?: CompanyAutoCompleteData;
}

export interface CompanyAutoCompleteData {
  cui: string;
  name: string;
  type: string;
  registrationNumber: string;
  address: string;
  status: string;
  isActive: boolean;
}

/**
 * Property Module State
 */
export interface PropertyState {
  county: string;
  locality: string;
  carteFunciara: string;
  cadastral: string;
  topografic?: string;
  motiv?: string;

  // For identification services
  ownerName?: string;
  ownerCnpCui?: string;
  propertyAddress?: string;
}

/**
 * Vehicle Module State
 */
export interface VehicleState {
  plateNumber: string;
  vin?: string;
  brand?: string;
  model?: string;
  year?: number;
  category?: string;  // A, B, C, D, E, F, G for rovinieta
  period?: string;    // TWELVE_MONTHS, SIX_MONTHS, etc.
}

/**
 * Billing Module State
 * Used for invoice generation (PF or PJ)
 */
export type BillingType = 'persoana_fizica' | 'persoana_juridica';

export type BillingSource = 'self' | 'other_pf' | 'company';

export interface BillingState {
  // Selection
  source: BillingSource;  // 'self' = use data from ID, 'other_pf' = another person, 'company' = PJ
  type: BillingType;

  // Persoană Fizică fields
  firstName?: string;
  lastName?: string;
  cnp?: string;
  address?: string;

  // Persoană Juridică fields
  companyName?: string;
  cui?: string;
  regCom?: string;
  companyAddress?: string;
  bankName?: string;
  bankIban?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;

  // Validation
  isValid: boolean;
  cuiVerified?: boolean;
}

/**
 * Signature Module State
 */
export interface SignatureState {
  signatureBase64: string;
  termsAccepted: boolean;
  signedAt: string;
}

// ============================================================================
// MODULAR WIZARD STATE
// ============================================================================

/**
 * Complete wizard state with all modules
 */
export interface ModularWizardState {
  // Current step
  currentStepId: ModularStepId;
  currentStepNumber: number;
  steps: ModularStep[];

  // Service info
  serviceSlug: string | null;
  serviceId: string | null;
  verificationConfig: ServiceVerificationConfig | null;

  // Contact (always present)
  contact: {
    email: string;
    phone: string;
    preferredContact: 'email' | 'phone' | 'whatsapp';
  };

  // Client type (PF = Persoana Fizică, PJ = Persoana Juridică)
  clientType: ClientType;

  // Module states (nullable based on what's enabled)
  personalKyc: PersonalKYCState | null;
  companyKyc: CompanyKYCState | null;
  property: PropertyState | null;
  vehicle: VehicleState | null;
  signature: SignatureState | null;
  billing: BillingState | null;

  // Options & Delivery (always present)
  selectedOptions: SelectedOptionState[];
  delivery: DeliveryState;

  // Order metadata
  orderId: string | null;
  friendlyOrderId: string | null;
  userId: string | null;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: string | null;
  error: string | null;

  // Initialization flag (true after cache check is complete)
  isInitialized: boolean;
}

export interface SelectedOptionState {
  optionId: string;
  optionName: string;
  quantity: number;
  priceModifier: number;
}

export interface DeliveryState {
  method: 'email' | 'courier' | 'registered_mail' | null;
  methodName: string;
  price: number;
  estimatedDays: number;
  address?: AddressState;
}

// ============================================================================
// MODULE COMPONENT PROPS
// ============================================================================

/**
 * Base props for all module components
 */
export interface ModuleBaseProps {
  isActive: boolean;
  onComplete: () => void;
  onBack: () => void;
}

export interface PersonalKYCModuleProps extends ModuleBaseProps {
  config: PersonalKYCConfig;
  state: PersonalKYCState;
  onUpdate: (state: Partial<PersonalKYCState>) => void;
  serviceSlug: string;
}

export interface CompanyKYCModuleProps extends ModuleBaseProps {
  config: CompanyKYCConfig;
  state: CompanyKYCState;
  onUpdate: (state: Partial<CompanyKYCState>) => void;
}

export interface PropertyModuleProps extends ModuleBaseProps {
  config: PropertyVerificationConfig;
  state: PropertyState;
  onUpdate: (state: Partial<PropertyState>) => void;
}

export interface VehicleModuleProps extends ModuleBaseProps {
  config: VehicleVerificationConfig;
  state: VehicleState;
  onUpdate: (state: Partial<VehicleState>) => void;
}

export interface SignatureModuleProps extends ModuleBaseProps {
  config: SignatureConfig;
  state: SignatureState;
  onUpdate: (state: Partial<SignatureState>) => void;
}

export interface BillingModuleProps extends ModuleBaseProps {
  state: BillingState;
  onUpdate: (state: Partial<BillingState>) => void;
  prefillFromId?: {
    firstName?: string;
    lastName?: string;
    cnp?: string;
    address?: string;
  };
}

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

/**
 * Default disabled config for all modules
 */
export const DEFAULT_DISABLED_CONFIG: ServiceVerificationConfig = {
  personalKyc: {
    enabled: false,
    acceptedDocuments: [],
    requireAddressCertificate: 'never',
    selfieRequired: false,
    signatureRequired: false,
    expiredDocumentAllowed: false,
    citizenshipFlows: {
      romanian: { documents: [] },
      european: { documents: [] },
      foreign: { documents: [] },
    },
    parentDataRequired: false,
    parentDocuments: { enabled: false },
  },
  companyKyc: {
    enabled: false,
    validation: 'manual',
    autoComplete: false,
    allowedTypes: [],
    blockedTypes: [],
    specialRules: [],
  },
  propertyVerification: {
    enabled: false,
    fields: {
      county: { required: false },
      locality: { required: false },
      carteFunciara: { required: false },
      cadastral: { required: false },
      topografic: { required: false },
    },
    identificationService: { enabled: false, extraFields: [] },
  },
  vehicleVerification: {
    enabled: false,
    fields: {
      plateNumber: { required: false },
      vin: { required: false },
      brand: { required: false },
      model: { required: false },
      year: { required: false },
      category: { required: false },
      period: { required: false },
    },
    plateFormat: 'romanian',
    vinValidation: false,
  },
  signature: {
    enabled: false,
    required: false,
    termsAcceptanceRequired: false,
  },
};

/**
 * Full KYC config (for services like Cazier Fiscal)
 */
export const FULL_KYC_CONFIG: Partial<ServiceVerificationConfig> = {
  personalKyc: {
    enabled: true,
    acceptedDocuments: ['ci_vechi', 'ci_nou_front', 'ci_nou_back', 'passport', 'certificat_domiciliu'],
    requireAddressCertificate: 'ci_nou_passport',
    selfieRequired: true,
    signatureRequired: true,
    expiredDocumentAllowed: false,
    citizenshipFlows: {
      romanian: { documents: ['ci_or_passport', 'selfie'] },
      european: { documents: ['passport', 'residence_permit', 'selfie'] },
      foreign: { documents: ['passport', 'registration_cert', 'selfie'], processingType: 'extended' },
    },
    parentDataRequired: false,
    parentDocuments: { enabled: false },
  },
  signature: {
    enabled: true,
    required: true,
    termsAcceptanceRequired: true,
  },
};

/**
 * Company-only config (for services like Certificat Constatator)
 */
export const COMPANY_ONLY_CONFIG: Partial<ServiceVerificationConfig> = {
  personalKyc: { ...DEFAULT_DISABLED_CONFIG.personalKyc },
  companyKyc: {
    enabled: true,
    validation: 'infocui',
    autoComplete: true,
    allowedTypes: ['SRL', 'SA', 'SCS', 'SNC', 'PFA', 'II', 'IF', 'COOPERATIVA'],
    blockedTypes: ['ASOCIATIE', 'FUNDATIE', 'ONG', 'CABINET', 'PAROHIE', 'SINDICAT'],
    blockMessage: 'Pentru acest tip de entitate nu se poate elibera certificat constatator de la ONRC!',
    specialRules: [
      {
        entityTypes: ['PFA', 'II', 'IF'],
        action: 'warn',
        message: 'Pentru PFA/II/IF se eliberează certificat constatator pe persoană fizică.',
      },
    ],
  },
  signature: {
    enabled: false,
    required: false,
    termsAcceptanceRequired: false,
  },
};
