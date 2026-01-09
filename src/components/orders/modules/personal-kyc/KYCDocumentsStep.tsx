'use client';

/**
 * KYCDocumentsStep Component (Improved)
 *
 * Handles KYC document verification including selfie and additional documents.
 * Supports drag & drop, preview images, face matching, and better UX.
 *
 * Ported from the old wizard kyc-step.tsx with improvements for modular system.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useModularWizard } from '@/providers/modular-wizard-provider';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  Camera,
  Upload,
  User,
  FileText,
  Trash2,
  Eye,
  X,
  CreditCard,
  Info,
  FileCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PersonalKYCConfig, DocumentType, UploadedDocumentState } from '@/types/verification-modules';

interface KYCDocumentsStepProps {
  config: PersonalKYCConfig;
  onValidChange: (valid: boolean) => void;
}

type KYCDocType = 'selfie' | 'certificat_domiciliu';

interface UploadState {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  progress: number;
  error: string | null;
}

const initialUploadState: UploadState = {
  file: null,
  preview: null,
  uploading: false,
  progress: 0,
  error: null,
};

// Document type config
const DOCUMENT_CONFIG: Record<
  KYCDocType,
  {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    tips: string[];
  }
> = {
  selfie: {
    title: 'Selfie cu Document',
    description: 'Selfie ținând cartea de identitate lângă față',
    icon: User,
    tips: [
      'Ține documentul lângă față',
      'Asigură-te că fața ta este vizibilă clar',
      'Iluminare bună, fără umbre pe față',
    ],
  },
  certificat_domiciliu: {
    title: 'Certificat de Atestare a Domiciliului',
    description: 'Document care atestă adresa de domiciliu',
    icon: FileText,
    tips: [
      'Documentul trebuie să fie vizibil complet',
      'Asigură-te că datele sunt citibile',
      'Evită reflexiile și umbrele',
    ],
  },
};

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;
// Accepted file types
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export default function KYCDocumentsStep({ config, onValidChange }: KYCDocumentsStepProps) {
  const { state, updatePersonalKyc, isPrefilled, prefillData } = useModularWizard();
  const personalKyc = state.personalKyc;

  // Check if user has valid KYC from their account
  const hasValidAccountKyc = isPrefilled && prefillData?.has_valid_kyc;
  const [showReuploadOption, setShowReuploadOption] = useState(false);

  const [uploads, setUploads] = useState<Record<KYCDocType, UploadState>>({
    selfie: { ...initialUploadState },
    certificat_domiciliu: { ...initialUploadState },
  });

  const [previewModal, setPreviewModal] = useState<{
    open: boolean;
    type: KYCDocType | null;
    url: string | null;
  }>({
    open: false,
    type: null,
    url: null,
  });

  const [faceMatchResult, setFaceMatchResult] = useState<{
    matched: boolean;
    confidence: number;
  } | null>(null);

  const selfieInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);

  // Get uploaded documents
  const getDocumentByType = useCallback((type: DocumentType): UploadedDocumentState | undefined => {
    return personalKyc?.uploadedDocuments.find(doc => doc.type === type);
  }, [personalKyc?.uploadedDocuments]);

  // Check if we have ID document (for face matching reference)
  const getIDDocument = useCallback(() => {
    return personalKyc?.uploadedDocuments.find(doc =>
      doc.type === 'ci_vechi' ||
      doc.type === 'ci_nou_front' ||
      doc.type === 'passport'
    );
  }, [personalKyc?.uploadedDocuments]);

  // Validate step
  const isValid = useCallback(() => {
    if (!personalKyc) return false;

    // If user has valid KYC from account and not showing reupload, automatically valid
    if (hasValidAccountKyc && !showReuploadOption) {
      return true;
    }

    // Check selfie if required
    if (config.selfieRequired) {
      const hasSelfie = personalKyc.uploadedDocuments.some(d => d.type === 'selfie');
      if (!hasSelfie) return false;
    }

    // Check for address certificate if required
    if (personalKyc.requiresAddressCertificate && config.requireAddressCertificate !== 'never') {
      const hasCertificate = personalKyc.uploadedDocuments.some(d => d.type === 'certificat_domiciliu');
      if (!hasCertificate) return false;
    }

    return true;
  }, [personalKyc, config, hasValidAccountKyc, showReuploadOption]);

  // Notify parent of validation changes
  useEffect(() => {
    onValidChange(isValid());
  }, [isValid, onValidChange]);

  // Handle file selection
  const handleFileSelect = useCallback(
    async (type: KYCDocType, file: File) => {
      // Validate file type
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setUploads((prev) => ({
          ...prev,
          [type]: {
            ...prev[type],
            error: 'Format invalid. Acceptăm doar JPEG sau PNG.',
          },
        }));
        return;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        setUploads((prev) => ({
          ...prev,
          [type]: {
            ...prev[type],
            error: 'Fișierul este prea mare. Limita este 10MB.',
          },
        }));
        return;
      }

      // Create preview
      const preview = URL.createObjectURL(file);

      setUploads((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          file,
          preview,
          error: null,
        },
      }));

      // Auto-upload the file
      await handleUpload(type, file, preview);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Upload and validate document
  const handleUpload = useCallback(
    async (type: KYCDocType, file: File, preview: string) => {
      setUploads((prev) => ({
        ...prev,
        [type]: { ...prev[type], uploading: true, progress: 0, error: null },
      }));

      try {
        // Read file as base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // Remove data:image/... prefix
          };
          reader.onerror = reject;
        });
        reader.readAsDataURL(file);
        const base64 = await base64Promise;

        setUploads((prev) => ({
          ...prev,
          [type]: { ...prev[type], progress: 50 },
        }));

        // For selfie, perform face matching with ID document
        if (type === 'selfie' && config.selfieRequired) {
          const idDoc = getIDDocument();
          if (idDoc?.base64) {
            try {
              const response = await fetch('/api/kyc/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  idImage: idDoc.base64,
                  selfieImage: base64,
                  mimeType: file.type,
                }),
              });

              if (response.ok) {
                const data = await response.json();
                if (data.success && data.data?.faceMatch) {
                  setFaceMatchResult({
                    matched: data.data.faceMatch.matched,
                    confidence: data.data.faceMatch.confidence,
                  });
                }
              }
            } catch {
              console.log('Face matching skipped');
            }
          }
        }

        setUploads((prev) => ({
          ...prev,
          [type]: { ...prev[type], progress: 80 },
        }));

        // Create document record
        const newDoc: UploadedDocumentState = {
          id: crypto.randomUUID(),
          type: type,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          uploadedAt: new Date().toISOString(),
          base64,
        };

        // Update state - remove existing document of same type
        const filteredDocs = personalKyc?.uploadedDocuments.filter(doc => doc.type !== type) || [];
        updatePersonalKyc({
          uploadedDocuments: [...filteredDocs, newDoc],
        });

        setUploads((prev) => ({
          ...prev,
          [type]: {
            ...prev[type],
            uploading: false,
            progress: 100,
          },
        }));
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Încărcarea a eșuat';
        setUploads((prev) => ({
          ...prev,
          [type]: {
            ...prev[type],
            uploading: false,
            error: errorMessage,
          },
        }));
      }
    },
    [personalKyc?.uploadedDocuments, updatePersonalKyc, config.selfieRequired, getIDDocument]
  );

  // Handle remove
  const handleRemove = useCallback(
    (type: KYCDocType) => {
      if (uploads[type].preview) {
        URL.revokeObjectURL(uploads[type].preview!);
      }

      setUploads((prev) => ({
        ...prev,
        [type]: { ...initialUploadState },
      }));

      // Remove from context
      const filteredDocs = personalKyc?.uploadedDocuments.filter(doc => doc.type !== type) || [];
      updatePersonalKyc({
        uploadedDocuments: filteredDocs,
      });

      if (type === 'selfie') {
        setFaceMatchResult(null);
      }
    },
    [uploads, personalKyc?.uploadedDocuments, updatePersonalKyc]
  );

  // Handle drag and drop
  const handleDrop = useCallback(
    (type: KYCDocType, e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(type, file);
      }
    },
    [handleFileSelect]
  );

  // Render upload card
  const renderUploadCard = (type: KYCDocType) => {
    const docConfig = DOCUMENT_CONFIG[type];
    const uploadState = uploads[type];
    const existingDoc = getDocumentByType(type);
    const Icon = docConfig.icon;

    const hasFile = uploadState.file || uploadState.preview || existingDoc;
    const isUploaded = !!existingDoc;

    return (
      <div
        key={type}
        className={cn(
          'relative rounded-xl border-2 border-dashed p-4 transition-all',
          isUploaded
            ? 'border-green-300 bg-green-50'
            : uploadState.error
            ? 'border-red-300 bg-red-50'
            : 'border-neutral-200 hover:border-primary-300 bg-white'
        )}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
              isUploaded ? 'bg-green-100' : 'bg-neutral-100'
            )}
          >
            {isUploaded ? (
              <FileCheck className={cn('w-5 h-5', 'text-green-600')} />
            ) : (
              <Icon className={cn('w-5 h-5', 'text-neutral-500')} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-secondary-900">{docConfig.title}</h4>
            <p className="text-sm text-neutral-600">{docConfig.description}</p>
          </div>
          {isUploaded && (
            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
          )}
        </div>

        {/* Preview or Upload Area */}
        {hasFile ? (
          <div className="relative">
            {/* Preview Image */}
            <div
              className="relative aspect-video bg-neutral-100 rounded-lg overflow-hidden cursor-pointer"
              onClick={() =>
                setPreviewModal({
                  open: true,
                  type,
                  url: uploadState.preview || (existingDoc?.base64 ? `data:${existingDoc.mimeType};base64,${existingDoc.base64}` : null),
                })
              }
            >
              <img
                src={uploadState.preview || (existingDoc?.base64 ? `data:${existingDoc.mimeType};base64,${existingDoc.base64}` : '')}
                alt={docConfig.title}
                className="w-full h-full object-contain"
              />
              {uploadState.uploading && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                  <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                  <span className="text-white text-sm font-medium">
                    {uploadState.progress}%
                  </span>
                </div>
              )}
            </div>

            {/* Face match result for selfie */}
            {type === 'selfie' && faceMatchResult && (
              <div className={cn(
                'mt-2 text-sm flex items-center gap-2 px-3 py-2 rounded-lg',
                faceMatchResult.matched ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              )}>
                {faceMatchResult.matched ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Verificat - {Math.round(faceMatchResult.confidence * 100)}% potrivire
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    Fața nu corespunde cu documentul
                  </>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3">
              {isUploaded && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPreviewModal({
                      open: true,
                      type,
                      url: existingDoc?.base64 ? `data:${existingDoc.mimeType};base64,${existingDoc.base64}` : null,
                    })
                  }
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Previzualizează
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleRemove(type)}
                disabled={uploadState.uploading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Upload info */}
            {isUploaded && existingDoc && (
              <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Document încărcat: {existingDoc.fileName}
              </div>
            )}
          </div>
        ) : (
          <div
            onDrop={(e) => handleDrop(type, e)}
            onDragOver={(e) => e.preventDefault()}
            className="relative"
          >
            <input
              ref={type === 'selfie' ? selfieInputRef : certInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              capture={type === 'selfie' ? 'user' : undefined}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(type, file);
                e.target.value = ''; // Reset input
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="border border-neutral-200 rounded-lg p-6 text-center hover:bg-neutral-50 transition-colors">
              <div className="flex justify-center gap-2 mb-2">
                <Camera className="w-6 h-6 text-neutral-400" />
                <Upload className="w-6 h-6 text-neutral-400" />
              </div>
              <p className="text-sm font-medium text-secondary-900 mb-1">
                {type === 'selfie' ? 'Click pentru selfie sau trage o imagine' : 'Trage fișierul aici sau click pentru a selecta'}
              </p>
              <p className="text-xs text-neutral-500">
                JPEG sau PNG, max 10MB
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {uploadState.error && (
          <div className="flex items-center gap-2 mt-3 text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{uploadState.error}</span>
          </div>
        )}

        {/* Tips */}
        {!hasFile && (
          <div className="mt-4 space-y-1">
            {docConfig.tips.map((tip, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-neutral-500">
                <CheckCircle className="w-3 h-3 text-neutral-400" />
                {tip}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!personalKyc) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Modulul de verificare nu este configurat corect.
        </AlertDescription>
      </Alert>
    );
  }

  // Check which sections to show
  const showSelfie = config.selfieRequired;
  const showCertificate = personalKyc.requiresAddressCertificate && config.requireAddressCertificate !== 'never';

  // Count uploaded documents (from Step 3)
  const idDocsCount = personalKyc.uploadedDocuments.filter(d =>
    d.type !== 'selfie' && d.type !== 'certificat_domiciliu'
  ).length;

  return (
    <div className="space-y-6">
      {/* KYC Already Verified Banner */}
      {hasValidAccountKyc && !showReuploadOption && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <FileCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-800 text-lg">
                Documente deja verificate
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Avem deja documentele tale KYC verificate în cont.
                Poți continua direct la pasul următor fără a încărca documente noi.
              </p>
              <div className="flex items-center gap-4 mt-4">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Identitate verificată
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReuploadOption(true)}
                  className="text-green-700 hover:text-green-800 hover:bg-green-100"
                >
                  Încarcă documente noi
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reupload notice */}
      {hasValidAccountKyc && showReuploadOption && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex gap-3 items-center">
            <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-blue-800">
                Încarci documente noi care vor înlocui verificarea existentă.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowReuploadOption(false)}
              className="text-blue-700 hover:text-blue-800"
            >
              Anulează
            </Button>
          </div>
        </div>
      )}

      {/* Already uploaded documents from Step 3 */}
      {idDocsCount > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <FileText className="h-5 w-5" />
              Documente Încărcate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {personalKyc.uploadedDocuments
                .filter(d => d.type !== 'selfie' && d.type !== 'certificat_domiciliu')
                .map(doc => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-green-200"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="font-medium text-sm">{getDocumentLabel(doc.type)}</p>
                        <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const filteredDocs = personalKyc.uploadedDocuments.filter(d => d.id !== doc.id);
                        updatePersonalKyc({ uploadedDocuments: filteredDocs });
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selfie Section - only show if reupload selected or no valid KYC */}
      {showSelfie && (!hasValidAccountKyc || showReuploadOption) && renderUploadCard('selfie')}

      {/* Certificate Section - only show if reupload selected or no valid KYC */}
      {showCertificate && (!hasValidAccountKyc || showReuploadOption) && renderUploadCard('certificat_domiciliu')}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">De ce avem nevoie de aceste documente?</p>
            <p className="text-blue-700">
              Verificarea identității este necesară pentru a procesa cererea ta în mod legal.
              Documentele sunt criptate și stocate securizat conform GDPR.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      {(showSelfie || showCertificate) && (
        <div className="flex items-center justify-center gap-4 py-4">
          {showSelfie && (
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                  getDocumentByType('selfie')
                    ? 'bg-green-500 text-white'
                    : 'bg-neutral-200 text-neutral-500'
                )}
              >
                {getDocumentByType('selfie') ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  '1'
                )}
              </div>
              <span className="text-sm text-neutral-600">Selfie</span>
            </div>
          )}
          {showSelfie && showCertificate && (
            <div className={cn(
              'w-8 h-0.5',
              getDocumentByType('selfie') ? 'bg-green-500' : 'bg-neutral-200'
            )} />
          )}
          {showCertificate && (
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                  getDocumentByType('certificat_domiciliu')
                    ? 'bg-green-500 text-white'
                    : 'bg-neutral-200 text-neutral-500'
                )}
              >
                {getDocumentByType('certificat_domiciliu') ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  showSelfie ? '2' : '1'
                )}
              </div>
              <span className="text-sm text-neutral-600">Certificat</span>
            </div>
          )}
        </div>
      )}

      {/* Security Note */}
      <div className="text-center text-xs text-neutral-500">
        <span className="inline-flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Documentele sunt criptate și stocate securizat pentru verificarea identității
        </span>
      </div>

      {/* Preview Modal */}
      {previewModal.open && previewModal.url && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewModal({ open: false, type: null, url: null })}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-secondary-900">
                {previewModal.type && DOCUMENT_CONFIG[previewModal.type].title}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setPreviewModal({ open: false, type: null, url: null })
                }
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4">
              <img
                src={previewModal.url}
                alt="Preview"
                className="max-h-[60vh] w-full object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to get document label
function getDocumentLabel(type: DocumentType): string {
  const labels: Record<string, string> = {
    ci_vechi: 'CI Vechi',
    ci_nou_front: 'CI Nou (față)',
    ci_nou_back: 'CI Nou (verso)',
    passport: 'Pașaport',
    certificat_domiciliu: 'Certificat Domiciliu',
    residence_permit: 'Permis de Ședere',
    registration_cert: 'Certificat Înregistrare',
    selfie: 'Selfie',
    unknown: 'Document',
  };
  return labels[type] || 'Document';
}
