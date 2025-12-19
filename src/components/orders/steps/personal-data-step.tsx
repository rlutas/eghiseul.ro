'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Calendar,
  MapPin,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Info,
  Camera,
  Upload,
  Loader2,
  Scan,
  X,
  FileCheck,
} from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOrderWizard } from '@/providers/order-wizard-provider';
import { validateCNP } from '@/lib/validations/cnp';
import { cn } from '@/lib/utils';
import { COUNTY_NAMES, findCounty, getCountyName, getLocalitiesForCounty } from '@/lib/data/romania-counties';

// CNP validation schema with custom validator
const personalDataSchema = z.object({
  cnp: z.string()
    .min(13, 'CNP-ul trebuie să conțină 13 cifre')
    .max(13, 'CNP-ul trebuie să conțină 13 cifre')
    .refine((val) => validateCNP(val).valid, {
      message: 'CNP invalid - verifică cifrele introduse',
    }),
  ci_series: z.string()
    .min(2, 'Seria trebuie să aibă 2 caractere')
    .max(2, 'Seria trebuie să aibă 2 caractere')
    .regex(/^[A-Z]{2}$/, 'Seria trebuie să conțină 2 litere mari'),
  ci_number: z.string()
    .min(6, 'Numărul trebuie să aibă 6 cifre')
    .max(6, 'Numărul trebuie să aibă 6 cifre')
    .regex(/^\d{6}$/, 'Numărul trebuie să conțină 6 cifre'),
  first_name: z.string()
    .min(2, 'Prenumele trebuie să aibă cel puțin 2 caractere')
    .max(50, 'Prenumele poate avea maxim 50 caractere')
    // Include all Romanian diacritics (both comma-below and cedilla variants)
    // Also include common foreign characters for names (É, Ö, Ü, etc.)
    .regex(/^[a-zA-ZăâîșțĂÂÎȘȚşŞţŢéÉèÈêÊëËöÖüÜáÁíÍóÓúÚñÑ\s'-]+$/, 'Prenumele poate conține doar litere'),
  last_name: z.string()
    .min(2, 'Numele trebuie să aibă cel puțin 2 caractere')
    .max(50, 'Numele poate avea maxim 50 caractere')
    // Include all Romanian diacritics (both comma-below and cedilla variants)
    .regex(/^[a-zA-ZăâîșțĂÂÎȘȚşŞţŢéÉèÈêÊëËöÖüÜáÁíÍóÓúÚñÑ\s'-]+$/, 'Numele poate conține doar litere'),
  birth_date: z.string().min(1, 'Data nașterii este obligatorie'),
  birth_place: z.string()
    .min(2, 'Locul nașterii este obligatoriu')
    .max(100, 'Locul nașterii poate avea maxim 100 caractere'),
  address: z.object({
    street: z.string().min(2, 'Strada este obligatorie'),
    number: z.string().min(1, 'Numărul este obligatoriu'),
    building: z.string().optional(),
    staircase: z.string().optional(), // Scara
    floor: z.string().optional(), // Etaj
    apartment: z.string().optional(),
    county: z.string().min(1, 'Județul este obligatoriu'),
    city: z.string().min(2, 'Localitatea este obligatorie'),
    postal_code: z.string()
      .regex(/^(\d{6})?$/, 'Codul poștal trebuie să aibă 6 cifre')
      .optional()
      .or(z.literal('')),
  }),
});

type PersonalDataFormData = z.infer<typeof personalDataSchema>;

interface PersonalDataStepProps {
  onValidChange: (valid: boolean) => void;
}

// Document scan states
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

export function PersonalDataStep({ onValidChange }: PersonalDataStepProps) {
  const { state, updatePersonalData, updateKYCDocuments } = useOrderWizard();
  const [cnpStatus, setCnpStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [cnpInfo, setCnpInfo] = useState<string | null>(null);

  // Document scanning states
  const [ciFrontScan, setCiFrontScan] = useState<ScanState>(initialScanState);
  const [ciBackScan, setCiBackScan] = useState<ScanState>(initialScanState);
  const [showScanSection, setShowScanSection] = useState(true);

  // Localities for selected county
  const [localities, setLocalities] = useState<string[]>([]);

  // Ref to track if we're updating from context (to prevent loops)
  const isUpdatingFromContext = useRef(false);
  const lastFormValues = useRef<string>('');

  const form = useForm<PersonalDataFormData>({
    resolver: zodResolver(personalDataSchema),
    defaultValues: {
      cnp: state.personalData.cnp || '',
      ci_series: state.personalData.ci_series || '',
      ci_number: state.personalData.ci_number || '',
      first_name: state.personalData.first_name || '',
      last_name: state.personalData.last_name || '',
      birth_date: state.personalData.birth_date || '',
      birth_place: state.personalData.birth_place || '',
      address: {
        street: state.personalData.address?.street || '',
        number: state.personalData.address?.number || '',
        building: state.personalData.address?.building || '',
        staircase: state.personalData.address?.staircase || '',
        floor: state.personalData.address?.floor || '',
        apartment: state.personalData.address?.apartment || '',
        city: state.personalData.address?.city || '',
        county: state.personalData.address?.county || '',
        postal_code: state.personalData.address?.postal_code || '',
      },
    },
    mode: 'onChange',
  });

  const { isValid } = form.formState;

  // Update parent validity
  useEffect(() => {
    onValidChange(isValid);
  }, [isValid, onValidChange]);

  // Helper function to clean locality names from prefixes (sat, com., comună, etc.)
  const cleanLocalityName = useCallback((name: string): string => {
    if (!name) return name;

    // Remove common prefixes: sat, sat., com, com., comună, comuna, oras, oraș, mun, mun., municipiul
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

  // Watch county and update localities list
  const selectedCounty = form.watch('address.county');
  useEffect(() => {
    if (selectedCounty) {
      const countyLocalities = getLocalitiesForCounty(selectedCounty);
      setLocalities(countyLocalities);

      // If current city isn't in the new localities list, try to match
      // This handles OCR values like "sat Odoreu" → "Odoreu"
      const currentCity = form.getValues('address.city');
      if (currentCity && countyLocalities.length > 0 && !countyLocalities.includes(currentCity)) {
        // First, clean the city name (remove sat, com., etc.)
        const cleanedCity = cleanLocalityName(currentCity);

        // Check if cleaned name matches exactly
        if (countyLocalities.includes(cleanedCity)) {
          form.setValue('address.city', cleanedCity, { shouldValidate: true });
        } else {
          // Check for partial match
          const matchingLocality = countyLocalities.find(
            loc => loc.toLowerCase().includes(cleanedCity.toLowerCase()) ||
                   cleanedCity.toLowerCase().includes(loc.toLowerCase())
          );
          if (matchingLocality) {
            form.setValue('address.city', matchingLocality, { shouldValidate: true });
          }
        }
      }
    } else {
      setLocalities([]);
    }
  }, [selectedCounty, form, cleanLocalityName]);

  // Debounced update to context
  const debouncedUpdate = useCallback(
    (value: Partial<PersonalDataFormData>) => {
      const valueString = JSON.stringify(value);
      // Only update if values actually changed
      if (valueString !== lastFormValues.current && !isUpdatingFromContext.current) {
        lastFormValues.current = valueString;
        updatePersonalData(value);
      }
    },
    [updatePersonalData]
  );

  // Update context when form changes (with debounce)
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Use setTimeout to debounce updates
      const timeoutId = setTimeout(() => {
        debouncedUpdate(value as Partial<PersonalDataFormData>);
      }, 100);
      return () => clearTimeout(timeoutId);
    });
    return () => subscription.unsubscribe();
  }, [form, debouncedUpdate]);

  // Handle CNP validation and auto-fill birth date
  const handleCNPChange = (value: string) => {
    // Only allow digits
    const digits = value.replace(/\D/g, '').slice(0, 13);
    form.setValue('cnp', digits, { shouldValidate: true });

    if (digits.length === 13) {
      const result = validateCNP(digits);
      if (result.valid && result.data) {
        setCnpStatus('valid');
        setCnpInfo(`${result.data.gender === 'male' ? 'Bărbat' : 'Femeie'}, ${result.data.age} ani`);

        // Auto-fill birth date
        const birthDate = result.data.birthDate;
        const formattedDate = birthDate.toISOString().split('T')[0];
        form.setValue('birth_date', formattedDate, { shouldValidate: true });
      } else {
        setCnpStatus('invalid');
        setCnpInfo(result.errors[0] || 'CNP invalid');
      }
    } else {
      setCnpStatus('idle');
      setCnpInfo(null);
    }
  };

  // Helper function to fill address fields from OCR data
  const fillAddressFields = useCallback((addr: {
    fullAddress?: string;
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

    // County - first, as city might depend on it
    // Handle abbreviations like "SM" → "Satu Mare"
    if (addr.county) {
      const countyName = getCountyName(addr.county);
      console.log('County mapping:', addr.county, '→', countyName);
      if (countyName && COUNTY_NAMES.includes(countyName)) {
        form.setValue('address.county', countyName, { shouldValidate: true });
      }
    }

    // City - for București, include sector
    // Also clean prefixes like "sat", "com.", "comună" for villages
    if (addr.city) {
      let cityName = addr.city;
      const countyMatch = findCounty(addr.county);

      if (addr.sector && (countyMatch?.name === 'București' || addr.city?.toLowerCase().includes('bucurești'))) {
        cityName = `București, Sector ${addr.sector}`;
      } else {
        // Clean village/commune prefixes: "sat Odoreu" → "Odoreu"
        cityName = cleanLocalityName(cityName);
        console.log('City cleaned:', addr.city, '→', cityName);
      }

      form.setValue('address.city', cityName, { shouldValidate: true });
    }

    // Street - can include streetType if provided
    if (addr.street) {
      const streetName = addr.streetType
        ? `${addr.streetType} ${addr.street}`
        : addr.street;
      form.setValue('address.street', streetName, { shouldValidate: true });
    }
    if (addr.number) {
      form.setValue('address.number', addr.number, { shouldValidate: true });
    }
    if (addr.building) {
      form.setValue('address.building', addr.building, { shouldValidate: true });
    }
    if (addr.staircase) {
      form.setValue('address.staircase', addr.staircase, { shouldValidate: true });
    }
    if (addr.floor) {
      form.setValue('address.floor', addr.floor, { shouldValidate: true });
    }
    if (addr.apartment) {
      form.setValue('address.apartment', addr.apartment, { shouldValidate: true });
    }
    if (addr.postalCode) {
      form.setValue('address.postal_code', addr.postalCode, { shouldValidate: true });
    }
  }, [form, cleanLocalityName]);

  // Handle file selection for scanning
  const handleFileSelect = async (
    type: 'ci_front' | 'ci_back',
    file: File
  ) => {
    const setState = type === 'ci_front' ? setCiFrontScan : setCiBackScan;

    // Validate file
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setState(prev => ({ ...prev, error: 'Format invalid. Acceptăm doar JPEG sau PNG.' }));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setState(prev => ({ ...prev, error: 'Fișierul este prea mare. Limita este 10MB.' }));
      return;
    }

    // Create preview and start scanning
    const preview = URL.createObjectURL(file);
    setState({ scanning: true, progress: 10, error: null, success: false, preview });

    try {
      // Read file as base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const imageBase64 = await base64Promise;

      setState(prev => ({ ...prev, progress: 30 }));

      // Call OCR API
      const response = await fetch('/api/ocr/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'specific',
          documentType: type,
          imageBase64,
          mimeType: file.type,
        }),
      });

      setState(prev => ({ ...prev, progress: 70 }));

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'OCR failed');
      }

      const ocr = result.data?.ocr;
      setState(prev => ({ ...prev, progress: 90 }));

      // Debug logging for OCR response
      console.log('OCR Response for', type, ':', JSON.stringify(ocr, null, 2));

      if (ocr?.success && ocr.confidence >= 50) {
        // Extract and fill form data
        const extracted = ocr.extractedData;

        if (type === 'ci_front') {
          // Fill personal data from CI front
          if (extracted.cnp) {
            handleCNPChange(extracted.cnp);
          }
          if (extracted.lastName) {
            form.setValue('last_name', extracted.lastName, { shouldValidate: true });
          }
          if (extracted.firstName) {
            form.setValue('first_name', extracted.firstName, { shouldValidate: true });
          }
          if (extracted.birthDate) {
            // Convert DD.MM.YYYY to YYYY-MM-DD
            const match = extracted.birthDate.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
            if (match) {
              const [, day, month, year] = match;
              form.setValue('birth_date', `${year}-${month}-${day}`, { shouldValidate: true });
            }
          }
          if (extracted.birthPlace) {
            form.setValue('birth_place', extracted.birthPlace, { shouldValidate: true });
          }

          // CI Series and Number
          if (extracted.series) {
            form.setValue('ci_series', extracted.series.toUpperCase(), { shouldValidate: true });
          }
          if (extracted.number) {
            form.setValue('ci_number', extracted.number, { shouldValidate: true });
          }

          // For OLD CI format - address might be on front side!
          // Check if address was extracted from CI front (old Romanian ID cards)
          const addr = extracted.address;
          if (addr) {
            console.log('Address found on CI FRONT (old format):', JSON.stringify(addr, null, 2));
            fillAddressFields(addr);
          }

          // Store document for KYC step
          updateKYCDocuments({
            ci_front: {
              file_url: preview,
              uploaded_at: new Date().toISOString(),
              file_size: file.size,
              mime_type: file.type,
              validation_result: {
                valid: true,
                confidence: ocr.confidence,
                documentType: 'ci_front',
                extractedData: extracted,
                issues: ocr.issues || [],
                suggestions: ocr.suggestions || [],
              },
            },
          });
        } else {
          // Fill address from CI back
          const addr = extracted.address;
          console.log('Address data for ci_back:', JSON.stringify(addr, null, 2));
          if (addr) {
            fillAddressFields(addr);
          }

          // Store document for KYC step
          updateKYCDocuments({
            ci_back: {
              file_url: preview,
              uploaded_at: new Date().toISOString(),
              file_size: file.size,
              mime_type: file.type,
              validation_result: {
                valid: true,
                confidence: ocr.confidence,
                documentType: 'ci_back',
                extractedData: extracted,
                issues: ocr.issues || [],
                suggestions: ocr.suggestions || [],
              },
            },
          });
        }

        setState(prev => ({ ...prev, scanning: false, progress: 100, success: true }));
      } else {
        // Log why extraction failed
        console.warn('OCR extraction failed or low confidence:', {
          success: ocr?.success,
          confidence: ocr?.confidence,
          issues: ocr?.issues,
        });
        const confidenceMsg = ocr?.confidence !== undefined && ocr.confidence < 50
          ? ` (încredere: ${ocr.confidence}%)`
          : '';
        const errorMsg = ocr?.issues?.join('. ') || `Nu s-au putut extrage datele din document${confidenceMsg}`;
        setState(prev => ({ ...prev, scanning: false, error: errorMsg }));
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Eroare la scanare';
      setState(prev => ({ ...prev, scanning: false, error: errorMsg }));
    }
  };

  // Reset scan
  const resetScan = (type: 'ci_front' | 'ci_back') => {
    const setState = type === 'ci_front' ? setCiFrontScan : setCiBackScan;
    setState(initialScanState);
    updateKYCDocuments({ [type]: undefined });
  };

  // Render scan card
  const renderScanCard = (
    type: 'ci_front' | 'ci_back',
    title: string,
    description: string
  ) => {
    const scanState = type === 'ci_front' ? ciFrontScan : ciBackScan;
    const existingDoc = type === 'ci_front' ? state.kycDocuments.ci_front : state.kycDocuments.ci_back;

    const hasUpload = scanState.preview || existingDoc;
    const isSuccess = scanState.success || existingDoc?.validation_result?.valid;

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
              src={scanState.preview || existingDoc?.file_url}
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
            <div className="border border-neutral-200 rounded-lg p-4 text-center hover:bg-neutral-50 transition-colors">
              <div className="flex justify-center gap-2 mb-2">
                <Camera className="w-5 h-5 text-neutral-400" />
                <Upload className="w-5 h-5 text-neutral-400" />
              </div>
              <p className="text-xs text-neutral-600">
                Fotografiază sau încarcă
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
    <Form {...form}>
      <form className="space-y-8">
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

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4">
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

            {(ciFrontScan.success || ciBackScan.success || state.kycDocuments.ci_front || state.kycDocuments.ci_back) && (
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

        {/* CNP Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-secondary-900">
            <CreditCard className="h-5 w-5 text-primary-500" />
            <h3 className="font-semibold">Identificare</h3>
          </div>

          <FormField
            control={form.control}
            name="cnp"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-secondary-900 font-medium">
                  CNP (Cod Numeric Personal) <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      {...field}
                      type="text"
                      inputMode="numeric"
                      placeholder="1234567890123"
                      maxLength={13}
                      className={cn(
                        'font-mono text-lg tracking-wider pr-10 bg-white placeholder:text-neutral-400',
                        cnpStatus === 'valid' && 'border-green-500 focus-visible:ring-green-500',
                        cnpStatus === 'invalid' && 'border-red-500 focus-visible:ring-red-500'
                      )}
                      onChange={(e) => handleCNPChange(e.target.value)}
                    />
                    {cnpStatus === 'valid' && (
                      <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                    )}
                    {cnpStatus === 'invalid' && (
                      <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                    )}
                  </div>
                </FormControl>
                {cnpInfo && (
                  <p className={cn(
                    'text-sm flex items-center gap-1',
                    cnpStatus === 'valid' ? 'text-green-600' : 'text-red-600'
                  )}>
                    {cnpStatus === 'valid' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    {cnpInfo}
                  </p>
                )}
                <FormDescription className="flex items-start gap-1">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  CNP-ul se găsește pe cartea de identitate
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* CI Series and Number */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="ci_series"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-secondary-900 font-medium">
                    Seria CI <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="ex: XV"
                      maxLength={2}
                      className="font-mono text-lg tracking-wider uppercase bg-white placeholder:text-neutral-400"
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ci_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-secondary-900 font-medium">
                    Număr CI <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      inputMode="numeric"
                      placeholder="ex: 517628"
                      maxLength={6}
                      className="font-mono text-lg tracking-wider bg-white placeholder:text-neutral-400"
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Personal Info Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-secondary-900">
            <User className="h-5 w-5 text-primary-500" />
            <h3 className="font-semibold">Date Personale</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-secondary-900 font-medium">
                    Nume <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ex: Popescu" className="bg-white placeholder:text-neutral-400" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-secondary-900 font-medium">
                    Prenume <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ex: Ion" className="bg-white placeholder:text-neutral-400" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="birth_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-secondary-900 font-medium">
                    Data Nașterii <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <Input
                        {...field}
                        type="date"
                        className="pl-10"
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Se completează automat din CNP
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birth_place"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-secondary-900 font-medium">
                    Locul Nașterii <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ex: București" className="bg-white placeholder:text-neutral-400" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Address Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-secondary-900">
            <MapPin className="h-5 w-5 text-primary-500" />
            <h3 className="font-semibold">Adresă de Domiciliu</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <FormField
                control={form.control}
                name="address.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-secondary-900 font-medium">
                      Strada <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ex: Strada Victoriei" className="bg-white placeholder:text-neutral-400" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address.number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-secondary-900 font-medium">
                    Nr. <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ex: 10" className="bg-white placeholder:text-neutral-400" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* County and City - County first! */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="address.county"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-secondary-900 font-medium">
                    Județ <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="— Selectează județul —" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[300px]">
                      {COUNTY_NAMES.map((county) => (
                        <SelectItem key={county} value={county}>
                          {county}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-secondary-900 font-medium">
                    Localitate <span className="text-red-500">*</span>
                  </FormLabel>
                  {localities.length > 0 ? (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white">
                          <SelectValue placeholder="— Selectează localitatea —" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[300px]">
                        {localities.map((locality) => (
                          <SelectItem key={locality} value={locality}>
                            {locality}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={selectedCounty ? "Se încarcă localitățile..." : "Selectează mai întâi județul"}
                        className="bg-white placeholder:text-neutral-400"
                        disabled={!selectedCounty}
                      />
                    </FormControl>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Building details */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <FormField
              control={form.control}
              name="address.building"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-secondary-900 font-medium">
                    Bloc
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ex: A1" className="bg-white placeholder:text-neutral-400" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.staircase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-secondary-900 font-medium">
                    Scara
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ex: A" className="bg-white placeholder:text-neutral-400" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.floor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-secondary-900 font-medium">
                    Etaj
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ex: 3" className="bg-white placeholder:text-neutral-400" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.apartment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-secondary-900 font-medium">
                    Ap.
                  </FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="ex: 25" className="bg-white placeholder:text-neutral-400" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address.postal_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-secondary-900 font-medium">
                    Cod Poștal
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="text"
                      inputMode="numeric"
                      placeholder="ex: 010101"
                      className="bg-white placeholder:text-neutral-400"
                      maxLength={6}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                        field.onChange(digits);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Info Box */}
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
      </form>
    </Form>
  );
}
