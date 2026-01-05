'use client';

/**
 * KYCDocumentsStep Component
 *
 * Handles KYC document verification including selfie and additional documents.
 * Supports face matching with ID photo.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useModularWizard } from '@/providers/modular-wizard-provider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
} from 'lucide-react';
import type { PersonalKYCConfig, DocumentType, UploadedDocumentState } from '@/types/verification-modules';

interface KYCDocumentsStepProps {
  config: PersonalKYCConfig;
  onValidChange: (valid: boolean) => void;
}

export default function KYCDocumentsStep({ config, onValidChange }: KYCDocumentsStepProps) {
  const { state, updatePersonalKyc } = useModularWizard();
  const personalKyc = state.personalKyc;

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingType, setProcessingType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selfieBase64, setSelfieBase64] = useState<string | null>(null);
  const [faceMatchResult, setFaceMatchResult] = useState<{
    matched: boolean;
    confidence: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get uploaded documents by type
  const getDocumentByType = useCallback((type: DocumentType): UploadedDocumentState | undefined => {
    return personalKyc?.uploadedDocuments.find(doc => doc.type === type);
  }, [personalKyc?.uploadedDocuments]);

  // Check if we have ID document (for face matching)
  const hasIDDocument = useCallback(() => {
    return personalKyc?.uploadedDocuments.some(doc =>
      doc.type === 'ci_vechi' ||
      doc.type === 'ci_nou_front' ||
      doc.type === 'passport'
    );
  }, [personalKyc?.uploadedDocuments]);

  // Handle document upload
  const handleDocumentUpload = useCallback(async (
    event: React.ChangeEvent<HTMLInputElement>,
    docType: DocumentType
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProcessingType(docType);
    setError(null);

    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Add to uploaded documents
      const newDoc: UploadedDocumentState = {
        id: crypto.randomUUID(),
        type: docType,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        base64,
      };

      // Remove existing document of same type if exists
      const filteredDocs = personalKyc?.uploadedDocuments.filter(doc => doc.type !== docType) || [];

      updatePersonalKyc({
        uploadedDocuments: [...filteredDocs, newDoc],
      });

      // If it's a selfie, store for face matching
      if (docType === 'selfie') {
        setSelfieBase64(base64);
      }

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Eroare la încărcare');
    } finally {
      setIsProcessing(false);
      setProcessingType(null);
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  }, [personalKyc?.uploadedDocuments, updatePersonalKyc]);

  // Handle selfie capture
  const handleSelfieCapture = useCallback(async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProcessingType('selfie');
    setError(null);
    setFaceMatchResult(null);

    try {
      // Convert to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setSelfieBase64(base64);

      // Add selfie to documents
      const selfieDoc: UploadedDocumentState = {
        id: crypto.randomUUID(),
        type: 'selfie',
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        base64,
      };

      const filteredDocs = personalKyc?.uploadedDocuments.filter(doc => doc.type !== 'selfie') || [];

      updatePersonalKyc({
        uploadedDocuments: [...filteredDocs, selfieDoc],
      });

      // Perform face matching if we have an ID document
      if (hasIDDocument()) {
        const idDoc = personalKyc?.uploadedDocuments.find(doc =>
          doc.type === 'ci_vechi' ||
          doc.type === 'ci_nou_front' ||
          doc.type === 'passport'
        );

        if (idDoc?.base64) {
          // Call face matching API
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
            if (data.success && data.data) {
              setFaceMatchResult({
                matched: data.data.faceMatch?.matched || false,
                confidence: data.data.faceMatch?.confidence || 0,
              });
            }
          }
        }
      }

    } catch (err) {
      console.error('Selfie error:', err);
      setError(err instanceof Error ? err.message : 'Eroare la încărcare selfie');
    } finally {
      setIsProcessing(false);
      setProcessingType(null);
      if (event.target) {
        event.target.value = '';
      }
    }
  }, [personalKyc?.uploadedDocuments, hasIDDocument, updatePersonalKyc]);

  // Remove document
  const handleRemoveDocument = useCallback((docId: string) => {
    const doc = personalKyc?.uploadedDocuments.find(d => d.id === docId);
    if (doc?.type === 'selfie') {
      setSelfieBase64(null);
      setFaceMatchResult(null);
    }

    updatePersonalKyc({
      uploadedDocuments: personalKyc?.uploadedDocuments.filter(d => d.id !== docId) || [],
    });
  }, [personalKyc?.uploadedDocuments, updatePersonalKyc]);

  // Validate all required documents are uploaded
  const isValid = useCallback(() => {
    if (!personalKyc) return false;

    // Check selfie if required
    if (config.selfieRequired) {
      const hasSelfie = personalKyc.uploadedDocuments.some(d => d.type === 'selfie');
      if (!hasSelfie) return false;

      // Check face match passed
      if (faceMatchResult && !faceMatchResult.matched) return false;
    }

    // Check for address certificate if required
    if (personalKyc.requiresAddressCertificate && config.requireAddressCertificate !== 'never') {
      const hasCertificate = personalKyc.uploadedDocuments.some(d => d.type === 'certificat_domiciliu');
      if (!hasCertificate) return false;
    }

    return true;
  }, [personalKyc, config, faceMatchResult]);

  // Notify parent of validation changes
  useEffect(() => {
    onValidChange(isValid());
  }, [isValid, onValidChange]);

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

  return (
    <div className="space-y-6">
      {/* Uploaded Documents Summary */}
      {personalKyc.uploadedDocuments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documente Încărcate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {personalKyc.uploadedDocuments.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
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
                    onClick={() => handleRemoveDocument(doc.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selfie Section */}
      {config.selfieRequired && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Selfie pentru Verificare
            </CardTitle>
            <CardDescription>
              Fă o fotografie de tip selfie pentru a verifica identitatea ta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              {/* Selfie Preview */}
              {selfieBase64 && (
                <div className="relative">
                  <img
                    src={`data:image/jpeg;base64,${selfieBase64}`}
                    alt="Selfie"
                    className="w-32 h-32 rounded-full object-cover border-4 border-primary"
                  />
                  {faceMatchResult && (
                    <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-medium ${
                      faceMatchResult.matched
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {faceMatchResult.matched
                        ? `Verificat (${Math.round(faceMatchResult.confidence * 100)}%)`
                        : 'Nu corespunde'}
                    </div>
                  )}
                </div>
              )}

              {/* Selfie Upload */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isProcessing}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isProcessing && processingType === 'selfie' ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4 mr-2" />
                  )}
                  {selfieBase64 ? 'Refă Selfie' : 'Fă Selfie'}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="user"
                  className="hidden"
                  onChange={handleSelfieCapture}
                />
              </div>

              {/* Face Match Error */}
              {faceMatchResult && !faceMatchResult.matched && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Selfie-ul nu corespunde cu fotografia din document. Te rugăm să refaci fotografia.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Address Certificate Section */}
      {personalKyc.requiresAddressCertificate && config.requireAddressCertificate !== 'never' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Certificat de Atestare a Domiciliului
            </CardTitle>
            <CardDescription>
              Actul tău de identitate nu conține adresa. Încarcă un certificat de atestare a domiciliului.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!getDocumentByType('certificat_domiciliu') ? (
              <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-lg">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Încarcă certificatul de atestare a domiciliului
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Acceptăm: JPG, PNG, PDF (max 10MB)
                  </p>
                </div>
                <label>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleDocumentUpload(e, 'certificat_domiciliu')}
                    disabled={isProcessing}
                  />
                  <Button type="button" variant="secondary" asChild>
                    <span>
                      {isProcessing && processingType === 'certificat_domiciliu' ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4 mr-2" />
                      )}
                      Selectează Fișier
                    </span>
                  </Button>
                </label>
              </div>
            ) : (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Certificat încărcat cu succes
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Helper function to get document label
function getDocumentLabel(type: DocumentType): string {
  const labels: Record<DocumentType, string> = {
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
