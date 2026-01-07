'use client';

/**
 * PersonalDataStep Component
 *
 * Collects personal data with OCR support for Romanian ID documents.
 * Supports: CI Vechi, CI Nou, Passport, Certificat Atestare Domiciliu.
 * Design matches the old wizard for consistency.
 */

import { useState, useCallback, useEffect } from 'react';
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
  X,
  FileCheck,
  Info,
  CreditCard,
  User,
  MapPin,
  Calendar,
} from 'lucide-react';
import type { PersonalKYCConfig, CitizenshipType, DocumentType } from '@/types/verification-modules';
import { validateCNP, extractBirthDateFromCNP } from '@/lib/validations/cnp';
import { cn } from '@/lib/utils';
import { COUNTY_NAMES, getLocalitiesForCounty, getCountyName, findCounty } from '@/lib/data/romania-counties';

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

export default function PersonalDataStep({ config, onValidChange }: PersonalDataStepProps) {
  const { state, updatePersonalKyc } = useModularWizard();
  const personalKyc = state.personalKyc;

  const [ciFrontScan, setCiFrontScan] = useState<ScanState>(initialScanState);
  const [ciBackScan, setCiBackScan] = useState<ScanState>(initialScanState);
  const [showScanSection, setShowScanSection] = useState(true);
  const [localities, setLocalities] = useState<string[]>([]);
  const [cnpInfo, setCnpInfo] = useState<string | null>(null);

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
        console.log('City cleaned:', addr.city, '→', cityName);
      }
      addressUpdates.city = cityName;
    }

    // Street - include streetType if provided
    if (addr.street) {
      addressUpdates.street = addr.streetType
        ? `${addr.streetType} ${addr.street}`
        : addr.street;
    }
    if (addr.number) addressUpdates.number = addr.number;
    if (addr.building) addressUpdates.building = addr.building;
    if (addr.staircase) addressUpdates.staircase = addr.staircase;
    if (addr.floor) addressUpdates.floor = addr.floor;
    if (addr.apartment) addressUpdates.apartment = addr.apartment;
    if (addr.postalCode) addressUpdates.postalCode = addr.postalCode;

    updatePersonalKyc({ address: addressUpdates });
  }, [personalKyc?.address, updatePersonalKyc, cleanLocalityName]);

  // Handle file select and OCR
  const handleFileSelect = useCallback(async (
    type: 'ci_front' | 'ci_back',
    file: File
  ) => {
    const setState = type === 'ci_front' ? setCiFrontScan : setCiBackScan;
    setState(prev => ({ ...prev, scanning: true, progress: 0, error: null }));

    try {
      // Create preview
      const reader = new FileReader();
      const previewPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const preview = await previewPromise;

      setState(prev => ({ ...prev, preview, progress: 20 }));

      // Extract base64
      const base64 = preview.split(',')[1];
      setState(prev => ({ ...prev, progress: 40 }));

      // Call OCR API
      const docType = type === 'ci_front' ? 'ci_front' : 'ci_back';
      const response = await fetch('/api/ocr/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'specific',
          imageBase64: base64,
          mimeType: file.type,
          documentType: docType,
        }),
      });

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

        // Update state with extracted data
        updatePersonalKyc({
          firstName: extracted.firstName || personalKyc?.firstName || '',
          lastName: extracted.lastName || personalKyc?.lastName || '',
          cnp: extracted.cnp || personalKyc?.cnp || '',
          birthDate: convertDateFormat(extracted.birthDate) || personalKyc?.birthDate || '',
          birthPlace: extracted.birthPlace || personalKyc?.birthPlace || '',
          documentSeries: extracted.series || personalKyc?.documentSeries || '',
          documentNumber: extracted.number || personalKyc?.documentNumber || '',
          documentExpiry: convertDateFormat(extracted.expiryDate) || personalKyc?.documentExpiry || '',
          documentIssueDate: convertDateFormat(extracted.issueDate) || personalKyc?.documentIssueDate || '',
          documentIssuedBy: extracted.issuedBy || personalKyc?.documentIssuedBy || '',
          documentType: ocr.documentType || type,
          isExpired: ocr.isExpired || false,
          requiresAddressCertificate: ocr.requiresAddressCertificate || false,
          // Note: Address will be filled separately using fillAddressFields
          fatherName: extracted.fatherName || personalKyc?.fatherName,
          motherName: extracted.motherName || personalKyc?.motherName,
          // Add to uploaded documents
          uploadedDocuments: [
            ...(personalKyc?.uploadedDocuments || []).filter(d => d.type !== type),
            {
              id: crypto.randomUUID(),
              type: ocr.documentType || type,
              fileName: file.name,
              fileSize: file.size,
              mimeType: file.type,
              uploadedAt: new Date().toISOString(),
              base64,
            },
          ],
          ocrResults: [
            ...(personalKyc?.ocrResults || []).filter(r => r.documentType !== type),
            {
              documentType: ocr.documentType || type,
              success: true,
              confidence: ocr.confidence || 0.9,
              extractedData: extracted,
              issues: ocr.issues || [],
              processedAt: new Date().toISOString(),
            },
          ],
        });

        // Fill address fields using the helper (handles county conversion, city cleaning, etc.)
        if (extracted.address) {
          console.log('Address found in OCR:', JSON.stringify(extracted.address, null, 2));
          fillAddressFields(extracted.address);
        }

        setState(prev => ({ ...prev, scanning: false, progress: 100, success: true }));
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
    }
  }, [personalKyc, updatePersonalKyc, fillAddressFields]);

  // Reset scan
  const resetScan = useCallback((type: 'ci_front' | 'ci_back') => {
    const setState = type === 'ci_front' ? setCiFrontScan : setCiBackScan;
    setState(initialScanState);

    // Remove from uploaded documents
    if (personalKyc?.uploadedDocuments) {
      updatePersonalKyc({
        uploadedDocuments: personalKyc.uploadedDocuments.filter(d => d.type !== type),
        ocrResults: personalKyc.ocrResults?.filter(r => r.documentType !== type) || [],
      });
    }
  }, [personalKyc, updatePersonalKyc]);

  // Handle CNP change with validation
  const handleCNPChange = useCallback((value: string) => {
    const cleanCNP = value.replace(/\D/g, '').slice(0, 13);
    updatePersonalKyc({ cnp: cleanCNP });

    // Auto-fill birth date from CNP if valid
    if (cleanCNP.length === 13) {
      const result = validateCNP(cleanCNP);
      if (result.valid && result.data) {
        setCnpInfo(`${result.data.gender === 'male' ? 'Bărbat' : 'Femeie'}, ${result.data.age} ani`);
        const birthDate = result.data.birthDate;
        updatePersonalKyc({
          birthDate: birthDate.toISOString().split('T')[0],
        });
      } else {
        setCnpInfo(result.errors[0] || 'CNP invalid');
      }
    } else {
      setCnpInfo(null);
    }
  }, [updatePersonalKyc]);

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
      address: { ...personalKyc?.address, county: countyName, city: newCity }
    });
  }, [personalKyc?.address, updatePersonalKyc, cleanLocalityName]);

  // Initialize localities when component loads (for restored data)
  useEffect(() => {
    if (personalKyc?.address?.county) {
      const countyLocalities = getLocalitiesForCounty(personalKyc.address.county);
      setLocalities(countyLocalities);
    }
  }, [personalKyc?.address?.county]);

  // Validate form
  const isFormValid = useCallback(() => {
    if (!personalKyc) return false;

    const cnpValidation = validateCNP(personalKyc.cnp);
    if (!cnpValidation.valid) return false;

    if (!personalKyc.firstName.trim()) return false;
    if (!personalKyc.lastName.trim()) return false;
    if (!personalKyc.birthDate) return false;

    // Check document requirements (with defensive checks)
    const acceptedDocs = config?.acceptedDocuments ?? [];
    const uploadedDocs = personalKyc?.uploadedDocuments ?? [];
    if (acceptedDocs.length > 0 && uploadedDocs.length === 0) {
      return false;
    }

    // Check if expired document is allowed
    if (personalKyc?.isExpired && !config?.expiredDocumentAllowed) {
      return false;
    }

    return true;
  }, [personalKyc, config]);

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

  // Render scan card (matches old wizard design)
  const renderScanCard = (
    type: 'ci_front' | 'ci_back',
    title: string,
    description: string
  ) => {
    const scanState = type === 'ci_front' ? ciFrontScan : ciBackScan;
    const existingDoc = personalKyc?.uploadedDocuments?.find(d =>
      d.type === type || d.type === (type === 'ci_front' ? 'ci_nou_front' : 'ci_nou_back')
    );

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
            <img
              src={scanState.preview || (existingDoc?.base64 ? `data:${existingDoc.mimeType};base64,${existingDoc.base64}` : '')}
              alt={title}
              className="w-full h-full object-contain"
            />
            {scanState.scanning && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                <span className="text-white text-sm font-medium">
                  Scanare... {scanState.progress}%
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
          <div className="relative">
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(type, file);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={scanState.scanning}
            />
            <div className="border-2 border-dashed border-primary-300 rounded-lg p-3 text-center hover:border-primary-500 hover:bg-primary-50/50 transition-all cursor-pointer group">
              {/* Show illustration */}
              <div className="mb-3 opacity-80 group-hover:opacity-100 transition-opacity">
                {type === 'ci_front' ? (
                  <IdCardFrontIllustration className="w-full h-auto max-h-24" />
                ) : (
                  <IdCardBackIllustration className="w-full h-auto max-h-24" />
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
                JPG sau PNG, max 10MB
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
      {/* ID Scan Section */}
      {showScanSection && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-secondary-900">
              <Scan className="h-5 w-5 text-primary-500" />
              <h3 className="font-semibold">Scanează Actul de Identitate</h3>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowScanSection(false)}
              className="text-neutral-500 text-xs"
            >
              Completez manual
            </Button>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 mb-4">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Completare automată rapidă</p>
                <p className="text-blue-700 text-xs">
                  Fotografiază cartea de identitate și datele se vor completa automat.
                  Acceptăm CI românești sau pașapoarte.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {renderScanCard(
              'ci_front',
              'Carte Identitate - Față',
              'CNP, nume, adresă (CI vechi)'
            )}
            {renderScanCard(
              'ci_back',
              'Verso (opțional)',
              'Doar pentru CI-uri noi cu adresa pe spate'
            )}
          </div>

          {(ciFrontScan.success || ciBackScan.success || personalKyc.uploadedDocuments.length > 0) && (
            <div className="text-center text-xs text-neutral-500 pt-2">
              <CheckCircle className="w-4 h-4 inline mr-1" />
              Documentele scanate vor fi folosite și la pasul de verificare KYC
            </div>
          )}
        </div>
      )}

      {/* Manual Entry Link */}
      {!showScanSection && (
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
        <div className="flex items-center gap-2 text-secondary-900">
          <CreditCard className="h-5 w-5 text-primary-500" />
          <h3 className="font-semibold">Identificare</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cnp" className="text-secondary-900 font-medium">
            CNP (Cod Numeric Personal) <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="cnp"
              type="text"
              inputMode="numeric"
              maxLength={13}
              value={personalKyc.cnp}
              onChange={(e) => handleCNPChange(e.target.value)}
              placeholder="1234567890123"
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
          {cnpValidation.valid && personalKyc.cnp.length === 13 && (
            <p className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              {cnpInfo || 'CNP valid'}
            </p>
          )}
          <p className="text-sm text-neutral-500 flex items-start gap-1">
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            CNP-ul se găsește pe cartea de identitate
          </p>
        </div>

        {/* Document Series and Number */}
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
      </div>

      {/* Personal Info Section */}
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
          <div className="space-y-2">
            <Label htmlFor="citizenship" className="text-secondary-900 font-medium">
              Cetățenie
            </Label>
            <Select
              value={personalKyc.citizenship}
              onValueChange={(value: CitizenshipType) => updatePersonalKyc({ citizenship: value })}
            >
              <SelectTrigger id="citizenship">
                <SelectValue placeholder="Selectează cetățenia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="romanian">Română</SelectItem>
                <SelectItem value="european">UE / SEE</SelectItem>
                <SelectItem value="foreign">Non-UE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

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

      {/* Address Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-secondary-900">
          <MapPin className="h-5 w-5 text-primary-500" />
          <h3 className="font-semibold">Adresă de Domiciliu</h3>
        </div>

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
      </div>

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
    </div>
  );
}
