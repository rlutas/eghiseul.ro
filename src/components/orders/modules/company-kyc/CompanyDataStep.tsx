'use client';

/**
 * CompanyDataStep Component
 *
 * Handles company verification with CUI validation.
 * Supports auto-complete from InfoCUI API.
 */

import { useState, useCallback, useEffect } from 'react';
import { useModularWizard } from '@/providers/modular-wizard-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Building2,
  Search,
  AlertTriangle,
} from 'lucide-react';
import type { CompanyKYCConfig, CompanyAutoCompleteData } from '@/types/verification-modules';

interface CompanyDataStepProps {
  config: CompanyKYCConfig;
  onValidChange: (valid: boolean) => void;
}

export default function CompanyDataStep({ config, onValidChange }: CompanyDataStepProps) {
  const { state, updateCompanyKyc } = useModularWizard();
  const companyKyc = state.companyKyc;

  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  // Auto-validate CUI when it changes (debounced)
  useEffect(() => {
    if (!companyKyc?.cui || companyKyc.cui.length < 6) {
      updateCompanyKyc?.({ validationStatus: 'pending' });
      return;
    }

    const timeoutId = setTimeout(() => {
      validateCUI(companyKyc.cui);
    }, 500);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyKyc?.cui]); // Intentionally excluding validateCUI and updateCompanyKyc to prevent infinite loops

  // Validate CUI and fetch company data
  const validateCUI = useCallback(async (cui: string) => {
    if (!cui || cui.length < 6) return;

    setIsValidating(true);
    setError(null);
    setWarning(null);

    try {
      // Clean CUI (remove RO prefix if present)
      const cleanCUI = cui.replace(/^RO/i, '').replace(/\D/g, '');

      if (config.validation === 'infocui' && config.autoComplete) {
        // Call InfoCUI API for validation and auto-complete
        const response = await fetch(`/api/company/validate?cui=${cleanCUI}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || 'Eroare la validare CUI');
        }

        const data = await response.json();

        if (data.success && data.data) {
          const companyData: CompanyAutoCompleteData = data.data;

          // Check if company type is allowed
          const companyType = companyData.type?.toUpperCase() || '';
          const isBlocked = config.blockedTypes.some(blocked =>
            companyType.includes(blocked.toUpperCase())
          );

          if (isBlocked) {
            updateCompanyKyc?.({
              validationStatus: 'blocked',
              validationMessage: config.blockMessage || `Tipul de entitate "${companyType}" nu este acceptat.`,
            });
            setError(config.blockMessage || `Tipul de entitate "${companyType}" nu este acceptat.`);
            return;
          }

          // Check for special rules
          const specialRule = config.specialRules.find(rule =>
            rule.entityTypes.some(et => companyType.includes(et.toUpperCase()))
          );

          if (specialRule) {
            if (specialRule.action === 'block') {
              updateCompanyKyc?.({
                validationStatus: 'blocked',
                validationMessage: specialRule.message,
              });
              setError(specialRule.message);
              return;
            } else if (specialRule.action === 'warn') {
              setWarning(specialRule.message);
            }
          }

          // Auto-fill company data
          updateCompanyKyc?.({
            cui: cleanCUI,
            companyName: companyData.name || '',
            companyType: companyData.type || '',
            registrationNumber: companyData.registrationNumber || '',
            isActive: companyData.isActive,
            validationStatus: companyData.isActive ? 'valid' : 'invalid',
            validationMessage: companyData.isActive ? undefined : 'Firma nu este activă',
            autoCompleteData: companyData,
            address: {
              county: '',
              city: '',
              street: companyData.address || '',
              number: '',
            },
          });

          if (!companyData.isActive) {
            setError('Firma nu este activă în Registrul Comerțului.');
          }

        } else {
          throw new Error('CUI inexistent în baza de date');
        }

      } else {
        // Manual validation - just mark as pending for admin review
        updateCompanyKyc?.({
          cui: cleanCUI,
          validationStatus: 'pending',
          validationMessage: 'Va fi verificat manual',
        });
      }

    } catch (err) {
      console.error('CUI validation error:', err);
      updateCompanyKyc?.({
        validationStatus: 'invalid',
        validationMessage: err instanceof Error ? err.message : 'Eroare la validare',
      });
      setError(err instanceof Error ? err.message : 'Eroare la validare CUI');
    } finally {
      setIsValidating(false);
    }
  }, [config, updateCompanyKyc]);

  // Handle CUI input change
  const handleCUIChange = useCallback((value: string) => {
    // Clean and format CUI
    const cleanCUI = value.replace(/^RO/i, '').replace(/\D/g, '');
    updateCompanyKyc?.({
      cui: cleanCUI,
      validationStatus: 'pending',
      companyName: '',
      companyType: '',
      registrationNumber: '',
      autoCompleteData: undefined,
    });
    setError(null);
    setWarning(null);
  }, [updateCompanyKyc]);

  // Manual search
  const handleSearch = useCallback(() => {
    if (companyKyc?.cui) {
      validateCUI(companyKyc.cui);
    }
  }, [companyKyc?.cui, validateCUI]);

  // Validate form
  const isFormValid = useCallback(() => {
    if (!companyKyc) return false;
    if (!companyKyc.cui || companyKyc.cui.length < 6) return false;
    if (companyKyc.validationStatus === 'blocked') return false;
    if (companyKyc.validationStatus === 'invalid') return false;
    if (!companyKyc.companyName.trim()) return false;
    return true;
  }, [companyKyc]);

  // Notify parent of validation changes
  useEffect(() => {
    onValidChange(isFormValid());
  }, [isFormValid, onValidChange]);

  if (!companyKyc) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Modulul de verificare firmă nu este activat pentru acest serviciu.
        </AlertDescription>
      </Alert>
    );
  }

  const getStatusColor = () => {
    switch (companyKyc.validationStatus) {
      case 'valid':
        return 'border-green-200 bg-green-50';
      case 'invalid':
      case 'blocked':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Company Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Verificare Firmă
          </CardTitle>
          <CardDescription>
            Introdu CUI-ul firmei pentru a prelua automat datele
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* CUI Input */}
          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="cui">CUI (Cod Unic de Identificare)</Label>
              <div className="relative">
                <Input
                  id="cui"
                  type="text"
                  value={companyKyc.cui}
                  onChange={(e) => handleCUIChange(e.target.value)}
                  placeholder="12345678"
                  className={`pr-10 ${getStatusColor()}`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isValidating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  {!isValidating && companyKyc.validationStatus === 'valid' && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                  {!isValidating && (companyKyc.validationStatus === 'invalid' || companyKyc.validationStatus === 'blocked') && (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                variant="secondary"
                onClick={handleSearch}
                disabled={isValidating || !companyKyc.cui || companyKyc.cui.length < 6}
              >
                {isValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Eroare</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Warning Message */}
          {warning && (
            <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertTitle>Atenție</AlertTitle>
              <AlertDescription>{warning}</AlertDescription>
            </Alert>
          )}

          {/* Success - Company Found */}
          {companyKyc.validationStatus === 'valid' && companyKyc.autoCompleteData && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle>Firmă găsită</AlertTitle>
              <AlertDescription>
                Datele firmei au fost preluate automat din Registrul Comerțului.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Company Details */}
      {(companyKyc.companyName || companyKyc.validationStatus === 'valid') && (
        <Card>
          <CardHeader>
            <CardTitle>Date Firmă</CardTitle>
            <CardDescription>
              Verifică și completează datele firmei
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="companyName">Denumire Firmă</Label>
              <Input
                id="companyName"
                type="text"
                value={companyKyc.companyName}
                onChange={(e) => updateCompanyKyc?.({ companyName: e.target.value })}
                placeholder="SC EXEMPLU SRL"
                readOnly={config.autoComplete && !!companyKyc.autoCompleteData}
                className={config.autoComplete && companyKyc.autoCompleteData ? 'bg-muted' : ''}
              />
            </div>

            {/* Company Type and Registration Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyType">Forma Juridică</Label>
                <Input
                  id="companyType"
                  type="text"
                  value={companyKyc.companyType}
                  onChange={(e) => updateCompanyKyc?.({ companyType: e.target.value })}
                  placeholder="SRL"
                  readOnly={config.autoComplete && !!companyKyc.autoCompleteData}
                  className={config.autoComplete && companyKyc.autoCompleteData ? 'bg-muted' : ''}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Număr Registrul Comerțului</Label>
                <Input
                  id="registrationNumber"
                  type="text"
                  value={companyKyc.registrationNumber}
                  onChange={(e) => updateCompanyKyc?.({ registrationNumber: e.target.value })}
                  placeholder="J40/12345/2020"
                  readOnly={config.autoComplete && !!companyKyc.autoCompleteData}
                  className={config.autoComplete && companyKyc.autoCompleteData ? 'bg-muted' : ''}
                />
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
              <div className={`w-3 h-3 rounded-full ${companyKyc.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">
                Status: {companyKyc.isActive ? 'Firmă activă' : 'Firmă inactivă'}
              </span>
            </div>

            {/* Address */}
            {companyKyc.autoCompleteData?.address && (
              <div className="space-y-2">
                <Label>Sediu Social</Label>
                <p className="text-sm p-3 rounded-lg bg-muted">
                  {companyKyc.autoCompleteData.address}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
