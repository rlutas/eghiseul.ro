'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Upload,
  Camera,
  CreditCard,
  User,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  Info,
  Eye,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOrderWizard } from '@/providers/order-wizard-provider';
import { DocumentUpload } from '@/types/orders';
import { cn } from '@/lib/utils';

interface KYCStepProps {
  onValidChange: (valid: boolean) => void;
}

type DocumentType = 'ci_front' | 'ci_back' | 'selfie';

interface UploadState {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  progress: number;
  error: string | null;
  uploaded: DocumentUpload | null;
}

const initialUploadState: UploadState = {
  file: null,
  preview: null,
  uploading: false,
  progress: 0,
  error: null,
  uploaded: null,
};

// Document type config
const DOCUMENT_CONFIG: Record<
  DocumentType,
  {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    tips: string[];
  }
> = {
  ci_front: {
    title: 'Carte de Identitate - Față',
    description: 'Fotografie clară a feței cărții de identitate',
    icon: CreditCard,
    tips: [
      'Asigură-te că toate datele sunt vizibile',
      'Evită reflexiile și umbrele',
      'Fotografia trebuie să fie în focus',
    ],
  },
  ci_back: {
    title: 'Carte de Identitate - Verso',
    description: 'Fotografie clară a spatelui cărții de identitate',
    icon: CreditCard,
    tips: [
      'Adresa trebuie să fie citibilă',
      'Include toate marginile documentului',
      'Fundalul trebuie să fie uniform',
    ],
  },
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
};

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;
// Accepted file types
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

export function KYCStep({ onValidChange }: KYCStepProps) {
  const { state, updateKYCDocuments } = useOrderWizard();
  const { service, kycDocuments } = state;

  // Check which documents were already uploaded in Step 2
  const hasCIFrontFromStep2 = !!kycDocuments.ci_front?.validation_result?.valid;
  const hasCIBackFromStep2 = !!kycDocuments.ci_back?.validation_result?.valid;

  const [uploads, setUploads] = useState<Record<DocumentType, UploadState>>({
    ci_front: { ...initialUploadState, uploaded: kycDocuments.ci_front || null },
    ci_back: { ...initialUploadState, uploaded: kycDocuments.ci_back || null },
    selfie: { ...initialUploadState, uploaded: kycDocuments.selfie || null },
  });

  const [previewModal, setPreviewModal] = useState<{
    open: boolean;
    type: DocumentType | null;
    url: string | null;
  }>({
    open: false,
    type: null,
    url: null,
  });

  // Check if KYC is required
  const kycRequired = service?.requires_kyc ?? true;

  // Check validity
  useEffect(() => {
    if (!kycRequired) {
      onValidChange(true);
      return;
    }

    // Check if all required documents are uploaded
    const hasCIFront = uploads.ci_front.uploaded || kycDocuments.ci_front;
    const hasCIBack = uploads.ci_back.uploaded || kycDocuments.ci_back;
    const hasSelfie = uploads.selfie.uploaded || kycDocuments.selfie;

    const allUploaded = hasCIFront && hasCIBack && hasSelfie;

    onValidChange(!!allUploaded);
  }, [uploads, kycDocuments, kycRequired, onValidChange]);

  // Handle file selection
  const handleFileSelect = useCallback(
    async (type: DocumentType, file: File) => {
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
    },
    []
  );

  // Upload and validate document with AI
  const handleUpload = useCallback(
    async (type: DocumentType) => {
      const uploadState = uploads[type];
      if (!uploadState.file) return;

      setUploads((prev) => ({
        ...prev,
        [type]: { ...prev[type], uploading: true, progress: 0, error: null },
      }));

      try {
        // Read file as base64
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });
        reader.readAsDataURL(uploadState.file);
        const imageBase64 = await base64Promise;

        setUploads((prev) => ({
          ...prev,
          [type]: { ...prev[type], progress: 30 },
        }));

        // Validate with AI
        const validationBody: Record<string, unknown> = {
          mode: 'single',
          documentType: type,
          imageBase64,
          mimeType: uploadState.file.type,
        };

        // For selfie, include CI front as reference if available
        if (type === 'selfie') {
          const ciFrontDoc = uploads.ci_front.uploaded || kycDocuments.ci_front;
          // Use the stored base64 data, not the blob URL
          if (ciFrontDoc?.imageBase64) {
            validationBody.referenceImageBase64 = ciFrontDoc.imageBase64;
            validationBody.referenceMimeType = ciFrontDoc.mime_type;
          }
        }

        setUploads((prev) => ({
          ...prev,
          [type]: { ...prev[type], progress: 50 },
        }));

        const response = await fetch('/api/kyc/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(validationBody),
        });

        setUploads((prev) => ({
          ...prev,
          [type]: { ...prev[type], progress: 80 },
        }));

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Validarea a eșuat');
        }

        const validation = result.data?.validation;

        // Check if validation passed
        if (!validation?.valid) {
          const issues = validation?.issues?.join('. ') || 'Document invalid';
          const suggestions = validation?.suggestions?.join(' ') || '';
          throw new Error(`${issues}${suggestions ? ` ${suggestions}` : ''}`);
        }

        // Create uploaded document record
        const uploadedDoc: DocumentUpload = {
          file_url: uploadState.preview || '',
          uploaded_at: new Date().toISOString(),
          file_size: uploadState.file.size,
          mime_type: uploadState.file.type,
          validation_result: validation,
          // Store base64 for reference (used for selfie face matching)
          imageBase64: imageBase64,
        };

        setUploads((prev) => ({
          ...prev,
          [type]: {
            ...prev[type],
            uploading: false,
            progress: 100,
            uploaded: uploadedDoc,
          },
        }));

        // Update context with validated document
        updateKYCDocuments({ [type]: uploadedDoc });
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
    [uploads, kycDocuments, updateKYCDocuments]
  );

  // Handle remove
  const handleRemove = useCallback(
    (type: DocumentType) => {
      if (uploads[type].preview) {
        URL.revokeObjectURL(uploads[type].preview!);
      }

      setUploads((prev) => ({
        ...prev,
        [type]: { ...initialUploadState },
      }));

      // Remove from context
      updateKYCDocuments({ [type]: undefined });
    },
    [uploads, updateKYCDocuments]
  );

  // Handle drag and drop
  const handleDrop = useCallback(
    (type: DocumentType, e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(type, file);
      }
    },
    [handleFileSelect]
  );

  // Render upload card
  const renderUploadCard = (type: DocumentType) => {
    const config = DOCUMENT_CONFIG[type];
    const uploadState = uploads[type];
    const existingDoc = kycDocuments[type];
    const Icon = config.icon;

    // Check if document was uploaded in Step 2
    const fromStep2 = type !== 'selfie' && existingDoc?.validation_result?.valid;

    const hasFile = uploadState.file || uploadState.uploaded || existingDoc;
    const isUploaded = !!uploadState.uploaded || !!existingDoc;

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
        {/* From Step 2 Badge */}
        {fromStep2 && (
          <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
            Din Pasul 2
          </div>
        )}

        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
              isUploaded ? 'bg-green-100' : 'bg-neutral-100'
            )}
          >
            {isUploaded ? (
              <FileCheck className={cn('w-5 h-5', isUploaded ? 'text-green-600' : 'text-neutral-500')} />
            ) : (
              <Icon className={cn('w-5 h-5', 'text-neutral-500')} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-secondary-900">{config.title}</h4>
            <p className="text-sm text-neutral-600">{config.description}</p>
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
                  url: uploadState.preview || existingDoc?.file_url || null,
                })
              }
            >
              <img
                src={uploadState.preview || existingDoc?.file_url}
                alt={config.title}
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

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3">
              {!isUploaded && uploadState.file && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleUpload(type)}
                  disabled={uploadState.uploading}
                  className="flex-1 bg-primary-500 hover:bg-primary-600 text-secondary-900"
                >
                  {uploadState.uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Se validează...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Validează
                    </>
                  )}
                </Button>
              )}
              {isUploaded && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPreviewModal({
                      open: true,
                      type,
                      url: existingDoc?.file_url || uploadState.uploaded?.file_url || null,
                    })
                  }
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Previzualizează
                </Button>
              )}
              {!fromStep2 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRemove(type)}
                  disabled={uploadState.uploading}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Validation info */}
            {isUploaded && existingDoc?.validation_result && (
              <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Validat cu {existingDoc.validation_result.confidence}% încredere
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
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(type, file);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="border border-neutral-200 rounded-lg p-6 text-center hover:bg-neutral-50 transition-colors">
              <div className="flex justify-center gap-2 mb-2">
                <Camera className="w-6 h-6 text-neutral-400" />
                <Upload className="w-6 h-6 text-neutral-400" />
              </div>
              <p className="text-sm font-medium text-secondary-900 mb-1">
                Trage fișierul aici sau click pentru a selecta
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
            {config.tips.map((tip, i) => (
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

  // If KYC not required
  if (!kycRequired) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-secondary-900 mb-2">
          Verificare KYC nu este necesară
        </h3>
        <p className="text-neutral-600">
          Acest serviciu nu necesită încărcarea documentelor de identitate.
          Poți continua la pasul următor.
        </p>
      </div>
    );
  }

  // Count already uploaded documents
  const uploadedCount = [
    kycDocuments.ci_front || uploads.ci_front.uploaded,
    kycDocuments.ci_back || uploads.ci_back.uploaded,
    kycDocuments.selfie || uploads.selfie.uploaded,
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      {(hasCIFrontFromStep2 || hasCIBackFromStep2) && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-green-800">
              <p className="font-medium mb-1">Documente deja încărcate</p>
              <p className="text-green-700">
                {hasCIFrontFromStep2 && hasCIBackFromStep2
                  ? 'Cartea de identitate (față și verso) a fost deja scanată în Pasul 2. Mai trebuie doar selfie-ul.'
                  : hasCIFrontFromStep2
                  ? 'Cartea de identitate (față) a fost deja scanată în Pasul 2.'
                  : 'Cartea de identitate (verso) a fost deja scanată în Pasul 2.'}
              </p>
            </div>
          </div>
        </div>
      )}

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

      {/* Upload Cards */}
      <div className="space-y-4">
        {(['ci_front', 'ci_back', 'selfie'] as DocumentType[]).map((type) =>
          renderUploadCard(type)
        )}
      </div>

      {/* Progress Summary */}
      <div className="flex items-center justify-center gap-4 py-4">
        {(['ci_front', 'ci_back', 'selfie'] as DocumentType[]).map((type, i) => {
          const isCompleted = !!(kycDocuments[type] || uploads[type].uploaded);
          return (
            <div key={type} className="flex items-center gap-2">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold',
                  isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-neutral-200 text-neutral-500'
                )}
              >
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 2 && (
                <div
                  className={cn(
                    'w-8 h-0.5',
                    isCompleted ? 'bg-green-500' : 'bg-neutral-200'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress Text */}
      <div className="text-center text-sm text-neutral-600">
        {uploadedCount}/3 documente încărcate
      </div>

      {/* Security Note */}
      <div className="text-center text-xs text-neutral-500">
        <span className="inline-flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Documentele sunt criptate end-to-end și șterse după procesare
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
