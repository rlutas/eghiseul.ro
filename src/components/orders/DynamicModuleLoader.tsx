'use client';

/**
 * DynamicModuleLoader Component
 *
 * Dynamically loads and renders module components based on the current step.
 * Supports lazy loading for code splitting.
 */

import { Suspense, lazy, useMemo, ComponentType } from 'react';
import { useModularWizard } from '@/providers/modular-wizard-provider';
import { MODULE_LOADERS, hasModuleLoader } from '@/lib/verification-modules/registry';
import type { ModularStepId, ModuleBaseProps, ServiceVerificationConfig } from '@/types/verification-modules';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Loading fallback
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="ml-3 text-muted-foreground">Se încarcă...</span>
    </div>
  );
}

// Error fallback
function ErrorFallback({ stepId }: { stepId: ModularStepId }) {
  return (
    <Alert variant="destructive">
      <AlertDescription>
        Nu s-a putut încărca modulul pentru pasul &quot;{stepId}&quot;.
        Te rugăm să reîncerci sau să contactezi suportul.
      </AlertDescription>
    </Alert>
  );
}

interface DynamicModuleLoaderProps {
  stepId: ModularStepId;
  onComplete: () => void;
  onBack: () => void;
}

export default function DynamicModuleLoader({
  stepId,
  onComplete,
  onBack,
}: DynamicModuleLoaderProps) {
  const { state } = useModularWizard();
  const config = state.verificationConfig;

  // Create lazy component based on step ID
  const LazyComponent = useMemo(() => {
    if (!hasModuleLoader(stepId)) {
      return null;
    }

    const loader = MODULE_LOADERS[stepId];
    if (!loader) return null;

    return lazy(loader);
  }, [stepId]);

  // Get module config based on step type
  const moduleConfig = useMemo(() => {
    if (!config) return null;

    switch (stepId) {
      case 'client-type':
        return config.clientTypeSelection;
      case 'personal-data':
      case 'kyc-documents':
        return config.personalKyc;
      case 'company-data':
        return config.companyKyc;
      case 'property-data':
        return config.propertyVerification;
      case 'vehicle-data':
        return config.vehicleVerification;
      case 'signature':
        return config.signature;
      default:
        return null;
    }
  }, [stepId, config]);

  // If no loader exists for this step, show error
  if (!LazyComponent) {
    return <ErrorFallback stepId={stepId} />;
  }

  // If no config, show error
  if (!moduleConfig) {
    return (
      <Alert>
        <AlertDescription>
          Configurația pentru acest modul nu este disponibilă.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <LazyComponent config={moduleConfig} />
    </Suspense>
  );
}

/**
 * Hook to get the component for a step
 */
export function useStepComponent(stepId: ModularStepId): {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: ComponentType<{ config: any }> | null;
  config: unknown;
} {
  const { state } = useModularWizard();

  const Component = useMemo(() => {
    if (!hasModuleLoader(stepId)) return null;

    const loader = MODULE_LOADERS[stepId];
    if (!loader) return null;

    return lazy(loader);
  }, [stepId]);

  const config = useMemo(() => {
    const verificationConfig = state.verificationConfig;
    if (!verificationConfig) return null;

    switch (stepId) {
      case 'client-type':
        return verificationConfig.clientTypeSelection;
      case 'personal-data':
      case 'kyc-documents':
        return verificationConfig.personalKyc;
      case 'company-data':
        return verificationConfig.companyKyc;
      case 'property-data':
        return verificationConfig.propertyVerification;
      case 'vehicle-data':
        return verificationConfig.vehicleVerification;
      case 'signature':
        return verificationConfig.signature;
      default:
        return null;
    }
  }, [stepId, state.verificationConfig]);

  return { Component, config };
}
