'use client';

/**
 * IdScanner Component
 *
 * Reusable component for scanning Romanian ID documents (CI/Passport).
 * Extracts personal data via OCR using Google Gemini.
 *
 * Used in:
 * - Order wizard (PersonalDataStep)
 * - Account page (KYCTab)
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
export interface ExtractedAddress {
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
}

export interface ExtractedIdData {
  firstName?: string;
  lastName?: string;
  cnp?: string;
  birthDate?: string;
  birthPlace?: string;
  documentSeries?: string;
  documentNumber?: string;
  documentExpiry?: string;
  documentIssueDate?: string;
  documentIssuedBy?: string;
  documentType?: string;
  isExpired?: boolean;
  requiresAddressCertificate?: boolean;
  fatherName?: string;
  motherName?: string;
  address?: ExtractedAddress;
}

export interface UploadedDocument {
  id: string;
  type: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  base64: string;
}

export interface OcrResult {
  documentType: string;
  success: boolean;
  confidence: number;
  extractedData: ExtractedIdData;
  issues: string[];
  processedAt: string;
}

export interface IdScannerProps {
  onScanComplete: (data: {
    extractedData: ExtractedIdData;
    documents: UploadedDocument[];
    ocrResults: OcrResult[];
  }) => void;
  onError?: (error: string) => void;
  existingDocuments?: UploadedDocument[];
  existingOcrResults?: OcrResult[];
  showBackSide?: boolean;
  showSelfieWithId?: boolean; // Enable selfie with ID held visible
  className?: string;
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

// Selfie with ID Illustration
function SelfieWithIdIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 100" className={className} aria-label="Selfie cu act">
      {/* Background */}
      <rect x="2" y="2" width="156" height="96" rx="8" fill="#F0F9FF" stroke="#3B82F6" strokeWidth="1.5"/>
      {/* Header */}
      <rect x="2" y="2" width="156" height="22" rx="8" fill="#3B82F6"/>
      <rect x="2" y="16" width="156" height="8" fill="#3B82F6"/>
      <text x="80" y="16" textAnchor="middle" fill="#FFFFFF" fontSize="7" fontWeight="700">SELFIE CU ACTUL</text>
      {/* Person silhouette */}
      <circle cx="60" cy="50" r="18" fill="none" stroke="#60A5FA" strokeWidth="2"/>
      <path d="M42 82 Q60 60 78 82" fill="none" stroke="#60A5FA" strokeWidth="2"/>
      {/* ID card in hand */}
      <g transform="translate(90, 45) rotate(-10)">
        <rect x="0" y="0" width="50" height="32" rx="3" fill="#FFFDF5" stroke="#ECB95F" strokeWidth="1"/>
        <rect x="0" y="0" width="50" height="8" rx="3" fill="#ECB95F"/>
        <rect x="5" y="12" width="12" height="15" rx="1" fill="#FBF0CC"/>
        <rect x="20" y="14" width="25" height="3" rx="1" fill="#FBF0CC"/>
        <rect x="20" y="20" width="20" height="3" rx="1" fill="#FBF0CC"/>
      </g>
      {/* Arrow pointing to ID */}
      <path d="M100 85 L115 75" stroke="#3B82F6" strokeWidth="2" markerEnd="url(#arrow)"/>
      <defs>
        <marker id="arrow" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#3B82F6"/>
        </marker>
      </defs>
      <text x="80" y="94" textAnchor="middle" fill="#3B82F6" fontSize="5">Ține actul vizibil lângă față</text>
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

export default function IdScanner({
  onScanComplete,
  onError,
  existingDocuments = [],
  existingOcrResults = [],
  showBackSide = true,
  showSelfieWithId = false,
  className,
}: IdScannerProps) {
  const [ciFrontScan, setCiFrontScan] = useState<ScanState>(initialScanState);
  const [ciBackScan, setCiBackScan] = useState<ScanState>(initialScanState);
  const [selfieScan, setSelfieScan] = useState<ScanState>(initialScanState);
  const [documents, setDocuments] = useState<UploadedDocument[]>(existingDocuments);
  const [ocrResults, setOcrResults] = useState<OcrResult[]>(existingOcrResults);
  const [mergedData, setMergedData] = useState<ExtractedIdData>({});

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

        // Create new document entry
        const newDoc: UploadedDocument = {
          id: crypto.randomUUID(),
          type: ocr.documentType || type,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          uploadedAt: new Date().toISOString(),
          base64,
        };

        // Create new OCR result
        const newOcrResult: OcrResult = {
          documentType: ocr.documentType || type,
          success: true,
          confidence: ocr.confidence || 0.9,
          extractedData: extracted,
          issues: ocr.issues || [],
          processedAt: new Date().toISOString(),
        };

        // Update documents and OCR results
        const updatedDocs = [
          ...documents.filter(d => d.type !== type && d.type !== (type === 'ci_front' ? 'ci_nou_front' : 'ci_nou_back')),
          newDoc,
        ];
        const updatedOcrResults = [
          ...ocrResults.filter(r => r.documentType !== type && r.documentType !== (type === 'ci_front' ? 'ci_nou_front' : 'ci_nou_back')),
          newOcrResult,
        ];

        setDocuments(updatedDocs);
        setOcrResults(updatedOcrResults);

        // Merge extracted data with existing
        const newMergedData: ExtractedIdData = {
          ...mergedData,
          firstName: extracted.firstName || mergedData.firstName,
          lastName: extracted.lastName || mergedData.lastName,
          cnp: extracted.cnp || mergedData.cnp,
          birthDate: convertDateFormat(extracted.birthDate) || mergedData.birthDate,
          birthPlace: extracted.birthPlace || mergedData.birthPlace,
          documentSeries: extracted.series || mergedData.documentSeries,
          documentNumber: extracted.number || mergedData.documentNumber,
          documentExpiry: convertDateFormat(extracted.expiryDate) || mergedData.documentExpiry,
          documentIssueDate: convertDateFormat(extracted.issueDate) || mergedData.documentIssueDate,
          documentIssuedBy: extracted.issuedBy || mergedData.documentIssuedBy,
          documentType: ocr.documentType || type,
          isExpired: ocr.isExpired || mergedData.isExpired || false,
          requiresAddressCertificate: ocr.requiresAddressCertificate || mergedData.requiresAddressCertificate || false,
          fatherName: extracted.fatherName || mergedData.fatherName,
          motherName: extracted.motherName || mergedData.motherName,
          address: extracted.address || mergedData.address,
        };
        setMergedData(newMergedData);

        // Notify parent
        onScanComplete({
          extractedData: newMergedData,
          documents: updatedDocs,
          ocrResults: updatedOcrResults,
        });

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
      const errorMessage = error instanceof Error ? error.message : 'Eroare la procesare document';
      setState(prev => ({
        ...prev,
        scanning: false,
        error: errorMessage,
      }));
      onError?.(errorMessage);
    }
  }, [documents, ocrResults, mergedData, onScanComplete, onError]);

  // Handle selfie upload (no OCR, just store the image)
  const handleSelfieUpload = useCallback(async (file: File) => {
    setSelfieScan(prev => ({ ...prev, scanning: true, progress: 0, error: null }));

    try {
      // Create preview
      const reader = new FileReader();
      const previewPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const preview = await previewPromise;

      setSelfieScan(prev => ({ ...prev, preview, progress: 50 }));

      // Extract base64
      const base64 = preview.split(',')[1];

      // Create new document entry for selfie
      const newDoc: UploadedDocument = {
        id: crypto.randomUUID(),
        type: 'selfie_with_id',
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        base64,
      };

      // Update documents
      const updatedDocs = [
        ...documents.filter(d => d.type !== 'selfie_with_id'),
        newDoc,
      ];

      setDocuments(updatedDocs);
      setSelfieScan(prev => ({ ...prev, scanning: false, progress: 100, success: true }));

      // Notify parent
      onScanComplete({
        extractedData: mergedData,
        documents: updatedDocs,
        ocrResults,
      });
    } catch (error) {
      console.error('Selfie upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Eroare la încărcarea imaginii';
      setSelfieScan(prev => ({
        ...prev,
        scanning: false,
        error: errorMessage,
      }));
      onError?.(errorMessage);
    }
  }, [documents, ocrResults, mergedData, onScanComplete, onError]);

  // Reset scan
  const resetScan = useCallback((type: 'ci_front' | 'ci_back' | 'selfie_with_id') => {
    if (type === 'selfie_with_id') {
      setSelfieScan(initialScanState);
      const updatedDocs = documents.filter(d => d.type !== 'selfie_with_id');
      setDocuments(updatedDocs);
      onScanComplete({
        extractedData: mergedData,
        documents: updatedDocs,
        ocrResults,
      });
      return;
    }

    const setState = type === 'ci_front' ? setCiFrontScan : setCiBackScan;
    setState(initialScanState);

    // Remove from documents and results
    const updatedDocs = documents.filter(d => d.type !== type && d.type !== (type === 'ci_front' ? 'ci_nou_front' : 'ci_nou_back'));
    const updatedOcrResults = ocrResults.filter(r => r.documentType !== type && r.documentType !== (type === 'ci_front' ? 'ci_nou_front' : 'ci_nou_back'));

    setDocuments(updatedDocs);
    setOcrResults(updatedOcrResults);

    // Notify parent with updated state
    onScanComplete({
      extractedData: mergedData,
      documents: updatedDocs,
      ocrResults: updatedOcrResults,
    });
  }, [documents, ocrResults, mergedData, onScanComplete]);

  // Render scan card
  const renderScanCard = (
    type: 'ci_front' | 'ci_back',
    title: string,
    description: string
  ) => {
    const scanState = type === 'ci_front' ? ciFrontScan : ciBackScan;
    const existingDoc = documents.find(d =>
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

  // Render selfie card
  const renderSelfieCard = () => {
    const existingDoc = documents.find(d => d.type === 'selfie_with_id');
    const hasUpload = selfieScan.preview || existingDoc;
    const isSuccess = selfieScan.success || !!existingDoc;

    return (
      <div
        className={cn(
          'relative rounded-xl border-2 p-4 transition-all',
          isSuccess
            ? 'border-green-300 bg-green-50'
            : selfieScan.error
            ? 'border-red-300 bg-red-50'
            : 'border-dashed border-blue-200 hover:border-blue-400 bg-blue-50/30'
        )}
      >
        <div className="flex items-center gap-3 mb-3">
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center',
              isSuccess ? 'bg-green-100' : 'bg-blue-100'
            )}
          >
            {selfieScan.scanning ? (
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            ) : isSuccess ? (
              <FileCheck className="w-5 h-5 text-green-600" />
            ) : (
              <Camera className="w-5 h-5 text-blue-500" />
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-secondary-900 text-sm">Selfie cu Actul</h4>
            <p className="text-xs text-neutral-600">Ține actul vizibil lângă față</p>
          </div>
          {isSuccess && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => resetScan('selfie_with_id')}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {hasUpload ? (
          <div className="relative aspect-[3/2] bg-neutral-100 rounded-lg overflow-hidden">
            <img
              src={selfieScan.preview || (existingDoc?.base64 ? `data:${existingDoc.mimeType};base64,${existingDoc.base64}` : '')}
              alt="Selfie cu act"
              className="w-full h-full object-contain"
            />
            {selfieScan.scanning && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin mb-2" />
                <span className="text-white text-sm font-medium">
                  Se încarcă... {selfieScan.progress}%
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
                if (file) handleSelfieUpload(file);
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={selfieScan.scanning}
            />
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-3 text-center hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group">
              <div className="mb-3 opacity-80 group-hover:opacity-100 transition-opacity">
                <SelfieWithIdIllustration className="w-full h-auto max-h-24" />
              </div>
              <div className="bg-blue-100 hover:bg-blue-200 rounded-lg py-2 px-4 inline-flex items-center gap-2 transition-colors">
                <Camera className="w-4 h-4 text-blue-700" />
                <Upload className="w-4 h-4 text-blue-700" />
                <span className="text-sm font-medium text-blue-800">
                  Încarcă selfie
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Asigură-te că actul este vizibil
              </p>
            </div>
          </div>
        )}

        {selfieScan.error && (
          <div className="flex items-center gap-2 mt-2 text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs">{selfieScan.error}</span>
          </div>
        )}

        {isSuccess && (
          <div className="flex items-center gap-2 mt-2 text-green-600">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-xs">Selfie încărcat cu succes!</span>
          </div>
        )}
      </div>
    );
  };

  const hasAnySuccess = ciFrontScan.success || ciBackScan.success || selfieScan.success || documents.length > 0;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2 text-secondary-900">
        <Scan className="h-5 w-5 text-primary-500" />
        <h3 className="font-semibold">Scanează Actul de Identitate</h3>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Completare automată rapidă</p>
            <p className="text-blue-700 text-xs">
              Fotografiază cartea de identitate și datele se vor completa automat.
              {showSelfieWithId && ' Pentru verificare, adaugă și un selfie cu actul vizibil.'}
            </p>
          </div>
        </div>
      </div>

      <div className={cn(
        'grid gap-4',
        showBackSide && !showSelfieWithId ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'
      )}>
        {renderScanCard(
          'ci_front',
          'Carte Identitate - Față',
          'CNP, nume, adresă (CI vechi)'
        )}
        {showBackSide && renderScanCard(
          'ci_back',
          'Verso (opțional)',
          'Doar pentru CI-uri noi cu adresa pe spate'
        )}
      </div>

      {showSelfieWithId && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-secondary-900 flex items-center gap-2">
            <Camera className="w-4 h-4 text-blue-500" />
            Verificare identitate
          </h4>
          {renderSelfieCard()}
        </div>
      )}

      {hasAnySuccess && (
        <div className="text-center text-xs text-neutral-500 pt-2">
          <CheckCircle className="w-4 h-4 inline mr-1" />
          Documentele scanate vor fi salvate în contul tău
        </div>
      )}
    </div>
  );
}
