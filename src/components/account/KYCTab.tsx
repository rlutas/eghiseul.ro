'use client';
/* eslint-disable @next/next/no-img-element -- preview thumbnails use data URLs / dynamic S3 sources, Image component does not apply */

/**
 * KYCTab Component
 *
 * The account's identity tab. The customer first says WHICH identity document
 * they hold — the same three choices the order wizard offers
 * (`DocumentTypePicker`) — and the tab then asks only for what that choice
 * needs: the front of an old CI, front + back of a new one, or the passport's
 * data page. A selfie is always asked for, and a short list of documents that
 * only some services need is offered as optional.
 *
 * Which document each choice needs lives in `@/lib/kyc/identity-documents`,
 * shared with `POST /api/user/kyc/save`, so the account and an order write the
 * same row types.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
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
  Eye,
  EyeOff,
  User,
  CreditCard,
  RefreshCw,
  Building2,
  FileText,
  BookOpen,
  Pencil,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { interestsRequireIdentity, type InterestId } from '@/lib/account/service-interests';
import {
  DocumentTypePicker,
  type IdDocumentType,
} from '@/components/orders/modules/personal-kyc/DocumentTypePicker';
import {
  type AccountKycDocumentType,
  OPTIONAL_DOCUMENT_TYPES,
  requiredDocumentsFor,
  missingDocumentsFor,
  detectIdDocumentType,
  documentTypeAliases,
  hasDocument,
  ocrDocumentTypeFor,
  isOcrResultUsable,
} from '@/lib/kyc/identity-documents';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useKycStatus, type KycStatus } from '@/hooks/useKycStatus';
import { useAddresses } from '@/hooks/useAddresses';
import { useBillingProfiles } from '@/hooks/useBillingProfiles';
import { uploadToS3, getS3DownloadUrl, isS3Url } from '@/lib/aws/upload-client';
import type { ExtractedIdData } from '@/components/shared/IdScanner';
import { compressImage, compressedToFile, ImageCompressionError, type CompressedImage } from '@/lib/images/compress';
import { runFaceMatch, fetchImageAsBase64 } from '@/lib/kyc/face-match';

interface KYCTabProps {
  className?: string;
  /**
   * The answer to the account's onboarding question. When it covers only
   * services that never ask for an identity document, this tab says so instead
   * of quietly presenting an uploader the customer will never need — 20 of the
   * 31 active services do not ask for one, and we do not hand an identity
   * document to ONRC or ANCPI either. Uploading stays possible: the answer is a
   * preference, not a restriction.
   */
  serviceInterests?: InterestId[];
}

// Document type configuration. Keys are the names the row is STORED under —
// the same ones the wizard writes (see @/lib/kyc/identity-documents).
const DOCUMENT_TYPES: Record<
  AccountKycDocumentType,
  {
    label: string;
    description: string;
    icon: typeof CreditCard;
  }
> = {
  ci_front: {
    label: 'Act de identitate — față',
    description: 'CNP, nume și prenume. Le citim automat din poză.',
    icon: CreditCard,
  },
  ci_nou_back: {
    label: 'CI nou — verso',
    description: 'Spatele CI-ului electronic, unde este trecut domiciliul.',
    icon: CreditCard,
  },
  passport_opened: {
    label: 'Pașaport — pagina cu date',
    description: 'Pașaportul deschis, cu fotografia și datele vizibile.',
    icon: BookOpen,
  },
  selfie: {
    label: 'Selfie cu actul',
    description: 'Ține actul lângă față. Confirmă că tu ești titularul.',
    icon: User,
  },
  certificat_domiciliu: {
    label: 'Certificat de atestare a domiciliului',
    description: 'Dovada adresei, când actul nu o conține.',
    icon: FileText,
  },
  residence_permit: {
    label: 'Permis de ședere / certificat fiscal',
    description: 'Pentru cetățenii străini.',
    icon: FileText,
  },
  permis_fata: {
    label: 'Permis de conducere — față',
    description: 'Necesar la cazierul auto.',
    icon: CreditCard,
  },
};

type DocumentTypeKey = AccountKycDocumentType;

// Same wording as the picker's cards, so the summary line reads like the choice.
const ID_TYPE_LABELS: Record<IdDocumentType, string> = {
  ci_vechi: 'Buletin / CI vechi',
  ci_nou: 'CI nou electronic',
  passport: 'Pașaport',
};

// Remembers the choice between visits, so a customer who uploaded only the
// front of a new CI is not greeted by a checklist for the old one.
const ID_TYPE_STORAGE_KEY = 'eghiseul:account:id-document-type';

// Company document types
const COMPANY_DOCUMENT_TYPES = {
  company_registration_cert: {
    label: 'Certificat de Înregistrare',
    shortLabel: 'Cert. Înreg.',
    description: 'CUI, denumire firmă',
    icon: FileText,
    color: 'purple',
  },
  company_statement_cert: {
    label: 'Certificat Constatator',
    shortLabel: 'Cert. Const.',
    description: 'Date firmă actualizate',
    icon: FileText,
    color: 'purple',
  },
} as const;

type CompanyDocTypeKey = keyof typeof COMPANY_DOCUMENT_TYPES;

export default function KYCTab({ className, serviceInterests }: KYCTabProps) {
  const identityIsOptional = interestsRequireIdentity(serviceInterests ?? null) === false;
  const {
    expiresAt,
    daysUntilExpiry,
    isVerified,
    isExpiring,
    isExpired,
    documents,
    isLoading: kycLoading,
    error: kycError,
    saveDocument,
    refresh: refreshKyc,
  } = useKycStatus();

  const { addresses, create: createAddress, update: updateAddress } = useAddresses();
  const { profiles, createFromIdData: createBillingFromId } = useBillingProfiles();

  const [uploadingType, setUploadingType] = useState<DocumentTypeKey | CompanyDocTypeKey | null>(null);
  const [processingOcr, setProcessingOcr] = useState<DocumentTypeKey | null>(null);
  // Which identity document the customer says they hold. Null = not chosen and
  // nothing on file yet, so we show the picker.
  const [idType, setIdType] = useState<IdDocumentType | null>(null);
  const [isPickingIdType, setIsPickingIdType] = useState(false);
  const [showOptionalDocs, setShowOptionalDocs] = useState(false);
  // Faza 3 / decision D8: the data read off the document may also be used for
  // invoicing — the customer's choice, off by default. It used to happen on
  // every scan, silently, and it overwrote a profile they may have corrected by
  // hand with a flat address the next order would refuse.
  const [reuseIdForBilling, setReuseIdForBilling] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [resolvedUrls, setResolvedUrls] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [hasCompanyProfile, setHasCompanyProfile] = useState(false);
  // Cache last-uploaded CI front in memory so a subsequent selfie upload in the
  // same session can be face-matched without a round-trip to S3.
  const ciFrontCacheRef = useRef<{ base64: string; mimeType: string } | null>(null);

  // Check if user has a company profile
  useEffect(() => {
    async function checkCompanyProfile() {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const result = await response.json();
          setHasCompanyProfile(!!result.data?.companyProfile);
        }
      } catch {
        // Ignore - company section just won't show
      }
    }
    checkCompanyProfile();
  }, []);

  // Resolve S3 URL when document is expanded
  const resolveDocumentUrl = useCallback(async (docId: string, fileUrl: string) => {
    // Skip if already resolved or if it's a data URL
    if (resolvedUrls[docId] || fileUrl.startsWith('data:')) {
      return;
    }

    // Check if it's an S3 URL that needs presigning
    if (isS3Url(fileUrl)) {
      try {
        // Extract key from S3 URL
        const url = new URL(fileUrl);
        const key = url.pathname.substring(1); // Remove leading /
        const presignedUrl = await getS3DownloadUrl(key);
        setResolvedUrls(prev => ({ ...prev, [docId]: presignedUrl }));
      } catch (err) {
        console.error('Failed to resolve S3 URL:', err);
        // Fall back to original URL (will fail to load, but shows something)
        setResolvedUrls(prev => ({ ...prev, [docId]: fileUrl }));
      }
    } else {
      // Not an S3 URL, use as-is
      setResolvedUrls(prev => ({ ...prev, [docId]: fileUrl }));
    }
  }, [resolvedUrls]);

  // Every stored document type the user currently has on file.
  const storedTypes = useMemo(() => documents.map(d => d.documentType), [documents]);

  // Pick up the remembered choice, else infer it from what is already on file.
  // Runs once documents are loaded; a later upload must not reset a choice the
  // customer made in this session, hence the "only when still null" guard.
  useEffect(() => {
    if (kycLoading) return;
    setIdType(prev => {
      if (prev) return prev;
      let remembered: string | null = null;
      try {
        remembered = window.localStorage.getItem(ID_TYPE_STORAGE_KEY);
      } catch {
        // Private mode / blocked storage — fall back to detection.
      }
      if (remembered === 'ci_vechi' || remembered === 'ci_nou' || remembered === 'passport') {
        return remembered;
      }
      return detectIdDocumentType(storedTypes);
    });
  }, [kycLoading, storedTypes]);

  // Open the optional section on first load when something is already there,
  // once — so collapsing it afterwards sticks.
  const optionalDefaultApplied = useRef(false);
  useEffect(() => {
    if (kycLoading || optionalDefaultApplied.current) return;
    optionalDefaultApplied.current = true;
    if (OPTIONAL_DOCUMENT_TYPES.some(type => hasDocument(type, storedTypes))) {
      setShowOptionalDocs(true);
    }
  }, [kycLoading, storedTypes]);

  const handlePickIdType = useCallback((picked: IdDocumentType) => {
    setIdType(picked);
    setIsPickingIdType(false);
    setUploadError(null);
    try {
      window.localStorage.setItem(ID_TYPE_STORAGE_KEY, picked);
    } catch {
      // Not remembering the choice is harmless — detection takes over.
    }
  }, []);

  // Get document by type, accepting the legacy and wizard names for the same
  // physical document (e.g. a `ci_nou_front` row satisfies `ci_front`).
  const getDocumentByType = useCallback((type: DocumentTypeKey) => {
    const aliases = documentTypeAliases(type);
    return documents.find(d => aliases.includes(d.documentType));
  }, [documents]);

  // Handle file upload
  const handleFileUpload = useCallback(async (type: DocumentTypeKey, file: File) => {
    setUploadError(null);
    setSaveSuccess(false);

    try {
      // Compress + decode (EXIF-safe). Reduces 3-7MB phone photos to ~250KB JPEG.
      let compressed: CompressedImage | undefined;
      let uploadFile: File = file;
      try {
        compressed = await compressImage(file);
        console.log(`[KYC] ${type}: ${(compressed.sizeBefore/1024/1024).toFixed(1)}MB → ${(compressed.sizeAfter/1024).toFixed(0)}KB`);
        uploadFile = compressedToFile(compressed, file);
      } catch (e) {
        if (e instanceof ImageCompressionError) {
          // HEIC or decode failure: fall through with raw file (server-side fallback can normalize)
          console.warn('Image compression skipped:', e.code);
        } else {
          throw e;
        }
      }

      const dataUrl = compressed?.dataUrl ?? await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const base64 = compressed?.base64 ?? dataUrl.split(',')[1];

      // Generate a verification ID for this upload session
      const verificationId = `kyc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Upload to S3 first (if S3 is configured)
      let fileUrl = dataUrl; // Fallback to data URL
      let fileKey: string | undefined;

      try {
        const s3Result = await uploadToS3({
          category: 'kyc',
          file: uploadFile,
          documentType: type,
          verificationId,
        });
        fileUrl = s3Result.url;
        fileKey = s3Result.key;
      } catch (s3Error) {
        // S3 not configured or failed - fall back to data URL
        console.warn('S3 upload failed, using data URL:', s3Error);
      }

      const finalSize = compressed?.sizeAfter ?? file.size;
      const finalMime = compressed?.mimeType ?? file.type;

      // Cache the identity document for an in-session face match against a
      // selfie uploaded right after it.
      const isIdentityFront = type === 'ci_front' || type === 'passport_opened';
      if (isIdentityFront && compressed) {
        ciFrontCacheRef.current = { base64: compressed.base64, mimeType: compressed.mimeType };
      }

      const ocrType = ocrDocumentTypeFor(type);

      // For identity documents, run OCR
      if (ocrType) {
        setProcessingOcr(type);

        // Call OCR API (still uses base64 for processing)
        const ocrResponse = await fetch('/api/ocr/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode: 'specific',
            imageBase64: base64,
            mimeType: finalMime,
            documentType: ocrType,
          }),
        });

        if (!ocrResponse.ok) {
          const errorData = await ocrResponse.json().catch(() => ({}));
          throw new Error(errorData.error?.message || 'OCR processing failed');
        }

        const ocrResult = await ocrResponse.json();
        const ocr = ocrResult.data?.ocr;

        // Gemini's confidence is unreliable (it returns 0 on documents it read
        // perfectly), so we judge the DATA, not the score — same rule the
        // wizard applies.
        if (!isOcrResultUsable(ocr)) {
          throw new Error('Nu am putut citi documentul. Asigură-te că imaginea este clară și că se vede tot actul.');
        }

        // Save KYC document with S3 URL
        await saveDocument({
          documentType: type,
          fileUrl,
          fileKey,
          fileSize: finalSize,
          mimeType: finalMime,
          extractedData: ocr.extractedData,
          validationResult: { confidence: ocr.confidence, issues: ocr.issues },
          documentExpiry: ocr.extractedData?.expiryDate,
          useIdDataForBilling: reuseIdForBilling,
        });

        // Auto-create address and billing profile from whatever the document
        // carried (name + CNP on a front/passport, address on a new-CI back).
        if (ocr.extractedData) {
          await autoCreateUserData(ocr.extractedData);
        }
      } else if (type !== 'selfie') {
        // Documents nobody needs to read automatically (address certificate,
        // residence permit, driving licence) — stored for the team to review.
        await saveDocument({
          documentType: type,
          fileUrl,
          fileKey,
          fileSize: finalSize,
          mimeType: finalMime,
          extractedData: {},
        });
      } else {
        // For selfie: face match against the user's CI front before saving.
        // Use the in-session cache if available, else fall back to the stored
        // S3 image (previous session). If no CI is on file, save without
        // validation (admin will see the missing reference).
        let faceMatchValidation: Record<string, unknown> = {};

        let reference = ciFrontCacheRef.current;
        if (!reference) {
          const idAliases = [
            ...documentTypeAliases('ci_front'),
            ...documentTypeAliases('passport_opened'),
          ];
          const ciDoc = documents.find((d) => idAliases.includes(d.documentType));
          if (ciDoc?.fileUrl) {
            // getS3DownloadUrl takes a KEY, not a URL — passing the whole URL
            // made the cross-session face match fail silently.
            const resolved = isS3Url(ciDoc.fileUrl)
              ? await getS3DownloadUrl(new URL(ciDoc.fileUrl).pathname.substring(1))
              : ciDoc.fileUrl;
            reference = await fetchImageAsBase64(resolved);
          }
        }

        if (reference) {
          const faceMatch = await runFaceMatch({
            selfieBase64: base64,
            selfieMimeType: finalMime,
            referenceBase64: reference.base64,
            referenceMimeType: reference.mimeType,
          });
          if (faceMatch.ok) {
            console.log(`[KYC] selfie face match: ${faceMatch.matched ? 'MATCH' : 'NO MATCH'} (confidence ${faceMatch.faceMatchConfidence}%)`);
            faceMatchValidation = {
              faceMatch: faceMatch.matched,
              faceMatchConfidence: faceMatch.faceMatchConfidence,
              validationConfidence: faceMatch.validationConfidence,
              valid: faceMatch.valid,
              issues: faceMatch.issues,
            };
            if (!faceMatch.matched) {
              setUploadError('Fața din selfie nu corespunde cu cea din actul de identitate încărcat. Te rugăm să încerci o selfie clară, ținând actul lângă față.');
            }
          } else {
            console.warn('[KYC] face match unavailable:', faceMatch.error);
          }
        }

        await saveDocument({
          documentType: 'selfie',
          fileUrl,
          fileKey,
          fileSize: finalSize,
          mimeType: finalMime,
          extractedData: faceMatchValidation,
          validationResult: faceMatchValidation,
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveDocument, refreshKyc, documents]);

  // Handle company document upload (no OCR - manual admin review)
  const handleCompanyDocUpload = useCallback(async (type: CompanyDocTypeKey, file: File) => {
    setUploadError(null);
    setSaveSuccess(false);
    setUploadingType(type);

    try {
      const verificationId = `company-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      // Upload to S3
      let fileUrl: string;
      let fileKey: string | undefined;

      try {
        const s3Result = await uploadToS3({
          category: 'kyc',
          file,
          documentType: type,
          verificationId,
        });
        fileUrl = s3Result.url;
        fileKey = s3Result.key;
      } catch {
        // Fallback to data URL
        const reader = new FileReader();
        const dataUrlPromise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });
        reader.readAsDataURL(file);
        fileUrl = await dataUrlPromise;
      }

      // Save to KYC verifications (no OCR, manual review)
      await saveDocument({
        documentType: type,
        fileUrl,
        fileKey,
        fileSize: file.size,
        mimeType: file.type,
        extractedData: {},
      });

      setSaveSuccess(true);
      await refreshKyc();
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Company doc upload error:', err);
      setUploadError(err instanceof Error ? err.message : 'Eroare la încărcare');
    } finally {
      setUploadingType(null);
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

      // The billing profile, only if the customer asked for it and only when
      // they have none. An existing profile is never rewritten from the scan:
      // they may have corrected it themselves, and the OCR is not more right
      // than the person who reads their own invoice.
      if (reuseIdForBilling && profiles.length === 0) {
        await createBillingFromId(extractedData);
      }
    } catch (err) {
      console.error('Auto-create user data error:', err);
      // Non-blocking error
    }
  }, [addresses, profiles, createAddress, updateAddress, createBillingFromId, reuseIdForBilling]);

  // What the chosen identity document still needs. Drives the badge and the
  // "Necesar" markers — `hasAllRequired` from the API only knows about a front
  // and a selfie, so it would call a new CI complete without its back.
  const missingDocs = idType ? missingDocumentsFor(idType, storedTypes) : [];
  const isComplete = !!idType && missingDocs.length === 0;

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
    if (isExpiring && isComplete) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">
          <Clock className="w-4 h-4" />
          Expiră în {daysUntilExpiry} zile
        </span>
      );
    }
    if (isComplete && isVerified) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          Verificat complet
        </span>
      );
    }
    if (documents.length > 0 && missingDocs.length > 0) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
          <Clock className="w-4 h-4" />
          Incomplet — lipsește {missingDocs.map(t => DOCUMENT_TYPES[t].label.toLowerCase()).join(', ')}
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

  // Render compact document row. `required` comes from the chosen identity
  // document, so the same row can be mandatory in one flow and optional in
  // another (the back of a CI: required for the new one, never for a buletin).
  const renderDocumentRow = (type: DocumentTypeKey, required: boolean) => {
    const config = DOCUMENT_TYPES[type];
    const doc = getDocumentByType(type);
    const isUploading = uploadingType === type;
    const isProcessing = processingOcr === type;
    const isExpanded = expandedDoc === doc?.id;
    const IconComponent = config.icon;
    const isDocExpired = doc?.expiresAt && new Date(doc.expiresAt) < new Date();

    // Hidden input + ref.click() — a styled <label> does not open the picker
    // reliably on macOS Safari.
    const hiddenInput = (
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
        className="sr-only"
      />
    );

    return (
      <div key={type} className="border-b border-neutral-100 last:border-b-0">
        {/* Main row — wraps to a second line on narrow phones instead of squeezing */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 p-3">
          {/* Icon */}
          <div className={cn(
            'w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0',
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
          <div className="flex-1 min-w-[10rem]">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-medium text-secondary-900 text-sm">{config.label}</span>
              {required && !doc && (
                <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Necesar</span>
              )}
              {!required && (
                <span className="text-[10px] bg-neutral-100 text-neutral-500 px-1.5 py-0.5 rounded">Opțional</span>
              )}
            </div>
            <p className="text-xs text-neutral-500">{config.description}</p>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
            {doc ? (
              <>
                <span className={cn(
                  'text-xs font-medium px-2 py-1 rounded',
                  isDocExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                )}>
                  {isDocExpired ? 'Expirat' : 'OK'}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={isExpanded ? 'Ascunde documentul' : 'Vezi documentul'}
                  onClick={() => {
                    if (!isExpanded && doc.fileUrl) {
                      resolveDocumentUrl(doc.id, doc.fileUrl);
                    }
                    setExpandedDoc(isExpanded ? null : doc.id);
                  }}
                  className="h-11 w-11 p-0"
                >
                  {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
                {hiddenInput}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label="Înlocuiește documentul"
                  onClick={() => fileInputRefs.current[type]?.click()}
                  disabled={isUploading || isProcessing}
                  className="h-11 w-11 p-0"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                {hiddenInput}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRefs.current[type]?.click()}
                  disabled={isUploading || isProcessing}
                  className="h-11 px-4 text-xs"
                >
                  {isUploading || isProcessing ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      {isProcessing ? 'Citim actul...' : 'Se încarcă...'}
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
                  {resolvedUrls[doc.id] || doc.fileUrl.startsWith('data:') ? (
                    <img
                      src={resolvedUrls[doc.id] || doc.fileUrl}
                      alt={config.label}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="w-6 h-6 text-neutral-400 animate-spin" />
                    </div>
                  )}
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

  // Render company document row (simpler than personal - no OCR, no expand)
  const renderCompanyDocRow = (type: CompanyDocTypeKey) => {
    const config = COMPANY_DOCUMENT_TYPES[type];
    const doc = documents.find(d => d.documentType === type);
    const isUploading = uploadingType === type;
    const IconComponent = config.icon;

    return (
      <div key={type} className="border-b border-neutral-100 last:border-b-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 p-3">
          <div className={cn(
            'w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0',
            doc ? 'bg-green-100' : 'bg-neutral-100'
          )}>
            {isUploading ? (
              <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
            ) : doc ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <IconComponent className="w-5 h-5 text-neutral-500" />
            )}
          </div>

          <div className="flex-1 min-w-[10rem]">
            <div className="flex items-center gap-2">
              <span className="font-medium text-secondary-900 text-sm">{config.label}</span>
            </div>
            <p className="text-xs text-neutral-500">{config.description}</p>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
            {doc ? (
              <>
                <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-700">
                  Încărcat
                </span>
                <input
                  type="file"
                  ref={el => { fileInputRefs.current[type] = el; }}
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCompanyDocUpload(type, file);
                    e.target.value = '';
                  }}
                  className="sr-only"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRefs.current[type]?.click()}
                  disabled={isUploading}
                  className="h-11 w-11 p-0"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <input
                  type="file"
                  ref={el => { fileInputRefs.current[type] = el; }}
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleCompanyDocUpload(type, file);
                    e.target.value = '';
                  }}
                  className="sr-only"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRefs.current[type]?.click()}
                  disabled={isUploading}
                  className="h-11 px-4 text-xs"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ...
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
      {/* The customer told us they come here for property or company documents,
          and nothing on file contradicts it. Say what that means before showing
          an uploader. */}
      {identityIsOptional && documents.length === 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 sm:p-5">
          <p className="text-sm leading-relaxed text-neutral-700">
            <strong className="text-secondary-900">Nu-ți cerem act de identitate.</strong>{' '}
            Pentru serviciile care te interesează nu e nevoie de unul — nici noi nu
            depunem act la ONRC sau la ANCPI. Îl poți încărca oricând mai jos, dacă
            vrei să comanzi și un cazier sau un act de stare civilă.
          </p>
        </div>
      )}

      {/* Overall Status Card */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              isVerified && isComplete ? 'bg-green-100' : isExpired ? 'bg-red-100' : documents.length > 0 ? 'bg-amber-100' : 'bg-neutral-100'
            )}>
              <Shield className={cn(
                'w-6 h-6',
                isVerified && isComplete ? 'text-green-600' : isExpired ? 'text-red-600' : documents.length > 0 ? 'text-amber-600' : 'text-neutral-500'
              )} />
            </div>
            <div>
              <h3 className="font-semibold text-secondary-900">Verificare identitate</h3>
              <p className="text-sm text-neutral-500">
                {isVerified && isComplete
                  ? 'Poți plasa comenzi rapid'
                  : !idType
                  ? 'Alege actul de identitate pe care îl deții'
                  : missingDocs.length > 0
                  ? `Mai ai de încărcat: ${missingDocs.map(t => DOCUMENT_TYPES[t].label.toLowerCase()).join(', ')}`
                  : 'Documentele sunt încărcate'}
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

      {/* The one choice about what the scan may be used for. Off by default and
          shown before the upload, so it is a decision and not something the
          customer discovers afterwards on an invoice. Hidden once a billing
          profile exists — we would not touch it anyway. */}
      {profiles.length === 0 && (
        <label className="flex min-h-[56px] cursor-pointer items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4">
          <input
            type="checkbox"
            checked={reuseIdForBilling}
            onChange={(e) => setReuseIdForBilling(e.target.checked)}
            className="mt-0.5 h-5 w-5 flex-shrink-0 rounded border-neutral-300 accent-primary-500"
          />
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-secondary-900">
              Folosește datele din act și la facturare
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-neutral-500">
              Numele, CNP-ul și adresa din document intră și în profilul de
              facturare, ca să nu le mai scrii la comandă. Le poți schimba
              oricând din secțiunea de facturare. Dacă nu bifezi, actul rămâne folosit doar
              pentru verificarea identității.
            </span>
          </span>
        </label>
      )}

      {/* Identity documents — driven by the document the customer says they hold */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50">
          <h4 className="font-semibold text-secondary-900 flex items-center gap-2 text-sm">
            <Scan className="w-4 h-4 text-primary-500" />
            Documente de verificare
          </h4>
        </div>

        {!idType || isPickingIdType ? (
          <div className="p-4 space-y-3">
            <DocumentTypePicker onPick={handlePickIdType} />
            {isPickingIdType && (
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsPickingIdType(false)}
                  className="h-11 px-4 text-xs"
                >
                  Anulează
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-neutral-100">
              <p className="text-xs text-neutral-500">
                Actul tău: <span className="font-medium text-secondary-900">{ID_TYPE_LABELS[idType]}</span>
              </p>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsPickingIdType(true)}
                className="h-11 px-3 text-xs"
              >
                <Pencil className="w-3.5 h-3.5 mr-1.5" />
                Schimbă actul
              </Button>
            </div>
            <div>
              {requiredDocumentsFor(idType).map(type => renderDocumentRow(type, true))}
            </div>
          </>
        )}
      </div>

      {/* Optional documents — only some services ask for these */}
      <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowOptionalDocs(v => !v)}
          className="w-full flex items-center justify-between gap-3 px-4 py-3 min-h-11 bg-neutral-50 text-left hover:bg-neutral-100 transition-colors"
        >
          <span>
            <span className="font-semibold text-secondary-900 flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-primary-500" />
              Alte documente (opțional)
            </span>
            <span className="block text-xs text-neutral-500 mt-0.5">
              Dovada domiciliului, permis de ședere, permis de conducere
            </span>
          </span>
          {showOptionalDocs
            ? <ChevronUp className="w-4 h-4 text-neutral-500 flex-shrink-0" />
            : <ChevronDown className="w-4 h-4 text-neutral-500 flex-shrink-0" />}
        </button>
        {showOptionalDocs && (
          <div>
            {OPTIONAL_DOCUMENT_TYPES.map(type => renderDocumentRow(type, false))}
          </div>
        )}
      </div>

      {/* Company Documents Section (only if user has company profile) */}
      {hasCompanyProfile && (
        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50">
            <h4 className="font-semibold text-secondary-900 flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-primary-500" />
              Documente Firmă
            </h4>
            <p className="text-xs text-neutral-500 mt-0.5">
              Încarcă documentele firmei pentru verificare (revizia admin)
            </p>
          </div>
          <div>
            {renderCompanyDocRow('company_registration_cert')}
            {renderCompanyDocRow('company_statement_cert')}
          </div>
        </div>
      )}

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
