'use client';

/**
 * Modular Wizard Provider
 *
 * A dynamic order wizard that builds steps based on service verification config.
 * Supports different verification modules: PersonalKYC, CompanyKYC, Property, Vehicle, Signature.
 */

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  ReactNode,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type {
  ModularWizardState,
  ModularStep,
  ModularStepId,
  ServiceVerificationConfig,
  PersonalKYCState,
  CompanyKYCState,
  PropertyState,
  VehicleState,
  SignatureState,
  SelectedOptionState,
  DeliveryState,
  AddressState,
  ClientType,
} from '@/types/verification-modules';
import { DEFAULT_DISABLED_CONFIG } from '@/types/verification-modules';
import { Service, ServiceOption } from '@/types/services';
import {
  buildWizardSteps,
  getNextStep,
  getPrevStep,
  getVisibleSteps,
  renumberSteps,
} from '@/lib/verification-modules/step-builder';
import { generateOrderId, getDraftStorageKey } from '@/lib/order-id';

// Cache version for migrations
// v3: Added clientType to cache for proper step reconstruction
// v4: Fix priceModifier undefined bug (was using option.price_modifier instead of option.price)
const CACHE_VERSION = 4;

// ============================================================================
// STATE INITIALIZATION
// ============================================================================

function createInitialPersonalKYCState(): PersonalKYCState {
  return {
    firstName: '',
    lastName: '',
    cnp: '',
    birthDate: '',
    birthPlace: '',
    citizenship: 'romanian',
    documentType: null,
    documentSeries: '',
    documentNumber: '',
    documentExpiry: '',
    documentIssueDate: '',
    documentIssuedBy: '',
    address: createInitialAddressState(),
    uploadedDocuments: [],
    ocrResults: [],
    isExpired: false,
    expiryAllowed: false,
    requiresAddressCertificate: false,
  };
}

function createInitialCompanyKYCState(): CompanyKYCState {
  return {
    cui: '',
    companyName: '',
    companyType: '',
    registrationNumber: '',
    address: createInitialAddressState(),
    isActive: false,
    validationStatus: 'pending',
  };
}

function createInitialPropertyState(): PropertyState {
  return {
    county: '',
    locality: '',
    carteFunciara: '',
    cadastral: '',
  };
}

function createInitialVehicleState(): VehicleState {
  return {
    plateNumber: '',
  };
}

function createInitialSignatureState(): SignatureState {
  return {
    signatureBase64: '',
    termsAccepted: false,
    signedAt: '',
  };
}

function createInitialAddressState(): AddressState {
  return {
    county: '',
    city: '',
    street: '',
    number: '',
  };
}

function createInitialDeliveryState(): DeliveryState {
  return {
    method: null,
    methodName: '',
    price: 0,
    estimatedDays: 0,
  };
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: ModularWizardState = {
  currentStepId: 'contact',
  currentStepNumber: 1,
  steps: [],

  serviceSlug: null,
  serviceId: null,
  verificationConfig: null,

  contact: {
    email: '',
    phone: '',
    preferredContact: 'email',
  },

  clientType: null,

  personalKyc: null,
  companyKyc: null,
  property: null,
  vehicle: null,
  signature: null,

  selectedOptions: [],
  delivery: createInitialDeliveryState(),

  orderId: null,
  friendlyOrderId: null,
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
  error: null,
  isInitialized: false,
};

// ============================================================================
// ACTION TYPES
// ============================================================================

type ModularWizardAction =
  | { type: 'INIT_SERVICE'; payload: { service: Service; options: ServiceOption[] } }
  | { type: 'SET_STEP'; payload: ModularStepId }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_CLIENT_TYPE'; payload: ClientType }
  | { type: 'UPDATE_CONTACT'; payload: Partial<ModularWizardState['contact']> }
  | { type: 'UPDATE_PERSONAL_KYC'; payload: Partial<PersonalKYCState> }
  | { type: 'UPDATE_COMPANY_KYC'; payload: Partial<CompanyKYCState> }
  | { type: 'UPDATE_PROPERTY'; payload: Partial<PropertyState> }
  | { type: 'UPDATE_VEHICLE'; payload: Partial<VehicleState> }
  | { type: 'UPDATE_SIGNATURE'; payload: Partial<SignatureState> }
  | { type: 'UPDATE_OPTIONS'; payload: SelectedOptionState[] }
  | { type: 'UPDATE_DELIVERY'; payload: Partial<DeliveryState> }
  | { type: 'SET_ORDER_IDS'; payload: { orderId: string; friendlyOrderId: string } }
  | { type: 'SET_FRIENDLY_ORDER_ID'; payload: string }
  | { type: 'SAVE_START' }
  | { type: 'SAVE_SUCCESS'; payload: string }
  | { type: 'SAVE_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'MARK_DIRTY' }
  | { type: 'MARK_INITIALIZED' }
  | { type: 'RESTORE_FROM_CACHE'; payload: ModularDraftCache }
  | { type: 'RESET' };

// ============================================================================
// CACHE TYPE
// ============================================================================

interface ModularDraftCache {
  orderId: string | null;
  friendlyOrderId: string;
  serviceSlug: string;
  currentStepId: ModularStepId;
  currentStepNumber: number;
  clientType?: ClientType | null;
  data: {
    contact?: ModularWizardState['contact'];
    personalKyc?: PersonalKYCState | null;
    companyKyc?: CompanyKYCState | null;
    property?: PropertyState | null;
    vehicle?: VehicleState | null;
    signature?: SignatureState | null;
    selectedOptions?: SelectedOptionState[];
    delivery?: DeliveryState;
  };
  lastSavedAt: string;
  version: number;
}

// ============================================================================
// REDUCER
// ============================================================================

function modularWizardReducer(
  state: ModularWizardState,
  action: ModularWizardAction
): ModularWizardState {
  switch (action.type) {
    case 'INIT_SERVICE': {
      const { service, options } = action.payload;
      const verificationConfig = service.verification_config ?? DEFAULT_DISABLED_CONFIG;
      const steps = buildWizardSteps(verificationConfig);

      // Initialize module states based on config
      const personalKyc = verificationConfig.personalKyc.enabled
        ? createInitialPersonalKYCState()
        : null;
      const companyKyc = verificationConfig.companyKyc.enabled
        ? createInitialCompanyKYCState()
        : null;
      const property = verificationConfig.propertyVerification.enabled
        ? createInitialPropertyState()
        : null;
      const vehicle = verificationConfig.vehicleVerification.enabled
        ? createInitialVehicleState()
        : null;
      const signature = verificationConfig.signature.enabled
        ? createInitialSignatureState()
        : null;

      return {
        ...state,
        serviceSlug: service.slug,
        serviceId: service.id,
        verificationConfig,
        steps,
        personalKyc,
        companyKyc,
        property,
        vehicle,
        signature,
      };
    }

    case 'SET_STEP': {
      const step = state.steps.find(s => s.id === action.payload);
      if (step) {
        return {
          ...state,
          currentStepId: action.payload,
          currentStepNumber: step.number,
        };
      }
      return state;
    }

    case 'NEXT_STEP': {
      const nextStep = getNextStep(state.steps, state.currentStepId, state);
      if (nextStep) {
        return {
          ...state,
          currentStepId: nextStep.id,
          currentStepNumber: nextStep.number,
        };
      }
      return state;
    }

    case 'PREV_STEP': {
      const prevStep = getPrevStep(state.steps, state.currentStepId, state);
      if (prevStep) {
        return {
          ...state,
          currentStepId: prevStep.id,
          currentStepNumber: prevStep.number,
        };
      }
      return state;
    }

    case 'SET_CLIENT_TYPE': {
      const newClientType = action.payload;
      const config = state.verificationConfig;

      // When client type changes, rebuild steps and initialize appropriate modules
      if (config) {
        const steps = buildWizardSteps(config, newClientType);

        // Initialize modules based on client type
        let personalKyc = state.personalKyc;
        let companyKyc = state.companyKyc;

        if (newClientType === 'PF') {
          // PF: Enable personal KYC
          if (config.personalKyc.enabled && !personalKyc) {
            personalKyc = createInitialPersonalKYCState();
          }
        } else if (newClientType === 'PJ') {
          // PJ: Enable company KYC
          if (config.companyKyc.enabled && !companyKyc) {
            companyKyc = createInitialCompanyKYCState();
          }
          // PJ also needs personal KYC for the representative
          if (config.personalKyc.enabled && !personalKyc) {
            personalKyc = createInitialPersonalKYCState();
          }
        }

        return {
          ...state,
          clientType: newClientType,
          steps,
          personalKyc,
          companyKyc,
          isDirty: true,
        };
      }

      return {
        ...state,
        clientType: newClientType,
        isDirty: true,
      };
    }

    case 'UPDATE_CONTACT':
      return {
        ...state,
        contact: { ...state.contact, ...action.payload },
        isDirty: true,
      };

    case 'UPDATE_PERSONAL_KYC':
      return {
        ...state,
        personalKyc: state.personalKyc
          ? { ...state.personalKyc, ...action.payload }
          : null,
        isDirty: true,
      };

    case 'UPDATE_COMPANY_KYC':
      return {
        ...state,
        companyKyc: state.companyKyc
          ? { ...state.companyKyc, ...action.payload }
          : null,
        isDirty: true,
      };

    case 'UPDATE_PROPERTY':
      return {
        ...state,
        property: state.property
          ? { ...state.property, ...action.payload }
          : null,
        isDirty: true,
      };

    case 'UPDATE_VEHICLE':
      return {
        ...state,
        vehicle: state.vehicle
          ? { ...state.vehicle, ...action.payload }
          : null,
        isDirty: true,
      };

    case 'UPDATE_SIGNATURE':
      return {
        ...state,
        signature: state.signature
          ? { ...state.signature, ...action.payload }
          : null,
        isDirty: true,
      };

    case 'UPDATE_OPTIONS':
      return {
        ...state,
        selectedOptions: action.payload,
        isDirty: true,
      };

    case 'UPDATE_DELIVERY':
      return {
        ...state,
        delivery: { ...state.delivery, ...action.payload },
        isDirty: true,
      };

    case 'SET_ORDER_IDS':
      return {
        ...state,
        orderId: action.payload.orderId,
        friendlyOrderId: action.payload.friendlyOrderId,
      };

    case 'SET_FRIENDLY_ORDER_ID':
      return {
        ...state,
        friendlyOrderId: action.payload,
      };

    case 'SAVE_START':
      return {
        ...state,
        isSaving: true,
        error: null,
      };

    case 'SAVE_SUCCESS':
      return {
        ...state,
        isSaving: false,
        isDirty: false,
        lastSavedAt: action.payload,
        error: null,
      };

    case 'SAVE_ERROR':
      return {
        ...state,
        isSaving: false,
        error: action.payload,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };

    case 'MARK_DIRTY':
      return {
        ...state,
        isDirty: true,
      };

    case 'MARK_INITIALIZED':
      return {
        ...state,
        isInitialized: true,
      };

    case 'RESTORE_FROM_CACHE': {
      const cache = action.payload;
      const restoredClientType = cache.clientType ?? null;

      // Rebuild steps if we have a verification config and client type
      let steps = state.steps;
      if (state.verificationConfig && restoredClientType) {
        steps = buildWizardSteps(state.verificationConfig, restoredClientType);
      }

      return {
        ...state,
        orderId: cache.orderId,
        friendlyOrderId: cache.friendlyOrderId,
        currentStepId: cache.currentStepId,
        currentStepNumber: cache.currentStepNumber,
        clientType: restoredClientType,
        steps,
        contact: cache.data.contact || state.contact,
        personalKyc: cache.data.personalKyc ?? state.personalKyc,
        companyKyc: cache.data.companyKyc ?? state.companyKyc,
        property: cache.data.property ?? state.property,
        vehicle: cache.data.vehicle ?? state.vehicle,
        signature: cache.data.signature ?? state.signature,
        selectedOptions: cache.data.selectedOptions || [],
        delivery: cache.data.delivery || createInitialDeliveryState(),
        lastSavedAt: cache.lastSavedAt,
        isDirty: false,
        isInitialized: true,
      };
    }

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

interface ModularWizardContextType {
  state: ModularWizardState;

  // Service info
  service: Service | null;
  serviceOptions: ServiceOption[];

  // Navigation
  goToStep: (stepId: ModularStepId) => void;
  nextStep: () => void;
  prevStep: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  visibleSteps: ModularStep[];
  currentStep: ModularStep | null;

  // Data Updates
  initService: (service: Service, options: ServiceOption[]) => void;
  setClientType: (type: ClientType) => void;
  updateContact: (data: Partial<ModularWizardState['contact']>) => void;
  updatePersonalKyc: (data: Partial<PersonalKYCState>) => void;
  updateCompanyKyc: (data: Partial<CompanyKYCState>) => void;
  updateProperty: (data: Partial<PropertyState>) => void;
  updateVehicle: (data: Partial<VehicleState>) => void;
  updateSignature: (data: Partial<SignatureState>) => void;
  updateOptions: (options: SelectedOptionState[]) => void;
  updateDelivery: (data: Partial<DeliveryState>) => void;

  // Price
  priceBreakdown: PriceBreakdown;

  // Actions
  saveDraft: () => Promise<void>;
  saveDraftNow: () => Promise<void>;
  submitOrder: () => Promise<void>;
  resetWizard: () => void;
  clearError: () => void;

  // State checks
  canSaveToServer: boolean;
}

interface PriceBreakdown {
  basePrice: number;
  optionsPrice: number;
  deliveryPrice: number;
  discountAmount: number;
  totalPrice: number;
  currency: string;
}

const ModularWizardContext = createContext<ModularWizardContextType | null>(null);

// ============================================================================
// HELPERS
// ============================================================================

function hasValidContactData(contact: ModularWizardState['contact']): boolean {
  return Boolean(
    contact.email &&
    contact.email.includes('@') &&
    contact.phone &&
    contact.phone.length >= 10
  );
}

function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export function ModularWizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(modularWizardReducer, initialState);
  const router = useRouter();
  const pathname = usePathname();

  // Track service and options separately (for price calculation)
  const serviceRef = useRef<Service | null>(null);
  const serviceOptionsRef = useRef<ServiceOption[]>([]);

  // Refs for URL sync and save control
  const isUrlSyncRef = useRef(false);
  const initialSyncDoneRef = useRef(false);
  const saveAbortControllerRef = useRef<AbortController | null>(null);

  // Check if we can save to server
  const canSaveToServer = useMemo(() => {
    return hasValidContactData(state.contact);
  }, [state.contact]);

  // Calculate visible steps (steps that pass their conditions)
  const visibleSteps = useMemo(() => {
    const visible = getVisibleSteps(state.steps, state);
    return renumberSteps(visible);
  }, [state]);

  // Find current step object
  const currentStep = useMemo(() => {
    return visibleSteps.find(s => s.id === state.currentStepId) || null;
  }, [visibleSteps, state.currentStepId]);

  // Navigation computed values
  const currentStepIndex = visibleSteps.findIndex(s => s.id === state.currentStepId);
  const canGoNext = currentStepIndex < visibleSteps.length - 1;
  const canGoPrev = currentStepIndex > 0;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === visibleSteps.length - 1;

  // URL update
  const updateURL = useCallback(
    (stepNumber: number) => {
      if (isUrlSyncRef.current) return;
      const params = new URLSearchParams(window.location.search);
      params.set('step', stepNumber.toString());
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router]
  );

  // Restore from localStorage on mount
  const cacheRestoredRef = useRef(false);

  useEffect(() => {
    if (cacheRestoredRef.current || !state.serviceSlug) return;
    cacheRestoredRef.current = true;

    // Try to find existing draft in localStorage
    let cacheFound = false;
    try {
      // Look for any draft for this service
      const keys = Object.keys(localStorage).filter(k => k.startsWith('order_draft_'));
      for (const key of keys) {
        const cached = localStorage.getItem(key);
        if (cached) {
          const cacheData = JSON.parse(cached) as ModularDraftCache;
          // Check if it's for this service and has valid version
          if (cacheData.serviceSlug === state.serviceSlug && cacheData.version === CACHE_VERSION) {
            console.log('Restoring draft from localStorage:', cacheData.friendlyOrderId);
            dispatch({ type: 'RESTORE_FROM_CACHE', payload: cacheData });
            cacheFound = true;
            return;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to restore from localStorage:', error);
    }

    // No cache found, mark as initialized anyway
    if (!cacheFound) {
      dispatch({ type: 'MARK_INITIALIZED' });
    }
  }, [state.serviceSlug]);

  // Sync step from URL on mount - but verify data exists
  useEffect(() => {
    if (initialSyncDoneRef.current || visibleSteps.length === 0) return;
    initialSyncDoneRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const stepParam = params.get('step');
    if (stepParam) {
      const stepNumber = parseInt(stepParam, 10);

      // If trying to go to step > 1, verify we have valid contact data
      if (stepNumber > 1 && !hasValidContactData(state.contact)) {
        // No valid contact data - redirect to step 1
        console.log('No valid contact data, redirecting to step 1');
        updateURL(1);
        return;
      }

      if (stepNumber >= 1 && stepNumber <= visibleSteps.length) {
        const step = visibleSteps[stepNumber - 1];
        if (step && step.id !== state.currentStepId) {
          isUrlSyncRef.current = true;
          dispatch({ type: 'SET_STEP', payload: step.id });
          setTimeout(() => { isUrlSyncRef.current = false; }, 0);
        }
      }
    }
  }, [visibleSteps, state.currentStepId, state.contact, updateURL]);

  // Navigation functions
  const goToStep = useCallback(
    (stepId: ModularStepId) => {
      dispatch({ type: 'SET_STEP', payload: stepId });
      const stepIndex = visibleSteps.findIndex(s => s.id === stepId);
      if (stepIndex >= 0) {
        updateURL(stepIndex + 1);
      }
    },
    [visibleSteps, updateURL]
  );

  const nextStep = useCallback(() => {
    if (canGoNext) {
      // Generate Order ID when moving past contact step with valid data
      if (
        state.currentStepId === 'contact' &&
        !state.friendlyOrderId &&
        hasValidContactData(state.contact)
      ) {
        const newOrderId = generateOrderId();
        dispatch({ type: 'SET_FRIENDLY_ORDER_ID', payload: newOrderId });
      }

      dispatch({ type: 'NEXT_STEP' });
      updateURL(currentStepIndex + 2);
    }
  }, [canGoNext, state.currentStepId, state.friendlyOrderId, state.contact, currentStepIndex, updateURL]);

  const prevStep = useCallback(() => {
    if (canGoPrev) {
      dispatch({ type: 'PREV_STEP' });
      updateURL(currentStepIndex);
    }
  }, [canGoPrev, currentStepIndex, updateURL]);

  // Data update functions
  const initService = useCallback((service: Service, options: ServiceOption[]) => {
    serviceRef.current = service;
    serviceOptionsRef.current = options;
    dispatch({ type: 'INIT_SERVICE', payload: { service, options } });
  }, []);

  const setClientType = useCallback((type: ClientType) => {
    dispatch({ type: 'SET_CLIENT_TYPE', payload: type });
  }, []);

  const updateContact = useCallback((data: Partial<ModularWizardState['contact']>) => {
    dispatch({ type: 'UPDATE_CONTACT', payload: data });
  }, []);

  const updatePersonalKyc = useCallback((data: Partial<PersonalKYCState>) => {
    dispatch({ type: 'UPDATE_PERSONAL_KYC', payload: data });
  }, []);

  const updateCompanyKyc = useCallback((data: Partial<CompanyKYCState>) => {
    dispatch({ type: 'UPDATE_COMPANY_KYC', payload: data });
  }, []);

  const updateProperty = useCallback((data: Partial<PropertyState>) => {
    dispatch({ type: 'UPDATE_PROPERTY', payload: data });
  }, []);

  const updateVehicle = useCallback((data: Partial<VehicleState>) => {
    dispatch({ type: 'UPDATE_VEHICLE', payload: data });
  }, []);

  const updateSignature = useCallback((data: Partial<SignatureState>) => {
    dispatch({ type: 'UPDATE_SIGNATURE', payload: data });
  }, []);

  const updateOptions = useCallback((options: SelectedOptionState[]) => {
    dispatch({ type: 'UPDATE_OPTIONS', payload: options });
  }, []);

  const updateDelivery = useCallback((data: Partial<DeliveryState>) => {
    dispatch({ type: 'UPDATE_DELIVERY', payload: data });
  }, []);

  // Price calculation
  const priceBreakdown = useMemo((): PriceBreakdown => {
    const service = serviceRef.current;
    const basePrice = service?.base_price ?? 0;
    const optionsPrice = state.selectedOptions.reduce(
      (sum, opt) => {
        // Defensive: handle undefined/NaN priceModifier from old cached data
        const price = typeof opt.priceModifier === 'number' && !isNaN(opt.priceModifier)
          ? opt.priceModifier
          : 0;
        return sum + price * (opt.quantity || 1);
      },
      0
    );
    const deliveryPrice = state.delivery.price ?? 0;
    const discountAmount = 0; // TODO: Apply promo codes
    const totalPrice = basePrice + optionsPrice + deliveryPrice - discountAmount;

    return {
      basePrice,
      optionsPrice,
      deliveryPrice,
      discountAmount,
      totalPrice,
      currency: service?.currency ?? 'RON',
    };
  }, [state.selectedOptions, state.delivery]);

  // Save to localStorage
  const saveToLocalStorage = useCallback(() => {
    if (!state.friendlyOrderId || !state.serviceSlug || !canSaveToServer) return;

    const cacheData: ModularDraftCache = {
      orderId: state.orderId,
      friendlyOrderId: state.friendlyOrderId,
      serviceSlug: state.serviceSlug,
      currentStepId: state.currentStepId,
      currentStepNumber: state.currentStepNumber,
      clientType: state.clientType,
      data: {
        contact: state.contact,
        personalKyc: state.personalKyc,
        companyKyc: state.companyKyc,
        property: state.property,
        vehicle: state.vehicle,
        signature: state.signature,
        selectedOptions: state.selectedOptions,
        delivery: state.delivery,
      },
      lastSavedAt: new Date().toISOString(),
      version: CACHE_VERSION,
    };

    try {
      const cacheKey = getDraftStorageKey(state.friendlyOrderId);
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }, [state, canSaveToServer]);

  // Save draft to server
  const saveDraftToServer = useCallback(async () => {
    if (!serviceRef.current || !state.friendlyOrderId || !canSaveToServer) {
      return;
    }

    if (saveAbortControllerRef.current) {
      saveAbortControllerRef.current.abort();
    }
    saveAbortControllerRef.current = new AbortController();

    dispatch({ type: 'SAVE_START' });

    try {
      saveToLocalStorage();

      const method = state.orderId ? 'PATCH' : 'POST';

      // Build customer_data based on what modules are active
      const customerData: Record<string, unknown> = {
        contact: state.contact,
      };
      if (state.personalKyc) customerData.personal = state.personalKyc;
      if (state.companyKyc) customerData.company = state.companyKyc;
      if (state.property) customerData.property = state.property;
      if (state.vehicle) customerData.vehicle = state.vehicle;

      const response = await fetch('/api/orders/draft', {
        method,
        headers: { 'Content-Type': 'application/json' },
        signal: saveAbortControllerRef.current.signal,
        body: JSON.stringify({
          id: state.orderId,
          friendly_order_id: state.friendlyOrderId,
          service_id: state.serviceId,
          current_step: state.currentStepId,
          customer_data: customerData,
          selected_options: state.selectedOptions.map(opt => ({
            option_id: opt.optionId,
            option_name: opt.optionName,
            quantity: opt.quantity,
            price_modifier: opt.priceModifier,
          })),
          // For drafts, only save document metadata (not base64 data)
          // Full documents will be uploaded to S3 at final submission
          kyc_documents: state.personalKyc?.uploadedDocuments?.map(doc => ({
            id: doc.id,
            type: doc.type,
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            mimeType: doc.mimeType,
            uploadedAt: doc.uploadedAt,
            // Exclude base64 to keep payload small
          })) || null,
          delivery_method: state.delivery.method ? {
            type: state.delivery.method,
            name: state.delivery.methodName,
            price: state.delivery.price,
            estimated_days: state.delivery.estimatedDays,
          } : null,
          delivery_address: state.delivery.address || null,
          // Don't send signature base64 in drafts - only at final submission
          signature: state.signature?.signatureBase64 ? 'pending' : null,
          base_price: priceBreakdown.basePrice,
          options_price: priceBreakdown.optionsPrice,
          delivery_price: priceBreakdown.deliveryPrice,
          total_price: priceBreakdown.totalPrice,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Save draft error:', response.status, errorData);
        throw new Error(errorData.error?.message || `Salvarea a eșuat (${response.status})`);
      }

      const data = await response.json();

      if (data.data?.order) {
        if (data.data.order.id && !state.orderId) {
          dispatch({
            type: 'SET_ORDER_IDS',
            payload: {
              orderId: data.data.order.id,
              friendlyOrderId: data.data.order.friendly_order_id || state.friendlyOrderId,
            },
          });
        }
      }

      dispatch({ type: 'SAVE_SUCCESS', payload: new Date().toISOString() });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request was aborted - reset saving state without error
        dispatch({ type: 'SAVE_SUCCESS', payload: new Date().toISOString() });
        return;
      }
      console.error('Auto-save failed:', error);
      dispatch({
        type: 'SAVE_ERROR',
        payload: error instanceof Error ? error.message : 'Salvarea a eșuat',
      });
    }
  }, [state, priceBreakdown, saveToLocalStorage, canSaveToServer]);

  // Debounced save
  const debouncedSave = useMemo(
    () => debounce(saveDraftToServer, 500),
    [saveDraftToServer]
  );

  // Public save functions
  const saveDraft = useCallback(async () => {
    if (canSaveToServer) debouncedSave();
  }, [debouncedSave, canSaveToServer]);

  const saveDraftNow = useCallback(async () => {
    if (canSaveToServer) await saveDraftToServer();
  }, [saveDraftToServer, canSaveToServer]);

  // Auto-save on changes
  useEffect(() => {
    if (!state.isDirty || !serviceRef.current || !canSaveToServer || !state.friendlyOrderId) {
      return;
    }
    debouncedSave();
  }, [state.isDirty, canSaveToServer, state.friendlyOrderId, debouncedSave]);

  // Save to localStorage immediately
  useEffect(() => {
    if (state.isDirty && state.friendlyOrderId && canSaveToServer) {
      saveToLocalStorage();
    }
  }, [state.isDirty, state.friendlyOrderId, canSaveToServer, saveToLocalStorage]);

  // Submit order
  const submitOrder = useCallback(async () => {
    dispatch({ type: 'SAVE_START' });
    try {
      await saveDraftNow();

      if (!state.orderId) {
        throw new Error('Order ID not found');
      }

      const paymentResponse = await fetch(`/api/orders/${state.orderId}/payment`, {
        method: 'POST',
      });

      if (!paymentResponse.ok) {
        throw new Error('Failed to create payment');
      }

      const paymentData = await paymentResponse.json();

      if (paymentData.data?.checkout_url) {
        window.location.href = paymentData.data.checkout_url;
      }
    } catch (error) {
      dispatch({
        type: 'SAVE_ERROR',
        payload: error instanceof Error ? error.message : 'Submit failed',
      });
    }
  }, [state.orderId, saveDraftNow]);

  // Reset wizard
  const resetWizard = useCallback(() => {
    if (state.friendlyOrderId) {
      try {
        localStorage.removeItem(getDraftStorageKey(state.friendlyOrderId));
      } catch {
        // Ignore
      }
    }
    serviceRef.current = null;
    serviceOptionsRef.current = [];
    dispatch({ type: 'RESET' });
  }, [state.friendlyOrderId]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      const stepParam = new URLSearchParams(window.location.search).get('step');
      if (stepParam && visibleSteps.length > 0) {
        const stepNumber = parseInt(stepParam, 10);
        if (stepNumber >= 1 && stepNumber <= visibleSteps.length) {
          const step = visibleSteps[stepNumber - 1];
          if (step) {
            dispatch({ type: 'SET_STEP', payload: step.id });
          }
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [visibleSteps]);

  // Warn on page unload if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.isDirty && state.friendlyOrderId && canSaveToServer) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.isDirty, state.friendlyOrderId, canSaveToServer]);

  const value: ModularWizardContextType = {
    state,
    service: serviceRef.current,
    serviceOptions: serviceOptionsRef.current,
    goToStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    isFirstStep,
    isLastStep,
    visibleSteps,
    currentStep,
    initService,
    setClientType,
    updateContact,
    updatePersonalKyc,
    updateCompanyKyc,
    updateProperty,
    updateVehicle,
    updateSignature,
    updateOptions,
    updateDelivery,
    priceBreakdown,
    saveDraft,
    saveDraftNow,
    submitOrder,
    resetWizard,
    clearError,
    canSaveToServer,
  };

  return (
    <ModularWizardContext.Provider value={value}>
      {children}
    </ModularWizardContext.Provider>
  );
}

// ============================================================================
// HOOK
// ============================================================================

export function useModularWizard() {
  const context = useContext(ModularWizardContext);
  if (!context) {
    throw new Error('useModularWizard must be used within ModularWizardProvider');
  }
  return context;
}
