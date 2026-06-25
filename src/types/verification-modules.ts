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
  | 'ci_front'             // CI front (from OCR auto-detect)
  | 'ci_back'              // CI back (from OCR auto-detect)
  | 'ci_vechi'             // Old Romanian ID (has address on front)
  | 'ci_nou_front'         // New Romanian ID front
  | 'ci_nou_back'          // New Romanian ID back
  | 'passport'             // Passport (legacy — photo page only)
  | 'passport_opened'      // Passport opened spread (post-2026-05-28 flow)
  | 'ro_cei_reader_pdf'    // PDF from official MAI RO CEI Reader app (eCI address proof)
  | 'certificat_domiciliu' // Certificate of domicile (for address)
  | 'residence_permit'     // Permis de rezidență
  | 'registration_cert'    // Certificat de înregistrare
  | 'selfie'               // Selfie for face matching
  | 'act_identitate'       // Act de identitate (față) încărcat manual la pasul KYC (ruta „completez manual")
  | 'act_identitate_back'  // Act de identitate (spate) — ruta manuală
  | 'company_registration_cert'  // PJ: Certificat de Înregistrare (CUI)
  | 'company_statement_cert'     // PJ: Certificat Constatator (ONRC)
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
  condition?: string;  // e.g., "client_type == 'PF'" to only show for PF

  // Whether the "Sunt cetățean străin" toggle is offered for this service.
  // undefined/true → shown for PF (default; e.g. cazier judiciar, where
  // foreign residents legitimately apply). false → hidden (civil-status
  // documents like naștere/căsătorie/celibat are issued only for persons
  // registered in the Romanian civil registry, so there is no foreign path).
  allowForeignCitizen?: boolean;

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

  // Optional "Nume Anterior" (name at birth / before marriage). When true, an
  // optional text field is shown in the personal-data step. Used by cazier
  // judiciar for applicants who changed their name. undefined/false → hidden.
  collectBirthName?: boolean;
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

  // Company document requirements
  documentsRequired: boolean;
  requiredDocuments: ('company_registration_cert' | 'company_statement_cert')[];
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
    // Driving-licence number. Cazier auto = the driver's record (sanctions /
    // points), keyed by permit number, not the vehicle plate. Optional key so
    // services that don't collect it (rovinieta, etc.) need not declare it.
    drivingLicense?: { required: boolean };
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

/**
 * Certificat Constatator (ONRC) details module. The document type is
 * price-bearing — selecting it overrides the order base price (option A).
 */
/** A report sub-type with its OWN purpose list (matches ONRC step 4). */
export interface ConstatatorReportType {
  name: string;
  purposes?: string[];
}
export interface ConstatatorDocType {
  value: string;       // e.g. 'firma' | 'pf' | 'istoric'
  label: string;
  price: number;       // effective base price for this document type (RON)
  // Report sub-types. New shape carries per-type purposes; legacy is string[].
  reportTypes?: Array<string | ConstatatorReportType>;
  // Purpose list when the type has NO report sub-types (e.g. 'pf' → ONRC subtype
  // 160's 10 reasons). 'istoric' has none (ONRC has no Tip Document step there).
  purposes?: string[];
}
export interface ConstatatorConfig {
  enabled: boolean;
  documentTypes: ConstatatorDocType[];
  purposes: string[];  // "Document solicitat spre a servi la" destinations
}

/**
 * Civil-status questionnaire module (certificat naștere / căsătorie / celibat).
 * `documentType` drives labels + which fields make sense; `fields` toggles each
 * question per service. Mirrors the data the Starea Civilă application needs.
 */
export interface CivilStatusConfig {
  enabled: boolean;
  documentType: 'nastere' | 'casatorie' | 'celibat';
  fields: {
    applicantType?: boolean;      // Minor / Adult (naștere)
    birthPlace?: boolean;         // Born in RO / abroad — warns about transcription
    birthLocality?: boolean;      // Birth locality + county/sector (celibat)
    nationality?: boolean;        // Nationality (celibat)
    currentlyMarried?: boolean;   // "Sunteți căsătorit?" (naștere, adults)
    maritalStatus?: boolean;      // Current marital status (celibat)
    maritalHistory?: boolean;     // Prior marriages: yes/no → count + ended-by
    stillHaveOldMarriageCert?: boolean; // "Mai dețineți vechiul certificat de căsătorie?"
    marriageAbroadIntent?: boolean; // "Solicitați în vederea căsătoriei în străinătate?" (celibat)
    marriagePlace?: boolean;      // Marriage in RO / abroad — warns about transcription
    spouseName?: boolean;         // Spouse name before marriage (căsătorie)
    marriageDate?: boolean;       // Marriage date (căsătorie)
    registrationPlace?: boolean;  // Office/locality that registered the act
    birthName?: boolean;          // Name at birth (maiden / pre-marriage)
    parentNames?: boolean;        // Father + mother full names
    oldCertificateReason?: boolean; // "Vechiul certificat mi-a fost:" pierdut/deteriorat/...
    renouncedCitizenship?: boolean; // Renounced RO citizenship → note: cert has no CNP
    purpose?: boolean;            // Purpose of obtaining the certificate
    countryOfUse?: boolean;       // Country where the document will be used
  };
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
  civilStatus?: CivilStatusConfig;
  constatator?: ConstatatorConfig;
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
  | 'civil-status'      // Civil-status questionnaire (birth/marriage/celibacy certs)
  | 'constatator'       // Certificat constatator (ONRC) details
  | 'company-data'      // Company KYC data entry
  | 'property-data'     // Property data entry
  | 'vehicle-data'      // Vehicle data entry
  | 'options'           // Service options
  | 'kyc-documents'     // Document upload + OCR
  | 'company-documents' // Company document upload (cert inregistrare / cert constatator)
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
  moduleType: 'core' | 'personalKyc' | 'civilStatus' | 'constatator' | 'companyKyc' | 'companyDocuments' | 'property' | 'vehicle' | 'signature' | 'billing';
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

  // User's explicit choice of ID document type (post-2026-05-28 picker).
  // Distinct from `documentType` below, which is OCR-detected. This drives
  // which scan zones render and which OCR extractors are called.
  //
  // - 'ci_vechi':  carton/plastic 2009-2024, fără cip → scan: ci_front only
  // - 'ci_nou':    eCI/CEI cu cip 2021+ → scan: ci_front + ci_nou_back + ro_cei_reader_pdf
  // - 'passport':  pașaport simplu/electronic → scan: passport_opened
  //
  // null = user hasn't picked yet (show DocumentTypePicker)
  idDocumentType: 'ci_vechi' | 'ci_nou' | 'passport' | null;

  // Document info (OCR-detected, populated after scan)
  documentType: DocumentType | null;
  documentSeries: string;
  documentNumber: string;
  documentExpiry: string;
  documentIssueDate: string;
  documentIssuedBy: string;

  // Address (from CI vechi or Certificat Domiciliu)
  address: AddressState;

  // Foreign citizen data (when citizenship is 'european' or 'foreign')
  foreignData?: {
    birthCity: string;
    birthCountry: string;
    hasRomanianAddress: boolean;
    foreignAddress?: string;
  };

  // Parent data
  fatherName?: string;
  motherName?: string;

  // Nume anterior (la naștere / dinaintea căsătoriei) — optional, gated by
  // PersonalKYCConfig.collectBirthName.
  birthName?: string;

  // Uploaded documents
  uploadedDocuments: UploadedDocumentState[];

  // OCR results
  ocrResults: OCRResultState[];

  // Validation
  isExpired: boolean;
  expiryAllowed: boolean;
  requiresAddressCertificate: boolean;

  // KYC validation results (from AI)
  kycValidation?: KYCValidationResults;
}

/**
 * Per-document KYC validation result from AI
 */
export interface KYCDocumentValidation {
  valid: boolean;
  confidence: number; // 0-100
}

/**
 * Aggregated KYC validation results
 * Stores per-document AI confidence and face match result
 */
export interface KYCValidationResults {
  ciFront?: KYCDocumentValidation;
  ciBack?: KYCDocumentValidation;
  selfie?: KYCDocumentValidation & {
    faceMatch: boolean;
    faceMatchConfidence: number; // 0-100
    /** Operator should manually confirm identity (PDF ref, low/borderline confidence, or face-match unavailable). */
    needsManualReview?: boolean;
    /** Short machine-readable reason for the manual review flag. */
    reviewReason?: string;
  };
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
  // Set only for international shipping destinations (DHL Express,
  // Poșta Română International). Free-text — no enforced country list.
  country?: string;
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
  uploadedDocuments: UploadedDocumentState[];
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
/** One additional imobil in a multi-extract order (same county as the primary). */
export interface AdditionalImobil {
  locality: string;
  carteFunciara: string;
  cadastral: string;
  topografic?: string;
}

export interface PropertyState {
  county: string;
  locality: string;
  carteFunciara: string;
  cadastral: string;
  topografic?: string;
  motiv?: string;

  // Multi-extract: extra imobile in the same county ("Adaugă un extras").
  additionalImobile?: AdditionalImobil[];

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
  drivingLicense?: string;  // Numărul permisului de conducere (cazier auto)
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
  address?: string;     // street line: stradă, nr, bloc, scară, ap
  city?: string;        // localitate — required for Oblio
  county?: string;      // județ (name, e.g. "Constanța") — required for Oblio
  postalCode?: string;  // cod poștal — optional
  country?: string;     // default "Romania"

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

/**
 * Civil-status questionnaire state (certificat naștere / căsătorie / celibat).
 */
export interface CivilStatusState {
  applicantType?: 'minor' | 'adult';
  bornAbroad?: boolean;             // Nașterea a avut loc în străinătate
  birthLocality?: string;           // Localitatea în care v-ați născut (celibat)
  birthCounty?: string;             // Județul / Sectorul în care v-ați născut (celibat)
  nationality?: string;             // Naționalitatea (celibat)
  currentlyMarried?: boolean;       // Sunteți căsătorit(ă)?
  maritalStatus?: 'necasatorit' | 'casatorit' | 'divortat' | 'vaduv';
  wasMarriedBefore?: boolean;
  priorMarriagesCount?: string;
  lastMarriageEndedBy?: 'divort' | 'deces';
  stillHaveOldMarriageCert?: boolean; // Mai dețineți vechiul certificat de căsătorie?
  marriageAbroadIntent?: boolean;   // Solicitați în vederea căsătoriei în străinătate?
  marriageAbroad?: boolean;         // Căsătoria a avut loc în străinătate
  spouseNameBeforeMarriage?: string;
  futureSpouseName?: string;        // celibat: numele viitorului soț/soție (căsătorie în străinătate)
  marriageDate?: string;
  registrationPlace?: string;
  birthName?: string;
  fatherName?: string;
  motherName?: string;
  oldCertificateReason?: 'pierdut' | 'distrus' | 'furat'; // Vechiul certificat mi-a fost:
  renouncedRomanianCitizenship?: boolean; // Ați renunțat la cetățenia română?
  purpose?: string;
  countryOfUse?: string;
}

/**
 * Certificat Constatator (ONRC) details state.
 */
export interface ConstatatorState {
  documentType?: string;     // matches a ConstatatorDocType.value — drives base price
  reportType?: string;       // conditional report sub-type
  purpose?: string;          // "servi la" destination
  otherPurpose?: string;     // free-text when purpose is "Altele"
  period?: 'founding' | 'custom';
  periodFrom?: string;
  periodTo?: string;
  requesterName?: string;    // Nume complet persoană solicitantă
  requesterCnp?: string;     // CNP persoană solicitantă
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
    /** Citizenship — only meaningful for PF clients. Default: 'romanian'. */
    citizenship?: 'romanian' | 'foreign';
    /** Sub-type of foreign citizenship for procedural routing. */
    foreignType?: 'eu' | 'non-eu';
    /** "Motivul solicitării" / purpose of the request — applies to services
     * that require it (cazier judiciar, fiscal, auto, integritate). */
    purpose?: string;
  };

  // Client type (PF = Persoana Fizică, PJ = Persoana Juridică)
  clientType: ClientType;

  // Module states (nullable based on what's enabled)
  personalKyc: PersonalKYCState | null;
  civilStatus: CivilStatusState | null;
  constatator: ConstatatorState | null;
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

  // Consent state (set by review step, persisted for submission)
  consent: ConsentState;

  // Applied coupon (set in review step, validated server-side on checkout)
  coupon: CouponState | null;

  // Initialization flag (true after cache check is complete)
  isInitialized: boolean;
}

/**
 * Applied coupon state (client-side only — final validation happens server-side).
 */
export interface CouponState {
  code: string;
  discountAmount: number; // RON
  discountType: 'percentage' | 'fixed';
  discountValue: number;
}

export interface ConsentState {
  termsAccepted: boolean;
  privacyAccepted: boolean;
  withdrawalWaiver: boolean;
  /** Civil-status only: vechiul certificat devine nul la emiterea unuia nou. */
  oldCertVoidAccepted?: boolean;
  /** Civil-status only: declarație pe propria răspundere privind corectitudinea datelor. */
  dataAccuracyAccepted?: boolean;
}

export interface SelectedOptionState {
  optionId: string;
  optionName: string;
  optionDescription?: string;
  quantity: number;
  priceModifier: number;
  // Option code (e.g. 'cetatean_strain', 'urgenta') — used by downstream
  // logic (delivery calculator, admin) to recognize the option by its
  // stable DB code rather than by name matching.
  code?: string;
  // System-toggled flag options (e.g. `cetatean_strain`) are not
  // user-selected from the Options step — the wizard auto-adds them based
  // on upstream data (citizenship, client type, etc.). The Options step
  // renders these as read-only info cards with an "Aplicat automat" badge.
  isAutoApplied?: boolean;
  // Cross-service bundling metadata (optional)
  // When set, this option belongs to a bundled (addon) service, not the primary service
  bundledFor?: {
    // The optionId of the parent cross-service addon (e.g. id of addon_cazier_judiciar)
    parentOptionId: string;
    // Slug of the bundled service the option belongs to (e.g. "cazier-judiciar")
    bundledServiceSlug: string;
    // Original option code on the bundled service (e.g. "apostila_haga")
    bundledOptionCode: string;
  };
  // Free-form metadata captured from the Options step.
  // Currently used for:
  //   - language: authorized translation language (when `traducere` is selected)
  //   - country: destination country for apostilla (when `apostila_haga` or
  //     `apostila_notari` is selected; shared across both)
  metadata?: {
    language?: string;
    country?: string;
  };
}

export interface DeliveryState {
  method: 'email' | 'courier' | 'registered_mail' | null;
  methodName: string;
  price: number;
  estimatedDays: number;
  address?: AddressState;
  // Courier-specific fields (Fan Courier, Sameday, etc.)
  courierProvider?: string; // 'fancourier', 'sameday', etc.
  courierService?: string; // 'Standard', 'FANbox', etc.
  courierQuote?: {
    provider: string;
    providerName: string;
    service: string;
    serviceName: string;
    price: number;
    priceWithVAT: number;
    vat: number;
    currency: string;
    estimatedDays: number;
    breakdown?: {
      basePrice?: number;
      fuelCost?: number;
      extraKmCost?: number;
      insuranceCost?: number;
      optionsCost?: number;
    };
    // Locker info (when locker delivery selected)
    lockerId?: string;
    lockerName?: string;
    lockerAddress?: string;
  };
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
    documentsRequired: false,
    requiredDocuments: [],
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
    documentsRequired: true,
    requiredDocuments: ['company_registration_cert'],
  },
  signature: {
    enabled: false,
    required: false,
    termsAcceptanceRequired: false,
  },
};
