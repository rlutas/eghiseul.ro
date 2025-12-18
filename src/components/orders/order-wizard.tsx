'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Save, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useOrderWizard } from '@/providers/order-wizard-provider';
import { WizardProgress } from './wizard-progress';
import { PriceSidebar } from './price-sidebar';
import { Service, ServiceOption } from '@/types/services';

// Step Components (will be created separately)
import { ContactStep } from './steps/contact-step';
import { PersonalDataStep } from './steps/personal-data-step';
import { OptionsStep } from './steps/options-step';
import { KYCStep } from './steps/kyc-step';
import { DeliveryStep } from './steps/delivery-step';
import { ReviewStep } from './steps/review-step';

// Exit Confirmation Dialog
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface OrderWizardProps {
  initialService: Service;
  initialOptions: ServiceOption[];
}

export function OrderWizard({ initialService, initialOptions }: OrderWizardProps) {
  const {
    state,
    goToStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
    isFirstStep,
    isLastStep,
    setService,
    saveDraft,
    submitOrder,
    priceBreakdown,
  } = useOrderWizard();

  const [showExitDialog, setShowExitDialog] = useState(false);
  const [stepValid, setStepValid] = useState(false);

  // Initialize service data
  useEffect(() => {
    if (initialService && !state.service) {
      setService(initialService, initialOptions);
    }
  }, [initialService, initialOptions, setService, state.service]);

  // URL sync is handled by OrderWizardProvider - removed duplicate to prevent infinite loop

  // Handle beforeunload for dirty form
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.isDirty]);

  // Render current step
  const renderStep = () => {
    switch (state.currentStep) {
      case 'contact':
        return <ContactStep onValidChange={setStepValid} />;
      case 'personal':
        return <PersonalDataStep onValidChange={setStepValid} />;
      case 'options':
        return <OptionsStep onValidChange={setStepValid} />;
      case 'kyc':
        return <KYCStep onValidChange={setStepValid} />;
      case 'delivery':
        return <DeliveryStep onValidChange={setStepValid} />;
      case 'review':
        return <ReviewStep onValidChange={setStepValid} />;
      default:
        return <ContactStep onValidChange={setStepValid} />;
    }
  };

  const handleNext = () => {
    if (isLastStep) {
      submitOrder();
    } else {
      nextStep();
    }
  };

  const handleSaveDraft = async () => {
    await saveDraft();
  };

  if (!state.service) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-[1200px]">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">
            Comandă {state.service.name}
          </h1>
          <p className="text-neutral-600">
            Completează informațiile necesare pentru a plasa comanda
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <WizardProgress
            currentStep={state.currentStep}
            stepNumber={state.stepNumber}
            onStepClick={goToStep}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Step Content */}
          <div className="lg:col-span-2">
            <Card className="border border-neutral-200 shadow-sm">
              <CardHeader className="border-b border-neutral-100 bg-neutral-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-secondary-900">
                      Pasul {state.stepNumber}:{' '}
                      {state.currentStep === 'contact' && 'Informații Contact'}
                      {state.currentStep === 'personal' && 'Date Personale'}
                      {state.currentStep === 'options' && 'Opțiuni Serviciu'}
                      {state.currentStep === 'kyc' && 'Verificare Identitate'}
                      {state.currentStep === 'delivery' && 'Livrare & Semnătură'}
                      {state.currentStep === 'review' && 'Verificare & Plată'}
                    </h2>
                  </div>
                  {state.isDirty && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSaveDraft}
                      disabled={state.isLoading}
                      className="text-neutral-600"
                    >
                      {state.isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Salvează Draft
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-6">{renderStep()}</CardContent>

              {/* Navigation */}
              <div className="border-t border-neutral-100 px-6 py-4 bg-neutral-50/50">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={isFirstStep || state.isLoading}
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
                      disabled={!stepValid || state.isLoading}
                      className="gap-2 bg-primary-500 hover:bg-primary-600 text-secondary-900 font-semibold"
                    >
                      {state.isLoading && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      {isLastStep ? (
                        <>
                          Plătește {priceBreakdown.totalPrice} RON
                          <ArrowRight className="h-4 w-4" />
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
          </div>

          {/* Price Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <PriceSidebar />
            </div>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Părăsești comanda?</AlertDialogTitle>
            <AlertDialogDescription>
              Ai modificări nesalvate. Dorești să salvezi ca draft înainte de a
              părăsi pagina?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Rămân aici</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSaveDraft}
              className="bg-primary-500 text-secondary-900"
            >
              Salvează și ieși
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
