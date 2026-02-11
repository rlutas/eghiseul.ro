'use client';

import { useState, useCallback } from 'react';
import { Upload, Loader2, CheckCircle, X, FileText, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadToS3 } from '@/lib/aws/upload-client';

interface PaymentProofUploadProps {
  orderId: string;
  onUploadComplete: (fileKey: string) => void;
  onUploadError?: (error: string) => void;
}

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function PaymentProofUpload({
  orderId,
  onUploadComplete,
  onUploadError,
}: PaymentProofUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    key: string;
    type: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Tip de fișier invalid. Acceptăm: JPG, PNG, WebP, PDF';
    }
    if (file.size > MAX_SIZE) {
      return 'Fișierul este prea mare. Maxim 10MB.';
    }
    return null;
  };

  const handleUpload = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        onUploadError?.(validationError);
        return;
      }

      setIsUploading(true);
      setError(null);

      try {
        const result = await uploadToS3({
          category: 'orders',
          file,
          orderId,
        });

        setUploadedFile({
          name: file.name,
          key: result.key,
          type: file.type,
        });
        onUploadComplete(result.key);
      } catch (err) {
        const message = 'Eroare la încărcare. Te rugăm să încerci din nou.';
        setError(message);
        onUploadError?.(message);
      } finally {
        setIsUploading(false);
      }
    },
    [orderId, onUploadComplete, onUploadError]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    setError(null);
  };

  // Successfully uploaded state
  if (uploadedFile) {
    return (
      <div className="space-y-4">
        <h4 className="font-medium text-secondary-900">Dovada plății</h4>

        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            {uploadedFile.type === 'application/pdf' ? (
              <FileText className="h-5 w-5 text-green-600" />
            ) : (
              <Image className="h-5 w-5 text-green-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-green-800 truncate">
              {uploadedFile.name}
            </p>
            <p className="text-sm text-green-600">Încărcat cu succes</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-green-600 hover:text-green-700 hover:bg-green-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700">
            Vom verifica plata în 1-3 zile lucrătoare și te vom notifica pe email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-secondary-900">
          Încarcă dovada plății
        </h4>
        <p className="text-sm text-neutral-500 mt-1">
          După ce ai efectuat transferul, încarcă un screenshot sau PDF cu
          confirmarea.
        </p>
      </div>

      {/* Upload Area */}
      <label
        className={`flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
          dragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-neutral-300 hover:border-primary-400 hover:bg-neutral-50'
        } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="sr-only"
        />

        {isUploading ? (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            <p className="mt-2 text-sm text-neutral-600">Se încarcă...</p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-neutral-400" />
            <p className="mt-2 text-sm text-neutral-600">
              Click pentru a încărca sau trage fișierul aici
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              JPG, PNG, WebP sau PDF (max 10MB)
            </p>
          </>
        )}
      </label>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}
    </div>
  );
}
