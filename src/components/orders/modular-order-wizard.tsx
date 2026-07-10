/* eslint-disable @next/next/no-assign-module-variable, react-hooks/preserve-manual-memoization -- pre-existing pattern, refactor when touched */
'use client';

/**
 * Modular Order Wizard Component
 *
 * Dynamic wizard that renders steps based on service verification config.
 * Uses ModularWizardProvider for state management.
 */

import { useEffect, useState, Suspense, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Loader2, AlertTriangle, CheckCircle, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useModularWizard } from '@/providers/modular-wizard-provider';
import { WizardProgress } from './wizard-progress-modular';
import { PriceSidebarModular } from './price-sidebar-modular';
import { SaveStatus } from './save-status';
import { OrderIdDisplay, OrderIdBadge } from './order-id-display';
import { SaveDataModal } from './save-data-modal';
import { Service, ServiceOption } from '@/types/services';
import { MODULE_LOADERS, hasModuleLoader } from '@/lib/verification-modules/registry';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ModularStepId } from '@/types/verification-modules';
import { createClient } from '@/lib/supabase/client';

// Core step components (always available)
import { ContactStepModular } from './steps-modular/contact-step';
import { OptionsStepModular } from './steps-modular/options-step';
import { DeliveryStepModular } from './steps-modular/delivery-step';
import BillingStepModular from './steps-modular/billing-step';
import { ReviewStepModular } from './steps-modular/review-step';

// Loading fallback
function StepLoading() {
  return (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      <span className="ml-3 text-neutral-600">Se încarcă...</span>
    </div>
  );
}

interface ModularOrderWizardProps {
  initialService: Service;
  initialOptions: ServiceOption[];
  /** Optional control rendered in the header (e.g. cadastral service switcher). */
  headerExtra?: React.ReactNode;
}

export function ModularOrderWizard({ initialService, initialOptions, headerExtra }: ModularOrderWizardProps) {
  const {
    state,
    initService,
    nextStep,
    prevStep,
    goToStep,
    saveDraftNow,
    clearError,
    startNewOrder,
    priceBreakdown,
    canSaveToServer,
    visibleSteps,
    isFirstStep,
    isLastStep,
    requestValidation,
  } = useModularWizard();

  const [stepValid, setStepValid] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [DynamicComponent, setDynamicComponent] = useState<React.ComponentType<any> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [orderComplete, setOrderComplete] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null = loading
  const [summaryOpen, setSummaryOpen] = useState(false); // mobile sticky summary dropdown

  // Initialize service data
  useEffect(() => {
    if (initialService && !state.serviceId) {
      initService(initialService, initialOptions);
    }
  }, [initialService, initialOptions, initService, state.serviceId]);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  // Load dynamic component when step changes
  useEffect(() => {
    const loadComponent = async () => {
      const stepId = state.currentStepId;

      // Core steps don't use dynamic loading
      if (['contact', 'options', 'delivery', 'review'].includes(stepId)) {
        setDynamicComponent(null);
        return;
      }

      // Check if we have a loader for this step
      if (hasModuleLoader(stepId)) {
        const loader = MODULE_LOADERS[stepId];
        if (loader) {
          try {
            const module = await loader();
            setDynamicComponent(() => module.default);
          } catch (error) {
            console.error(`Failed to load module for step ${stepId}:`, error);
            setDynamicComponent(null);
          }
        }
      }
    };

    loadComponent();
  }, [state.currentStepId]);

  // Get module config for current step
  const getModuleConfig = () => {
    if (!state.verificationConfig) return null;

    switch (state.currentStepId) {
      case 'client-type':
        return state.verificationConfig.clientTypeSelection;
      case 'personal-data':
      case 'kyc-documents':
        return state.verificationConfig.personalKyc;
      case 'civil-status':
        return state.verificationConfig.civilStatus;
      case 'constatator':
        return state.verificationConfig.constatator;
      case 'company-data':
      case 'company-documents':
        return state.verificationConfig.companyKyc;
      case 'property-data':
        return state.verificationConfig.propertyVerification;
      case 'vehicle-data':
        return state.verificationConfig.vehicleVerification;
      case 'signature':
        return state.verificationConfig.signature;
      default:
        return null;
    }
  };

  // Render current step
  const renderStep = () => {
    const stepId = state.currentStepId;

    // Core steps
    switch (stepId) {
      case 'contact':
        return <ContactStepModular onValidChange={setStepValid} />;
      case 'options':
        return <OptionsStepModular onValidChange={setStepValid} />;
      case 'delivery':
        return <DeliveryStepModular onValidChange={setStepValid} />;
      case 'billing':
        return <BillingStepModular onValidChange={setStepValid} />;
      case 'review':
        return <ReviewStepModular onValidChange={setStepValid} />;
    }

    // Dynamic modules
    if (DynamicComponent) {
      const config = getModuleConfig();
      return <DynamicComponent config={config} onValidChange={setStepValid} />;
    }

    return <StepLoading />;
  };

  // Get current visible step info (label and renumbered step number)
  const currentVisibleStep = visibleSteps.find(s => s.id === state.currentStepId);
  const getStepLabel = () => {
    return currentVisibleStep?.labelRo || 'Pas';
  };

  // Handle order submission - redirect to checkout page
  const handleSubmitOrder = useCallback(async () => {
    if (!state.orderId) {
      // Draft not yet persisted (fresh id after a recovered save error, or the
      // very first autosave still in flight) — tell the user instead of a dead
      // button; the autosave loop assigns the id within seconds.
      console.error('No order ID available');
      toast.error('Comanda se salvează încă — așteaptă o secundă și apasă din nou.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit the order (change status from 'draft' to 'pending_payment')
      const submitResponse = await fetch(`/api/orders/${state.orderId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          total_price: priceBreakdown.totalPrice,
          signature_base64: state.signature?.signatureBase64 || null,
          consent: {
            termsAccepted: state.consent.termsAccepted,
            privacyAccepted: state.consent.privacyAccepted,
            signatureConsent: state.signature?.termsAccepted || false,
            withdrawalWaiver: state.consent.withdrawalWaiver,
          },
        }),
      });

      if (!submitResponse.ok) {
        const submitError = await submitResponse.json().catch(() => ({}));
        console.error('Order submission failed:', submitError);
        toast.error(
          submitError?.error?.message ||
            'Nu am putut finaliza comanda. Verifică datele introduse și încearcă din nou.'
        );
        setIsSubmitting(false);
        return;
      }

      // Redirect to checkout page for payment method selection
      window.location.href = `/comanda/checkout/${state.orderId}`;
    } catch (error) {
      console.error('Order submission error:', error);
      toast.error('Eroare de conexiune la trimiterea comenzii. Verifică internetul și încearcă din nou.');
      setIsSubmitting(false);
    }
  }, [state.orderId, priceBreakdown.totalPrice, state.signature?.signatureBase64, state.signature?.termsAccepted, state.consent]);

  // Handle next
  const handleNext = () => {
    // Pas invalid → nu avansăm; semnalăm pasului să afișeze ce lipsește + scroll
    // la prima problemă (în loc să lăsăm butonul „mort" fără explicație). Toast =
    // plasă de siguranță pentru pașii care nu au listă proprie de erori.
    if (!stepValid) {
      requestValidation();
      toast.error('Mai sunt câmpuri obligatorii necompletate pe acest pas.');
      return;
    }
    if (isLastStep) {
      handleSubmitOrder();
    } else {
      nextStep();
    }
  };

  // Scroll to top of page on step change.
  // Critical for mobile UX — without this the user lands at the bottom of the
  // previous step's content after pressing Continuă and has to scroll up
  // manually to see the new step's header + progress indicator.
  const isInitialMount = useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (typeof window !== 'undefined') {
      // 'instant' on mobile (avoid the smooth-scroll jank during fast taps);
      // smooth on desktop where animation reads as polished.
      const isMobile = window.innerWidth < 1024;
      window.scrollTo({
        top: 0,
        behavior: isMobile ? 'auto' : 'smooth',
      });
    }
  }, [state.currentStepId]);

  // Handle retry save
  const handleRetry = () => {
    clearError();
    saveDraftNow();
  };

  // Handle starting a new order
  const handleStartNewOrder = useCallback(() => {
    if (window.confirm('Ești sigur că vrei să începi o comandă nouă? Toate datele introduse vor fi șterse.')) {
      startNewOrder();
    }
  }, [startNewOrder]);

  // Loading state
  if (!state.serviceId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-[1200px]">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      </div>
    );
  }

  // Order complete state - show success screen
  if (orderComplete) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-[800px]">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-secondary-900 mb-2">
              Comanda a fost plasată cu succes!
            </h1>
            <p className="text-neutral-600 mb-4">
              Îți mulțumim pentru comandă. Vei primi un email de confirmare la{' '}
              <strong>{state.contact.email}</strong>
            </p>
            {state.friendlyOrderId && (
              <div className="bg-white p-4 rounded-lg border border-green-200 inline-block mb-6">
                <p className="text-sm text-neutral-600 mb-1">Codul comenzii tale:</p>
                <p className="text-xl font-mono font-bold text-secondary-900">
                  {state.friendlyOrderId}
                </p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {isAuthenticated ? (
                <>
                  <Button
                    onClick={() => window.location.href = '/account'}
                    className="bg-primary-500 hover:bg-primary-600 text-secondary-900"
                  >
                    Mergi la Contul Tău
                  </Button>
                  <Button
                    onClick={() => window.location.href = `/comanda/status?order=${state.friendlyOrderId}&email=${encodeURIComponent(state.contact.email)}`}
                    variant="outline"
                  >
                    Verifică Statusul Comenzii
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => window.location.href = `/comanda/status?order=${state.friendlyOrderId}&email=${encodeURIComponent(state.contact.email)}`}
                    className="bg-primary-500 hover:bg-primary-600 text-secondary-900"
                  >
                    Verifică Statusul Comenzii
                  </Button>
                  <Button
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                  >
                    Înapoi la pagina principală
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Save Data Modal for guest users */}
        <SaveDataModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          orderId={state.orderId || ''}
          email={state.contact.email}
          onSuccess={() => {
            // User created account successfully
            console.log('Account created successfully');
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-3 sm:pt-8 pb-28 lg:pb-8 max-w-[1200px]">
      {/* Header with Order ID */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-3 sm:mb-4">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900 mb-1">
              Comandă {initialService.name}
            </h1>
            <p className="text-neutral-600">
              Completează informațiile necesare pentru a plasa comanda
            </p>
          </div>

          {/* Order ID Display - Desktop */}
          {state.friendlyOrderId && (
            <div className="hidden sm:block">
              <OrderIdDisplay
                orderId={state.friendlyOrderId}
                showClearButton={true}
                onClear={handleStartNewOrder}
              />
            </div>
          )}
        </div>

        {/* Order ID Display - Mobile */}
        {state.friendlyOrderId && (
          <div className="sm:hidden">
            <OrderIdBadge orderId={state.friendlyOrderId} />
          </div>
        )}

        {/* Optional header control (cadastral service switcher) — full width,
            responsive: stacks under the title on mobile, sits inline on desktop. */}
        {headerExtra && <div className="mt-3 sm:mt-4">{headerExtra}</div>}
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        {state.isInitialized ? (
          <WizardProgress
            steps={visibleSteps}
            currentStepId={state.currentStepId}
            onStepClick={goToStep}
          />
        ) : (
          <div className="w-full">
            {/* Desktop skeleton */}
            <div className="hidden md:flex items-center justify-between">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-neutral-200 animate-pulse" />
                    <div className="mt-2 h-3 w-16 bg-neutral-200 rounded animate-pulse" />
                  </div>
                  {i < 5 && <div className="flex-1 h-0.5 mx-2 bg-neutral-200" />}
                </div>
              ))}
            </div>
            {/* Mobile skeleton */}
            <div className="md:hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
                <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse" />
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-2">
                <div className="bg-neutral-300 h-2 rounded-full w-1/3 animate-pulse" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Step Content */}
        <div className="lg:col-span-2">
          <Card className="border border-neutral-200 shadow-sm overflow-hidden !p-0 !gap-0">
            <div className="border-b border-neutral-100 bg-neutral-50/50 py-3 px-6">
              <div className="flex items-center justify-between min-h-[40px]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary-500 text-secondary-900 font-bold text-xs">
                    {currentVisibleStep?.number ?? state.currentStepNumber}
                  </span>
                  <h2 className="text-base font-semibold text-secondary-900 leading-none">
                    {getStepLabel()}
                  </h2>
                </div>

                {/* Save Status Indicator */}
                {canSaveToServer && (
                  <SaveStatus
                    isSaving={state.isSaving}
                    lastSavedAt={state.lastSavedAt}
                    error={state.error}
                    onRetry={handleRetry}
                  />
                )}
              </div>
            </div>

            <CardContent className="p-6">
              <Suspense fallback={<StepLoading />}>
                {renderStep()}
              </Suspense>
            </CardContent>

            {/* Navigation — stays in the form on all sizes (Back/Continue). */}
            <div className="border-t border-neutral-100 px-6 py-4 bg-neutral-50/50">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={isFirstStep}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Înapoi
                </Button>

                <div className="flex items-center gap-3">
                  {state.error && (
                    <span className="text-sm text-red-600 flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      {state.error}
                    </span>
                  )}

                  <Button
                    onClick={handleNext}
                    // Intermediate steps advance optimistically — the draft
                    // auto-save runs in the background (shown by <SaveStatus>),
                    // so `state.isSaving` must NOT block "Continuă". Only the
                    // final "Plătește" step waits for the save/submit to finish.
                    // Butonul NU se mai dezactivează pe pas invalid — la click pe
                    // pas invalid afișăm ce lipsește + scroll la problemă
                    // (handleNext → requestValidation). Doar submit-ul așteaptă.
                    disabled={
                      isSubmitting ||
                      (isLastStep && state.isSaving)
                    }
                    className="gap-2 bg-primary-500 hover:bg-primary-600 text-secondary-900 font-semibold"
                  >
                    {((isLastStep && state.isSaving) || isSubmitting) && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    {isLastStep ? (
                      <>
                        {isSubmitting ? 'Se procesează...' : `Plătește ${Number(priceBreakdown.totalPrice).toFixed(2)} RON`}
                        {!isSubmitting && <ArrowRight className="h-4 w-4" />}
                      </>
                    ) : (
                      <>
                        Continuă
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Support Message */}
          {state.friendlyOrderId && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Ai nevoie de ajutor?</strong> Contactează-ne și
                menționează codul comenzii tale:{' '}
                <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono font-semibold">
                  {state.friendlyOrderId}
                </code>
              </p>
            </div>
          )}

          {/* Mobile only: estimated time + trust badges. The price summary
              itself lives in the sticky-bar dropdown; these "extras" stay here
              in the form so the dropdown stays clean. Desktop has them in the
              sidebar. */}
          <div className="lg:hidden mt-4">
            <PriceSidebarModular service={initialService} variant="extras" />
          </div>
        </div>

        {/* Price Sidebar — desktop only. On mobile the same summary is opened
            as a dropdown from the sticky bottom bar. */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="lg:sticky lg:top-28">
            <PriceSidebarModular service={initialService} />
            {/* Order code is shown twice already (top-right header + Rezumat
                comandă chip). The redundant footer card was removed for
                cleaner mobile layout. */}
          </div>
        </div>
      </div>

      {/* Mobile sticky SUMMARY bar — the running total stays visible across
          every wizard step; tapping it opens the full "Rezumat comandă" as a
          dropdown. Navigation (Back/Continuă) stays in the form footer. */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40">
        {/* Backdrop closes the dropdown */}
        {summaryOpen && (
          <button
            type="button"
            aria-label="Închide rezumatul"
            onClick={() => setSummaryOpen(false)}
            className="fixed inset-0 bg-black/30 z-0"
          />
        )}
        <div className="relative z-10 border-t border-neutral-200 bg-white/95 backdrop-blur shadow-[0_-4px_20px_-8px_rgba(0,0,0,0.08)]">
          {/* Expanded summary panel — price breakdown only (clean). The
              estimated time + trust badges live in the form below. */}
          {summaryOpen && (
            <div className="max-h-[60vh] overflow-y-auto border-b border-neutral-100 p-4">
              <PriceSidebarModular service={initialService} variant="summary" />
            </div>
          )}
          <button
            type="button"
            onClick={() => setSummaryOpen((v) => !v)}
            aria-expanded={summaryOpen}
            className="w-full px-4 py-2.5 flex items-center justify-between gap-3 text-left"
          >
            <span className="flex items-center gap-2 min-w-0">
              <ChevronUp
                className={cn(
                  'h-4 w-4 text-neutral-500 transition-transform shrink-0',
                  summaryOpen && 'rotate-180'
                )}
              />
              <span className="min-w-0">
                <span className="block text-[11px] uppercase tracking-wide text-neutral-500 leading-tight">
                  Rezumat comandă{priceBreakdown.discountAmount > 0 ? ' · reducere aplicată' : ''}
                </span>
                <span className="block text-[11px] text-neutral-400 leading-tight">
                  {summaryOpen ? 'Apasă pentru a ascunde' : 'Apasă pentru detalii'}
                </span>
              </span>
            </span>
            <span className="text-lg font-bold text-primary-600 tabular-nums shrink-0">
              {Number(priceBreakdown.totalPrice).toFixed(2)} RON
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
