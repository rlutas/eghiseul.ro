'use client';

/**
 * useKycStatus Hook
 *
 * Manages user's KYC verification status and documents.
 */

import { useState, useEffect, useCallback } from 'react';
import type { ExtractedIdData, UploadedDocument, OcrResult } from '@/components/shared/IdScanner';

export type KycStatus = 'verified' | 'expiring' | 'expired' | 'unverified' | 'partial';

interface KycDocument {
  id: string;
  documentType: string;
  fileUrl: string;
  extractedData: ExtractedIdData;
  validationResult: Record<string, unknown>;
  verifiedAt: string;
  expiresAt: string;
  createdAt: string;
}

interface UseKycStatusReturn {
  status: KycStatus;
  expiresAt: string | null;
  daysUntilExpiry: number | null;
  isVerified: boolean;
  isExpiring: boolean;
  isExpired: boolean;
  isPartial: boolean;
  hasFrontId: boolean;
  hasSelfie: boolean;
  hasAllRequired: boolean;
  documents: KycDocument[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  saveDocument: (params: {
    documentType: string;
    fileUrl: string;
    fileKey?: string;
    fileSize?: number;
    mimeType?: string;
    extractedData: ExtractedIdData;
    validationResult?: Record<string, unknown>;
    documentExpiry?: string;
  }) => Promise<KycDocument | null>;
}

export function useKycStatus(): UseKycStatusReturn {
  const [status, setStatus] = useState<KycStatus>('unverified');
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [daysUntilExpiry, setDaysUntilExpiry] = useState<number | null>(null);
  const [documents, setDocuments] = useState<KycDocument[]>([]);
  const [hasFrontId, setHasFrontId] = useState(false);
  const [hasSelfie, setHasSelfie] = useState(false);
  const [hasAllRequired, setHasAllRequired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch KYC status
  const fetchKycStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/user/kyc');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch KYC status');
      }

      const data = result.data;
      setStatus(data.status);
      setExpiresAt(data.expiresAt);
      setDaysUntilExpiry(data.daysUntilExpiry);
      setDocuments(data.documents || []);
      setHasFrontId(data.hasFrontId || false);
      setHasSelfie(data.hasSelfie || false);
      setHasAllRequired(data.hasAllRequired || false);
    } catch (err) {
      console.error('Error fetching KYC status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch KYC status');
      setStatus('unverified');
      setExpiresAt(null);
      setDaysUntilExpiry(null);
      setDocuments([]);
      setHasFrontId(false);
      setHasSelfie(false);
      setHasAllRequired(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchKycStatus();
  }, [fetchKycStatus]);

  // Derived states
  // Only verified if we have ALL required documents AND not expired
  const isVerified = (status === 'verified' || status === 'expiring') && hasAllRequired;
  const isExpiring = status === 'expiring';
  const isExpired = status === 'expired';
  const isPartial = status === 'partial';

  // Save KYC document
  const saveDocument = useCallback(async (params: {
    documentType: string;
    fileUrl: string;
    fileKey?: string;
    fileSize?: number;
    mimeType?: string;
    extractedData: ExtractedIdData;
    validationResult?: Record<string, unknown>;
    documentExpiry?: string;
  }): Promise<KycDocument | null> => {
    try {
      setError(null);

      const response = await fetch('/api/user/kyc/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save KYC document');
      }

      // Refresh KYC status
      await fetchKycStatus();

      return result.data;
    } catch (err) {
      console.error('Error saving KYC document:', err);
      setError(err instanceof Error ? err.message : 'Failed to save KYC document');
      return null;
    }
  }, [fetchKycStatus]);

  return {
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
    isLoading,
    error,
    refresh: fetchKycStatus,
    saveDocument,
  };
}
