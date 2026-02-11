'use client';

/**
 * CompanyDocumentsStep Component
 *
 * Handles company document upload for PJ orders.
 * Supports Certificat de Inregistrare and Certificat Constatator.
 * Simpler than KYCDocumentsStep - no OCR, no face matching.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useModularWizard } from '@/providers/modular-wizard-provider';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  CheckCircle,
  AlertCircle,
  Upload,
  FileText,
  Trash2,
  Eye,
  X,
  Info,
  FileCheck,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CompanyKYCConfig, UploadedDocumentState } from '@/types/verification-modules';

interface CompanyDocumentsStepProps {
  config: CompanyKYCConfig;
  onValidChange: (valid: boolean) => void;
}

type CompanyDocType = 'company_registration_cert' | 'company_statement_cert';

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

const COMPANY_DOC_CONFIG: Record<
  CompanyDocType,
  {
    title: string;
    description: string;
    tips: string[];
  }
> = {
  company_registration_cert: {
    title: 'Certificat de Înregistrare',
    description: 'Documentul emis de Registrul Comerțului cu CUI-ul firmei',
    tips: [
      'Documentul trebuie să fie complet vizibil',
      'CUI-ul să fie citibil',
      'Acceptăm și copie scanată',
    ],
  },
  company_statement_cert: {
    title: 'Certificat Constatator',
    description: 'Certificat constatator emis de ONRC',
    tips: [
      'Certificatul trebuie să fie în termen de valabilitate',
      'Toate paginile trebuie incluse',
      'Acceptăm și copie scanată',
    ],
  },
};

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;
// Accepted file types (including PDF for company docs)
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const ACCEPTED_EXTENSIONS = '.jpeg,.jpg,.png,.pdf';

export default function CompanyDocumentsStep({ config, onValidChange }: CompanyDocumentsStepProps) {
  const { state, updateCompanyKycDocuments, isPrefilled, prefillData } = useModularWizard();
  const companyKyc = state.companyKyc;

  // Check if user has verified company docs from their account
  const hasVerifiedCompanyDocs = isPrefilled && prefillData?.company?.verified;
  const [showReuploadOption, setShowReuploadOption] = useState(false);

  // Required documents from config
  const requiredDocs = config.requiredDocuments || [];

  const [uploads, setUploads] = useState<Record<string, UploadState>>(() => {
    const initial: Record<string, UploadState> = {};
    for (const docType of requiredDocs) {
      initial[docType] = { ...initialUploadState };
    }
    return initial;
  });

  const [previewModal, setPreviewModal] = useState<{
    open: boolean;
    type: CompanyDocType | null;
    url: string | null;
    isPdf: boolean;
  }>({
    open: false,
    type: null,
    url: null,
    isPdf: false,
  });

  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Get uploaded document by type
  const getDocumentByType = useCallback((type: string): UploadedDocumentState | undefined => {
    return companyKyc?.uploadedDocuments?.find(doc => doc.type === type);
  }, [companyKyc?.uploadedDocuments]);

  // Validate step
  const isValid = useCallback(() => {
    if (!companyKyc) return false;

    // If user has verified company docs and not reuploading, automatically valid
    if (hasVerifiedCompanyDocs && !showReuploadOption) {
      return true;
    }

    // Check all required documents are uploaded
    for (const docType of requiredDocs) {
      const hasDoc = companyKyc.uploadedDocuments?.some(d => d.type === docType);
      if (!hasDoc) return false;
    }

    return true;
  }, [companyKyc, hasVerifiedCompanyDocs, showReuploadOption, requiredDocs]);

  // Notify parent of validation changes
  useEffect(() => {
    onValidChange(isValid());
  }, [isValid, onValidChange]);

  // Handle file selection
  const handleFileSelect = useCallback(
    async (type: CompanyDocType, file: File) => {
      // Validate file type
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setUploads((prev) => ({
          ...prev,
          [type]: {
            ...prev[type],
            error: 'Format invalid. Acceptăm JPEG, PNG sau PDF.',
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

      // Create preview (only for images)
      const isImage = file.type.startsWith('image/');
      const preview = isImage ? URL.createObjectURL(file) : null;

      setUploads((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          file,
          preview,
          error: null,
          uploading: true,
          progress: 0,
        },
      }));

      try {
        // Read file as base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // Remove data:... prefix
          };
          reader.onerror = reject;
        });
        reader.readAsDataURL(file);
        const base64 = await base64Promise;

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

        // Update state - remove existing document of same type, add new one
        const currentDocs = companyKyc?.uploadedDocuments || [];
        const filteredDocs = currentDocs.filter(doc => doc.type !== type);
        updateCompanyKycDocuments([...filteredDocs, newDoc]);

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
    [companyKyc?.uploadedDocuments, updateCompanyKycDocuments]
  );

  // Handle remove
  const handleRemove = useCallback(
    (type: CompanyDocType) => {
      if (uploads[type]?.preview) {
        URL.revokeObjectURL(uploads[type].preview!);
      }

      setUploads((prev) => ({
        ...prev,
        [type]: { ...initialUploadState },
      }));

      // Remove from context
      const currentDocs = companyKyc?.uploadedDocuments || [];
      const filteredDocs = currentDocs.filter(doc => doc.type !== type);
      updateCompanyKycDocuments(filteredDocs);
    },
    [uploads, companyKyc?.uploadedDocuments, updateCompanyKycDocuments]
  );

  // Handle drag and drop
  const handleDrop = useCallback(
    (type: CompanyDocType, e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(type, file);
      }
    },
    [handleFileSelect]
  );

  // Render upload card for a document type
  const renderUploadCard = (type: CompanyDocType) => {
    const docConfig = COMPANY_DOC_CONFIG[type];
    if (!docConfig) return null;

    const uploadState = uploads[type] || initialUploadState;
    const existingDoc = getDocumentByType(type);
    const hasFile = uploadState.file || uploadState.preview || existingDoc;
    const isUploaded = !!existingDoc;
    const isPdf = existingDoc?.mimeType === 'application/pdf' || uploadState.file?.type === 'application/pdf';

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
              <FileCheck className="w-5 h-5 text-green-600" />
            ) : (
              <FileText className="w-5 h-5 text-neutral-500" />
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
            {/* Preview */}
            {isPdf ? (
              <div className="flex items-center gap-3 p-4 bg-neutral-100 rounded-lg">
                <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-secondary-900 truncate">
                    {existingDoc?.fileName || uploadState.file?.name}
                  </p>
                  <p className="text-xs text-neutral-500">PDF Document</p>
                </div>
              </div>
            ) : (
              <div
                className="relative aspect-video bg-neutral-100 rounded-lg overflow-hidden cursor-pointer"
                onClick={() =>
                  setPreviewModal({
                    open: true,
                    type,
                    url: uploadState.preview || (existingDoc?.base64 ? `data:${existingDoc.mimeType};base64,${existingDoc.base64}` : null),
                    isPdf: false,
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
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3">
              {isUploaded && !isPdf && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPreviewModal({
                      open: true,
                      type,
                      url: existingDoc?.base64 ? `data:${existingDoc.mimeType};base64,${existingDoc.base64}` : null,
                      isPdf: false,
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
          >
            <input
              ref={(el) => { inputRefs.current[type] = el; }}
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(type, file);
                e.target.value = '';
              }}
              className="hidden"
            />
            <div
              onClick={() => inputRefs.current[type]?.click()}
              className="border border-neutral-200 rounded-lg p-6 text-center hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-secondary-900 mb-1">
                Trage fișierul aici sau click pentru a selecta
              </p>
              <p className="text-xs text-neutral-500">
                JPEG, PNG sau PDF, max 10MB
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

  if (!companyKyc) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Modulul de verificare firmă nu este configurat corect.
        </AlertDescription>
      </Alert>
    );
  }

  if (requiredDocs.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Nu sunt necesare documente suplimentare pentru firmă.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Company Docs Already Verified Banner */}
      {hasVerifiedCompanyDocs && !showReuploadOption && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-800 text-lg">
                Documente firmă deja verificate
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Avem deja documentele firmei verificate în contul tău.
                Poți continua direct la pasul următor fără a încărca documente noi.
              </p>
              <div className="flex items-center gap-4 mt-4">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <CheckCircle className="w-4 h-4" />
                  Firmă verificată
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
      {hasVerifiedCompanyDocs && showReuploadOption && (
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

      {/* Upload Cards - only show if no verified docs or reupload selected */}
      {(!hasVerifiedCompanyDocs || showReuploadOption) && (
        <div className="space-y-4">
          {requiredDocs.map((docType) => renderUploadCard(docType))}
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">De ce avem nevoie de aceste documente?</p>
            <p className="text-blue-700">
              Documentele firmei sunt necesare pentru a valida identitatea juridică
              și a procesa cererea conform legislației în vigoare.
              Documentele sunt criptate și stocate securizat conform GDPR.
            </p>
          </div>
        </div>
      </div>

      {/* Progress Summary */}
      {(!hasVerifiedCompanyDocs || showReuploadOption) && requiredDocs.length > 0 && (
        <div className="flex items-center justify-center gap-4 py-4">
          {requiredDocs.map((docType, index) => {
            const docConfig = COMPANY_DOC_CONFIG[docType];
            const hasDoc = !!getDocumentByType(docType);
            return (
              <div key={docType} className="flex items-center gap-2">
                {index > 0 && (
                  <div className={cn(
                    'w-8 h-0.5',
                    getDocumentByType(requiredDocs[index - 1]) ? 'bg-green-500' : 'bg-neutral-200'
                  )} />
                )}
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                    hasDoc
                      ? 'bg-green-500 text-white'
                      : 'bg-neutral-200 text-neutral-500'
                  )}
                >
                  {hasDoc ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    String(index + 1)
                  )}
                </div>
                <span className="text-sm text-neutral-600">
                  {docConfig?.title.split(' ').slice(-1)[0] || `Doc ${index + 1}`}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Security Note */}
      <div className="text-center text-xs text-neutral-500">
        <span className="inline-flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Documentele sunt criptate și stocate securizat pentru verificarea firmei
        </span>
      </div>

      {/* Preview Modal */}
      {previewModal.open && previewModal.url && !previewModal.isPdf && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewModal({ open: false, type: null, url: null, isPdf: false })}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-secondary-900">
                {previewModal.type && COMPANY_DOC_CONFIG[previewModal.type]?.title}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setPreviewModal({ open: false, type: null, url: null, isPdf: false })
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
