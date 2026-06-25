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

import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  User,
  Users,
  Building2,
  Briefcase,
  CheckCircle,
  Loader2,
  AlertCircle,
  Search,
  FileText,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useModularWizard } from '@/providers/modular-wizard-provider';
import { cn } from '@/lib/utils';
import { COUNTIES, getLocalitiesForCounty, findCounty } from '@/lib/data/romania-counties';
import { isPfBillingComplete } from '@/lib/orders/billing-validation';
import type { BillingSource, BillingState } from '@/types/verification-modules';

interface BillingStepProps {
  onValidChange: (valid: boolean) => void;
}

interface BillingOption {
  source: BillingSource;
  /** Distinct id when two options share a source (e.g. two `company` variants). */
  id?: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

// Billing options for PF orders (personal)
const PF_BILLING_OPTIONS: BillingOption[] = [
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

// Billing options for PJ orders (company) — company first, "pe mine" hidden
const PJ_BILLING_OPTIONS: BillingOption[] = [
  {
    source: 'company',
    label: 'Facturează pe firmă',
    description: 'Folosește datele firmei introduse anterior',
    icon: Building2,
  },
  {
    source: 'other_pf',
    label: 'Persoană fizică',
    description: 'Facturează pe o persoană fizică',
    icon: User,
  },
];

// Billing options for "certificat constatator pe firmă" — the certificate is for
// a company, so default to billing that firm (PJ first), then a person. The
// "Persoană juridică" card is prefilled with the firm from the request but the
// CUI is editable, so billing a DIFFERENT company is just changing the CUI.
const CONSTATATOR_BILLING_OPTIONS: BillingOption[] = [
  {
    source: 'company',
    id: 'request_firm',
    label: 'Firma din certificat',
    description: 'Eliberează factura pe aceeași societate ca certificatul',
    icon: Building2,
  },
  {
    source: 'company',
    id: 'other_company',
    label: 'Persoană juridică',
    description: 'Facturează pe o altă societate (alt CUI)',
    icon: Briefcase,
  },
  {
    source: 'other_pf',
    label: 'Persoană fizică',
    description: 'Eliberează factura pe o persoană fizică',
    icon: User,
  },
];

// Billing options for "certificat constatator pe persoană" — the certificate is
// for a person, so default to billing that person (PF first), prefilled with the
// requester name + CNP from the request, then another person or a company.
const CONSTATATOR_PF_BILLING_OPTIONS: BillingOption[] = [
  {
    source: 'self',
    label: 'Persoană fizică (solicitantul)',
    description: 'Facturează pe persoana din cerere (nume + CNP) — completează adresa',
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

// Property/cadastral (imobiliare) services collect no scanned ID, so billing is
// a simple Persoană fizică / Persoană juridică choice (no "Facturează pe mine").
const NO_ID_SCAN_PROPERTY_SLUGS = new Set<string>([
  'extras-carte-funciara', 'identificare-imobil', 'extras-plan-cadastral',
  'certificat-sarcini', 'copie-carte-funciara', 'copie-plan-cadastral',
  'copie-inventar-coordonate', 'copie-intabulare', 'copie-releveu',
  'copie-arhiva-ocpi', 'copie-contract-vanzare', 'plan-amplasament-delimitare',
  'copie-plan-incadrare', 'extras-cf-colectiv', 'actualizare-adresa-cf',
  'identificare-imobile-proprietar', 'certificat-detineri-imobile',
]);

// Billing options for Extras Carte Funciară — no ID scan, so no "pe mine".
// Client simply picks Persoană fizică OR Persoană juridică and fills the fields.
const CF_BILLING_OPTIONS: BillingOption[] = [
  {
    source: 'other_pf',
    label: 'Persoană fizică',
    description: 'Factură pe numele tău (persoană fizică)',
    icon: User,
  },
  {
    source: 'company',
    label: 'Persoană juridică',
    description: 'Factură pe o firmă (introdu CUI)',
    icon: Building2,
  },
];

export default function BillingStepModular({ onValidChange }: BillingStepProps) {
  const { state, updateBilling, prefillData } = useModularWizard();
  const { billing, personalKyc, companyKyc, clientType, constatator, serviceSlug } = state;
  const isPJOrder = clientType === 'PJ';
  // Certificat constatator pe firmă: bill the firm by default (PJ-first), like a
  // PJ order, even though the client type isn't "PJ".
  const isConstatatorFirm =
    serviceSlug === 'certificat-constatator' && constatator?.documentType !== 'pf';
  // Certificat constatator pe persoană: bill the requester person by default.
  const isConstatatorPf =
    serviceSlug === 'certificat-constatator' && constatator?.documentType === 'pf';
  // No-KYC property/topograph services (imobiliare): no ID scan → the client
  // simply picks Persoană fizică OR Persoană juridică (no "Facturează pe mine");
  // CNP optional. Covers Extras CF, Identificare imobil, Plan cadastral + the
  // full cadastral catalog (certificat sarcini, copii, PAD, etc.).
  const isCarteFunciara = NO_ID_SCAN_PROPERTY_SLUGS.has(serviceSlug || '');
  const companyFirst = isPJOrder || isConstatatorFirm;

  // CUI validation state
  const [cuiLoading, setCuiLoading] = useState(false);
  const [cuiError, setCuiError] = useState<string | null>(null);
  const [cuiSuccess, setCuiSuccess] = useState(billing?.cuiVerified ?? false);

  // Constatator firm: distinguishes the two `company` billing cards — bill the
  // firm FROM the certificate (prefilled) vs ANOTHER company (cleared CUI).
  // UI-only; both still submit as source === 'company'.
  const [companyMode, setCompanyMode] = useState<'request' | 'other'>('request');

  // Check for saved PJ billing profile to auto-fill
  const savedPjProfile = prefillData?.billing_profiles?.find(
    (bp: { type: string; billing_data?: Record<string, unknown> }) => bp.type === 'persoana_juridica'
  );

  // Get prefill data from personal KYC (memoized to avoid new object refs each render).
  // Address is kept STRUCTURED — Oblio needs street/locality/county separately.
  // Passport holders have no address on the document, so these come back empty
  // and the customer fills them in (the fields are editable, see below).
  const prefillFromId = useMemo(() => personalKyc ? {
    firstName: personalKyc.firstName,
    lastName: personalKyc.lastName,
    cnp: personalKyc.cnp,
    address: [
      personalKyc.address?.street,
      personalKyc.address?.number ? `Nr. ${personalKyc.address.number}` : null,
      personalKyc.address?.building ? `Bl. ${personalKyc.address.building}` : null,
      personalKyc.address?.apartment ? `Ap. ${personalKyc.address.apartment}` : null,
    ].filter(Boolean).join(', '),
    city: personalKyc.address?.city || '',
    // Normalize the scanned county to the canonical name so it matches a
    // dropdown option (OCR may return a code "SM" or a "Jud. ..." prefix).
    county: findCounty(personalKyc.address?.county)?.name || '',
    postalCode: personalKyc.address?.postalCode || '',
  // eslint-disable-next-line react-hooks/exhaustive-deps
  } : undefined, [
    personalKyc?.firstName, personalKyc?.lastName, personalKyc?.cnp,
    personalKyc?.address?.street, personalKyc?.address?.number,
    personalKyc?.address?.building, personalKyc?.address?.apartment,
    personalKyc?.address?.city, personalKyc?.address?.county,
    personalKyc?.address?.postalCode,
  ]);

  // For PJ orders: auto-default to 'company' billing and prefill from companyKyc
  const companyKycCui = companyKyc?.cui;
  const companyKycName = companyKyc?.companyName;
  useEffect(() => {
    if (companyFirst && companyKycName && (billing?.source === 'self' || !billing?.source) && !billing?.companyName) {
      // Build address string from companyKyc address object
      const addr = companyKyc?.address;
      const companyAddr = addr
        ? [addr.street, addr.number ? `Nr. ${addr.number}` : null, addr.city, addr.county]
            .filter(Boolean).join(', ')
        : companyKyc?.autoCompleteData?.address || '';

      updateBilling({
        source: 'company',
        type: 'persoana_juridica',
        companyName: companyKycName,
        cui: companyKycCui || '',
        regCom: companyKyc?.registrationNumber || '',
        companyAddress: companyAddr,
        cuiVerified: companyKyc?.validationStatus === 'valid',
        isValid: companyKyc?.validationStatus === 'valid' && !!companyKycName && !!companyKycCui,
        // Clear PF fields
        firstName: undefined,
        lastName: undefined,
        cnp: undefined,
        address: undefined,
      });
      if (companyKyc?.validationStatus === 'valid') {
        setCuiSuccess(true);
      }
    }
  }, [companyFirst, companyKycCui, companyKycName, billing?.source, billing?.companyName, companyKyc, updateBilling]);

  // Initialize billing with self data if available and source is 'self' (PF orders)
  useEffect(() => {
    if (!isPJOrder && billing?.source === 'self' && prefillFromId && !billing?.firstName) {
      updateBilling({
        firstName: prefillFromId.firstName,
        lastName: prefillFromId.lastName,
        cnp: prefillFromId.cnp,
        address: prefillFromId.address,
        city: prefillFromId.city,
        county: prefillFromId.county,
        postalCode: prefillFromId.postalCode,
        country: 'Romania',
        type: 'persoana_fizica',
        isValid: isPfBillingComplete({
          firstName: prefillFromId.firstName,
          lastName: prefillFromId.lastName,
          cnp: prefillFromId.cnp,
          address: prefillFromId.address,
          city: prefillFromId.city,
          county: prefillFromId.county,
        }),
      });
    }
  }, [isPJOrder, billing?.source, billing?.firstName, prefillFromId, updateBilling]);

  // Certificat constatator pe persoană: default-bill the requester person,
  // prefilling name + CNP from the request. The full "Nume complet" is split on
  // whitespace (firstName+lastName concatenate back to the same name on the
  // invoice). Address stays empty → the customer completes it (Oblio needs it).
  const requesterName = constatator?.requesterName;
  const requesterCnp = constatator?.requesterCnp;
  useEffect(() => {
    if (!isConstatatorPf) return;
    if ((billing?.source === 'self' || !billing?.source) && !billing?.firstName) {
      const parts = (requesterName ?? '').trim().split(/\s+/).filter(Boolean);
      updateBilling({
        source: 'self',
        type: 'persoana_fizica',
        firstName: parts[0] ?? '',
        lastName: parts.slice(1).join(' '),
        cnp: requesterCnp ?? '',
        country: 'Romania',
        isValid: false, // address still required for the invoice → customer completes it
      });
    }
  }, [isConstatatorPf, billing?.source, billing?.firstName, requesterName, requesterCnp, updateBilling]);

  // Extras Carte Funciară: no ID scan → default to manual persoană fizică so the
  // fields are exposed for the client to fill (they can switch to PJ).
  useEffect(() => {
    if (!isCarteFunciara) return;
    if (!billing?.source) {
      updateBilling({ source: 'other_pf', type: 'persoana_fizica', country: 'Romania', isValid: false });
    }
  }, [isCarteFunciara, billing?.source, updateBilling]);

  // Extract primitive billing values to avoid effect re-triggers from object reference changes
  const billingSource = billing?.source;
  const billingFirstName = billing?.firstName;
  const billingLastName = billing?.lastName;
  const billingCnp = billing?.cnp;
  const billingAddress = billing?.address;
  const billingCity = billing?.city;
  const billingCounty = billing?.county;
  const billingCuiVerified = billing?.cuiVerified;
  const billingCompanyName = billing?.companyName;
  const billingCui = billing?.cui;
  const billingIsValid = billing?.isValid;

  // Validate step (uses primitives to prevent infinite update loops)
  useEffect(() => {
    if (!billingSource) {
      onValidChange(false);
      return;
    }

    let isValid = false;

    if (billingSource === 'self' || billingSource === 'other_pf') {
      // PF: name + CNP + full address (street + locality + county) — Oblio
      // refuses the invoice without a complete address.
      isValid = isPfBillingComplete({
        firstName: billingFirstName,
        lastName: billingLastName,
        cnp: billingCnp,
        address: billingAddress,
        city: billingCity,
        county: billingCounty,
      }, { cnpOptional: isCarteFunciara });
    } else if (billingSource === 'company') {
      // Company: must have verified CUI and company name
      isValid = Boolean(billingCuiVerified && billingCompanyName && billingCui);
    }

    // Update billing validity
    if (billingIsValid !== isValid) {
      updateBilling({ isValid });
    }

    onValidChange(isValid);
  }, [billingSource, billingFirstName, billingLastName, billingCnp, billingAddress, billingCity, billingCounty, billingCuiVerified, billingCompanyName, billingCui, billingIsValid, isCarteFunciara, onValidChange, updateBilling]);

  // Handle source selection
  const handleSourceSelect = useCallback((source: BillingSource) => {
    if (source === 'self') {
      // Use data from ID scan (name/CNP authoritative; address prefilled when
      // the document carries one, otherwise left blank for the customer).
      updateBilling({
        source,
        type: 'persoana_fizica',
        firstName: prefillFromId?.firstName || '',
        lastName: prefillFromId?.lastName || '',
        cnp: prefillFromId?.cnp || '',
        address: prefillFromId?.address || '',
        city: prefillFromId?.city || '',
        county: prefillFromId?.county || '',
        postalCode: prefillFromId?.postalCode || '',
        country: 'Romania',
        // Clear company fields
        companyName: undefined,
        cui: undefined,
        regCom: undefined,
        companyAddress: undefined,
        cuiVerified: undefined,
        isValid: isPfBillingComplete({
          firstName: prefillFromId?.firstName,
          lastName: prefillFromId?.lastName,
          cnp: prefillFromId?.cnp,
          address: prefillFromId?.address,
          city: prefillFromId?.city,
          county: prefillFromId?.county,
        }),
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
        city: '',
        county: '',
        postalCode: '',
        country: 'Romania',
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
      // Priority: 1) companyKyc from wizard step 3, 2) saved PJ profile, 3) empty
      const pjData = savedPjProfile?.billing_data as Record<string, string> | undefined;

      // Build address from companyKyc
      const kycAddr = companyKyc?.address;
      const companyKycAddr = kycAddr
        ? [kycAddr.street, kycAddr.number ? `Nr. ${kycAddr.number}` : null, kycAddr.city, kycAddr.county]
            .filter(Boolean).join(', ')
        : companyKyc?.autoCompleteData?.address || '';

      const hasCompanyKyc = companyKyc?.cui && companyKyc?.companyName;
      const hasSavedPj = pjData?.cui && pjData?.companyName;

      updateBilling({
        source,
        type: 'persoana_juridica',
        // Clear PF fields
        firstName: undefined,
        lastName: undefined,
        cnp: undefined,
        address: undefined,
        city: undefined,
        county: undefined,
        postalCode: undefined,
        // Prefill: companyKyc > saved profile > empty
        companyName: companyKyc?.companyName || pjData?.companyName || billing?.companyName || '',
        cui: companyKyc?.cui || pjData?.cui || billing?.cui || '',
        regCom: companyKyc?.registrationNumber || pjData?.regCom || billing?.regCom || '',
        companyAddress: companyKycAddr || pjData?.address || billing?.companyAddress || '',
        cuiVerified: !!(hasCompanyKyc && companyKyc?.validationStatus === 'valid') || !!hasSavedPj,
        isValid: !!(hasCompanyKyc && companyKyc?.validationStatus === 'valid') || !!hasSavedPj,
      });

      if ((hasCompanyKyc && companyKyc?.validationStatus === 'valid') || hasSavedPj) {
        setCuiSuccess(true);
        setCuiError(null);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billing, prefillFromId, companyKyc, updateBilling]);

  // Constatator: maps the 3 billing cards (firma din certificat / altă firmă /
  // persoană fizică) onto the underlying sources. Both firm cards use source
  // 'company'; they differ only in whether the CUI is prefilled or cleared.
  const handleOptionClick = useCallback((option: BillingOption) => {
    if (option.id === 'other_company') {
      setCompanyMode('other');
      updateBilling({
        source: 'company',
        type: 'persoana_juridica',
        firstName: undefined, lastName: undefined, cnp: undefined,
        address: undefined, city: undefined, county: undefined, postalCode: undefined,
        companyName: '', cui: '', regCom: '', companyAddress: '',
        cuiVerified: false, isValid: false,
      });
      setCuiSuccess(false);
      setCuiError(null);
      return;
    }
    setCompanyMode('request');
    handleSourceSelect(option.source);
  }, [handleSourceSelect, updateBilling]);

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

  // County → reset locality when it no longer belongs to the new county.
  const handleCountyChange = useCallback((countyName: string) => {
    const stillValid = getLocalitiesForCounty(countyName).includes(billing?.city || '');
    updateBilling({ county: countyName, city: stillValid ? billing?.city : '' });
  }, [billing?.city, updateBilling]);

  // Localities for the currently selected billing county (dependent dropdown).
  const billingLocalities = useMemo(
    () => getLocalitiesForCounty(billing?.county),
    [billing?.county],
  );

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
        throw new Error(errorData.error?.message || errorData.error || 'Eroare la validarea CUI');
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

  const selectedSource =
    billing?.source || (isCarteFunciara ? 'other_pf' : companyFirst ? 'company' : 'self');
  const billingOptions = isCarteFunciara
    ? CF_BILLING_OPTIONS
    : isConstatatorFirm
      ? CONSTATATOR_BILLING_OPTIONS
      : isConstatatorPf
        ? CONSTATATOR_PF_BILLING_OPTIONS
        : isPJOrder
          ? PJ_BILLING_OPTIONS
          : PF_BILLING_OPTIONS;

  return (
    <div className="space-y-8">
      {/* Billing Source Selection */}
      <div className="space-y-4">
        <h3 className="font-semibold text-secondary-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary-500" />
          Date pentru facturare
        </h3>

        <div className={cn(
          'grid grid-cols-1 gap-4',
          billingOptions.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
        )}>
          {billingOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = option.id
              ? selectedSource === 'company' && companyMode === (option.id === 'request_firm' ? 'request' : 'other')
              : selectedSource === option.source;

            return (
              <div
                key={option.id ?? option.source}
                onClick={() => handleOptionClick(option)}
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
            {selectedSource === 'self' && !isCarteFunciara ? 'Date facturare (din act)' : 'Date facturare (persoană fizică)'}
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
              CNP {isCarteFunciara ? <span className="text-neutral-400 text-xs">(opțional)</span> : <span className="text-red-500">*</span>}
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

          {/* Structured billing address — required for Oblio (street + locality
              + county sent separately). Always editable, even for "self": a
              passport carries no address, and a scanned CI address may need a
              correction. Name/CNP stay locked to the scanned document. */}
          <div className="space-y-2">
            <Label htmlFor="address" className="text-secondary-900 font-medium">
              Stradă, număr, bloc, ap. <span className="text-red-500">*</span>
            </Label>
            <Input
              id="address"
              type="text"
              value={billing?.address || ''}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="ex: Str. Mihai Viteazu nr. 10, bl. A2, ap. 5"
              className="bg-white placeholder:text-neutral-400 placeholder:italic"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="county" className="text-secondary-900 font-medium">
                Județ <span className="text-red-500">*</span>
              </Label>
              <Select
                value={billing?.county || ''}
                onValueChange={handleCountyChange}
              >
                <SelectTrigger id="county" className="bg-white">
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-secondary-900 font-medium">
                Localitate <span className="text-red-500">*</span>
              </Label>
              <Select
                value={billing?.city || ''}
                onValueChange={(v) => updateField('city', v)}
                disabled={!billing?.county}
              >
                <SelectTrigger id="city" className="bg-white">
                  <SelectValue
                    placeholder={billing?.county ? 'Alege localitatea' : 'Alege întâi județul'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {billingLocalities.map((loc) => (
                    <SelectItem key={loc} value={loc}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              value={billing?.postalCode || ''}
              onChange={(e) => updateField('postalCode', e.target.value.replace(/\D/g, ''))}
              placeholder="ex: 900001"
              className="bg-white"
            />
          </div>
        </div>
      )}

      {/* Persoană Juridică Fields */}
      {selectedSource === 'company' && (
        <div className="space-y-4 p-4 bg-neutral-50 rounded-xl">
          <h4 className="font-medium text-secondary-900">Date facturare (persoană juridică)</h4>

          {/* Auto-fill notice */}
          {cuiSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              <CheckCircle className="w-4 h-4 shrink-0" />
              {isPJOrder && companyKyc?.companyName
                ? 'Date preluate automat din datele firmei introduse anterior'
                : savedPjProfile
                  ? 'Date preluate automat din profilul de firmă salvat'
                  : 'CUI valid - date completate automat'}
            </div>
          )}

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

          {/* Bancă + IBAN câmpuri eliminate 2026-05-28 — nu sunt necesare
              pentru factura PJ. Oblio nu cere date bancare ale clientului
              pe e-factura (acolo apar conturile NOASTRE, nu ale clientului).
              Backward compat: dacă admin/client setează `bankName`/`bankIban`
              prin profile (BillingProfileForm), state-ul rămâne — doar
              wizard-ul nu le mai cere. */}
        </div>
      )}
    </div>
  );
}
