'use client';

/**
 * BillingProfileForm Component
 *
 * Reusable form for creating/editing billing profiles.
 * Supports both Persoană Fizică (PF) and Persoană Juridică (PJ).
 * Includes CUI validation via InfoCUI API for companies.
 *
 * Used in:
 * - Account page (BillingTab)
 * - Order wizard (billing step)
 */

import { useState, useCallback } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
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

  // Persoană Fizică fields
  firstName?: string;
  lastName?: string;
  cnp?: string;
  address?: string;

  // Persoană Juridică fields
  companyName?: string;
  cui?: string;
  regCom?: string; // Registrul Comerțului
  companyAddress?: string;
  bankName?: string;
  bankIban?: string;
  contactPerson?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface BillingProfileFormProps {
  value: Partial<BillingData>;
  onChange: (data: BillingData) => void;
  onSubmit?: () => void;
  onCancel?: () => void;
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

export default function BillingProfileForm({
  value,
  onChange,
  onSubmit,
  onCancel,
  prefillFromId,
  submitLabel = 'Salvează',
  cancelLabel = 'Anulează',
  loading = false,
  className,
}: BillingProfileFormProps) {
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
      const response = await fetch('/api/infocui/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cui }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Eroare la validarea CUI');
      }

      const data = await response.json();

      if (data.success && data.company) {
        // Auto-fill company data
        onChange({
          ...value,
          label: value.label || data.company.name || '',
          type: 'persoana_juridica',
          companyName: data.company.name || value.companyName,
          cui: data.company.cui || value.cui,
          regCom: data.company.regCom || value.regCom,
          companyAddress: data.company.address || value.companyAddress,
        } as BillingData);
        setCuiSuccess(true);
      } else {
        throw new Error(data.error || 'CUI invalid sau firmă inactivă');
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
          className="bg-white"
        />
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
                className="bg-white"
              />
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
                className="bg-white"
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
              value={value.cnp || ''}
              onChange={(e) => updateField('cnp', e.target.value.replace(/\D/g, ''))}
              placeholder="1234567890123"
              className="bg-white font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-secondary-900 font-medium">
              Adresă facturare
            </Label>
            <Input
              id="address"
              type="text"
              value={value.address || ''}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="Strada, număr, localitate, județ"
              className="bg-white"
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
                  'bg-white font-mono flex-1',
                  cuiSuccess && 'border-green-500',
                  cuiError && 'border-red-500'
                )}
              />
              <Button
                type="button"
                variant="outline"
                onClick={validateCUI}
                disabled={cuiLoading || !value.cui}
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
              value={value.companyName || ''}
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
              value={value.regCom || ''}
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
              value={value.companyAddress || ''}
              onChange={(e) => updateField('companyAddress', e.target.value)}
              placeholder="Strada, număr, localitate, județ"
              className="bg-white"
            />
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
                className="bg-white"
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
                className="bg-white font-mono text-sm"
              />
            </div>
          </div>

          {/* Contact Person */}
          <div className="pt-4 border-t space-y-4">
            <h4 className="font-medium text-secondary-900">Persoană de contact</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPerson" className="text-secondary-900 font-medium">
                  Nume
                </Label>
                <Input
                  id="contactPerson"
                  type="text"
                  value={value.contactPerson || ''}
                  onChange={(e) => updateField('contactPerson', e.target.value)}
                  placeholder="Ion Popescu"
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone" className="text-secondary-900 font-medium">
                  Telefon
                </Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={value.contactPhone || ''}
                  onChange={(e) => updateField('contactPhone', e.target.value)}
                  placeholder="0712345678"
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="text-secondary-900 font-medium">
                  Email
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={value.contactEmail || ''}
                  onChange={(e) => updateField('contactEmail', e.target.value)}
                  placeholder="contact@firma.ro"
                  className="bg-white"
                />
              </div>
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
