/**
 * Client-side S3 Upload Utility
 *
 * Handles file uploads to S3 via presigned URLs.
 * This file runs in the browser.
 *
 * Flow:
 * 1. Request presigned URL from /api/upload
 * 2. PUT file directly to S3 using presigned URL
 * 3. Return S3 key for storage in database
 */

import type { DocumentCategory, KycDocumentType } from './s3';

export interface UploadOptions {
  category: DocumentCategory;
  file: File;
  // For KYC uploads
  documentType?: KycDocumentType;
  verificationId?: string;
  // For order uploads
  orderId?: string;
  // Progress callback
  onProgress?: (progress: number) => void;
}

export interface UploadResult {
  key: string;
  bucket: string;
  url: string; // S3 URL (not presigned, for storage)
}

/**
 * Upload a file to S3 via presigned URL
 */
export async function uploadToS3(options: UploadOptions): Promise<UploadResult> {
  const { category, file, documentType, verificationId, orderId, onProgress } = options;

  // Step 1: Get presigned URL from our API
  const presignedResponse = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category,
      contentType: file.type,
      filename: file.name,
      fileSize: file.size,
      documentType,
      verificationId,
      orderId,
    }),
  });

  if (!presignedResponse.ok) {
    const error = await presignedResponse.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to get upload URL');
  }

  const { data } = await presignedResponse.json();
  const { uploadUrl, key, bucket } = data;

  // Step 2: Upload file directly to S3
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error(`S3 upload failed: ${uploadResponse.statusText}`);
  }

  // Step 3: Return the S3 key (not the presigned URL)
  // The presigned URL expires, so we store the key and generate URLs on demand
  const s3Url = `https://${bucket}.s3.eu-central-1.amazonaws.com/${key}`;

  onProgress?.(100);

  return {
    key,
    bucket,
    url: s3Url,
  };
}

/**
 * Upload a base64 data URL to S3
 * Converts base64 to File before uploading
 */
export async function uploadBase64ToS3(
  base64DataUrl: string,
  filename: string,
  options: Omit<UploadOptions, 'file'>
): Promise<UploadResult> {
  // Convert base64 data URL to Blob
  const response = await fetch(base64DataUrl);
  const blob = await response.blob();

  // Create File from Blob
  const file = new File([blob], filename, { type: blob.type });

  return uploadToS3({ ...options, file });
}

/**
 * Get a temporary download URL for an S3 file
 */
export async function getS3DownloadUrl(key: string): Promise<string> {
  const response = await fetch(`/api/upload/download?key=${encodeURIComponent(key)}`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Failed to get download URL');
  }

  const { data } = await response.json();
  return data.url;
}

/**
 * Check if a URL is an S3 URL or a data URL
 */
export function isS3Url(url: string): boolean {
  return url.startsWith('https://') && url.includes('.s3.') && url.includes('amazonaws.com');
}

/**
 * Check if a URL is a data URL (base64)
 */
export function isDataUrl(url: string): boolean {
  return url.startsWith('data:');
}

/**
 * Get file extension from MIME type
 */
export function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
  };
  return map[mimeType] || 'bin';
}
