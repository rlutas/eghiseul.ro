'use client';

/**
 * BillingProfileForm Component
 *
 * Reusable form for creating/editing billing profiles.
 * Supports both Persoană Fizică (PF) and Persoană Juridică (PJ).
 * Includes CUI validation via ANAF API for companies.
 *
 * Used in:
 * - Account page (BillingTab)
 * - Order wizard (billing step)
 */

import { useState, useCallback, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { COUNTIES, canonicalCountyName } from '@/lib/data/romania-counties';
import { billingLocalityOptions } from '@/lib/orders/billing-locality';
import {
  Building2,
  User,
  Loader2,
  CheckCircle,
  AlertCircle,
  Search,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type BillingType = 'persoana_fizica' | 'persoana_juridica';

export interface BillingData {
  // Common fields
  label: string;
  type: BillingType;
  isDefault?: boolean;

  // Persoană Fizică fields.
  // The address is kept STRUCTURED because Oblio sends street, locality and
  // county as separate fields — a profile without `city` + `county` can never
  // satisfy isPfBillingComplete, so the customer would retype everything at
  // checkout (see src/lib/orders/billing-validation.ts).
  firstName?: string;
  lastName?: string;
  cnp?: string;
  /** Street line: „Str. X nr. 10, bl. A2, ap. 5". */
  address?: string;
  /** Localitate; „Sector N" when the county is București (SPV requirement). */
  city?: string;
  /** Canonical county name, matching an option of the dropdown. */
  county?: string;
  postalCode?: string;

  // Persoană Juridică fields
  companyName?: string;
  cui?: string;
  regCom?: string; // Registrul Comerțului
  companyAddress?: string;
  bankName?: string;
  bankIban?: string;
}

export interface BillingProfileFormProps {
  value: Partial<BillingData>;
  onChange: (data: BillingData) => void;
  onSubmit?: () => void;
  onCancel?: () => void;
  /**
   * Per-field messages, rendered under the field they belong to.
   *
   * Optional and empty by default, so every existing caller keeps behaving
   * exactly as before. The profile checklist dialog validates on blur and on a
   * failed submit and passes what it found in here, rather than duplicating the
   * PF/PJ form and its ANAF lookup just to own its own error lines.
   */
  errors?: Partial<Record<keyof BillingData, string>>;
  prefillFromId?: {
    firstName?: string;
    lastName?: string;
    cnp?: string;
    address?: string;
  };
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  className?: string;
}

/** The message for one field, under that field. Renders nothing without one. */
function FieldError({ field, message }: { field: string; message?: string | null }) {
  if (!message) return null;
  return (
    <p id={`${field}-error`} role="alert" className="text-xs font-medium text-red-600">
      {message}
    </p>
  );
}

export default function BillingProfileForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  errors,
  prefillFromId,
  submitLabel = 'Salvează',
  cancelLabel = 'Anulează',
  loading = false,
  className,
}: BillingProfileFormProps) {
  // The message sits under its own field, so it is obvious which one is wrong.
  const fieldError = (field: keyof BillingData) => (errors?.[field] as string | undefined) || null;
  const errorProps = (field: keyof BillingData) =>
    fieldError(field) ? { 'aria-invalid': true as const, 'aria-describedby': `${field}-error` } : {};

  const [cuiLoading, setCuiLoading] = useState(false);
  const [cuiError, setCuiError] = useState<string | null>(null);
  const [cuiSuccess, setCuiSuccess] = useState(false);

  const billingType = value.type || 'persoana_fizica';

  // Update field
  const updateField = useCallback((field: keyof BillingData, fieldValue: string | boolean) => {
    onChange({
      ...value,
      label: value.label || '',
      type: value.type || 'persoana_fizica',
      [field]: fieldValue,
    } as BillingData);
  }, [value, onChange]);

  // Canonical county, so a value stored as a code („SM") or without diacritics
  // („Timis") still matches an option of the dropdown.
  const selectedCounty = canonicalCountyName(value.county) ?? '';
  const localities = useMemo(() => billingLocalityOptions(selectedCounty), [selectedCounty]);

  // County change drops the locality when it no longer belongs to the new county.
  const handleCountyChange = useCallback((countyName: string) => {
    const stillValid = billingLocalityOptions(countyName).includes(value.city || '');
    onChange({
      ...value,
      label: value.label || '',
      type: value.type || 'persoana_fizica',
      county: countyName,
      city: stillValid ? value.city : '',
    } as BillingData);
  }, [value, onChange]);

  // Handle billing type change
  const handleTypeChange = useCallback((type: BillingType) => {
    const newData: BillingData = {
      label: value.label || '',
      type,
      isDefault: value.isDefault,
    };

    if (type === 'persoana_fizica' && prefillFromId) {
      newData.firstName = prefillFromId.firstName;
      newData.lastName = prefillFromId.lastName;
      newData.cnp = prefillFromId.cnp;
      newData.address = prefillFromId.address;
    }

    onChange(newData);
    setCuiError(null);
    setCuiSuccess(false);
  }, [value, prefillFromId, onChange]);

  // Use prefilled data for PF
  const usePrefillData = useCallback(() => {
    if (prefillFromId) {
      onChange({
        ...value,
        label: value.label || '',
        type: 'persoana_fizica',
        firstName: prefillFromId.firstName,
        lastName: prefillFromId.lastName,
        cnp: prefillFromId.cnp,
        address: prefillFromId.address,
      } as BillingData);
    }
  }, [value, prefillFromId, onChange]);

  // Validate CUI and fetch company data
  const validateCUI = useCallback(async () => {
    const cui = value.cui?.replace(/\s/g, '');
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
        throw new Error(errorData.error?.message || errorData.error || 'Eroare la validarea CUI');
      }

      const data = await response.json();

      if (data.success && data.data) {
        // Auto-fill company data from ANAF
        onChange({
          ...value,
          label: value.label || data.data.name || '',
          type: 'persoana_juridica',
          companyName: data.data.name || value.companyName,
          cui: data.data.cui || value.cui,
          regCom: data.data.registrationNumber || value.regCom,
          companyAddress: data.data.address || value.companyAddress,
        } as BillingData);
        setCuiSuccess(true);
      } else {
        throw new Error(data.error?.message || 'CUI invalid sau firmă inactivă');
      }
    } catch (error) {
      console.error('CUI validation error:', error);
      setCuiError(error instanceof Error ? error.message : 'Eroare la validarea CUI');
    } finally {
      setCuiLoading(false);
    }
  }, [value, onChange]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Billing Type Selection */}
      <div className="space-y-3">
        <Label className="text-secondary-900 font-medium">
          Tip profil facturare
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleTypeChange('persoana_fizica')}
            className={cn(
              'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
              billingType === 'persoana_fizica'
                ? 'border-primary-500 bg-primary-50'
                : 'border-neutral-200 hover:border-primary-300 bg-white'
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              billingType === 'persoana_fizica' ? 'bg-primary-500' : 'bg-neutral-100'
            )}>
              <User className={cn(
                'w-5 h-5',
                billingType === 'persoana_fizica' ? 'text-secondary-900' : 'text-neutral-500'
              )} />
            </div>
            <div className="text-left">
              <div className={cn(
                'font-semibold',
                billingType === 'persoana_fizica' ? 'text-secondary-900' : 'text-neutral-700'
              )}>
                Persoană Fizică
              </div>
              <div className="text-xs text-neutral-500">Facturare pe CNP</div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('persoana_juridica')}
            className={cn(
              'flex items-center gap-3 p-4 rounded-xl border-2 transition-all',
              billingType === 'persoana_juridica'
                ? 'border-primary-500 bg-primary-50'
                : 'border-neutral-200 hover:border-primary-300 bg-white'
            )}
          >
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              billingType === 'persoana_juridica' ? 'bg-primary-500' : 'bg-neutral-100'
            )}>
              <Building2 className={cn(
                'w-5 h-5',
                billingType === 'persoana_juridica' ? 'text-secondary-900' : 'text-neutral-500'
              )} />
            </div>
            <div className="text-left">
              <div className={cn(
                'font-semibold',
                billingType === 'persoana_juridica' ? 'text-secondary-900' : 'text-neutral-700'
              )}>
                Persoană Juridică
              </div>
              <div className="text-xs text-neutral-500">Facturare pe CUI</div>
            </div>
          </button>
        </div>
      </div>

      {/* Label */}
      <div className="space-y-2">
        <Label htmlFor="label" className="text-secondary-900 font-medium">
          Etichetă profil <span className="text-red-500">*</span>
        </Label>
        <Input
          id="label"
          type="text"
          value={value.label || ''}
          onChange={(e) => updateField('label', e.target.value)}
          placeholder={billingType === 'persoana_fizica' ? 'ex: Personal' : 'ex: Firma mea SRL'}
          className="bg-white h-11"
          {...errorProps('label')}
        />
        <FieldError field="label" message={fieldError('label')} />
      </div>

      {/* Persoană Fizică Fields */}
      {billingType === 'persoana_fizica' && (
        <>
          {prefillFromId && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={usePrefillData}
              className="text-primary-600"
            >
              <FileText className="w-4 h-4 mr-2" />
              Folosește datele din actul scanat
            </Button>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-secondary-900 font-medium">
                Nume <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                type="text"
                value={value.lastName || ''}
                onChange={(e) => updateField('lastName', e.target.value)}
                placeholder="ex: Popescu"
                className="bg-white h-11"
                {...errorProps('lastName')}
              />
              <FieldError field="lastName" message={fieldError('lastName')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-secondary-900 font-medium">
                Prenume <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                type="text"
                value={value.firstName || ''}
                onChange={(e) => updateField('firstName', e.target.value)}
                placeholder="ex: Ion"
                className="bg-white h-11"
                {...errorProps('firstName')}
              />
              <FieldError field="firstName" message={fieldError('firstName')} />
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
              value={value.cnp || ''}
              onChange={(e) => updateField('cnp', e.target.value.replace(/\D/g, ''))}
              placeholder="1234567890123"
              className="bg-white font-mono h-11"
              inputMode="numeric"
              {...errorProps('cnp')}
            />
            <FieldError field="cnp" message={fieldError('cnp')} />
          </div>

          {/* Structured billing address — Oblio sends street, locality and
              county separately, so a single free-text line is not enough for
              the profile to be reusable at checkout. */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-secondary-900 font-medium">
              Stradă, număr, bloc, ap. <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              type="text"
              value={value.address || ''}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="ex: Str. Mihai Viteazu nr. 10, bl. A2, ap. 5"
              className="bg-white h-11"
              {...errorProps('address')}
            />
            <FieldError field="address" message={fieldError('address')} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="county" className="text-secondary-900 font-medium">
                Județ <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedCounty} onValueChange={handleCountyChange}>
                <SelectTrigger
                  id="county"
                  className="w-full min-w-0 bg-white h-11"
                  {...errorProps('county')}
                >
                  <SelectValue placeholder="Alege județul" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTIES.map((c) => (
                    <SelectItem key={c.code} value={c.name}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError field="county" message={fieldError('county')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-secondary-900 font-medium">
                Localitate <span className="text-red-500">*</span>
              </Label>
              <Select
                value={value.city || ''}
                onValueChange={(v) => updateField('city', v)}
                disabled={!selectedCounty}
              >
                <SelectTrigger
                  id="city"
                  className="w-full min-w-0 bg-white h-11"
                  {...errorProps('city')}
                >
                  <SelectValue
                    placeholder={selectedCounty ? 'Alege localitatea' : 'Alege întâi județul'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {localities.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError field="city" message={fieldError('city')} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="postalCode" className="text-secondary-900 font-medium">
              Cod poștal <span className="text-xs font-normal text-neutral-500">(opțional)</span>
            </Label>
            <Input
              id="postalCode"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={value.postalCode || ''}
              onChange={(e) => updateField('postalCode', e.target.value.replace(/\D/g, ''))}
              placeholder="ex: 900001"
              className="bg-white h-11"
            />
          </div>
        </>
      )}

      {/* Persoană Juridică Fields */}
      {billingType === 'persoana_juridica' && (
        <>
          {/* CUI with validation */}
          <div className="space-y-2">
            <Label htmlFor="cui" className="text-secondary-900 font-medium">
              CUI (Cod Unic de Înregistrare) <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="cui"
                type="text"
                value={value.cui || ''}
                onChange={(e) => {
                  updateField('cui', e.target.value.replace(/\s/g, ''));
                  setCuiError(null);
                  setCuiSuccess(false);
                }}
                placeholder="ex: RO12345678"
                className={cn(
                  'bg-white font-mono flex-1 h-11',
                  cuiSuccess && 'border-green-500',
                  cuiError && 'border-red-500'
                )}
                {...errorProps('cui')}
              />
              <Button
                type="button"
                variant="outline"
                onClick={validateCUI}
                disabled={cuiLoading || !value.cui}
                className="shrink-0 h-11"
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
            {!cuiError && <FieldError field="cui" message={fieldError('cui')} />}
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-secondary-900 font-medium">
              Denumire firmă <span className="text-red-500">*</span>
            </Label>
            <Input
              id="companyName"
              type="text"
              value={value.companyName || ''}
              onChange={(e) => updateField('companyName', e.target.value)}
              placeholder="SC Firma Mea SRL"
              className="bg-white h-11"
              {...errorProps('companyName')}
            />
            <FieldError field="companyName" message={fieldError('companyName')} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="regCom" className="text-secondary-900 font-medium">
              Nr. Registrul Comerțului
            </Label>
            <Input
              id="regCom"
              type="text"
              value={value.regCom || ''}
              onChange={(e) => updateField('regCom', e.target.value)}
              placeholder="J40/1234/2020"
              className="bg-white h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyAddress" className="text-secondary-900 font-medium">
              Sediu social <span className="text-red-500">*</span>
            </Label>
            <Input
              id="companyAddress"
              type="text"
              value={value.companyAddress || ''}
              onChange={(e) => updateField('companyAddress', e.target.value)}
              placeholder="Strada, număr, localitate, județ"
              className="bg-white h-11"
              {...errorProps('companyAddress')}
            />
            <FieldError field="companyAddress" message={fieldError('companyAddress')} />
          </div>

          {/* Bank Details (optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankName" className="text-secondary-900 font-medium">
                Bancă
              </Label>
              <Input
                id="bankName"
                type="text"
                value={value.bankName || ''}
                onChange={(e) => updateField('bankName', e.target.value)}
                placeholder="ex: BCR"
                className="bg-white h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bankIban" className="text-secondary-900 font-medium">
                IBAN
              </Label>
              <Input
                id="bankIban"
                type="text"
                value={value.bankIban || ''}
                onChange={(e) => updateField('bankIban', e.target.value.toUpperCase())}
                placeholder="RO49AAAA1B31007593840000"
                className="bg-white font-mono text-sm h-11"
              />
            </div>
          </div>

        </>
      )}

      {/* Is Default Checkbox */}
      <div className="flex items-center space-x-2 pt-2">
        <Checkbox
          id="isDefault"
          checked={value.isDefault || false}
          onCheckedChange={(checked) => updateField('isDefault', !!checked)}
        />
        <Label
          htmlFor="isDefault"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Setează ca profil implicit de facturare
        </Label>
      </div>

      {/* Action Buttons */}
      {(onSubmit || onCancel) && (
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              {cancelLabel}
            </Button>
          )}
          {onSubmit && (
            <Button
              type="button"
              onClick={onSubmit}
              disabled={loading}
              className="bg-primary-500 hover:bg-primary-600 text-secondary-900"
            >
              {loading ? 'Se salvează...' : submitLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
