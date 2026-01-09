'use client';

/**
 * Billing Step Component
 *
 * Allows users to select billing profile for invoice generation.
 * Three options:
 * 1. "Facturează pe mine" - Use data from scanned ID (PF)
 * 2. "Facturează pe altcineva" - Manual entry for another person (PF)
 * 3. "Facturează pe firmă" - Company billing with CUI validation (PJ)
 */

import { useEffect, useState, useCallback } from 'react';
import {
  User,
  Users,
  Building2,
  CheckCircle,
  Loader2,
  AlertCircle,
  Search,
  FileText,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useModularWizard } from '@/providers/modular-wizard-provider';
import { cn } from '@/lib/utils';
import type { BillingSource, BillingState } from '@/types/verification-modules';

interface BillingStepProps {
  onValidChange: (valid: boolean) => void;
}

interface BillingOption {
  source: BillingSource;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

const BILLING_OPTIONS: BillingOption[] = [
  {
    source: 'self',
    label: 'Facturează pe mine',
    description: 'Folosește datele din actul de identitate scanat',
    icon: User,
  },
  {
    source: 'other_pf',
    label: 'Altă persoană fizică',
    description: 'Facturează pe numele altei persoane',
    icon: Users,
  },
  {
    source: 'company',
    label: 'Persoană juridică',
    description: 'Facturează pe o firmă (introdu CUI)',
    icon: Building2,
  },
];

export default function BillingStepModular({ onValidChange }: BillingStepProps) {
  const { state, updateBilling } = useModularWizard();
  const { billing, personalKyc } = state;

  // CUI validation state
  const [cuiLoading, setCuiLoading] = useState(false);
  const [cuiError, setCuiError] = useState<string | null>(null);
  const [cuiSuccess, setCuiSuccess] = useState(billing?.cuiVerified ?? false);

  // Get prefill data from personal KYC
  const prefillFromId = personalKyc ? {
    firstName: personalKyc.firstName,
    lastName: personalKyc.lastName,
    cnp: personalKyc.cnp,
    address: [
      personalKyc.address?.street,
      personalKyc.address?.number ? `Nr. ${personalKyc.address.number}` : null,
      personalKyc.address?.building ? `Bl. ${personalKyc.address.building}` : null,
      personalKyc.address?.apartment ? `Ap. ${personalKyc.address.apartment}` : null,
      personalKyc.address?.city,
      personalKyc.address?.county,
    ].filter(Boolean).join(', '),
  } : undefined;

  // Initialize billing with self data if available and source is 'self'
  useEffect(() => {
    if (billing?.source === 'self' && prefillFromId && !billing?.firstName) {
      updateBilling({
        firstName: prefillFromId.firstName,
        lastName: prefillFromId.lastName,
        cnp: prefillFromId.cnp,
        address: prefillFromId.address,
        type: 'persoana_fizica',
        isValid: Boolean(prefillFromId.firstName && prefillFromId.lastName && prefillFromId.cnp),
      });
    }
  }, [billing?.source, billing?.firstName, prefillFromId, updateBilling]);

  // Validate step
  useEffect(() => {
    if (!billing) {
      onValidChange(false);
      return;
    }

    let isValid = false;

    if (billing.source === 'self') {
      // Self: must have name and CNP (pre-filled from ID)
      isValid = Boolean(billing.firstName && billing.lastName && billing.cnp);
    } else if (billing.source === 'other_pf') {
      // Other PF: must have name and CNP
      isValid = Boolean(billing.firstName && billing.lastName && billing.cnp);
    } else if (billing.source === 'company') {
      // Company: must have verified CUI and company name
      isValid = Boolean(billing.cuiVerified && billing.companyName && billing.cui);
    }

    // Update billing validity
    if (billing.isValid !== isValid) {
      updateBilling({ isValid });
    }

    onValidChange(isValid);
  }, [billing, onValidChange, updateBilling]);

  // Handle source selection
  const handleSourceSelect = useCallback((source: BillingSource) => {
    if (source === 'self') {
      // Use data from ID scan
      updateBilling({
        source,
        type: 'persoana_fizica',
        firstName: prefillFromId?.firstName || '',
        lastName: prefillFromId?.lastName || '',
        cnp: prefillFromId?.cnp || '',
        address: prefillFromId?.address || '',
        // Clear company fields
        companyName: undefined,
        cui: undefined,
        regCom: undefined,
        companyAddress: undefined,
        cuiVerified: undefined,
        isValid: Boolean(prefillFromId?.firstName && prefillFromId?.lastName && prefillFromId?.cnp),
      });
      setCuiSuccess(false);
      setCuiError(null);
    } else if (source === 'other_pf') {
      // Clear all and let user enter manually
      updateBilling({
        source,
        type: 'persoana_fizica',
        firstName: '',
        lastName: '',
        cnp: '',
        address: '',
        // Clear company fields
        companyName: undefined,
        cui: undefined,
        regCom: undefined,
        companyAddress: undefined,
        cuiVerified: undefined,
        isValid: false,
      });
      setCuiSuccess(false);
      setCuiError(null);
    } else if (source === 'company') {
      // Switch to company mode
      updateBilling({
        source,
        type: 'persoana_juridica',
        // Clear PF fields
        firstName: undefined,
        lastName: undefined,
        cnp: undefined,
        address: undefined,
        // Initialize company fields
        companyName: billing?.companyName || '',
        cui: billing?.cui || '',
        regCom: billing?.regCom || '',
        companyAddress: billing?.companyAddress || '',
        cuiVerified: false,
        isValid: false,
      });
    }
  }, [billing, prefillFromId, updateBilling]);

  // Update field
  const updateField = useCallback((field: keyof BillingState, value: string) => {
    updateBilling({ [field]: value });
    // Reset CUI validation if CUI changes
    if (field === 'cui') {
      setCuiSuccess(false);
      setCuiError(null);
      updateBilling({ cuiVerified: false });
    }
  }, [updateBilling]);

  // Validate CUI and fetch company data
  const validateCUI = useCallback(async () => {
    const cui = billing?.cui?.replace(/\s/g, '');
    if (!cui || cui.length < 2) {
      setCuiError('Introdu un CUI valid');
      return;
    }

    setCuiLoading(true);
    setCuiError(null);
    setCuiSuccess(false);

    try {
      const response = await fetch('/api/company/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cui }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Eroare la validarea CUI');
      }

      const data = await response.json();

      if (data.success && data.data) {
        // Auto-fill company data
        updateBilling({
          companyName: data.data.name || billing?.companyName,
          cui: data.data.cui || billing?.cui,
          regCom: data.data.registrationNumber || billing?.regCom,
          companyAddress: data.data.address || billing?.companyAddress,
          cuiVerified: true,
          isValid: true,
        });
        setCuiSuccess(true);
      } else {
        throw new Error(data.error || 'CUI invalid sau firmă inactivă');
      }
    } catch (error) {
      console.error('CUI validation error:', error);
      setCuiError(error instanceof Error ? error.message : 'Eroare la validarea CUI');
      updateBilling({ cuiVerified: false, isValid: false });
    } finally {
      setCuiLoading(false);
    }
  }, [billing, updateBilling]);

  const selectedSource = billing?.source || 'self';

  return (
    <div className="space-y-8">
      {/* Billing Source Selection */}
      <div className="space-y-4">
        <h3 className="font-semibold text-secondary-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary-500" />
          Date pentru facturare
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {BILLING_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedSource === option.source;

            return (
              <div
                key={option.source}
                onClick={() => handleSourceSelect(option.source)}
                className={cn(
                  'relative p-4 rounded-xl border-2 cursor-pointer transition-all',
                  isSelected
                    ? 'border-primary-500 bg-primary-50 shadow-md'
                    : 'border-neutral-200 hover:border-primary-300'
                )}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle className="w-5 h-5 text-primary-600" />
                  </div>
                )}

                <div className="flex flex-col items-center text-center">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-full flex items-center justify-center mb-3',
                      isSelected ? 'bg-primary-200' : 'bg-neutral-100'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-6 h-6',
                        isSelected ? 'text-primary-700' : 'text-neutral-600'
                      )}
                    />
                  </div>

                  <h4 className="font-semibold text-secondary-900">{option.label}</h4>
                  <p className="text-xs text-neutral-500 mt-1">{option.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Persoană Fizică Fields (self or other_pf) */}
      {(selectedSource === 'self' || selectedSource === 'other_pf') && (
        <div className="space-y-4 p-4 bg-neutral-50 rounded-xl">
          <h4 className="font-medium text-secondary-900">
            {selectedSource === 'self' ? 'Date facturare (din act)' : 'Date facturare (persoană fizică)'}
          </h4>

          {selectedSource === 'self' && prefillFromId && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Date preluate automat din actul de identitate scanat
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-secondary-900 font-medium">
                Nume <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                type="text"
                value={billing?.lastName || ''}
                onChange={(e) => updateField('lastName', e.target.value)}
                placeholder="ex: Popescu"
                className="bg-white"
                disabled={selectedSource === 'self'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-secondary-900 font-medium">
                Prenume <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                type="text"
                value={billing?.firstName || ''}
                onChange={(e) => updateField('firstName', e.target.value)}
                placeholder="ex: Ion"
                className="bg-white"
                disabled={selectedSource === 'self'}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnp" className="text-secondary-900 font-medium">
              CNP <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cnp"
              type="text"
              maxLength={13}
              value={billing?.cnp || ''}
              onChange={(e) => updateField('cnp', e.target.value.replace(/\D/g, ''))}
              placeholder="1234567890123"
              className="bg-white font-mono"
              disabled={selectedSource === 'self'}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-secondary-900 font-medium">
              Adresă facturare
            </Label>
            <Input
              id="address"
              type="text"
              value={billing?.address || ''}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Strada, număr, localitate, județ"
              className="bg-white"
              disabled={selectedSource === 'self'}
            />
          </div>
        </div>
      )}

      {/* Persoană Juridică Fields */}
      {selectedSource === 'company' && (
        <div className="space-y-4 p-4 bg-neutral-50 rounded-xl">
          <h4 className="font-medium text-secondary-900">Date facturare (persoană juridică)</h4>

          {/* CUI with validation */}
          <div className="space-y-2">
            <Label htmlFor="cui" className="text-secondary-900 font-medium">
              CUI (Cod Unic de Înregistrare) <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="cui"
                type="text"
                value={billing?.cui || ''}
                onChange={(e) => updateField('cui', e.target.value.replace(/\s/g, ''))}
                placeholder="ex: RO12345678"
                className={cn(
                  'bg-white font-mono flex-1',
                  cuiSuccess && 'border-green-500',
                  cuiError && 'border-red-500'
                )}
              />
              <Button
                type="button"
                variant="outline"
                onClick={validateCUI}
                disabled={cuiLoading || !billing?.cui}
                className="shrink-0"
              >
                {cuiLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Verifică
                  </>
                )}
              </Button>
            </div>
            {cuiError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {cuiError}
              </p>
            )}
            {cuiSuccess && (
              <p className="text-sm text-green-600 flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                CUI valid - date completate automat
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-secondary-900 font-medium">
              Denumire firmă <span className="text-red-500">*</span>
            </Label>
            <Input
              id="companyName"
              type="text"
              value={billing?.companyName || ''}
              onChange={(e) => updateField('companyName', e.target.value)}
              placeholder="SC Firma Mea SRL"
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="regCom" className="text-secondary-900 font-medium">
              Nr. Registrul Comerțului
            </Label>
            <Input
              id="regCom"
              type="text"
              value={billing?.regCom || ''}
              onChange={(e) => updateField('regCom', e.target.value)}
              placeholder="J40/1234/2020"
              className="bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyAddress" className="text-secondary-900 font-medium">
              Sediu social <span className="text-red-500">*</span>
            </Label>
            <Input
              id="companyAddress"
              type="text"
              value={billing?.companyAddress || ''}
              onChange={(e) => updateField('companyAddress', e.target.value)}
              placeholder="Strada, număr, localitate, județ"
              className="bg-white"
            />
          </div>

          {/* Optional bank details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="bankName" className="text-secondary-900 font-medium">
                Bancă <span className="text-neutral-400 text-xs">(opțional)</span>
              </Label>
              <Input
                id="bankName"
                type="text"
                value={billing?.bankName || ''}
                onChange={(e) => updateField('bankName', e.target.value)}
                placeholder="ex: BCR"
                className="bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankIban" className="text-secondary-900 font-medium">
                IBAN <span className="text-neutral-400 text-xs">(opțional)</span>
              </Label>
              <Input
                id="bankIban"
                type="text"
                value={billing?.bankIban || ''}
                onChange={(e) => updateField('bankIban', e.target.value.toUpperCase())}
                placeholder="RO49AAAA1B31007593840000"
                className="bg-white font-mono text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
