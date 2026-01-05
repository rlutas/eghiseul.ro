'use client';

/**
 * ClientTypeStep Component
 *
 * Allows users to select between PF (Persoana Fizică) and PJ (Persoana Juridică).
 * This step is shown when a service supports both client types with different flows.
 */

import { useCallback, useEffect } from 'react';
import { useModularWizard } from '@/providers/modular-wizard-provider';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { User, Building2, CheckCircle } from 'lucide-react';
import type { ClientTypeSelectionConfig, ClientType } from '@/types/verification-modules';

interface ClientTypeStepProps {
  config: ClientTypeSelectionConfig;
  onValidChange: (valid: boolean) => void;
}

// Default options if config doesn't have them
const DEFAULT_OPTIONS = [
  { value: 'PF' as const, label: 'Persoană Fizică', description: 'Pentru persoane fizice' },
  { value: 'PJ' as const, label: 'Persoană Juridică', description: 'Pentru companii și firme' },
];

export default function ClientTypeStep({ config, onValidChange }: ClientTypeStepProps) {
  const { state, setClientType } = useModularWizard();
  const selectedType = state.clientType;

  // Use config options or defaults
  const options = config?.options ?? DEFAULT_OPTIONS;

  // Update validity when selection changes
  useEffect(() => {
    onValidChange(!!selectedType);
  }, [selectedType, onValidChange]);

  // Handle type selection
  const handleSelectType = useCallback((type: ClientType) => {
    setClientType(type);
  }, [setClientType]);

  // Get icon for type
  const getIcon = (type: 'PF' | 'PJ') => {
    return type === 'PF' ? User : Building2;
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-center">
        Selectează tipul de client pentru care soliciți serviciul
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((option) => {
          const Icon = getIcon(option.value);
          const isSelected = selectedType === option.value;

          return (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all hover:border-primary !p-0 !gap-0 ${
                isSelected
                  ? 'border-2 border-primary bg-primary/5'
                  : 'border border-border hover:shadow-md'
              }`}
              onClick={() => handleSelectType(option.value)}
            >
              <CardHeader className="text-center pb-2 pt-6">
                <div className="mx-auto mb-3 relative">
                  <div className={`p-4 rounded-full ${
                    isSelected ? 'bg-primary-500 text-secondary-900' : 'bg-muted'
                  }`}>
                    <Icon className="h-8 w-8" />
                  </div>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg">{option.label}</CardTitle>
              </CardHeader>
              <CardContent className="text-center pb-6">
                {option.description && (
                  <CardDescription className="text-sm">
                    {option.description}
                  </CardDescription>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Type Info */}
      {selectedType && (
        <div className="bg-muted/50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground">
            {selectedType === 'PF' ? (
              <>
                Vei completa datele tale personale și vei furniza documente de identitate.
              </>
            ) : (
              <>
                Vei completa datele firmei (CUI) și informațiile reprezentantului legal.
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
