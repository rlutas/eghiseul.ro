'use client';

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
import {
  OrderWizardState,
  OrderWizardAction,
  WizardStep,
  WIZARD_STEPS,
  ContactData,
  PersonalData,
  SelectedOption,
  KYCDocuments,
  SignatureData,
  DeliverySelection,
  PriceBreakdown,
  DraftOrderCache,
} from '@/types/orders';
import { Service, ServiceOption } from '@/types/services';
import { generateOrderId, getDraftStorageKey } from '@/lib/order-id';

// Cache version for migrations
const CACHE_VERSION = 1;

// Minimum contact data required before saving
function hasValidContactData(contact: Partial<ContactData>): boolean {
  return Boolean(
    contact.email &&
    contact.email.includes('@') &&
    contact.phone &&
    contact.phone.length >= 10
  );
}

// Initial State
const initialState: OrderWizardState = {
  currentStep: 'contact',
  stepNumber: 1,
  serviceSlug: null,
  service: null,
  serviceOptions: [],
  contactData: {},
  personalData: {},
  selectedOptions: [],
  kycDocuments: {},
  signatureData: {},
  deliverySelection: {},
  orderId: null,
  friendlyOrderId: null,
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
  isLoading: false,
  error: null,
  saveError: null,
};

// Reducer
function orderWizardReducer(
  state: OrderWizardState,
  action: OrderWizardAction
): OrderWizardState {
  switch (action.type) {
    case 'SET_SERVICE':
      return {
        ...state,
        service: action.payload.service,
        serviceOptions: action.payload.options,
        serviceSlug: action.payload.service.slug,
      };

    case 'SET_STEP': {
      const stepIndex = WIZARD_STEPS.findIndex((s) => s.id === action.payload);
      return {
        ...state,
        currentStep: action.payload,
        stepNumber: stepIndex + 1,
      };
    }

    case 'NEXT_STEP': {
      const currentIndex = WIZARD_STEPS.findIndex((s) => s.id === state.currentStep);
      if (currentIndex < WIZARD_STEPS.length - 1) {
        const nextStep = WIZARD_STEPS[currentIndex + 1];
        return {
          ...state,
          currentStep: nextStep.id,
          stepNumber: nextStep.number,
        };
      }
      return state;
    }

    case 'PREV_STEP': {
      const currentIndex = WIZARD_STEPS.findIndex((s) => s.id === state.currentStep);
      if (currentIndex > 0) {
        const prevStep = WIZARD_STEPS[currentIndex - 1];
        return {
          ...state,
          currentStep: prevStep.id,
          stepNumber: prevStep.number,
        };
      }
      return state;
    }

    case 'UPDATE_CONTACT':
      return {
        ...state,
        contactData: { ...state.contactData, ...action.payload },
        isDirty: true,
      };

    case 'UPDATE_PERSONAL':
      return {
        ...state,
        personalData: { ...state.personalData, ...action.payload },
        isDirty: true,
      };

    case 'UPDATE_OPTIONS':
      return {
        ...state,
        selectedOptions: action.payload,
        isDirty: true,
      };

    case 'UPDATE_KYC':
      return {
        ...state,
        kycDocuments: { ...state.kycDocuments, ...action.payload },
        isDirty: true,
      };

    case 'UPDATE_SIGNATURE':
      return {
        ...state,
        signatureData: { ...state.signatureData, ...action.payload },
        isDirty: true,
      };

    case 'UPDATE_DELIVERY':
      return {
        ...state,
        deliverySelection: { ...state.deliverySelection, ...action.payload },
        isDirty: true,
      };

    case 'SET_ORDER_ID':
      return {
        ...state,
        orderId: action.payload,
      };

    case 'SET_FRIENDLY_ORDER_ID':
      return {
        ...state,
        friendlyOrderId: action.payload,
      };

    case 'SET_ORDER_IDS':
      return {
        ...state,
        orderId: action.payload.orderId,
        friendlyOrderId: action.payload.friendlyOrderId,
      };

    case 'SAVE_START':
      return {
        ...state,
        isSaving: true,
        saveError: null,
      };

    case 'SAVE_SUCCESS':
      return {
        ...state,
        isSaving: false,
        isDirty: false,
        lastSavedAt: action.payload,
        saveError: null,
      };

    case 'SAVE_ERROR':
      return {
        ...state,
        isSaving: false,
        saveError: action.payload,
      };

    case 'CLEAR_SAVE_ERROR':
      return {
        ...state,
        saveError: null,
      };

    case 'MARK_DIRTY':
      return {
        ...state,
        isDirty: true,
      };

    case 'RESTORE_FROM_CACHE': {
      const cache = action.payload;
      return {
        ...state,
        orderId: cache.orderId,
        friendlyOrderId: cache.friendlyOrderId,
        currentStep: cache.currentStep,
        stepNumber: cache.stepNumber,
        contactData: cache.data.contact || {},
        personalData: cache.data.personal || {},
        selectedOptions: cache.data.options || [],
        kycDocuments: cache.data.kyc || {},
        signatureData: cache.data.signature || {},
        deliverySelection: cache.data.delivery || {},
        lastSavedAt: cache.lastSavedAt,
        isDirty: false,
      };
    }

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// Context Type
interface OrderWizardContextType {
  state: OrderWizardState;
  // Navigation
  goToStep: (step: WizardStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  // Data Updates
  setService: (service: Service, options: ServiceOption[]) => void;
  updateContactData: (data: Partial<ContactData>) => void;
  updatePersonalData: (data: Partial<PersonalData>) => void;
  updateSelectedOptions: (options: SelectedOption[]) => void;
  updateKYCDocuments: (docs: Partial<KYCDocuments>) => void;
  updateSignature: (sig: Partial<SignatureData>) => void;
  updateDelivery: (del: Partial<DeliverySelection>) => void;
  // Price
  priceBreakdown: PriceBreakdown;
  // Actions
  saveDraft: () => Promise<void>;
  saveDraftNow: () => Promise<void>;
  submitOrder: () => Promise<void>;
  resetWizard: () => void;
  clearSaveError: () => void;
  // State checks
  canSaveToServer: boolean;
}

const OrderWizardContext = createContext<OrderWizardContextType | null>(null);

// Debounce utility
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

// Provider Component
export function OrderWizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(orderWizardReducer, initialState);
  const router = useRouter();
  const pathname = usePathname();

  // Track if we're syncing from URL to prevent loops
  const isUrlSyncRef = useRef(false);
  const initialSyncDoneRef = useRef(false);
  const saveAbortControllerRef = useRef<AbortController | null>(null);
  const hasGeneratedOrderIdRef = useRef(false);

  // Check if we can save to server (have valid contact data)
  const canSaveToServer = useMemo(() => {
    return hasValidContactData(state.contactData);
  }, [state.contactData]);

  // Sync step from URL on mount only (once)
  useEffect(() => {
    if (initialSyncDoneRef.current) return;
    initialSyncDoneRef.current = true;

    const params = new URLSearchParams(window.location.search);
    const stepParam = params.get('step');
    if (stepParam) {
      const stepNumber = parseInt(stepParam, 10);
      if (stepNumber >= 1 && stepNumber <= WIZARD_STEPS.length) {
        const step = WIZARD_STEPS[stepNumber - 1];
        if (step && step.id !== state.currentStep) {
          isUrlSyncRef.current = true;
          dispatch({ type: 'SET_STEP', payload: step.id });
          setTimeout(() => { isUrlSyncRef.current = false; }, 0);
        }
      }
    }
  }, []);

  // Update URL when step changes (but not when syncing from URL)
  const updateURL = useCallback(
    (stepNumber: number) => {
      if (isUrlSyncRef.current) return;

      const params = new URLSearchParams(window.location.search);
      params.set('step', stepNumber.toString());
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router]
  );

  // Navigation computed values
  const currentStepIndex = WIZARD_STEPS.findIndex((s) => s.id === state.currentStep);
  const canGoNext = currentStepIndex < WIZARD_STEPS.length - 1;
  const canGoPrev = currentStepIndex > 0;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === WIZARD_STEPS.length - 1;

  // Navigation functions
  const goToStep = useCallback(
    (step: WizardStep) => {
      dispatch({ type: 'SET_STEP', payload: step });
      const stepIndex = WIZARD_STEPS.findIndex((s) => s.id === step);
      updateURL(stepIndex + 1);
    },
    [updateURL]
  );

  const nextStep = useCallback(() => {
    if (canGoNext) {
      dispatch({ type: 'NEXT_STEP' });
      updateURL(state.stepNumber + 1);
    }
  }, [canGoNext, state.stepNumber, updateURL]);

  const prevStep = useCallback(() => {
    if (canGoPrev) {
      dispatch({ type: 'PREV_STEP' });
      updateURL(state.stepNumber - 1);
    }
  }, [canGoPrev, state.stepNumber, updateURL]);

  // Data update functions
  const setService = useCallback((service: Service, options: ServiceOption[]) => {
    dispatch({ type: 'SET_SERVICE', payload: { service, options } });
  }, []);

  const updateContactData = useCallback((data: Partial<ContactData>) => {
    dispatch({ type: 'UPDATE_CONTACT', payload: data });
  }, []);

  const updatePersonalData = useCallback((data: Partial<PersonalData>) => {
    dispatch({ type: 'UPDATE_PERSONAL', payload: data });
  }, []);

  const updateSelectedOptions = useCallback((options: SelectedOption[]) => {
    dispatch({ type: 'UPDATE_OPTIONS', payload: options });
  }, []);

  const updateKYCDocuments = useCallback((docs: Partial<KYCDocuments>) => {
    dispatch({ type: 'UPDATE_KYC', payload: docs });
  }, []);

  const updateSignature = useCallback((sig: Partial<SignatureData>) => {
    dispatch({ type: 'UPDATE_SIGNATURE', payload: sig });
  }, []);

  const updateDelivery = useCallback((del: Partial<DeliverySelection>) => {
    dispatch({ type: 'UPDATE_DELIVERY', payload: del });
  }, []);

  // Price calculation
  const priceBreakdown = useMemo((): PriceBreakdown => {
    const basePrice = state.service?.base_price ?? 0;
    const optionsPrice = state.selectedOptions.reduce(
      (sum, opt) => sum + opt.price_modifier * opt.quantity,
      0
    );
    const deliveryPrice = state.deliverySelection.method?.price ?? 0;
    const discountAmount = 0; // TODO: Apply promo codes
    const totalPrice = basePrice + optionsPrice + deliveryPrice - discountAmount;

    return {
      basePrice,
      optionsPrice,
      deliveryPrice,
      discountAmount,
      totalPrice,
      currency: state.service?.currency ?? 'RON',
    };
  }, [state.service, state.selectedOptions, state.deliverySelection]);

  // Generate order ID when we have valid contact data (only once)
  useEffect(() => {
    if (
      !hasGeneratedOrderIdRef.current &&
      !state.friendlyOrderId &&
      hasValidContactData(state.contactData)
    ) {
      hasGeneratedOrderIdRef.current = true;
      const newOrderId = generateOrderId();
      dispatch({ type: 'SET_FRIENDLY_ORDER_ID', payload: newOrderId });
    }
  }, [state.contactData, state.friendlyOrderId]);

  // Save to localStorage (immediate, no network) - only with valid contact data
  const saveToLocalStorage = useCallback(() => {
    if (!state.friendlyOrderId || !state.serviceSlug || !canSaveToServer) return;

    const cacheData: DraftOrderCache = {
      orderId: state.orderId,
      friendlyOrderId: state.friendlyOrderId,
      serviceSlug: state.serviceSlug,
      currentStep: state.currentStep,
      stepNumber: state.stepNumber,
      data: {
        contact: state.contactData,
        personal: state.personalData,
        options: state.selectedOptions,
        kyc: state.kycDocuments,
        signature: state.signatureData,
        delivery: state.deliverySelection,
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

  // Save draft to server - only if we have valid contact data
  const saveDraftToServer = useCallback(async () => {
    // Don't save if we don't have valid contact data
    if (!state.service || !state.friendlyOrderId || !canSaveToServer) {
      return;
    }

    // Cancel any pending save
    if (saveAbortControllerRef.current) {
      saveAbortControllerRef.current.abort();
    }
    saveAbortControllerRef.current = new AbortController();

    dispatch({ type: 'SAVE_START' });

    try {
      // First save to localStorage (immediate, offline resilience)
      saveToLocalStorage();

      // Then save to server
      const method = state.orderId ? 'PATCH' : 'POST';

      const response = await fetch('/api/orders/draft', {
        method,
        headers: { 'Content-Type': 'application/json' },
        signal: saveAbortControllerRef.current.signal,
        body: JSON.stringify({
          id: state.orderId,
          friendly_order_id: state.friendlyOrderId,
          service_id: state.service.id,
          current_step: state.currentStep,
          customer_data: {
            contact: state.contactData,
            personal: state.personalData,
          },
          selected_options: state.selectedOptions,
          kyc_documents: state.kycDocuments,
          delivery_method: state.deliverySelection.method,
          delivery_address: state.deliverySelection.address,
          signature: state.signatureData.signature_base64,
          base_price: priceBreakdown.basePrice,
          options_price: priceBreakdown.optionsPrice,
          delivery_price: priceBreakdown.deliveryPrice,
          total_price: priceBreakdown.totalPrice,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Salvarea a eșuat');
      }

      const data = await response.json();

      // Update state with server response
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
        // Save was cancelled, don't show error
        return;
      }

      console.error('Auto-save failed:', error);
      dispatch({
        type: 'SAVE_ERROR',
        payload: error instanceof Error ? error.message : 'Salvarea a eșuat',
      });
    }
  }, [state, priceBreakdown, saveToLocalStorage, canSaveToServer]);

  // Debounced save (500ms after typing stops)
  const debouncedSave = useMemo(
    () => debounce(saveDraftToServer, 500),
    [saveDraftToServer]
  );

  // Public save functions
  const saveDraft = useCallback(async () => {
    if (canSaveToServer) {
      debouncedSave();
    }
  }, [debouncedSave, canSaveToServer]);

  const saveDraftNow = useCallback(async () => {
    if (canSaveToServer) {
      await saveDraftToServer();
    }
  }, [saveDraftToServer, canSaveToServer]);

  // Auto-save when data changes (debounced) - only after Step 1 with valid contact data
  useEffect(() => {
    if (!state.isDirty || !state.service || !canSaveToServer || !state.friendlyOrderId) {
      return;
    }
    debouncedSave();
  }, [state.isDirty, state.service, canSaveToServer, state.friendlyOrderId, debouncedSave]);

  // Also save to localStorage immediately on any change (for offline resilience)
  useEffect(() => {
    if (state.isDirty && state.friendlyOrderId && canSaveToServer) {
      saveToLocalStorage();
    }
  }, [state.isDirty, state.friendlyOrderId, canSaveToServer, saveToLocalStorage]);

  // Submit order
  const submitOrder = useCallback(async () => {
    dispatch({ type: 'SAVE_START' });
    try {
      // First save the order
      await saveDraftNow();

      // Then create payment intent
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

      // Redirect to Stripe checkout
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
    // Clear localStorage
    if (state.friendlyOrderId) {
      try {
        localStorage.removeItem(getDraftStorageKey(state.friendlyOrderId));
      } catch {
        // Ignore
      }
    }
    hasGeneratedOrderIdRef.current = false;
    dispatch({ type: 'RESET' });
  }, [state.friendlyOrderId]);

  // Clear save error
  const clearSaveError = useCallback(() => {
    dispatch({ type: 'CLEAR_SAVE_ERROR' });
  }, []);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      const stepParam = new URLSearchParams(window.location.search).get('step');
      if (stepParam) {
        const stepNumber = parseInt(stepParam, 10);
        if (stepNumber >= 1 && stepNumber <= WIZARD_STEPS.length) {
          const step = WIZARD_STEPS[stepNumber - 1];
          if (step) {
            dispatch({ type: 'SET_STEP', payload: step.id });
          }
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Warn on page unload if dirty and have contact data
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.isDirty && state.friendlyOrderId && canSaveToServer) {
        e.preventDefault();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.isDirty, state.friendlyOrderId, canSaveToServer]);

  const value: OrderWizardContextType = {
    state,
    goToStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    isFirstStep,
    isLastStep,
    setService,
    updateContactData,
    updatePersonalData,
    updateSelectedOptions,
    updateKYCDocuments,
    updateSignature,
    updateDelivery,
    priceBreakdown,
    saveDraft,
    saveDraftNow,
    submitOrder,
    resetWizard,
    clearSaveError,
    canSaveToServer,
  };

  return (
    <OrderWizardContext.Provider value={value}>
      {children}
    </OrderWizardContext.Provider>
  );
}

// Hook
export function useOrderWizard() {
  const context = useContext(OrderWizardContext);
  if (!context) {
    throw new Error('useOrderWizard must be used within OrderWizardProvider');
  }
  return context;
}
