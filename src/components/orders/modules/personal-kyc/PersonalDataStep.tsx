'use client';
/* eslint-disable @next/next/no-img-element -- preview thumbnails use data URLs / dynamic S3 sources, Image component does not apply */

/**
 * PersonalDataStep Component
 *
 * Collects personal data with OCR support for Romanian ID documents.
 * Supports: CI Vechi, CI Nou, Passport, Certificat Atestare Domiciliu.
 * Design matches the old wizard for consistency.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useModularWizard } from '@/providers/modular-wizard-provider';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Camera,
  Upload,
  Scan,
  Pencil,
  X,
  FileCheck,
  Info,
  CreditCard,
  User,
  MapPin,
  Calendar,
} from 'lucide-react';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { PersonalKYCConfig, DocumentType, KYCValidationResults } from '@/types/verification-modules';
import { getCountriesForForeignType } from '@/config/countries';
import { DocumentTypePicker } from './DocumentTypePicker';
import { validateCNP, summarizeCNP } from '@/lib/validations/cnp';
import { cn } from '@/lib/utils';
import { COUNTY_NAMES, getLocalitiesForCounty, getCountyName, findCounty } from '@/lib/data/romania-counties';
import { fuzzyMatchLocality } from '@/lib/data/locality-fuzzy-match';
import { compressImage } from '@/lib/images/compress';
import { randomId } from '@/lib/random-id';

// Minimal ID Card Front Illustration (Gold theme)
function IdCardFrontIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 100" className={className} aria-label="CI față">
      {/* Card outline */}
      <rect x="2" y="2" width="156" height="96" rx="8" fill="#FFFDF5" stroke="#ECB95F" strokeWidth="1.5"/>
      {/* Gold header bar */}
      <rect x="2" y="2" width="156" height="22" rx="8" fill="#ECB95F"/>
      <rect x="2" y="16" width="156" height="8" fill="#ECB95F"/>
      <text x="80" y="16" textAnchor="middle" fill="#5E4319" fontSize="7" fontWeight="700">CARTE DE IDENTITATE</text>
      {/* Photo placeholder */}
      <rect x="10" y="30" width="38" height="48" rx="4" fill="#FDF8E8" stroke="#D4A24A" strokeWidth="1"/>
      <circle cx="29" cy="46" r="12" fill="none" stroke="#D4A24A" strokeWidth="1.5"/>
      <path d="M15 70 Q29 55 43 70" fill="none" stroke="#D4A24A" strokeWidth="1.5"/>
      {/* Data lines */}
      <g fill="#7C5A26" fontSize="5">
        <text x="55" y="36">Nume</text>
        <rect x="55" y="39" width="55" height="7" rx="2" fill="#FBF0CC"/>
        <text x="55" y="54">Prenume</text>
        <rect x="55" y="57" width="55" height="7" rx="2" fill="#FBF0CC"/>
        <text x="55" y="72">CNP</text>
        <rect x="55" y="75" width="95" height="7" rx="2" fill="#FBF0CC"/>
      </g>
      {/* Bottom hint */}
      <rect x="10" y="86" width="140" height="10" rx="3" fill="#FDF8E8"/>
      <text x="80" y="93" textAnchor="middle" fill="#B8893C" fontSize="5">Semnătură</text>
    </svg>
  );
}

// Minimal ID Card Back Illustration (Gold theme)
function IdCardBackIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 100" className={className} aria-label="CI verso">
      {/* Card outline */}
      <rect x="2" y="2" width="156" height="96" rx="8" fill="#FFFDF5" stroke="#ECB95F" strokeWidth="1.5"/>
      {/* Gold header bar */}
      <rect x="2" y="2" width="156" height="22" rx="8" fill="#ECB95F"/>
      <rect x="2" y="16" width="156" height="8" fill="#ECB95F"/>
      <text x="80" y="16" textAnchor="middle" fill="#5E4319" fontSize="7" fontWeight="700">VERSO - ADRESĂ</text>
      {/* Address lines */}
      <g fill="#7C5A26" fontSize="5">
        <text x="10" y="36">Domiciliu</text>
        <rect x="10" y="40" width="140" height="7" rx="2" fill="#FBF0CC"/>
        <rect x="10" y="50" width="120" height="7" rx="2" fill="#FBF0CC"/>
        <rect x="10" y="60" width="90" height="7" rx="2" fill="#FBF0CC"/>
      </g>
      {/* MRZ Zone */}
      <rect x="10" y="74" width="140" height="20" rx="3" fill="#5E4319"/>
      <g fill="#ECB95F" fontFamily="monospace" fontSize="5" opacity=".8">
        <text x="15" y="84">IDROU&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
        <text x="15" y="91">POPESCU&lt;&lt;ION&lt;&lt;&lt;&lt;&lt;&lt;</text>
      </g>
    </svg>
  );
}

// Helper to convert DD.MM.YYYY to YYYY-MM-DD (for HTML date inputs)
function convertDateFormat(dateStr: string | undefined): string {
  if (!dateStr) return '';
  // Try DD.MM.YYYY format
  const match = dateStr.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    return `${year}-${month}-${day}`;
  }
  // Already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }
  return '';
}

interface PersonalDataStepProps {
  config: PersonalKYCConfig;
  onValidChange: (valid: boolean) => void;
}

interface ScanState {
  scanning: boolean;
  progress: number;
  error: string | null;
  success: boolean;
  preview: string | null;
}

const initialScanState: ScanState = {
  scanning: false,
  progress: 0,
  error: null,
  success: false,
  preview: null,
};

// Birth country lists are now derived per-render from
// state.contact.foreignType using getCountriesForForeignType().

export default function PersonalDataStep({ config, onValidChange }: PersonalDataStepProps) {
  const { state, updatePersonalKyc, isPrefilled, prefillData } = useModularWizard();
  const personalKyc = state.personalKyc;

  // Check if we have valid KYC from user's account
  const hasValidKycFromAccount = isPrefilled && prefillData?.has_valid_kyc;

  const ciFrontInputRef = useRef<HTMLInputElement>(null);
  const ciBackInputRef = useRef<HTMLInputElement>(null);
  // Refs for new (post-2026-05-28) scan zones — only rendered conditionally
  // based on idDocumentType. Re-uses the same `ScanState` shape so existing
  // progress/error UI works for all of them.
  const ciNouBackInputRef = useRef<HTMLInputElement>(null);
  const passportOpenedInputRef = useRef<HTMLInputElement>(null);
  const roCeiPdfInputRef = useRef<HTMLInputElement>(null);

  const [ciFrontScan, setCiFrontScan] = useState<ScanState>(initialScanState);
  const [ciBackScan, setCiBackScan] = useState<ScanState>(initialScanState);
  const [ciNouBackScan, setCiNouBackScan] = useState<ScanState>(initialScanState);
  const [passportOpenedScan, setPassportOpenedScan] = useState<ScanState>(initialScanState);
  const [roCeiPdfScan, setRoCeiPdfScan] = useState<ScanState>(initialScanState);
  const [showScanSection, setShowScanSection] = useState(true);
  // Counter for OCR failures — after 2 consecutive fails we surface a
  // "completez manual" fallback link more prominently.
  const [scanFailureCount, setScanFailureCount] = useState(0);
  const [localities, setLocalities] = useState<string[]>([]);
  const [cnpInfo, setCnpInfo] = useState<string | null>(null);

  // Mode picker: 'choice' shows the Scan-vs-Manual landing card.
  // The user's existing data shortcuts the picker — if they're returning to
  // the step with data already filled, we skip the picker and show the form.
  // For foreign citizens we skip CI scan entirely (CI doesn't apply); they
  // upload passport at step 4 KYC instead and fill data manually here.
  const hasExistingData =
    !!state.personalKyc?.cnp ||
    !!state.personalKyc?.firstName ||
    !!state.personalKyc?.uploadedDocuments?.length;
  const isForeignCitizen =
    state.contact.citizenship === 'foreign' ||
    state.personalKyc?.citizenship !== undefined &&
      state.personalKyc?.citizenship !== 'romanian';
  const [mode, setMode] = useState<'choice' | 'scan' | 'manual'>(
    isForeignCitizen ? 'manual' : hasExistingData ? 'scan' : 'choice'
  );

  // In scan mode we hide the WHOLE form (CNP, serie/număr, nume, prenume,
  // birthDate, birthPlace, expiry). The customer only sees:
  //   1. The scan upload zones (CI față / verso)
  //   2. After a successful scan: the green "Date extrase" summary card —
  //      read-only, no inputs.
  // Rationale: removes Step 2 friction entirely. OCR fills state silently;
  // if Gemini misreads anything the operator corrects it from
  // /admin/orders/[id] (matches cazierjudiciaronline.com behavior).
  // Manual mode keeps the full form so the customer can type everything.
  const hideExtractedFields = mode === 'scan';

  // Helper function to clean locality names from prefixes (sat, com., comună, etc.)
  const cleanLocalityName = useCallback((name: string): string => {
    if (!name) return name;

    const prefixes = [
      /^sat\.\s*/i,
      /^sat\s+/i,
      /^com\.\s*/i,
      /^com\s+/i,
      /^comună\s+/i,
      /^comuna\s+/i,
      /^oraș\s+/i,
      /^oras\s+/i,
      /^mun\.\s*/i,
      /^mun\s+/i,
      /^municipiul\s+/i,
    ];

    let cleaned = name.trim();
    for (const prefix of prefixes) {
      cleaned = cleaned.replace(prefix, '');
    }

    return cleaned.trim();
  }, []);

  // Helper function to fill address fields from OCR data
  const fillAddressFields = useCallback((addr: {
    county?: string;
    city?: string;
    sector?: string;
    street?: string;
    streetType?: string;
    number?: string;
    building?: string;
    staircase?: string;
    floor?: string;
    apartment?: string;
    postalCode?: string;
  }) => {
    console.log('fillAddressFields called with:', addr);

    const addressUpdates: NonNullable<typeof personalKyc>['address'] = {
      county: personalKyc?.address?.county || '',
      city: personalKyc?.address?.city || '',
      street: personalKyc?.address?.street || '',
      number: personalKyc?.address?.number || '',
    };

    // County - convert abbreviations like "SM" → "Satu Mare"
    if (addr.county) {
      const countyName = getCountyName(addr.county);
      console.log('County mapping:', addr.county, '→', countyName);
      if (countyName && COUNTY_NAMES.includes(countyName)) {
        addressUpdates.county = countyName;
        // Load localities for this county
        const countyLocalities = getLocalitiesForCounty(countyName);
        setLocalities(countyLocalities);
      }
    }

    // City - for București, include sector; clean prefixes for villages
    if (addr.city) {
      let cityName = addr.city;
      const countyMatch = findCounty(addr.county);

      if (addr.sector && (countyMatch?.name === 'București' || addr.city?.toLowerCase().includes('bucurești'))) {
        cityName = `București, Sector ${addr.sector}`;
      } else {
        cityName = cleanLocalityName(cityName);
        // Canonicalize against the official locality list — fixes the most
        // common OCR mistake on Romanian diacritics (e.g. "Băbăcești" ←
        // misread "ș" — gets fuzzy-matched to "Băbășești" from the SM list).
        // No-op when the input is already canonical or county is unknown.
        const fuzzy = fuzzyMatchLocality(cityName, addr.county || addressUpdates.county);
        if (fuzzy.kind !== 'none' && fuzzy.canonical !== cityName) {
          console.log('Locality fuzzy-matched:', cityName, '→', fuzzy.canonical, `(${fuzzy.kind}, distance=${fuzzy.distance})`);
          cityName = fuzzy.canonical;
        }
        console.log('City cleaned:', addr.city, '→', cityName);
      }
      addressUpdates.city = cityName;
    }

    // Street - use only the street name (streetType is the prefix like "Strada", "Aleea", etc.
    // which is already shown as the form field label, so we avoid duplication)
    if (addr.street) {
      addressUpdates.street = addr.street;
    }
    if (addr.number) addressUpdates.number = addr.number;
    if (addr.building) addressUpdates.building = addr.building;
    if (addr.staircase) addressUpdates.staircase = addr.staircase;
    if (addr.floor) addressUpdates.floor = addr.floor;
    if (addr.apartment) addressUpdates.apartment = addr.apartment;
    if (addr.postalCode) addressUpdates.postalCode = addr.postalCode;

    updatePersonalKyc({ address: addressUpdates });
  }, [personalKyc?.address, updatePersonalKyc, cleanLocalityName]);

  // Handle file select and OCR. Accepts all 5 ScanType variants — both legacy
  // (`ci_front`, `ci_back`) and post-2026-05-28 picker-driven types
  // (`ci_nou_back`, `passport_opened`, `ro_cei_reader_pdf`). The setter is
  // resolved by switch — `setState` is the React state setter for the
  // appropriate scan-state slot.
  const handleFileSelect = useCallback(async (
    type: 'ci_front' | 'ci_back' | 'ci_nou_back' | 'passport_opened' | 'ro_cei_reader_pdf',
    file: File
  ) => {
    const setStateMap = {
      ci_front: setCiFrontScan,
      ci_back: setCiBackScan,
      ci_nou_back: setCiNouBackScan,
      passport_opened: setPassportOpenedScan,
      ro_cei_reader_pdf: setRoCeiPdfScan,
    } as const;
    const setState = setStateMap[type];
    setState(prev => ({ ...prev, scanning: true, progress: 0, error: null }));

    try {
      // PDF branch — Gemini accepts application/pdf natively. Skip image
      // compression (it's already a small vector format) and pass through.
      const isPdf = file.type === 'application/pdf' ||
        file.name.toLowerCase().endsWith('.pdf');

      let base64: string;
      let preview: string;
      let mimeType: string;
      let sizeAfter: number;

      if (isPdf) {
        // Read PDF as base64 directly.
        const buf = await file.arrayBuffer();
        const bytes = new Uint8Array(buf);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
        base64 = btoa(binary);
        mimeType = 'application/pdf';
        // Use a generic PDF placeholder for preview (no inline image).
        preview = '';
        sizeAfter = file.size;
        console.log(`[KYC] ${type}: PDF ${(file.size/1024).toFixed(0)}KB`);
      } else {
        // Image branch: compress + decode (EXIF-safe).
        const compressed = await compressImage(file);
        console.log(`[KYC] ${type}: ${(compressed.sizeBefore/1024/1024).toFixed(1)}MB → ${(compressed.sizeAfter/1024).toFixed(0)}KB`);
        base64 = compressed.base64;
        mimeType = compressed.mimeType;
        preview = compressed.dataUrl;
        sizeAfter = compressed.sizeAfter;
      }

      // Synthesize a `compressed`-shaped object so downstream code stays the same.
      const compressed = { base64, mimeType, dataUrl: preview, sizeAfter, sizeBefore: file.size };

      setState(prev => ({ ...prev, preview, progress: 20 }));
      setState(prev => ({ ...prev, progress: 40 }));

      // Call OCR API.
      // Gemini extraction takes ~2-10s. Without fake-progress the bar would
      // freeze at 40% the entire time and feel broken — so we creep it
      // forward asymptotically toward 68% while the request is in flight.
      // `type` is passed through directly — the API knows all 5 ScanType
      // variants and routes to the right extractor.
      const docType = type;

      const fakeProgressInterval = setInterval(() => {
        setState(prev => {
          if (!prev.scanning) return prev;
          // Approach 68 asymptotically — never reach 70 until the response is back.
          const next = prev.progress + Math.max(0.5, (68 - prev.progress) * 0.08);
          return { ...prev, progress: Math.min(68, next) };
        });
      }, 200);

      let response: Response;
      try {
        response = await fetch('/api/ocr/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'specific',
            imageBase64: base64,
            mimeType: compressed.mimeType,
            documentType: docType,
          }),
        });
      } finally {
        clearInterval(fakeProgressInterval);
      }

      setState(prev => ({ ...prev, progress: 70 }));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `OCR processing failed (${response.status})`);
      }

      const result = await response.json();
      const ocr = result.data?.ocr;

      console.log('OCR Response for', type, ':', JSON.stringify(ocr, null, 2));

      setState(prev => ({ ...prev, progress: 90 }));

      if (ocr?.success && ocr.confidence >= 50) {
        const extracted = ocr.extractedData;

        // OCR sometimes can't read the birth date on the CI (glare, low res).
        // The CNP already encodes it, so derive when OCR returned null.
        // Without this fallback isFormValid() blocks "Continuă" because
        // birthDate is required.
        let birthDateValue = convertDateFormat(extracted.birthDate) || personalKyc?.birthDate || '';
        if (!birthDateValue) {
          const cnpForDerive = extracted.cnp || personalKyc?.cnp || '';
          const cnpRes = validateCNP(cnpForDerive);
          if (cnpRes.valid && cnpRes.data) {
            const d = cnpRes.data.birthDate;
            birthDateValue = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          }
        }

        // Update state with extracted data
        updatePersonalKyc({
          firstName: extracted.firstName || personalKyc?.firstName || '',
          lastName: extracted.lastName || personalKyc?.lastName || '',
          cnp: extracted.cnp || personalKyc?.cnp || '',
          birthDate: birthDateValue,
          birthPlace: extracted.birthPlace || personalKyc?.birthPlace || '',
          documentSeries: extracted.series || personalKyc?.documentSeries || '',
          documentNumber: extracted.number || personalKyc?.documentNumber || '',
          documentExpiry: convertDateFormat(extracted.expiryDate) || personalKyc?.documentExpiry || '',
          documentIssueDate: convertDateFormat(extracted.issueDate) || personalKyc?.documentIssueDate || '',
          documentIssuedBy: extracted.issuedBy || personalKyc?.documentIssuedBy || '',
          // Persistăm tipul cerut explicit (request type), NU `ocr.documentType`.
          // De ce: extractFromCINouBack folosește `parseGeminiOCRResponse(text, 'ci_back')`
          // pentru backward compat → `ocr.documentType` ar fi 'ci_back', dar tipul real
          // de scan e 'ci_nou_back'. Idem pentru passport_opened și ro_cei_reader_pdf
          // (parserul le marchează 'passport'). Dacă păstram `ocr.documentType` ca cheie,
          // la revenire din Step 3 → 2, renderScanCard cu type='ci_nou_back' nu găsea
          // niciun upload (filter `d.type !== 'ci_nou_back'` cădea în branch-ul gol).
          documentType: type,
          isExpired: ocr.isExpired || false,
          requiresAddressCertificate: ocr.requiresAddressCertificate || false,
          // Note: Address will be filled separately using fillAddressFields
          fatherName: extracted.fatherName || personalKyc?.fatherName,
          motherName: extracted.motherName || personalKyc?.motherName,
          // Add to uploaded documents — indexat pe `type` request, vezi nota de mai sus.
          uploadedDocuments: [
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(personalKyc?.uploadedDocuments || []).filter((d: any) => d.type !== type),
            {
              id: randomId(),
              type,
              fileName: file.name,
              fileSize: compressed.sizeAfter,
              mimeType: compressed.mimeType,
              uploadedAt: new Date().toISOString(),
              base64,
            },
          ],
          ocrResults: [
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ...(personalKyc?.ocrResults || []).filter((r: any) => r.documentType !== type),
            {
              documentType: type,
              success: true,
              confidence: ocr.confidence || 0.9,
              extractedData: extracted,
              issues: ocr.issues || [],
              processedAt: new Date().toISOString(),
            },
          ],
          // Update kycValidation with per-document confidence
          kycValidation: {
            ...personalKyc?.kycValidation,
            ...(type === 'ci_front' ? {
              ciFront: {
                valid: ocr.success && (ocr.confidence || 0) >= 50,
                confidence: ocr.confidence || 0,
              },
            } : {}),
            ...(type === 'ci_back' ? {
              ciBack: {
                valid: ocr.success && (ocr.confidence || 0) >= 50,
                confidence: ocr.confidence || 0,
              },
            } : {}),
          } as KYCValidationResults,
        });

        // Fill address fields using the helper (handles county conversion, city cleaning, etc.)
        if (extracted.address) {
          console.log('Address found in OCR:', JSON.stringify(extracted.address, null, 2));
          fillAddressFields(extracted.address);
        }

        setState(prev => ({ ...prev, scanning: false, progress: 100, success: true }));
        // Reset failure counter on success
        setScanFailureCount(0);
      } else {
        console.warn('OCR extraction failed or low confidence:', {
          success: ocr?.success,
          confidence: ocr?.confidence,
          issues: ocr?.issues,
        });
        const confidenceMsg = ocr?.confidence !== undefined && ocr.confidence < 50
          ? ` (încredere: ${ocr.confidence}%)`
          : '';
        throw new Error(`Nu am putut extrage datele din document${confidenceMsg}. Verifică calitatea imaginii.`);
      }
    } catch (error) {
      console.error('OCR error:', error);
      setState(prev => ({
        ...prev,
        scanning: false,
        error: error instanceof Error ? error.message : 'Eroare la procesare document',
      }));
      // Bump failure counter — after 2 fails the UI surfaces a manual fallback
      setScanFailureCount(prev => prev + 1);
    }
  }, [personalKyc, updatePersonalKyc, fillAddressFields]);

  // Reset scan — clears state slot + removes the uploaded doc/OCR result.
  const resetScan = useCallback((type: 'ci_front' | 'ci_back' | 'ci_nou_back' | 'passport_opened' | 'ro_cei_reader_pdf') => {
    const setStateMap = {
      ci_front: setCiFrontScan,
      ci_back: setCiBackScan,
      ci_nou_back: setCiNouBackScan,
      passport_opened: setPassportOpenedScan,
      ro_cei_reader_pdf: setRoCeiPdfScan,
    } as const;
    setStateMap[type](initialScanState);

    // Remove from uploaded documents
    if (personalKyc?.uploadedDocuments) {
      updatePersonalKyc({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        uploadedDocuments: personalKyc.uploadedDocuments.filter((d: any) => d.type !== type),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ocrResults: personalKyc.ocrResults?.filter((r: any) => r.documentType !== type) || [],
      });
    }
  }, [personalKyc, updatePersonalKyc]);

  // Handle CNP change with validation + auto-fill of derivable fields
  const handleCNPChange = useCallback((value: string) => {
    const cleanCNP = value.replace(/\D/g, '').slice(0, 13);
    updatePersonalKyc({ cnp: cleanCNP });

    if (cleanCNP.length === 13) {
      const result = validateCNP(cleanCNP);
      const summary = summarizeCNP(cleanCNP);
      if (result.valid && result.data && summary) {
        setCnpInfo(`${result.data.gender === 'male' ? 'Bărbat' : 'Femeie'}, ${result.data.age} ani`);

        // Format birth date as local YYYY-MM-DD without UTC drift.
        // toISOString() converts to UTC and on Europe/Bucharest (UTC+2/+3)
        // shifts the date back one day for midnight-local timestamps —
        // which is why CNP 192...07.02 was rendering as 01.07 in the input.
        const d = result.data.birthDate;
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const localDate = `${yyyy}-${mm}-${dd}`;

        // Auto-fill birthDate + birthPlace (county). Don't overwrite if user
        // already has a more specific value (e.g. populated by OCR).
        updatePersonalKyc({
          birthDate: localDate,
          // Locul nașterii — only set if currently empty so we don't
          // clobber a more specific OCR-extracted city.
          birthPlace:
            personalKyc?.birthPlace && personalKyc.birthPlace.trim().length > 0
              ? personalKyc.birthPlace
              : summary.county,
        });
      } else {
        setCnpInfo(result.errors[0] || 'CNP invalid');
      }
    } else {
      setCnpInfo(null);
    }
  }, [updatePersonalKyc, personalKyc?.birthPlace]);

  // Handle county change - update localities list with smart city matching
  const handleCountyChange = useCallback((countyName: string) => {
    const countyLocalities = getLocalitiesForCounty(countyName);
    setLocalities(countyLocalities);

    // Try to match current city in new localities list
    const currentCity = personalKyc?.address?.city || '';
    let newCity = '';

    if (currentCity && countyLocalities.length > 0) {
      // First check exact match
      if (countyLocalities.includes(currentCity)) {
        newCity = currentCity;
      } else {
        // Clean the city name and try again
        const cleanedCity = cleanLocalityName(currentCity);
        if (countyLocalities.includes(cleanedCity)) {
          newCity = cleanedCity;
        } else {
          // Try partial match
          const matchingLocality = countyLocalities.find(
            loc => loc.toLowerCase().includes(cleanedCity.toLowerCase()) ||
                   cleanedCity.toLowerCase().includes(loc.toLowerCase())
          );
          if (matchingLocality) {
            newCity = matchingLocality;
          }
        }
      }
    }

    updatePersonalKyc({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      address: { ...personalKyc?.address, county: countyName, city: newCity } as any
    });
  }, [personalKyc?.address, updatePersonalKyc, cleanLocalityName]);

  // Initialize localities when component loads (for restored data)
  useEffect(() => {
    if (personalKyc?.address?.county) {
      const countyLocalities = getLocalitiesForCounty(personalKyc.address.county);
      setLocalities(countyLocalities);
    }
  }, [personalKyc?.address?.county]);

  // Auto-derive birthDate from CNP whenever it's missing but the CNP is valid.
  // Covers cases where: (a) OCR couldn't read the date from a glary photo,
  // (b) the user resumes a draft saved before this auto-derive existed,
  // (c) the user typed CNP via paste/autocomplete without a key event.
  // The CNP encodes day+month+year+sex+county — birthDate is fully derivable.
  useEffect(() => {
    if (!personalKyc || personalKyc.birthDate) return;
    const cnpRes = validateCNP(personalKyc.cnp || '');
    if (!cnpRes.valid || !cnpRes.data) return;
    const d = cnpRes.data.birthDate;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    updatePersonalKyc({ birthDate: `${yyyy}-${mm}-${dd}` });
  }, [personalKyc, updatePersonalKyc]);

  // Sync citizenship from step 1 (contact) → personal-kyc citizenship.
  // The dedicated <Select> for citizenship was removed from this step; the
  // user picks it earlier in the contact step. Mapping:
  //   contact.citizenship === 'romanian'                              → 'romanian'
  //   contact.citizenship === 'foreign' && foreignType === 'eu'       → 'european'
  //   contact.citizenship === 'foreign' && foreignType === 'non-eu'   → 'foreign'
  useEffect(() => {
    if (!personalKyc) return;
    const c = state.contact.citizenship;
    if (!c) return; // not yet set — keep existing
    let target: 'romanian' | 'european' | 'foreign' = 'romanian';
    if (c === 'foreign') {
      target = state.contact.foreignType === 'non-eu' ? 'foreign' : 'european';
    }
    if (personalKyc.citizenship !== target) {
      updatePersonalKyc({ citizenship: target });
    }
  }, [
    state.contact.citizenship,
    state.contact.foreignType,
    personalKyc,
    updatePersonalKyc,
  ]);

  // Validate form
  const isFormValid = useCallback(() => {
    if (!personalKyc) return false;

    // CNP is mandatory for Romanian citizens; foreign citizens typically don't
    // have one (they use passport / EU residence card instead). For foreign,
    // we only validate CNP if it's filled — empty is fine.
    const isForeignCitizen = personalKyc.citizenship !== 'romanian';
    if (!isForeignCitizen) {
      const cnpValidation = validateCNP(personalKyc.cnp);
      if (!cnpValidation.valid) return false;
    } else if (personalKyc.cnp && personalKyc.cnp.length > 0) {
      // Optional but if filled, must be valid (no garbage data accepted).
      const cnpValidation = validateCNP(personalKyc.cnp);
      if (!cnpValidation.valid) return false;
    }

    if (!personalKyc.firstName.trim()) return false;
    if (!personalKyc.lastName.trim()) return false;
    if (!personalKyc.birthDate) return false;

    // Check document requirements (with defensive checks)
    // Skip document requirement if user has valid KYC from their account
    const acceptedDocs = config?.acceptedDocuments ?? [];
    const uploadedDocs = personalKyc?.uploadedDocuments ?? [];
    if (acceptedDocs.length > 0 && uploadedDocs.length === 0 && !hasValidKycFromAccount) {
      return false;
    }

    // Check if expired document is allowed
    if (personalKyc?.isExpired && !config?.expiredDocumentAllowed) {
      return false;
    }

    // Foreign citizen extra fields validation:
    //   1. Localitatea nașterii (birthCity) — collected at step 1
    //   2. Țara nașterii (birthCountry) — collected at step 1
    //   3. Domicile address — split based on hasRomanianAddress toggle:
    //        - "Da" → Romanian address (street + city + county) is required
    //        - "Nu" → foreignData.foreignAddress + foreignData.birthCountry required
    //          (we re-use birthCountry as the country-of-domicile when foreign)
    if (personalKyc.citizenship !== 'romanian') {
      if (!personalKyc.foreignData?.birthCity?.trim()) return false;
      if (!personalKyc.foreignData?.birthCountry) return false;

      const hasRomanianAddress =
        personalKyc.foreignData?.hasRomanianAddress ?? true;
      if (hasRomanianAddress) {
        // Living in Romania → require local address (where the document gets delivered).
        if (
          !personalKyc.address?.street?.trim() ||
          !personalKyc.address?.city?.trim() ||
          !personalKyc.address?.county?.trim()
        ) {
          return false;
        }
      } else {
        // Living abroad → require foreign address text + country picked.
        if (!personalKyc.foreignData?.foreignAddress?.trim()) return false;
      }
    }

    return true;
  }, [personalKyc, config, hasValidKycFromAccount]);

  // Notify parent when validity changes
  useEffect(() => {
    onValidChange(isFormValid());
  }, [isFormValid, onValidChange]);

  if (!personalKyc) {
    return (
      <div className="flex items-center justify-center p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Modulul de verificare personală nu este activat pentru acest serviciu.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const cnpValidation = validateCNP(personalKyc.cnp);

  // Render scan card — accepts any of the 5 ScanType variants. The card
  // chrome (border colors, success state, error overlay) is the same
  // regardless of which document is being scanned; only the icon, title,
  // and description differ.
  const renderScanCard = (
    type: 'ci_front' | 'ci_back' | 'ci_nou_back' | 'passport_opened' | 'ro_cei_reader_pdf',
    title: string,
    description: string
  ) => {
    const scanStateMap = {
      ci_front: ciFrontScan,
      ci_back: ciBackScan,
      ci_nou_back: ciNouBackScan,
      passport_opened: passportOpenedScan,
      ro_cei_reader_pdf: roCeiPdfScan,
    } as const;
    const scanState = scanStateMap[type];
    // Direct match by type ONLY. Legacy back-compat alias (ci_back ↔ ci_nou_back)
    // is handled below in a constrained way — applies ONLY to those two types.
    //
    // Bug fixed 2026-05-28: the old fallback `type === 'ci_front' ? 'ci_nou_front'
    // : 'ci_nou_back'` triggered a `d.type === 'ci_nou_back'` cross-match for ALL
    // non-ci_front slots — meaning `ro_cei_reader_pdf` and `passport_opened`
    // accidentally rendered the uploaded ci_nou_back image as their own content.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existingDoc = personalKyc?.uploadedDocuments?.find((d: any) => {
      if (d.type === type) return true;
      // Strict back-compat: only between ci_back and ci_nou_back (same physical
      // document, two naming conventions across versions of the wizard).
      if (type === 'ci_back' && d.type === 'ci_nou_back') return true;
      if (type === 'ci_nou_back' && d.type === 'ci_back') return true;
      // And the original ci_front ↔ ci_nou_front legacy alias.
      if (type === 'ci_front' && d.type === 'ci_nou_front') return true;
      return false;
    });

    const hasUpload = scanState.preview || existingDoc;
    const isSuccess = scanState.success || !!existingDoc;

    return (
      <div
        className={cn(
          'relative rounded-xl border-2 p-4 transition-all',
          isSuccess
            ? 'border-green-300 bg-green-50'
            : scanState.error
            ? 'border-red-300 bg-red-50'
            : 'border-dashed border-neutral-200 hover:border-primary-300 bg-white'
        )}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              isSuccess ? 'bg-green-100' : 'bg-neutral-100'
            )}
          >
            {scanState.scanning ? (
              <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
            ) : isSuccess ? (
              <FileCheck className="w-5 h-5 text-green-600" />
            ) : (
              <Scan className="w-5 h-5 text-neutral-500" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-secondary-900 text-sm">{title}</h4>
            <p className="text-xs text-neutral-600">{description}</p>
          </div>
          {isSuccess && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => resetScan(type)}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {hasUpload ? (
          <div className="relative aspect-[3/2] bg-neutral-100 rounded-lg overflow-hidden">
            {(() => {
              // Detect PDF — Gemini accepts it but we can't render <img> for PDFs.
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const docMime = (existingDoc as any)?.mimeType as string | undefined;
              const isPdfUpload =
                docMime === 'application/pdf' ||
                (scanState.preview === '' && !existingDoc); // PDF newly uploaded → empty preview
              if (isPdfUpload) {
                // Hidden input + clickable area pentru re-upload.
                // De ce: pe PDF NU avem `<img>` interactiv ca pe imagini, deci
                // userul nu are unde să apese pentru a înlocui. X-ul din header
                // există, dar e mic — adăugăm aici 2 butoane mari și clare:
                // „Înlocuiește" (click → file picker) și „Șterge" (click → resetScan).
                const ref =
                  type === 'ci_front' ? ciFrontInputRef :
                  type === 'ci_back' ? ciBackInputRef :
                  type === 'ci_nou_back' ? ciNouBackInputRef :
                  type === 'passport_opened' ? passportOpenedInputRef :
                  roCeiPdfInputRef;
                return (
                  <>
                    <input
                      ref={ref}
                      type="file"
                      accept={type === 'ro_cei_reader_pdf' ? 'application/pdf' : 'image/jpeg,image/jpg,image/png,application/pdf'}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileSelect(type, file);
                        e.target.value = '';
                      }}
                      className="hidden"
                      disabled={scanState.scanning}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-50 text-neutral-700 p-3">
                      <FileCheck className="h-10 w-10 text-primary-500 mb-2" />
                      <p className="text-sm font-medium">Document PDF încărcat</p>
                      <p className="text-xs text-neutral-500 mt-0.5 mb-3">
                        Datele se extrag în câteva secunde
                      </p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            ref.current?.click();
                          }}
                          disabled={scanState.scanning}
                          className="text-xs px-3 py-1.5 bg-white border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-100 hover:border-neutral-400 transition-colors disabled:opacity-50"
                        >
                          Înlocuiește
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            resetScan(type);
                          }}
                          disabled={scanState.scanning}
                          className="text-xs px-3 py-1.5 bg-white border border-red-300 rounded-md text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors disabled:opacity-50"
                        >
                          Șterge
                        </button>
                      </div>
                    </div>
                  </>
                );
              }
              return (
                <img
                  src={scanState.preview || (existingDoc?.base64 ? `data:${existingDoc.mimeType};base64,${existingDoc.base64}` : '')}
                  alt={title}
                  className="w-full h-full object-contain"
                />
              );
            })()}
            {scanState.scanning && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                <span className="text-white text-sm font-medium">
                  Scanare... {Math.round(scanState.progress)}%
                </span>
              </div>
            )}
            {isSuccess && (
              <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                <CheckCircle className="w-4 h-4" />
              </div>
            )}
          </div>
        ) : (
          <div>
            <input
              ref={
                type === 'ci_front' ? ciFrontInputRef :
                type === 'ci_back' ? ciBackInputRef :
                type === 'ci_nou_back' ? ciNouBackInputRef :
                type === 'passport_opened' ? passportOpenedInputRef :
                roCeiPdfInputRef
              }
              type="file"
              accept={type === 'ro_cei_reader_pdf' ? 'application/pdf' : 'image/jpeg,image/jpg,image/png,application/pdf'}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(type, file);
                e.target.value = '';
              }}
              className="hidden"
              disabled={scanState.scanning}
            />
            <div
              onClick={() => {
                if (scanState.scanning) return;
                const ref =
                  type === 'ci_front' ? ciFrontInputRef :
                  type === 'ci_back' ? ciBackInputRef :
                  type === 'ci_nou_back' ? ciNouBackInputRef :
                  type === 'passport_opened' ? passportOpenedInputRef :
                  roCeiPdfInputRef;
                ref.current?.click();
              }}
              className="border-2 border-dashed border-primary-300 rounded-lg p-3 text-center hover:border-primary-500 hover:bg-primary-50/50 transition-all cursor-pointer group"
            >
              {/* Show illustration */}
              <div className="mb-3 opacity-80 group-hover:opacity-100 transition-opacity">
                {type === 'ci_front' ? (
                  <IdCardFrontIllustration className="w-full h-auto max-h-24" />
                ) : type === 'ci_back' || type === 'ci_nou_back' ? (
                  <IdCardBackIllustration className="w-full h-auto max-h-24" />
                ) : (
                  // Passport opened + RO CEI Reader PDF: use a simple icon placeholder
                  <div className="flex items-center justify-center h-24 text-neutral-400">
                    {type === 'ro_cei_reader_pdf' ? (
                      <FileCheck className="w-10 h-10" />
                    ) : (
                      <Scan className="w-10 h-10" />
                    )}
                  </div>
                )}
              </div>
              {/* Upload button area */}
              <div className="bg-primary-100 hover:bg-primary-200 rounded-lg py-2 px-4 inline-flex items-center gap-2 transition-colors">
                <Camera className="w-4 h-4 text-primary-700" />
                <Upload className="w-4 h-4 text-primary-700" />
                <span className="text-sm font-medium text-primary-800">
                  Încarcă imagine
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                JPG, PNG sau PDF, max 10MB
              </p>
            </div>
          </div>
        )}

        {scanState.error && (
          <div className="flex items-center gap-2 mt-2 text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs">{scanState.error}</span>
          </div>
        )}

        {isSuccess && (
          <div className="flex items-center gap-2 mt-2 text-green-600">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs">Date extrase cu succes!</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Prefilled Data Banner */}
      {isPrefilled && (personalKyc?.firstName || personalKyc?.cnp) && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-green-800">
                Date preluate din contul tău
              </p>
              <p className="text-sm text-green-700 mt-1">
                Am completat automat datele din profilul tău salvat.
                {hasValidKycFromAccount && ' Documentele KYC sunt deja verificate!'}
              </p>
              {hasValidKycFromAccount && (
                <div className="flex items-center gap-2 mt-2 text-xs text-green-600">
                  <FileCheck className="w-4 h-4" />
                  KYC verificat - poți sări peste pasul de scanare
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mode picker landing — shown only when user hasn't picked yet */}
      {mode === 'choice' && (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-semibold text-secondary-900">
              Cum vrei să completezi datele?
            </h3>
            <p className="text-sm text-neutral-500">
              Alege cum este mai simplu pentru tine — datele finale sunt aceleași.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mt-3">
            <button
              type="button"
              onClick={() => {
                setMode('scan');
                setShowScanSection(true);
              }}
              className="group relative flex flex-col items-center gap-2 sm:gap-3 rounded-xl border-2 border-primary-500 bg-primary-50/40 p-3 sm:p-5 text-center transition-all hover:bg-primary-50 hover:shadow-sm"
            >
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary-500 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-white uppercase tracking-wide whitespace-nowrap">
                Recomandat
              </span>
              <span className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-primary-100">
                <Scan className="h-5 w-5 sm:h-7 sm:w-7 text-primary-600" />
              </span>
              <div>
                <p className="text-sm sm:text-base font-semibold text-secondary-900 leading-tight">
                  Scanează actul
                </p>
                <p className="hidden sm:block text-xs text-neutral-500 mt-1 leading-snug">
                  Extragem automat datele în câteva secunde. Tot ce trebuie să faci e să faci o poză.
                </p>
                <p className="sm:hidden text-[11px] text-neutral-500 mt-1 leading-snug">
                  Date extrase automat
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('manual');
                setShowScanSection(false);
              }}
              className="group flex flex-col items-center gap-2 sm:gap-3 rounded-xl border-2 border-neutral-200 bg-white p-3 sm:p-5 text-center transition-all hover:border-neutral-300 hover:bg-neutral-50"
            >
              <span className="flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-neutral-100 group-hover:bg-neutral-200">
                <Pencil className="h-5 w-5 sm:h-7 sm:w-7 text-neutral-600" />
              </span>
              <div>
                <p className="text-sm sm:text-base font-semibold text-secondary-900 leading-tight">
                  Completez manual
                </p>
                <p className="hidden sm:block text-xs text-neutral-500 mt-1 leading-snug">
                  Tastez datele eu. Va trebui să încarc actul la pasul 4.
                </p>
                <p className="sm:hidden text-[11px] text-neutral-500 mt-1 leading-snug">
                  Tastez eu datele
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Manual mode notice */}
      {mode === 'manual' && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 flex items-start gap-3">
          <Info className="h-4 w-4 text-amber-700 mt-0.5 shrink-0" />
          <div className="flex-1 text-sm">
            <p className="text-amber-900 font-medium leading-snug">
              {isForeignCitizen
                ? 'Completează datele manual'
                : 'Completezi manual datele.'}
            </p>
            <p className="text-amber-800 text-xs mt-0.5 leading-snug">
              {isForeignCitizen ? (
                <>
                  La pasul 4 va trebui să încarci 3 documente: <strong>pașaportul deschis</strong>,
                  un <strong>selfie cu pașaportul</strong>, și <strong>permisul de
                  rezidență / certificatul de înregistrare fiscală</strong>.
                </>
              ) : (
                <>
                  La pasul 4 va trebui să încarci o poză a actului de identitate (obligatoriu pentru verificare).
                  <button
                    type="button"
                    onClick={() => {
                      setMode('scan');
                      setShowScanSection(true);
                    }}
                    className="ml-1 underline font-medium hover:text-amber-900"
                  >
                    Schimbă pe scanare automată
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* ID Scan Section — picker + conditional scan zones per document type */}
      {mode === 'scan' && showScanSection && !isForeignCitizen && (
        <div className="space-y-4">
          {/* Step 1: pick document type (if not picked yet) */}
          {!personalKyc.idDocumentType && (
            <DocumentTypePicker
              onPick={(type) => updatePersonalKyc({ idDocumentType: type })}
            />
          )}

          {/* Step 2: scan zones per picked type */}
          {personalKyc.idDocumentType && (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-secondary-900">
                  <Scan className="h-5 w-5 text-primary-500" />
                  <h3 className="font-semibold">
                    {personalKyc.idDocumentType === 'ci_vechi' && 'Scanează CI (vechi)'}
                    {personalKyc.idDocumentType === 'ci_nou' && 'Scanează CI nou + dovadă domiciliu'}
                    {personalKyc.idDocumentType === 'passport' && 'Scanează pașaportul'}
                  </h3>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    // Allow re-picking the document type. Wipe scans so the
                    // user doesn't accidentally submit mixed-type uploads.
                    updatePersonalKyc({ idDocumentType: null });
                    setCiFrontScan(initialScanState);
                    setCiNouBackScan(initialScanState);
                    setPassportOpenedScan(initialScanState);
                    setRoCeiPdfScan(initialScanState);
                  }}
                  className="text-neutral-500 text-xs"
                >
                  Schimbă tipul actului
                </Button>
              </div>

              {/* CI vechi — single zone (front only; back is blank/uninformative) */}
              {personalKyc.idDocumentType === 'ci_vechi' && (
                <div className="grid grid-cols-1 gap-4">
                  {renderScanCard(
                    'ci_front',
                    'CI vechi — față',
                    'Toate datele se citesc de pe față'
                  )}
                </div>
              )}

              {/* CI nou — 3 zones: front, back, RO CEI Reader PDF (dovadă domiciliu) */}
              {personalKyc.idDocumentType === 'ci_nou' && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {renderScanCard(
                      'ci_front',
                      'CI nou — față',
                      'Foto, nume, CNP, valabilitate'
                    )}
                    {renderScanCard(
                      'ci_nou_back',
                      'CI nou — spate',
                      'Data emiterii + autoritatea emitentă'
                    )}
                  </div>

                  {/* Info banner — slim, deasupra cardului de upload PDF, ca să nu
                      încărcăm vizual cardul. Match design cu banner-ul „Completare
                      automată rapidă" de mai sus. */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3">
                    <div className="flex gap-3">
                      <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800 flex-1">
                        <p className="font-medium mb-1">
                          Pas final — dovadă de domiciliu
                        </p>
                        <p className="text-blue-700 text-xs leading-snug">
                          Adresa nu e printată pe spate la CI nou — e doar în
                          cip. Generează PDF-ul cu aplicația oficială MAI:
                        </p>
                        <ol className="text-blue-700 text-xs leading-snug mt-2 list-decimal list-inside space-y-0.5">
                          <li>Instalează <strong>RO CEI Reader</strong> (gratis, de la MAI)</li>
                          <li>Apropie telefonul de cip-ul de pe spatele CI</li>
                          <li>Aplicația generează PDF-ul → îl urci aici</li>
                        </ol>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <a
                            href="https://play.google.com/store/search?q=RO+CEI+Reader+MAI"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] px-2.5 py-1 bg-white border border-blue-300 rounded-md text-blue-700 hover:bg-blue-100 hover:border-blue-400 transition-colors"
                          >
                            📲 Descarcă pentru Android
                          </a>
                          <a
                            href="https://apps.apple.com/search?term=RO%20CEI%20Reader"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] px-2.5 py-1 bg-white border border-blue-300 rounded-md text-blue-700 hover:bg-blue-100 hover:border-blue-400 transition-colors"
                          >
                            📲 Descarcă pentru iOS
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card upload PDF — același stil ca scan cards de mai sus */}
                  <div className="grid grid-cols-1 gap-4">
                    {renderScanCard(
                      'ro_cei_reader_pdf',
                      'PDF RO CEI Reader',
                      'Doar PDF generat de aplicația oficială MAI'
                    )}
                  </div>
                </>
              )}

              {/* Passport — opened spread */}
              {personalKyc.idDocumentType === 'passport' && (
                <div className="grid grid-cols-1 gap-4">
                  {renderScanCard(
                    'passport_opened',
                    'Pașaport deschis',
                    'Ambele pagini vizibile (foto + opusă), MRZ vizibil jos'
                  )}
                </div>
              )}

              {/* Fallback to manual — more prominent after 2 failures */}
              {scanFailureCount >= 2 && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="text-xs text-amber-800 leading-snug">
                    OCR-ul nu reușește. Vrei să completezi datele manual?{' '}
                    <button
                      type="button"
                      onClick={() => {
                        setShowScanSection(false);
                        setMode('manual');
                      }}
                      className="underline font-medium hover:text-amber-900"
                    >
                      Da, completez manual
                    </button>
                  </p>
                </div>
              )}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowScanSection(false);
                  setMode('manual');
                }}
                className="text-neutral-500 text-xs"
              >
                Completez manual
              </Button>
            </>
          )}

          {(ciFrontScan.success || ciBackScan.success || ciNouBackScan.success || passportOpenedScan.success || roCeiPdfScan.success || personalKyc.uploadedDocuments.length > 0) && (
            <div className="text-center text-xs text-neutral-500 pt-2">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Documentele scanate vor fi folosite și la pasul de verificare KYC
            </div>
          )}
        </div>
      )}

      {/* Manual Entry Link — only when in scan mode without scan section visible */}
      {mode === 'scan' && !showScanSection && (
        <div className="text-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowScanSection(true)}
            className="text-primary-600"
          >
            <Scan className="w-4 h-4 mr-2" />
            Scanează actul pentru completare automată
          </Button>
        </div>
      )}

      {/* Form fields — hidden on landing screen until user picks a mode */}
      {mode !== 'choice' && <>

      {/* Expired Document Warning */}
      {personalKyc.isExpired && !config?.expiredDocumentAllowed && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Documentul tău este expirat. Pentru acest serviciu, ai nevoie de un document valabil.
          </AlertDescription>
        </Alert>
      )}

      {personalKyc.isExpired && config?.expiredDocumentAllowed && (
        <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            {config?.expiredDocumentMessage || 'Documentul tău este expirat, dar este acceptat pentru acest serviciu.'}
          </AlertDescription>
        </Alert>
      )}

      {personalKyc.requiresAddressCertificate && config?.requireAddressCertificate !== 'never' && (
        <Alert className="border-blue-200 bg-blue-50 text-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            CI-ul nou sau pașaportul tău nu conține adresa. Te rugăm să încarci și un Certificat de Atestare a Domiciliului.
          </AlertDescription>
        </Alert>
      )}

      {/* CNP Section */}
      <div className="space-y-4">
        {/* "Identificare" header + CNP input — hidden in scan mode.
            OCR fills CNP into state silently; the read-only summary card below
            surfaces the result. Manual mode keeps the full input visible. */}
        {!hideExtractedFields && (
        <div className="flex items-center gap-2 text-secondary-900">
          <CreditCard className="h-5 w-5 text-primary-500" />
          <h3 className="font-semibold">Identificare</h3>
        </div>
        )}

        {!hideExtractedFields && (
        <div className="space-y-2">
          <Label htmlFor="cnp" className="text-secondary-900 font-medium">
            CNP (Cod Numeric Personal){' '}
            {personalKyc.citizenship === 'romanian' ? (
              <span className="text-red-500">*</span>
            ) : (
              <span className="text-xs font-normal text-neutral-500">(opțional pentru cetățeni străini)</span>
            )}
          </Label>
          <div className="relative">
            <Input
              id="cnp"
              type="text"
              inputMode="numeric"
              maxLength={13}
              value={personalKyc.cnp}
              onChange={(e) => handleCNPChange(e.target.value)}
              placeholder={personalKyc.citizenship === 'romanian' ? '1234567890123' : 'Lasă gol dacă nu ai CNP'}
              className={cn(
                'font-mono text-lg tracking-wider pr-10 bg-white placeholder:text-neutral-400',
                cnpValidation.valid && personalKyc.cnp.length === 13 && 'border-green-500 focus-visible:ring-green-500',
                !cnpValidation.valid && personalKyc.cnp.length === 13 && 'border-red-500 focus-visible:ring-red-500'
              )}
            />
            {cnpValidation.valid && personalKyc.cnp.length === 13 && (
              <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
            )}
            {!cnpValidation.valid && personalKyc.cnp.length === 13 && (
              <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
            )}
          </div>
          {!cnpValidation.valid && personalKyc.cnp.length === 13 && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {cnpValidation.errors[0]}
            </p>
          )}
        </div>
        )}

        {/* "Date extrase" summary card — renders whenever the CNP is valid.
            In manual mode it appears under the CNP input; in scan mode it
            appears after a successful scan as the SOLE proof to the customer
            that their data was captured. */}
        <div className="space-y-2">
          {cnpValidation.valid && personalKyc.cnp.length === 13 && (() => {
            const summary = summarizeCNP(personalKyc.cnp);
            if (!summary) {
              return (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {cnpInfo || 'CNP valid'}
                </p>
              );
            }
            // Combine CNP-derived județ with OCR-extracted localitate
            // (e.g. "Mun. Urziceni" from CI + "Ialomița" from CNP code 21).
            // When OCR didn't run (manual mode pre-fill, or scan still pending)
            // we show only the județ. Strip any "Jud. XX " prefix the OCR may
            // have included so we don't end up with "Jud. IL Mun. Urziceni".
            const ocrLocality = (personalKyc.birthPlace || '')
              .replace(/^Jud\.\s*[A-ZĂÂÎȘȚ]{1,3}\s*/i, '')
              .replace(/^Județ\s+[A-ZĂÂÎȘȚa-zăâîșț]+\s*/i, '')
              .trim();
            const fullName = [personalKyc.lastName, personalKyc.firstName]
              .filter(Boolean)
              .join(' ')
              .trim();
            return (
              <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm space-y-1.5">
                <div className="flex items-center gap-1 text-green-700 font-medium">
                  <CheckCircle className="h-4 w-4" />
                  Date extrase{fullName ? '' : ' din CNP'}:
                </div>
                {fullName && (
                  <div className="text-green-900 font-semibold text-base leading-tight">
                    {fullName}
                  </div>
                )}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="inline-flex items-center gap-1.5 text-green-800">
                    <Calendar className="h-3.5 w-3.5 text-green-600" />
                    <span className="font-medium tabular-nums">{summary.birthDate}</span>
                  </span>
                  <span className="text-green-300">•</span>
                  <span className="text-green-800 font-medium">{summary.gender}</span>
                  {(ocrLocality || summary.county) && (
                    <>
                      <span className="text-green-300">•</span>
                      <span className="text-green-800 inline-flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-green-600" />
                        {ocrLocality && (
                          <span className="font-medium">{ocrLocality}</span>
                        )}
                        {ocrLocality && summary.county && <span>,</span>}
                        {summary.county && (
                          <span>
                            Jud. <span className="font-medium">{summary.county}</span>
                          </span>
                        )}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })()}
          {!hideExtractedFields && (
            <p className="text-sm text-neutral-500 flex items-start gap-1">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              CNP-ul se găsește pe cartea de identitate
            </p>
          )}
        </div>

        {/* Document Series and Number — hidden in scan mode
            (OCR populated them; admin corrects if needed). */}
        {!hideExtractedFields && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="docSeries" className="text-secondary-900 font-medium">
              Serie document
              <span className="text-neutral-500 text-xs font-normal ml-1">(opțional pt pașaport)</span>
            </Label>
            <Input
              id="docSeries"
              type="text"
              maxLength={2}
              value={personalKyc.documentSeries}
              onChange={(e) => updatePersonalKyc({ documentSeries: e.target.value.toUpperCase() })}
              placeholder="ex: XV"
              className="font-mono text-lg tracking-wider uppercase bg-white placeholder:text-neutral-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="docNumber" className="text-secondary-900 font-medium">
              Număr document <span className="text-red-500">*</span>
            </Label>
            <Input
              id="docNumber"
              type="text"
              maxLength={9}
              value={personalKyc.documentNumber}
              onChange={(e) => updatePersonalKyc({ documentNumber: e.target.value.toUpperCase() })}
              placeholder="ex: 517628"
              className="font-mono text-lg tracking-wider uppercase bg-white placeholder:text-neutral-400"
            />
          </div>
        </div>
        )}
      </div>

      {/* Personal Info Section — hidden after successful scan; OCR fills it
          silently and admin verifies/corrects from the order detail page. */}
      {!hideExtractedFields && (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-secondary-900">
          <User className="h-5 w-5 text-primary-500" />
          <h3 className="font-semibold">Date Personale</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-secondary-900 font-medium">
              Nume <span className="text-red-500">*</span>
            </Label>
            <Input
              id="lastName"
              type="text"
              value={personalKyc.lastName}
              onChange={(e) => updatePersonalKyc({ lastName: e.target.value })}
              placeholder="ex: Popescu"
              className="bg-white placeholder:text-neutral-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-secondary-900 font-medium">
              Prenume <span className="text-red-500">*</span>
            </Label>
            <Input
              id="firstName"
              type="text"
              value={personalKyc.firstName}
              onChange={(e) => updatePersonalKyc({ firstName: e.target.value })}
              placeholder="ex: Ion"
              className="bg-white placeholder:text-neutral-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="birthDate" className="text-secondary-900 font-medium">
              Data Nașterii <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
              <Input
                id="birthDate"
                type="date"
                value={personalKyc.birthDate}
                onChange={(e) => updatePersonalKyc({ birthDate: e.target.value })}
                className="pl-10"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <p className="text-xs text-neutral-500">Se completează automat din CNP</p>
          </div>
          {/* Locul Nașterii — only for Romanian citizens.
              For foreign citizens, the city of birth + country are collected
              at step 1 (Contact) under "Date despre naștere". Don't ask twice. */}
          {personalKyc.citizenship === 'romanian' && (
            <div className="space-y-2">
              <Label htmlFor="birthPlace" className="text-secondary-900 font-medium">
                Locul Nașterii
              </Label>
              <Input
                id="birthPlace"
                type="text"
                value={personalKyc.birthPlace}
                onChange={(e) => updatePersonalKyc({ birthPlace: e.target.value })}
                placeholder="ex: București"
                className="bg-white placeholder:text-neutral-400"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="docExpiry" className="text-secondary-900 font-medium">
              Valabil Până La
            </Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
              <Input
                id="docExpiry"
                type="date"
                value={personalKyc.documentExpiry}
                onChange={(e) => updatePersonalKyc({ documentExpiry: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>
          {/* Cetățenie picker removed — handled at step 1 (Contact).
              The state is synced via useEffect above based on
              state.contact.citizenship + foreignType. */}
        </div>

        {/* Foreign-citizen birth fields moved to step 1 (Contact). Domicile
            toggle (Am domiciliu în România?) lives in the Address section
            below and gates Romanian vs foreign-address rendering. */}

        {/* Parent Names (if required) */}
        {config?.parentDataRequired && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="fatherName" className="text-secondary-900 font-medium">
                Prenume Tată
              </Label>
              <Input
                id="fatherName"
                type="text"
                value={personalKyc.fatherName || ''}
                onChange={(e) => updatePersonalKyc({ fatherName: e.target.value })}
                placeholder="ex: Gheorghe"
                className="bg-white placeholder:text-neutral-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motherName" className="text-secondary-900 font-medium">
                Prenume Mamă
              </Label>
              <Input
                id="motherName"
                type="text"
                value={personalKyc.motherName || ''}
                onChange={(e) => updatePersonalKyc({ motherName: e.target.value })}
                placeholder="ex: Maria"
                className="bg-white placeholder:text-neutral-400"
              />
            </div>
          </div>
        )}
      </div>
      )}
      {/* /Personal Info Section */}

      {/* Address Section
          Hidden entirely when the service config says
          requireAddressCertificate === 'never' AND citizenship === 'romanian'.
          Romanian citizens fall under this rule for services that don't need
          the domiciliu on the official form (e.g. cazier judiciar, migration
          039). Foreign citizens always see the section because we still need
          either a Romanian or a foreign address for the order. */}
      {!(
        config?.requireAddressCertificate === 'never' &&
        personalKyc.citizenship === 'romanian'
      ) && (
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-secondary-900">
          <MapPin className="h-5 w-5 text-primary-500" />
          <h3 className="font-semibold">Adresă de Domiciliu</h3>
        </div>

        {/* Romanian-domicile toggle — only for foreign citizens. Renders
            ABOVE the address fields and gates Romanian vs foreign rendering.
            Romanian citizens skip this and see Romanian fields directly. */}
        {personalKyc.citizenship !== 'romanian' && (
          <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3 sm:p-4 space-y-3">
            <div>
              <p className="text-secondary-900 font-medium text-sm">
                Am domiciliu în România? <span className="text-red-500">*</span>
              </p>
              <p className="text-xs text-neutral-500 mt-0.5 leading-snug">
                Dacă ai un domiciliu în România, completează adresa de mai jos.
                Dacă nu, completează adresa din străinătate.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {[
                { value: true, label: 'Da' },
                { value: false, label: 'Nu' },
              ].map((opt) => {
                const checked =
                  (personalKyc.foreignData?.hasRomanianAddress ?? true) ===
                  opt.value;
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    onClick={() =>
                      updatePersonalKyc({
                        foreignData: {
                          birthCity: personalKyc.foreignData?.birthCity || '',
                          birthCountry:
                            personalKyc.foreignData?.birthCountry || '',
                          hasRomanianAddress: opt.value,
                          foreignAddress:
                            personalKyc.foreignData?.foreignAddress,
                        },
                      })
                    }
                    aria-pressed={checked}
                    className={cn(
                      'rounded-xl border-2 px-3 py-2.5 text-center text-sm font-semibold transition-colors',
                      checked
                        ? 'border-primary-500 bg-primary-50 text-secondary-900 shadow-sm'
                        : 'border-neutral-200 bg-white text-neutral-700 hover:border-primary-300'
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Foreign address fields (when "Nu" is picked) — replaces the
            Romanian address grid below. */}
        {personalKyc.citizenship !== 'romanian' &&
          personalKyc.foreignData?.hasRomanianAddress === false && (
            <div className="space-y-3 rounded-xl border border-neutral-200 bg-white p-3 sm:p-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="foreignCountry"
                  className="text-secondary-900 font-medium"
                >
                  Țara de domiciliu <span className="text-red-500">*</span>
                </Label>
                <select
                  id="foreignCountry"
                  value={personalKyc.foreignData?.birthCountry || ''}
                  onChange={(e) =>
                    updatePersonalKyc({
                      foreignData: {
                        birthCity: personalKyc.foreignData?.birthCity || '',
                        birthCountry: e.target.value,
                        hasRomanianAddress: false,
                        foreignAddress:
                          personalKyc.foreignData?.foreignAddress,
                      },
                    })
                  }
                  className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="">Selectați țara</option>
                  {getCountriesForForeignType(state.contact.foreignType).map(
                    (c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="foreignAddress"
                  className="text-secondary-900 font-medium"
                >
                  Adresa completă din străinătate{' '}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="foreignAddress"
                  type="text"
                  value={personalKyc.foreignData?.foreignAddress || ''}
                  onChange={(e) =>
                    updatePersonalKyc({
                      foreignData: {
                        birthCity: personalKyc.foreignData?.birthCity || '',
                        birthCountry:
                          personalKyc.foreignData?.birthCountry || '',
                        hasRomanianAddress: false,
                        foreignAddress: e.target.value,
                      },
                    })
                  }
                  placeholder="Stradă, număr, oraș, cod poștal"
                  className="bg-white placeholder:text-neutral-400"
                />
              </div>
            </div>
          )}

        {/* Romanian address grid — shown when:
              - Romanian citizen (default)
              - OR foreign citizen with hasRomanianAddress === true (default)
            Hidden only when foreign + explicitly hasRomanianAddress === false. */}
        {!(
          personalKyc.citizenship !== 'romanian' &&
          personalKyc.foreignData?.hasRomanianAddress === false
        ) && (
        <>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="county" className="text-secondary-900 font-medium">
              Județ <span className="text-red-500">*</span>
            </Label>
            <Select
              value={personalKyc.address.county}
              onValueChange={handleCountyChange}
            >
              <SelectTrigger id="county" className="bg-white">
                <SelectValue placeholder="— Selectează județul —" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {COUNTY_NAMES.map((county) => (
                  <SelectItem key={county} value={county}>
                    {county}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="city" className="text-secondary-900 font-medium">
              Localitate <span className="text-red-500">*</span>
            </Label>
            {localities.length > 0 ? (
              <Select
                value={personalKyc.address.city}
                onValueChange={(value) => updatePersonalKyc({
                  address: { ...personalKyc.address, city: value }
                })}
              >
                <SelectTrigger id="city" className="bg-white">
                  <SelectValue placeholder="— Selectează localitatea —" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  {localities.map((locality) => (
                    <SelectItem key={locality} value={locality}>
                      {locality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="city"
                type="text"
                value={personalKyc.address.city}
                onChange={(e) => updatePersonalKyc({
                  address: { ...personalKyc.address, city: e.target.value }
                })}
                placeholder="Selectează mai întâi județul"
                className="bg-white placeholder:text-neutral-400"
                disabled={!personalKyc.address.county}
              />
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="street" className="text-secondary-900 font-medium">
              Strada <span className="text-red-500">*</span>
            </Label>
            <Input
              id="street"
              type="text"
              value={personalKyc.address.street}
              onChange={(e) => updatePersonalKyc({
                address: { ...personalKyc.address, street: e.target.value }
              })}
              placeholder="ex: Strada Victoriei"
              className="bg-white placeholder:text-neutral-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="number" className="text-secondary-900 font-medium">
              Nr. <span className="text-red-500">*</span>
            </Label>
            <Input
              id="number"
              type="text"
              value={personalKyc.address.number}
              onChange={(e) => updatePersonalKyc({
                address: { ...personalKyc.address, number: e.target.value }
              })}
              placeholder="ex: 10"
              className="bg-white placeholder:text-neutral-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="building" className="text-secondary-900 font-medium">
              Bloc
            </Label>
            <Input
              id="building"
              type="text"
              value={personalKyc.address.building || ''}
              onChange={(e) => updatePersonalKyc({
                address: { ...personalKyc.address, building: e.target.value }
              })}
              placeholder="A1"
              className="bg-white placeholder:text-neutral-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="staircase" className="text-secondary-900 font-medium">
              Scara
            </Label>
            <Input
              id="staircase"
              type="text"
              value={personalKyc.address.staircase || ''}
              onChange={(e) => updatePersonalKyc({
                address: { ...personalKyc.address, staircase: e.target.value }
              })}
              placeholder="A"
              className="bg-white placeholder:text-neutral-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="floor" className="text-secondary-900 font-medium">
              Etaj
            </Label>
            <Input
              id="floor"
              type="text"
              value={personalKyc.address.floor || ''}
              onChange={(e) => updatePersonalKyc({
                address: { ...personalKyc.address, floor: e.target.value }
              })}
              placeholder="3"
              className="bg-white placeholder:text-neutral-400"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apartment" className="text-secondary-900 font-medium">
              Apartament
            </Label>
            <Input
              id="apartment"
              type="text"
              value={personalKyc.address.apartment || ''}
              onChange={(e) => updatePersonalKyc({
                address: { ...personalKyc.address, apartment: e.target.value }
              })}
              placeholder="15"
              className="bg-white placeholder:text-neutral-400"
            />
          </div>
        </div>

        <div className="w-32 space-y-2">
          <Label htmlFor="postalCode" className="text-secondary-900 font-medium">
            Cod Poștal
          </Label>
          <Input
            id="postalCode"
            type="text"
            value={personalKyc.address.postalCode || ''}
            onChange={(e) => updatePersonalKyc({
              address: { ...personalKyc.address, postalCode: e.target.value }
            })}
            placeholder="010101"
            className="bg-white placeholder:text-neutral-400"
          />
        </div>
        </>
        )}
      </div>
      )}
      {/* /Address Section */}

      {/* Security Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Datele tale sunt în siguranță</p>
            <p className="text-blue-700">
              Informațiile personale sunt criptate și folosite exclusiv pentru procesarea comenzii.
              Nu le distribuim către terți.
            </p>
          </div>
        </div>
      </div>

      </>}
      {/* /Form fields conditional */}
    </div>
  );
}
