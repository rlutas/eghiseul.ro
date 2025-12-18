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
} from '@/types/orders';
import { Service, ServiceOption } from '@/types/services';

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
  isDirty: false,
  lastSavedAt: null,
  isLoading: false,
  error: null,
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

    case 'SAVE_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'SAVE_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isDirty: false,
        lastSavedAt: action.payload,
      };

    case 'SAVE_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case 'MARK_DIRTY':
      return {
        ...state,
        isDirty: true,
      };

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
  submitOrder: () => Promise<void>;
  resetWizard: () => void;
}

const OrderWizardContext = createContext<OrderWizardContextType | null>(null);

// Provider Component
export function OrderWizardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(orderWizardReducer, initialState);
  const router = useRouter();
  const pathname = usePathname();

  // Track if we're syncing from URL to prevent loops
  const isUrlSyncRef = useRef(false);
  const initialSyncDoneRef = useRef(false);

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
          // Reset flag after dispatch
          setTimeout(() => { isUrlSyncRef.current = false; }, 0);
        }
      }
    }
  }, []); // Empty deps - run only once on mount

  // Update URL when step changes (but not when syncing from URL)
  const updateURL = useCallback(
    (stepNumber: number) => {
      if (isUrlSyncRef.current) return; // Don't update URL if we're syncing from it

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

  // Save draft
  const saveDraft = useCallback(async () => {
    dispatch({ type: 'SAVE_START' });
    try {
      const response = await fetch('/api/orders', {
        method: state.orderId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: state.orderId,
          service_id: state.service?.id,
          status: 'draft',
          customer_data: {
            contact: state.contactData,
            personal: state.personalData,
          },
          selected_options: state.selectedOptions,
          kyc_documents: state.kycDocuments,
          delivery_method: state.deliverySelection.method,
          delivery_address: state.deliverySelection.address,
          signature: state.signatureData.signature_base64,
          ...priceBreakdown,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save draft');
      }

      const data = await response.json();
      if (data.data?.order?.id && !state.orderId) {
        dispatch({ type: 'SET_ORDER_ID', payload: data.data.order.id });
      }
      dispatch({ type: 'SAVE_SUCCESS', payload: new Date().toISOString() });
    } catch (error) {
      dispatch({
        type: 'SAVE_ERROR',
        payload: error instanceof Error ? error.message : 'Save failed',
      });
    }
  }, [state, priceBreakdown]);

  // Submit order
  const submitOrder = useCallback(async () => {
    dispatch({ type: 'SAVE_START' });
    try {
      // First save the order
      await saveDraft();

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
  }, [state.orderId, saveDraft]);

  // Reset wizard
  const resetWizard = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // Auto-save draft every 30 seconds when dirty
  useEffect(() => {
    if (!state.isDirty || !state.service) return;

    const timer = setTimeout(() => {
      saveDraft();
    }, 30000);

    return () => clearTimeout(timer);
  }, [state.isDirty, state.service, saveDraft]);

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
    submitOrder,
    resetWizard,
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
