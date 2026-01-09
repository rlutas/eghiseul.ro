'use client';

/**
 * KYCTab Component
 *
 * Displays KYC verification status with individual document cards.
 * Each document type (ID front, ID back, Selfie) shown separately.
 */

import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock,
  Scan,
  Loader2,
  Upload,
  Camera,
  X,
  Eye,
  EyeOff,
  User,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useKycStatus, type KycStatus } from '@/hooks/useKycStatus';
import { useAddresses } from '@/hooks/useAddresses';
import { useBillingProfiles } from '@/hooks/useBillingProfiles';
import type { ExtractedIdData } from '@/components/shared/IdScanner';

interface KYCTabProps {
  className?: string;
}

// Document type configuration
const DOCUMENT_TYPES = {
  ci_front: {
    label: 'Act Identitate - Față',
    shortLabel: 'CI Față',
    description: 'CNP, nume, prenume',
    icon: CreditCard,
    color: 'amber',
    requiredForKyc: true,
  },
  ci_back: {
    label: 'Act Identitate - Verso',
    shortLabel: 'CI Verso',
    description: 'Adresă (CI noi)',
    icon: CreditCard,
    color: 'amber',
    requiredForKyc: false,
  },
  selfie: {
    label: 'Selfie cu Actul',
    shortLabel: 'Selfie',
    description: 'Verificare identitate',
    icon: User,
    color: 'blue',
    requiredForKyc: true,
  },
} as const;

type DocumentTypeKey = keyof typeof DOCUMENT_TYPES;

export default function KYCTab({ className }: KYCTabProps) {
  const {
    status,
    expiresAt,
    daysUntilExpiry,
    isVerified,
    isExpiring,
    isExpired,
    isPartial,
    hasFrontId,
    hasSelfie,
    hasAllRequired,
    documents,
    isLoading: kycLoading,
    error: kycError,
    saveDocument,
    refresh: refreshKyc,
  } = useKycStatus();

  const { addresses, create: createAddress, update: updateAddress } = useAddresses();
  const { profiles, createFromIdData: createBillingFromId, update: updateBillingProfile } = useBillingProfiles();

  const [uploadingType, setUploadingType] = useState<DocumentTypeKey | null>(null);
  const [processingOcr, setProcessingOcr] = useState<DocumentTypeKey | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Get document by type (handle aliases like ci_nou_front -> ci_front)
  const getDocumentByType = useCallback((type: DocumentTypeKey) => {
    const typeAliases: Record<string, string[]> = {
      ci_front: ['ci_front', 'ci_nou_front'],
      ci_back: ['ci_back', 'ci_nou_back'],
      selfie: ['selfie', 'selfie_with_id'],
    };
    const aliases = typeAliases[type] || [type];
    return documents.find(d => aliases.includes(d.documentType));
  }, [documents]);

  // Handle file upload
  const handleFileUpload = useCallback(async (type: DocumentTypeKey, file: File) => {
    setUploadError(null);
    setSaveSuccess(false);

    try {
      // Create base64 preview
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const dataUrl = await base64Promise;
      const base64 = dataUrl.split(',')[1];

      // For ID documents (front/back), run OCR
      if (type === 'ci_front' || type === 'ci_back') {
        setProcessingOcr(type);

        // Call OCR API
        const ocrResponse = await fetch('/api/ocr/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'specific',
            imageBase64: base64,
            mimeType: file.type,
            documentType: type,
          }),
        });

        if (!ocrResponse.ok) {
          const errorData = await ocrResponse.json().catch(() => ({}));
          throw new Error(errorData.error?.message || 'OCR processing failed');
        }

        const ocrResult = await ocrResponse.json();
        const ocr = ocrResult.data?.ocr;

        if (!ocr?.success || ocr.confidence < 50) {
          throw new Error(`Nu am putut citi documentul. Asigură-te că imaginea este clară.`);
        }

        // Save KYC document with extracted data
        await saveDocument({
          documentType: type,
          fileUrl: dataUrl,
          fileSize: file.size,
          mimeType: file.type,
          extractedData: ocr.extractedData,
          validationResult: { confidence: ocr.confidence, issues: ocr.issues },
          documentExpiry: ocr.extractedData?.expiryDate,
        });

        // Auto-create address and billing profile from front ID
        if (type === 'ci_front' && ocr.extractedData) {
          await autoCreateUserData(ocr.extractedData);
        }
      } else {
        // For selfie, just save without OCR
        await saveDocument({
          documentType: 'selfie',
          fileUrl: dataUrl,
          fileSize: file.size,
          mimeType: file.type,
          extractedData: {},
        });
      }

      setSaveSuccess(true);
      await refreshKyc();

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err instanceof Error ? err.message : 'Eroare la încărcare');
    } finally {
      setUploadingType(null);
      setProcessingOcr(null);
    }
  }, [saveDocument, refreshKyc]);

  // Auto-create address and billing profile
  const autoCreateUserData = useCallback(async (extractedData: ExtractedIdData) => {
    try {
      // Create address if we have address data
      if (extractedData.address) {
        const addr = extractedData.address;
        const existingAddress = addresses.find(a =>
          a.street?.toLowerCase().includes((addr.street || '').toLowerCase()) &&
          a.number === addr.number
        );

        if (existingAddress) {
          // Update existing
          await updateAddress(existingAddress.id, {
            label: 'Adresă din act',
            country: 'RO',
            county: addr.county || existingAddress.county,
            city: addr.city || addr.sector || existingAddress.city,
            street: addr.street ? `${addr.streetType || ''} ${addr.street}`.trim() : existingAddress.street,
            number: addr.number || existingAddress.number,
            building: addr.building,
            staircase: addr.staircase,
            floor: addr.floor,
            apartment: addr.apartment,
            postalCode: addr.postalCode,
          });
        } else {
          // Create new
          await createAddress({
            label: 'Adresă din act',
            country: 'RO',
            county: addr.county || '',
            city: addr.city || addr.sector || '',
            street: addr.street ? `${addr.streetType || ''} ${addr.street}`.trim() : '',
            number: addr.number || '',
            building: addr.building,
            staircase: addr.staircase,
            floor: addr.floor,
            apartment: addr.apartment,
            postalCode: addr.postalCode,
            isDefault: addresses.length === 0,
          });
        }
      }

      // Create PF billing profile
      if (extractedData.firstName || extractedData.lastName || extractedData.cnp) {
        const existingProfile = profiles.find(p => p.cnp === extractedData.cnp);

        if (existingProfile) {
          const addr = extractedData.address || {};
          const addressParts = [
            addr.street,
            addr.number ? `Nr. ${addr.number}` : null,
            addr.building ? `Bl. ${addr.building}` : null,
            addr.apartment ? `Ap. ${addr.apartment}` : null,
            addr.city,
            addr.county,
          ].filter(Boolean);

          await updateBillingProfile(existingProfile.id, {
            firstName: extractedData.firstName || existingProfile.firstName,
            lastName: extractedData.lastName || existingProfile.lastName,
            address: addressParts.join(', ') || existingProfile.address,
          });
        } else {
          await createBillingFromId(extractedData);
        }
      }
    } catch (err) {
      console.error('Auto-create user data error:', err);
      // Non-blocking error
    }
  }, [addresses, profiles, createAddress, updateAddress, createBillingFromId, updateBillingProfile]);

  // Get overall KYC status badge
  const getOverallStatusBadge = () => {
    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
          <AlertTriangle className="w-4 h-4" />
          Expirat
        </span>
      );
    }
    if (isExpiring && hasAllRequired) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">
          <Clock className="w-4 h-4" />
          Expiră în {daysUntilExpiry} zile
        </span>
      );
    }
    if (hasAllRequired && isVerified) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          Verificat complet
        </span>
      );
    }
    if (hasFrontId || hasSelfie) {
      // Show what's missing
      const missing = [];
      if (!hasFrontId) missing.push('act identitate');
      if (!hasSelfie) missing.push('selfie');
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
          <Clock className="w-4 h-4" />
          Incomplet - lipsește {missing.join(', ')}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-100 text-neutral-600 text-sm font-medium">
        <Clock className="w-4 h-4" />
        Neverificat
      </span>
    );
  };

  // Render compact document row
  const renderDocumentRow = (type: DocumentTypeKey) => {
    const config = DOCUMENT_TYPES[type];
    const doc = getDocumentByType(type);
    const isUploading = uploadingType === type;
    const isProcessing = processingOcr === type;
    const isExpanded = expandedDoc === doc?.id;
    const IconComponent = config.icon;
    const isDocExpired = doc?.expiresAt && new Date(doc.expiresAt) < new Date();

    return (
      <div key={type} className="border-b border-neutral-100 last:border-b-0">
        {/* Main row - compact */}
        <div className="flex items-center gap-3 p-3">
          {/* Icon */}
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
            doc
              ? isDocExpired ? 'bg-red-100' : 'bg-green-100'
              : 'bg-neutral-100'
          )}>
            {isUploading || isProcessing ? (
              <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
            ) : doc ? (
              isDocExpired ? (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )
            ) : (
              <IconComponent className="w-5 h-5 text-neutral-500" />
            )}
          </div>

          {/* Title & Description */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-secondary-900 text-sm">{config.label}</span>
              {config.requiredForKyc && !doc && (
                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Necesar</span>
              )}
            </div>
            <p className="text-xs text-neutral-500">{config.description}</p>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {doc ? (
              <>
                <span className={cn(
                  'text-xs font-medium px-2 py-1 rounded',
                  isDocExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                )}>
                  {isDocExpired ? 'Expirat' : 'OK'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
                  className="h-8 w-8 p-0"
                >
                  {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                <input
                  type="file"
                  ref={el => { fileInputRefs.current[type] = el; }}
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadingType(type);
                      handleFileUpload(type, file);
                    }
                    e.target.value = '';
                  }}
                  className="hidden"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRefs.current[type]?.click()}
                  disabled={isUploading || isProcessing}
                  className="h-8 w-8 p-0"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <input
                  type="file"
                  ref={el => { fileInputRefs.current[type] = el; }}
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadingType(type);
                      handleFileUpload(type, file);
                    }
                    e.target.value = '';
                  }}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRefs.current[type]?.click()}
                  disabled={isUploading || isProcessing}
                  className="h-8 text-xs"
                >
                  {isUploading || isProcessing ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      {isProcessing ? 'OCR...' : '...'}
                    </>
                  ) : (
                    <>
                      <Upload className="w-3 h-3 mr-1" />
                      Încarcă
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Expanded details */}
        {isExpanded && doc && (
          <div className="px-3 pb-3 pt-0">
            <div className="bg-neutral-50 rounded-lg p-3 space-y-3">
              {/* Dates */}
              <div className="flex gap-4 text-xs">
                <span className="text-neutral-500">
                  Verificat: <span className="text-secondary-900 font-medium">
                    {new Date(doc.verifiedAt).toLocaleDateString('ro-RO')}
                  </span>
                </span>
                {doc.expiresAt && (
                  <span className="text-neutral-500">
                    Expiră: <span className={cn('font-medium', isDocExpired ? 'text-red-600' : 'text-secondary-900')}>
                      {new Date(doc.expiresAt).toLocaleDateString('ro-RO')}
                    </span>
                  </span>
                )}
              </div>

              {/* Document image */}
              {doc.fileUrl && (
                <div className="relative h-32 bg-white rounded-lg overflow-hidden border border-neutral-200">
                  <img
                    src={doc.fileUrl}
                    alt={config.label}
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Extracted data */}
              {doc.extractedData && Object.keys(doc.extractedData).length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {doc.extractedData.lastName && (
                    <div>
                      <span className="text-neutral-500">Nume:</span>{' '}
                      <span className="font-medium">{doc.extractedData.lastName}</span>
                    </div>
                  )}
                  {doc.extractedData.firstName && (
                    <div>
                      <span className="text-neutral-500">Prenume:</span>{' '}
                      <span className="font-medium">{doc.extractedData.firstName}</span>
                    </div>
                  )}
                  {doc.extractedData.cnp && (
                    <div className="col-span-2">
                      <span className="text-neutral-500">CNP:</span>{' '}
                      <span className="font-medium font-mono">{doc.extractedData.cnp}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (kycLoading) {
    return (
      <div className={cn('flex items-center justify-center py-12', className)}>
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overall Status Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              isVerified && hasAllRequired ? 'bg-green-100' : isExpired ? 'bg-red-100' : isPartial ? 'bg-amber-100' : 'bg-neutral-100'
            )}>
              <Shield className={cn(
                'w-6 h-6',
                isVerified && hasAllRequired ? 'text-green-600' : isExpired ? 'text-red-600' : isPartial ? 'text-amber-600' : 'text-neutral-500'
              )} />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900">Verificare KYC</h3>
              <p className="text-sm text-neutral-500">
                {isVerified && hasAllRequired
                  ? 'Poți plasa comenzi rapid'
                  : isPartial
                  ? 'Adaugă selfie cu actul pentru verificare completă'
                  : 'Adaugă documentele pentru verificare'}
              </p>
            </div>
          </div>
          {getOverallStatusBadge()}
        </div>

        {expiresAt && isVerified && !isExpired && (
          <div className={cn(
            'p-4 rounded-xl',
            isExpiring ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'
          )}>
            <p className={cn('text-sm', isExpiring ? 'text-yellow-800' : 'text-green-800')}>
              <strong>Valabilitate verificare:</strong>{' '}
              {new Date(expiresAt).toLocaleDateString('ro-RO', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
              {daysUntilExpiry !== null && ` (${daysUntilExpiry} zile rămase)`}
            </p>
          </div>
        )}

        {isExpiring && (
          <Alert className="mt-4 border-yellow-200 bg-yellow-50 text-yellow-800">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Verificarea expiră curând. Re-scanează actul pentru a menține accesul rapid.
            </AlertDescription>
          </Alert>
        )}

        {isExpired && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Verificarea a expirat. Trebuie să re-scanezi documentele.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Document salvat cu succes! Datele au fost actualizate.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {(uploadError || kycError) && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{uploadError || kycError}</AlertDescription>
        </Alert>
      )}

      {/* Documents List - Compact */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50">
          <h4 className="font-semibold text-secondary-900 flex items-center gap-2 text-sm">
            <Scan className="w-4 h-4 text-primary-500" />
            Documente de Verificare
          </h4>
        </div>
        <div>
          {renderDocumentRow('ci_front')}
          {renderDocumentRow('ci_back')}
          {renderDocumentRow('selfie')}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">De ce este necesară verificarea?</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Verificarea identității este obligatorie pentru serviciile publice</li>
              <li>Documentele sunt criptate și stocate securizat</li>
              <li>Valabilitatea de 90 de zile permite comenzi rapide</li>
              <li>La scanare se creează automat profilul de facturare și adresa</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
